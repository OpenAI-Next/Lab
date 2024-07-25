import {OpenaiPath, REQUEST_TIMEOUT_MS} from "@/constant";
import {getAuthHeaderWithApiKey} from "@/app/client/helper";
import {api2ProviderBaseUrl} from "@/app/store";

export interface WhisperRequest {
    /**
     * @description File uploads are currently limited to 25 MB and the following input file types are supported: mp3, mp4, mpeg, mpga, m4a, wav, webm.
     */
    file: any;

    model: "whisper-1" | "whisper-pro",

    prompt?: string;

    /**
     * @default "json"
     */
    response_format?: "json" | "text" | "srt" | "verbose_json" | "vtt";

    /**
     * @default 0
     */
    temperature?: number;
}

export const WHISPER_MODEL_OPTIONS: WhisperRequest["model"][] = ["whisper-1", "whisper-pro"];

export const WHISPER_RESPONSE_FORMAT_OPTIONS: Exclude<WhisperRequest["response_format"], undefined>[] = ["json", "text", "srt", "verbose_json", "vtt"];

export class OpenAIWhisperAPI {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    path(): string {
        return [api2ProviderBaseUrl.Whisper, OpenaiPath.TranscriptionPath].join("/");
    }

    async request(request: WhisperRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path(), {
                // 由于 ASR 需要使用 form-data 上传文件，所以不使用通用的 getRequestOptions 方法
                ...this.getRequestOptions(request),
                signal: abortSignal,
            });

            clearTimeout(timeoutId);

            return res;
        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                console.warn("[Request] TTS request aborted");
            } else {
                console.error("[Request] Failed to make a TTS request", e);
            }
            throw e;
        }
    }

    private getRequestOptions(options: WhisperRequest): RequestInit {
        if (options.temperature === 0) {
            delete options.temperature;
        }
        const formData = new FormData();
        const convertedFile = new File([options.file], "audio.webm", {type: options.file.type});

        formData.append("model", options.model);
        formData.append("file", convertedFile);
        options.prompt && formData.append("prompt", options.prompt);
        options.response_format && formData.append("response_format", options.response_format);
        options.temperature && formData.append("temperature", options.temperature.toString());

        return {
            method: "POST",
            headers: getAuthHeaderWithApiKey(this.apiKey),
            body: formData,
        }
    }
}
