import { OpenaiPath, REQUEST_TIMEOUT_MS } from "@/constant";
import { getRequestOptions } from "./helper";
import { api2ProviderBaseUrl } from "@/app/store";

export interface TtsRequest {
  model: "tts-1" | "tts-1-hd";
  input: string;
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

  /**
   * @default "mp3"
   */
  response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";

  /**
   * @description 0.25 ~ 4.0
   * @default 1.0
   */
  speed?: number;
}

export const TTS_MODEL_OPTIONS: TtsRequest["model"][] = ["tts-1", "tts-1-hd"];
export const TTS_VOICE_OPTIONS: TtsRequest["voice"][] = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
];
export const TTS_RESPONSE_FORMAT_OPTIONS: Exclude<
  TtsRequest["response_format"],
  undefined
>[] = ["mp3", "opus", "aac", "flac", "wav", "pcm"];

export class OpenAITTSAPI {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  path(path: string): string {
    return [api2ProviderBaseUrl.TTS, path].join("/");
  }

  async request(
    request: TtsRequest,
    signal?: AbortSignal,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const abortSignal = signal || controller.signal;

      signal && signal.addEventListener("abort", () => controller.abort());

      const res = await fetch(this.path(OpenaiPath.SpeechPath), {
        ...getRequestOptions(this.apiKey, request),
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
}
