import { geolocation, ipAddress } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";
import { checkBotId } from "botid/server";
import { after } from "next/server";
import { createResumableStreamContext } from "resumable-stream";
import { auth, type UserType } from "@/app/(auth)/auth";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import {
  allowedModelIds,
  chatModels,
  DEFAULT_CHAT_MODEL,
  getCapabilities,
  getModelAvailability,
} from "@/lib/ai/models";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/providers";
import { codeExecution } from "@/lib/ai/tools/code-execution";
import { createDocument } from "@/lib/ai/tools/create-document";
import { deepResearch } from "@/lib/ai/tools/deep-research";
import { editDocument } from "@/lib/ai/tools/edit-document";
import { generateFile } from "@/lib/ai/tools/file-generation";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { mcpAction } from "@/lib/ai/tools/mcp-action";
import { memoryTool } from "@/lib/ai/tools/memory";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { webSearch } from "@/lib/ai/tools/web-search";
import { isProductionEnvironment } from "@/lib/constants";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatTitleById,
  updateMessage,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import { ChatbotError } from "@/lib/errors";
import { getUserMemoryContext } from "@/lib/orchestration/memory";
import {
  formatProjectContextForPrompt,
  retrieveProjectContext,
} from "@/lib/orchestration/project-context";
import { checkIpRateLimit } from "@/lib/ratelimit";
import type { ChatMessage, WaitingStatusData } from "@/lib/types";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 300;

const HEALTH_CHECK_DELAY_MS = 9000;

const INCOGNITO_ACTIVE_TOOLS = ["getWeather", "webSearch"] as const;
const PERSISTENT_ACTIVE_TOOLS = [
  "getWeather",
  "webSearch",
  "deepResearch",
  "memory",
  "mcpAction",
  "codeExecution",
  "generateFile",
  "createDocument",
  "editDocument",
  "updateDocument",
  "requestSuggestions",
] as const;

function isModelStreamActivity(chunk: { type: string }) {
  return !["start", "start-step", "finish-step", "finish", "raw"].includes(
    chunk.type
  );
}

