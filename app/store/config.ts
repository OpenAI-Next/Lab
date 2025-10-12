import { createPersistStore } from "../utils/store";
import { uploadToGetFileUrl } from "@/app/utils/upload-to-server";
import { message } from "antd";

export enum Theme {
  Dark = "dark",
  Light = "light",
}

export const DEFAULT_BASE_URL = "https://draw.openai-next.com";

export enum Provider {
  NextAPI,
  ProxyAPI,
}

export const PROVIDER_NAME = {
  [Provider.NextAPI]: "Next API",
  [Provider.ProxyAPI]: "Proxy API",
} as const;

export const ProviderBaseUrlMap = {
  // [Provider.NextAPI]: "https://api.openai-next.com",
  // [Provider.ProxyAPI]: "https://mj.openai-next.com",
  [Provider.NextAPI]: "/nextapi",
  [Provider.ProxyAPI]: "/proxyapi",
} as const;

export const ProviderRealBaseUrlMap = {
  [Provider.NextAPI]: "https://api.openai-next.com",
  [Provider.ProxyAPI]: "https://mj.openai-next.com",
} as const;

export const api2Provider = {
  Chat: Provider.NextAPI,
  Embeddings: Provider.NextAPI,
  DallE: Provider.NextAPI,
  Flux: Provider.ProxyAPI,
  TTS: Provider.NextAPI,
  Whisper: Provider.NextAPI,
  Midjourney: Provider.ProxyAPI,
  Suno: Provider.ProxyAPI,
  Vidu: Provider.ProxyAPI,
  Pika: Provider.ProxyAPI,
  Luma: Provider.ProxyAPI,
  Doc2X: Provider.ProxyAPI,
  GPTs: Provider.ProxyAPI,
  StableDiffusion: Provider.ProxyAPI,
  BibiGPT: Provider.ProxyAPI,
} as const;

export const api2ProviderBaseUrl = {
  Chat: ProviderBaseUrlMap[api2Provider.Chat],
  Embeddings: ProviderBaseUrlMap[api2Provider.Embeddings],
  DallE: ProviderBaseUrlMap[api2Provider.DallE],
  Flux: ProviderBaseUrlMap[api2Provider.Flux],
  TTS: ProviderBaseUrlMap[api2Provider.TTS],
  Whisper: ProviderBaseUrlMap[api2Provider.Whisper],
  Midjourney: ProviderBaseUrlMap[api2Provider.Midjourney],
  Suno: ProviderBaseUrlMap[api2Provider.Suno],
  Vidu: ProviderBaseUrlMap[api2Provider.Vidu],
  Pika: ProviderBaseUrlMap[api2Provider.Pika],
  Luma: ProviderBaseUrlMap[api2Provider.Luma],
  Doc2X: ProviderBaseUrlMap[api2Provider.Doc2X],
  Gpts: ProviderBaseUrlMap[api2Provider.GPTs],
  StableDiffusion: ProviderBaseUrlMap[api2Provider.StableDiffusion],
} as const;

const DEFAULT_CONFIG = {
  apiKey: "" as string,
  base_url: DEFAULT_BASE_URL as string,
  theme: Theme.Light as Theme,
  lastUpdate: Date.now(),
} as const;

export const useAppConfig = createPersistStore(
  { ...DEFAULT_CONFIG },
  (_set, get) => ({
    getApiKey() {
      return get().apiKey;
    },
    getBaseUrl() {
      return get().base_url;
    },
    resetBaseUrl() {
      _set({ base_url: DEFAULT_BASE_URL });
    },
    getProFormUploadConfig(
      type: "base64" | "url" = "base64",
      max: number = 1,
      listType: string = "picture-card",
      replaceThumbUrl: boolean = false,
      beforeUpload?: (file: any) => any,
    ) {
      switch (type) {
        case "base64":
          return {
            max: max,
            fieldProps: {
              listType,
              beforeUpload,
            },
            transform: (value: Array<{ thumbUrl?: string }>) => {
              if (!value) return undefined;

              const doReplace = (text: string) => text.replace(/^data:image\/\w+;base64,/, "");

              if (max === 1) {
                return replaceThumbUrl ? doReplace(value[0].thumbUrl || "") : value[0].thumbUrl;
              } else {
                return replaceThumbUrl ? value.map((v) => doReplace(v.thumbUrl || "")) : value.map((v) => v.thumbUrl);
              }
            },
          } as any;
        case "url":
          return {
            max: max,
            fieldProps: {
              listType,
              beforeUpload,
              customRequest: async (options: any) => {
                try {
                  const fileUrl = await uploadToGetFileUrl(options.file as File);
                  if (fileUrl) {
                    options.onSuccess?.(fileUrl, options.file);
                  } else {
                    options.onError?.(new Error("上传失败"), options.file);
                  }
                } catch (error) {
                  console.error("Upload error:", error);
                  options.onError?.(error as Error, options.file);
                }
              },
              onChange: (info: any) => {
                if (info.file.status === "done") {
                  const fileUrl = info.file.response;
                  if (fileUrl && typeof fileUrl === "string") {
                    info.file.url = fileUrl;
                  } else {
                    info.file.status = "error";
                    message.error("上传失败");
                  }
                } else if (info.file.status === "error") {
                  message.error("上传失败");
                }
              },
            },
            transform: (value: Array<{ url?: string }>) => {
              if (!value) return undefined;
              if (max === 1) {
                return value[0].url;
              } else {
                return value.map((v) => v.url);
              }
            },
          } as any;
      }
    },

    getUploadConfig() {
      return {};
    },
  }),
  {
    name: "app-config",
    version: 1,
    migrate(persistedState) {
      return persistedState as typeof DEFAULT_CONFIG as any;
    },
  },
);
