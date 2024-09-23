export interface BibiBaseResponse {
  success: boolean;
  id: string;
  service: string;
  sourceUrl: string;
  htmlUrl: string;
  costDuration: number;
  remainingTime: number;
}

export interface BibiOpenRequest {
  url: string;
  limitation: {
    maxDuration: number;
    [key: string]: any;
  };
  prompt: string;
  promptConfig: {
    showEmoji: boolean;
    showTimestamp: boolean;
    outlineLevel: number;
    sentenceNumber: number;
    detailLevel: number;
    outputLanguage: string;
    [key: string]: any;
  };
  includeDetail: boolean;
}

export interface BibiOpenResponse extends BibiBaseResponse {
  summary: string;
}

export interface BibiChatRequest {
  url: string;
  question: string;
  history: string[];
  language: string;
  includeDetail: boolean;
}

export interface BibiChatResponse extends BibiBaseResponse {
  answer: string;
  sourceDocuments: {
    pageContent: string;
    metadata: object;
  }[];
}

export interface BibiSubtitleRequest {
  subtitle: string;
}

export interface BibiSubtitleResponse extends BibiBaseResponse {
  summary: string;
  detail: {
    title: string;
    descriptionText: string;
  };
}

export class BibiGPTAPI {
  website: string = "https://docs.bibigpt.co";
  introduce: string = `欢迎使用BibiGPT AI音视频一键总结工具，您的全能AI学习助手。\n
    无论您是想高效学习还是简化信息摘要过程，BibiGPT提供了一站式解决方案，让您轻松总结和学习来自各种平台和格式的内容。\n
    包括哔哩哔哩、YouTube、本地视频、本地音频、播客、小红书、抖音、会议、讲座，以及网页等。\n
    我们的目标是通过先进的AI技术，帮助您更快地获取和整理知识，无论何时何地，都能提升您的学习效率。`;
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
}
