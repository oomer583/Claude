export const DEFAULT_CHAT_MODEL = "moonshotai/kimi-k2.5";

export const titleModel = {
  description: "Fast model for title generation",
  gatewayOrder: ["fireworks", "bedrock"],
  id: "moonshotai/kimi-k2.5",
  name: "Kimi K2.5",
  provider: "moonshotai",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  gatewayOrder?: string[];
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  {
    description: "Fast and capable model with tool use",
    gatewayOrder: ["bedrock", "deepinfra"],
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "deepseek",
  },
  {
    description: "Moonshot AI flagship model",
    gatewayOrder: ["fireworks", "bedrock"],
    id: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    provider: "moonshotai",
  },
  {
    description: "Compact reasoning model",
    gatewayOrder: ["groq", "bedrock"],
    id: "openai/gpt-oss-20b",
    name: "GPT OSS 20B",
    provider: "openai",
    reasoningEffort: "low",
  },
  {
    description: "Open-source 120B parameter model",
    gatewayOrder: ["fireworks", "bedrock"],
    id: "openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "openai",
    reasoningEffort: "low",
  },
  {
    description: "Fast non-reasoning model with tool use",
    gatewayOrder: ["xai"],
    id: "xai/grok-4.1-fast-non-reasoning",
    name: "Grok 4.1 Fast",
    provider: "xai",
  },
];

function getGatewayBaseUrl() {
  return (
    process.env.MODEL_GATEWAY_BASE_URL ??
    process.env.ROUTER_BASE_URL ??
    "http://9router:20128/v1"
  ).replace(/\/$/, "");
}

function getGatewayApiKey() {
  return (
    process.env.MODEL_GATEWAY_API_KEY ??
    process.env.ROUTER_API_KEY ??
    "local-test"
  );
}

type GatewayModel = {
  id: string;
  name?: string;
  type?: string;
  tags?: string[];
  owned_by?: string;
  supported_parameters?: string[];
  architecture?: {
    input_modalities?: string[];
  };
};

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

function capabilitiesForGatewayModel(model: GatewayModel): ModelCapabilities {
  const tags = new Set(model.tags ?? []);
  const params = new Set(model.supported_parameters ?? []);
  const modalities = new Set(model.architecture?.input_modalities ?? []);

  return {
    reasoning:
      tags.has("reasoning") ||
      params.has("reasoning") ||
      params.has("reasoning_effort"),
    tools:
      tags.has("tool-use") ||
      tags.has("tools") ||
      params.has("tools") ||
      params.has("tool_choice"),
    vision:
      tags.has("vision") ||
      modalities.has("image") ||
      params.has("images"),
  };
}

async function fetchGatewayModels(): Promise<GatewayModel[]> {
  try {
    const response = await fetch(`${getGatewayBaseUrl()}/models`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${getGatewayApiKey()}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    const data = Array.isArray(json?.data) ? json.data : [];
    return data.filter(
      (model: GatewayModel) =>
        typeof model?.id === "string" &&
        (!model.type || model.type === "language" || model.type === "model")
    );
  } catch {
    return [];
  }
}

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  const gatewayModels = await fetchGatewayModels();
  const dynamicCapabilities = Object.fromEntries(
    gatewayModels.map((model) => [model.id, capabilitiesForGatewayModel(model)])
  );

  return Object.fromEntries(
    chatModels.map((model) => [
      model.id,
      dynamicCapabilities[model.id] ?? {
        reasoning: Boolean(model.reasoningEffort),
        tools: false,
        vision: false,
      },
    ])
  );
}

export const isDemo = process.env.IS_DEMO === "1";

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  const gatewayModels = await fetchGatewayModels();

  return gatewayModels.map((model) => ({
    capabilities: capabilitiesForGatewayModel(model),
    description: "Available through the configured model gateway",
    id: model.id,
    name: model.name ?? model.id,
    provider: model.owned_by ?? model.id.split("/")[0] ?? "gateway",
  }));
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);

export type ModelAvailability = "healthy" | "impacted" | "unknown";

export async function getModelAvailability(
  modelId: string
): Promise<ModelAvailability> {
  const effectiveModelId = process.env.MODEL_ID?.trim() || modelId;
  const gatewayModels = await fetchGatewayModels();

  if (gatewayModels.length === 0) {
    return "unknown";
  }

  return gatewayModels.some((model) => model.id === effectiveModelId)
    ? "healthy"
    : "impacted";
}
