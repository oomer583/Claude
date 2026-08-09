import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";

const DEFAULT_ROUTER_BASE_URL = "http://9router:20128/v1";

function getGatewayConfig() {
  const apiKey =
    process.env.MODEL_GATEWAY_API_KEY ??
    process.env.ROUTER_API_KEY ??
    "local-test";
  const baseURL =
    process.env.MODEL_GATEWAY_BASE_URL ??
    process.env.ROUTER_BASE_URL ??
    DEFAULT_ROUTER_BASE_URL;

  return { apiKey, baseURL };
}

function getRouterProvider() {
  const { apiKey, baseURL } = getGatewayConfig();

  return createOpenAICompatible({
    apiKey,
    baseURL,
    name: "model-gateway",
  });
}

function resolveModelId(requestedModelId: string) {
  return process.env.MODEL_ID?.trim() || requestedModelId;
}

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        chatModel,
        titleModel: mockTitleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": mockTitleModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  return getRouterProvider().chatModel(resolveModelId(modelId));
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  const routerTitleModel =
    process.env.ROUTER_TITLE_MODEL ?? process.env.MODEL_ID ?? titleModel.id;
  return getRouterProvider().chatModel(routerTitleModel);
}
