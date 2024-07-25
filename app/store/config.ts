import {createPersistStore} from "../utils/store";

export enum Theme {
    Dark = "dark",
    Light = "light",
}

interface APIKey {
    provider: Provider;
    apiKey: string;
}

type AvailableUploadServerProvider = Provider.NextAPI | Provider.ProxyAPI;

export interface UploadConfig {
    action: string;
    position: readonly string[];
    auth: string;
}

export enum Provider {
    NextAPI,
    ProxyAPI,
    DrawAPI,
}

export const PROVIDER_NAME = {
    [Provider.NextAPI]: "NextAPI",
    [Provider.ProxyAPI]: "ProxyAPI",
    [Provider.DrawAPI]: "DrawAPI",
} as const;

export const ProviderBaseUrlMap = {
    [Provider.NextAPI]: "https://api.openai-next.com",
    [Provider.ProxyAPI]: "https://proxy.openai-next.com",
    [Provider.DrawAPI]: "https://mj.openai-next.com",
} as const;

export const api2Provider = {
    Chat: Provider.NextAPI,
    Embeddings: Provider.NextAPI,
    DallE: Provider.NextAPI,
    TTS: Provider.NextAPI,
    Whisper: Provider.NextAPI,
    Midjourney: Provider.DrawAPI,
    Suno: Provider.ProxyAPI,
    Pika: Provider.ProxyAPI,
    Luma: Provider.ProxyAPI,
    Doc2X: Provider.ProxyAPI,
    GPTs: Provider.ProxyAPI,
} as const;

export const api2ProviderBaseUrl = {
    Chat: ProviderBaseUrlMap[api2Provider.Chat],
    Embeddings: ProviderBaseUrlMap[api2Provider.Embeddings],
    DallE: ProviderBaseUrlMap[api2Provider.DallE],
    TTS: ProviderBaseUrlMap[api2Provider.TTS],
    Whisper: ProviderBaseUrlMap[api2Provider.Whisper],
    Midjourney: ProviderBaseUrlMap[api2Provider.Midjourney],
    Suno: ProviderBaseUrlMap[api2Provider.Suno],
    Pika: ProviderBaseUrlMap[api2Provider.Pika],
    Luma: ProviderBaseUrlMap[api2Provider.Luma],
    Doc2X: ProviderBaseUrlMap[api2Provider.Doc2X],
    Gpts: ProviderBaseUrlMap[api2Provider.GPTs],
} as const;

export const UPLOAD_INFO = {
    [Provider.NextAPI]: {
        action: [[ProviderBaseUrlMap[Provider.NextAPI]], "fileSystem/upload"].join("/"),
        position: ["url"],
    },
    [Provider.ProxyAPI]: {
        action: [[ProviderBaseUrlMap[Provider.ProxyAPI]], "v1/file"].join("/"),
        position: ["data", "url"],
    },
} as const;

const DEFAULT_CONFIG = {
    apiKeys: [] as APIKey[],
    uploadServerProvider: Provider.NextAPI as AvailableUploadServerProvider,
    theme: Theme.Light as Theme,
    lastUpdate: Date.now(),
} as const;

export const useAppConfig = createPersistStore(
    {...DEFAULT_CONFIG},
    (_set, get) => ({
        getFirstApiKey(provider: Provider): string {
            const key = get().apiKeys.find(item => item.provider === provider)?.apiKey;
            if (key) {
                return key;
            } else {
                console.error(`No API key found for provider ${PROVIDER_NAME[provider]}`);
                return "";
            }
        },

        getUploadConfig(): UploadConfig {
            let provider = get().uploadServerProvider;
            if (!(provider in UPLOAD_INFO)) {
                provider = Provider.NextAPI;
            }
            return {
                action: UPLOAD_INFO[provider].action,
                position: UPLOAD_INFO[provider].position,
                auth: "Bearer " + this.getFirstApiKey(provider),
            };
        }
    }),
    {
        name: "app-config",
        version: 1,
        migrate(persistedState) {
            return persistedState as typeof DEFAULT_CONFIG as any;
        },
    },
);

