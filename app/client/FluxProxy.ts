// app/client/FluxProxy.ts
// "https://blackforestlabs.ai"

import { noApiKeys } from "@/app/utils";
import { FluxEndpoint, REQUEST_TIMEOUT_MS } from "@/constant";
import { api2ProviderBaseUrl } from "@/app/store";
import { getRequestOptions } from "@/app/client/helper";

export interface FluxImageRequest {
  prompt: string;
  width: number;
  height: number;
}

export interface FluxImageResponse {
  id: string;
}

export interface FluxGetRequest {
  request_id: string;
}

export interface FluxGetResponse {
  id: string;
  status: string | "Ready";
  result: string;
}

// export interface FluxPromptEnhanceRequest {
//     messages: string;
// }
//
// export interface FluxPromptEnhanceResponse {
//     data: string;
// }

export class FluxAPI {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  noKey(): boolean {
    return noApiKeys(this.apiKey);
  }

  path(endpoint: FluxEndpoint | string): string {
    return [api2ProviderBaseUrl.Flux, endpoint].join("/");
  }

  async onImage(
    request: FluxImageRequest,
    signal: AbortSignal,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    try {
      const res = await fetch(this.path(FluxEndpoint.IMAGE), {
        ...getRequestOptions(this.apiKey, request),
        signal: abortSignal,
      });
      clearTimeout(timeoutId);
      return res;
    } catch (e) {
      throw e;
    }
  }

  async getImage(
    request: FluxGetRequest,
    signal: AbortSignal,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    try {
      const res = await fetch(
        this.path(
          FluxEndpoint.GET.replace("{{request_id}}", request.request_id),
        ),
        {
          ...getRequestOptions(this.apiKey, "GET"),
          signal: abortSignal,
        },
      );
      clearTimeout(timeoutId);
      return res;
    } catch (e) {
      throw e;
    }
  }

  // async promptEnhance(request: FluxPromptEnhanceRequest): Promise<Response> {
  //    try {
  //         return await fetch(this.path(FluxEndpoint.PROMPT_ENHANCE), {
  //             ...getRequestOptions(this.apiKey, request)
  //         })
  //     } catch (e) {
  //         throw e;
  //    }
  // }
}
