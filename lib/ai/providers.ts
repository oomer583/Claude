import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";

const DEFAULT_ROUTER_BASE_URL = "http://9router:20128/v1";

function getRouterProvider() {
  const apiKey = process.env.ROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ROUTER_API_KEY is required to access the internal 9Router model gateway."
    );
  }

  return createOpenAICompatible({
    apiKey,
    baseURL: process.env.ROUTER_BASE_URL ?? DEFAULT_ROUTER_BASE_URL,
    name: "9router",
  });
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

  return getRouterProvider().chatModel(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  const routerTitleModel = process.env.ROUTER_TITLE_MODEL ?? titleModel.id;
  return getRouterProvider().chatModel(routerTitleModel);
}