function getUserMessageText(message: PostRequestBody["message"]) {
  if (!message) {
    return "";
  }

  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function getStreamContext() {
  try {
    return createResumableStreamContext({ waitUntil: after });
  } catch {
    return null;
  }
}

export { getStreamContext };

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch {
    return new ChatbotError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      incognito,
      message,
      messages,
      projectId,
      selectedChatModel,
      selectedVisibilityType,
    } = requestBody;

    const [botIdResult, session] = await Promise.all([
      checkBotId().catch(() => null),
      auth(),
    ]);

    if (botIdResult?.isBot) {
      return new ChatbotError("forbidden:api").toResponse();
    }

    if (!session?.user) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    if (incognito && projectId) {
      return new ChatbotError("bad_request:api").toResponse();
    }

    const chatModel = allowedModelIds.has(selectedChatModel)
      ? selectedChatModel
      : DEFAULT_CHAT_MODEL;

    await checkIpRateLimit(ipAddress(request));

    const userType: UserType = session.user.type;
    const messageCount = await getMessageCountByUserId({
      differenceInHours: 1,
      id: session.user.id,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerHour) {
      return new ChatbotError("rate_limit:chat").toResponse();
    }

    const isToolApprovalFlow = Boolean(messages);
    const chat = incognito ? null : await getChatById({ id });
    let messagesFromDb: DBMessage[] = [];
    let titlePromise: Promise<string> | null = null;
    let effectiveProjectId = incognito ? null : (projectId ?? null);

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatbotError("forbidden:chat").toResponse();
      }
      if (projectId && chat.projectId && chat.projectId !== projectId) {
        return new ChatbotError("forbidden:chat").toResponse();
      }
      effectiveProjectId = projectId ?? chat.projectId ?? null;
      messagesFromDb = await getMessagesByChatId({ id });
    } else if (!incognito && message?.role === "user") {
      await saveChat({
        id,
        title: "New chat",
        userId: session.user.id,
        visibility: selectedVisibilityType,
      });
      titlePromise = generateTitleFromUserMessage({ message });
    }

    let uiMessages: ChatMessage[];

    if (incognito && messages) {
      uiMessages = messages as ChatMessage[];
    } else if (isToolApprovalFlow && messages) {
      const dbMessages = convertToUIMessages(messagesFromDb);
      const approvalStates = new Map(
        messages.flatMap(
          (m) =>
            m.parts
              ?.filter(
                (p: Record<string, unknown>) =>
                  p.state === "approval-responded" ||
                  p.state === "output-denied"
              )
              .map((p: Record<string, unknown>) => [
                String(p.toolCallId ?? ""),
                p,
              ]) ?? []
        )
      );
      uiMessages = dbMessages.map((msg) => ({
        ...msg,
        parts: msg.parts.map((part) => {
          if (
            "toolCallId" in part &&
            approvalStates.has(String(part.toolCallId))
          ) {
            return { ...part, ...approvalStates.get(String(part.toolCallId)) };
          }
          return part;
        }),
      })) as ChatMessage[];
    } else {
      uiMessages = [
        ...convertToUIMessages(messagesFromDb),
        message as ChatMessage,
      ];
    }

    const { longitude, latitude, city, country } = geolocation(request);
    const requestHints: RequestHints = {
      city,
      country,
      latitude,
      longitude,
    };

    let projectContextPrompt: string | null = null;
    if (!incognito && effectiveProjectId && message?.role === "user") {
      const userMessageText = getUserMessageText(message);
      if (userMessageText) {
        const projectContext = await retrieveProjectContext({
          chatId: id,
          message: userMessageText,
          projectId: effectiveProjectId,
          userId: session.user.id,
        });

        if (!projectContext) {
          return new ChatbotError("forbidden:chat").toResponse();
        }

        projectContextPrompt = formatProjectContextForPrompt(projectContext);
      }
    }

    let memoryContextPrompt: string | null = null;
    if (!incognito) {
      try {
        const memoryContext = await getUserMemoryContext(session.user.id);
        memoryContextPrompt = memoryContext.prompt;
      } catch (error) {
        console.warn("Memory context unavailable; continuing without it", error);
      }
    }

    if (!incognito && message?.role === "user") {
      await saveMessages({
        messages: [
          {
            attachments: [],
            chatId: id,
            createdAt: new Date(),
            id: message.id,
            parts: message.parts,
            role: "user",
          },
        ],
      });
    }

    const modelConfig = chatModels.find((m) => m.id === chatModel);
    const modelCapabilities = await getCapabilities();
    const capabilities = modelCapabilities[chatModel];
    const isReasoningModel = capabilities?.reasoning === true;
    const supportsTools = capabilities?.tools === true;

    const modelMessages = await convertToModelMessages(uiMessages);
    const baseInstructions = systemPrompt({ requestHints, supportsTools });
    const privacyInstructions = incognito
      ? "This is an incognito chat. Do not claim to remember this conversation later. Persistent memory, project knowledge, connectors, code execution, generated files, artifacts, and resumable chat storage are disabled for this request."
      : null;
    const instructions = [
      baseInstructions,
      privacyInstructions,
      memoryContextPrompt,
      projectContextPrompt,
    ]
      .filter(Boolean)
      .join("\n\n");

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        const modelName = modelConfig?.name ?? chatModel;
        let hasModelActivity = false;
        let healthCheckTimer: ReturnType<typeof setTimeout> | undefined;

        const clearHealthCheckTimer = () => {
          if (healthCheckTimer) {
            clearTimeout(healthCheckTimer);
          }
        };

        const writeWaitingStatus = (
          phase: WaitingStatusData["phase"],
          messageText: string
        ) => {
          if (hasModelActivity && phase !== "thinking") {
            return;
          }
          dataStream.write({
            data: {
              message: messageText,
              modelId: chatModel,
              modelName,
              phase,
            },
            transient: true,
            type: "data-waiting-status",
          });
        };

        writeWaitingStatus("waiting", "Waiting...");

        healthCheckTimer = setTimeout(() => {
          getModelAvailability(chatModel)
            .then((availability) => {
              if (availability === "impacted") {
                writeWaitingStatus(
                  "health",
                  `${modelName} may be slow or unavailable right now...`
                );
              } else {
                writeWaitingStatus("still-waiting", "Still waiting...");
              }
            })
            .catch(() => {
              writeWaitingStatus("still-waiting", "Still waiting...");
            });
        }, HEALTH_CHECK_DELAY_MS);

        const markModelActive = () => {
          if (hasModelActivity) {
            return;
          }
          hasModelActivity = true;
          clearHealthCheckTimer();
          writeWaitingStatus("thinking", "Thinking...");
        };

        const stopWaitingStatus = () => {
          hasModelActivity = true;
          clearHealthCheckTimer();
        };

        const activeTools = incognito
          ? INCOGNITO_ACTIVE_TOOLS
          : PERSISTENT_ACTIVE_TOOLS;

        const result = streamText({
          activeTools:
            isReasoningModel && !supportsTools ? [] : [...activeTools],
          instructions,
          messages: modelMessages,
          model: getLanguageModel(chatModel),
          onAbort() {
            stopWaitingStatus();
          },
          onChunk({ chunk }) {
            if (isModelStreamActivity(chunk)) {
              markModelActive();
            }
          },
          onEnd() {
            stopWaitingStatus();
          },
          onError() {
            stopWaitingStatus();
          },
          providerOptions: {
            ...(modelConfig?.gatewayOrder && {
              gateway: { order: modelConfig.gatewayOrder },
            }),
            ...(modelConfig?.reasoningEffort && {
              openai: { reasoningEffort: modelConfig.reasoningEffort },
            }),
          },
          stopWhen: isStepCount(5),
          telemetry: {
            functionId: incognito ? "stream-text-incognito" : "stream-text",
            isEnabled: isProductionEnvironment,
          },
          tools: {
            codeExecution: codeExecution({ userId: session.user.id }),
            createDocument: createDocument({
              dataStream,
              modelId: chatModel,
              session,
            }),
            deepResearch: deepResearch({ userId: session.user.id }),
            editDocument: editDocument({ dataStream, session }),
            generateFile: generateFile({ userId: session.user.id }),
            getWeather,
            mcpAction: mcpAction({ userId: session.user.id }),
            memory: memoryTool({ userId: session.user.id }),
            requestSuggestions: requestSuggestions({
              dataStream,
              modelId: chatModel,
              session,
            }),
            updateDocument: updateDocument({
              dataStream,
              modelId: chatModel,
              session,
            }),
            webSearch: webSearch({ userId: session.user.id }),
          },
        });

        dataStream.merge(
          toUIMessageStream({
            sendReasoning: isReasoningModel,
            stream: result.stream,
          })
        );

        if (titlePromise) {
          try {
            const title = await titlePromise;
            dataStream.write({ data: title, type: "data-chat-title" });
            updateChatTitleById({ chatId: id, title });
          } catch {
            /* non-fatal */
          }
        }
      },
      generateId: generateUUID,
      onEnd: async ({ messages: finishedMessages }) => {
        if (incognito) {
          return;
        }

        if (isToolApprovalFlow) {
          await Promise.all(
            finishedMessages.map(async (finishedMsg) => {
              const existingMsg = uiMessages.find(
                (m) => m.id === finishedMsg.id
              );
              if (existingMsg) {
                await updateMessage({
                  id: finishedMsg.id,
                  parts: finishedMsg.parts,
                });
                return;
              }

              await saveMessages({
                messages: [
                  {
                    attachments: [],
                    chatId: id,
                    createdAt: new Date(),
                    id: finishedMsg.id,
                    parts: finishedMsg.parts,
                    role: finishedMsg.role,
                  },
                ],
              });
            })
          );
        } else if (finishedMessages.length > 0) {
          await saveMessages({
            messages: finishedMessages.map((currentMessage) => ({
              attachments: [],
              chatId: id,
              createdAt: new Date(),
              id: currentMessage.id,
              parts: currentMessage.parts,
              role: currentMessage.role,
            })),
          });
        }
      },
      onError: () => "Oops, an error occurred!",
      originalMessages:
        !incognito && isToolApprovalFlow ? uiMessages : undefined,
    });

    return createUIMessageStreamResponse({
      async consumeSseStream({ stream: sseStream }) {
        if (incognito || !process.env.REDIS_URL) {
          return;
        }
        try {
          const streamContext = getStreamContext();
          if (streamContext) {
            const streamId = generateId();
            await createStreamId({ chatId: id, streamId });
            await streamContext.createNewResumableStream(
              streamId,
              () => sseStream
            );
          }
        } catch {
          /* non-critical */
        }
      },
      stream,
    });
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatbotError) {
      return error.toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatbotError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatbotError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
