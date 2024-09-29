import { createPersistStore } from "../utils/store";
import { uploadToGetFileUrl } from "@/app/utils/upload-to-server";
import { message } from "antd";

export enum Theme {
  Dark = "dark",
  Light = "light",
}

export interface APIKey {
  id: string;
  name: string;
  apiKey: string;
}

const DEFAULT_CONFIG = {
  apiKeys: [] as APIKey[],
  selectedApiKeyId: "",
  theme: Theme.Light as Theme,
  lastUpdate: Date.now(),
} as const;

export const useAppConfig = createPersistStore(
  { ...DEFAULT_CONFIG },
  (_set, get) => ({
    getSelectedApiKey(): string {
      return get().apiKeys.find((k) => k.id === get().selectedApiKeyId)?.apiKey || "";
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
