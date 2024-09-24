import {
  AIProvider,
  LogoConfig,
  ModelSeries,
  ProviderName,
  ProviderWebsite,
} from "@/app/providers/interfaces";

export class KelingAI implements AIProvider {
  readonly name: ProviderName = {
    en: "Keling AI",
    zh: "可灵 AI",
  };

  readonly logo: LogoConfig = {
    basic: {
      monochrome: "./assets/logo_basic_mono.svg",
    },
  };

  readonly website: ProviderWebsite = {
    home: "https://klingai.com/",
    api_docs: "https://docs.qingque.cn/d/home/eZQDT9y_PeLL-HOb7fWz1POgu/",
  };

  readonly models: ModelSeries[] = [
    {
      name: "Text Generation",
      description: "Powered by KOLORS®",
      category: "ImageGeneration",
      models: [],
    },
    {
      name: "Video Generation",
      description: "Powered by KLING®",
      category: "VideoGeneration",
      models: [],
    },
  ];
}
