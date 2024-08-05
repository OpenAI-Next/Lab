// app/client/ViduProxy.ts

import {SunoEndpoint, ViduEndpoint} from "@/constant";
import {api2ProviderBaseUrl} from "@/app/store";
import {getRequestOptions} from "@/app/client/helper";

export interface ViduTaskGenerationRequest {
    input: {
        prompts: {
            type: string | "text" | "image";
            content: string;
            enhance: boolean;
        }[];
    };
    type: string | "img2video";
    settings: {
        style: string;
        aspect_ratio: string;
        duration: number;
        model: string | "vidu-1";
    };
}

export interface ViduTaskGenerationResponse {

}

export class ViduAPI {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    path(endpoint: ViduEndpoint) {
        return [api2ProviderBaseUrl.Vidu, endpoint].join("/");
    }

    async generateViduTask(request: ViduTaskGenerationRequest, signal?: AbortSignal, timeoutMs: number = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const abortSignal = signal || controller.signal;

        signal && signal.addEventListener("abort", () => controller.abort());

        try {
            const res = await fetch(this.path(ViduEndpoint.GENERATION), {
                ...getRequestOptions(this.apiKey, request),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;
        } catch (e) {
            console.error("[ViduProxy] failed to make a vidu generate-task request", e);
            throw e;
        }
    }

    async getViduTask(id: string, signal?: AbortSignal, timeoutMs: number = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const abortSignal = signal || controller.signal;

        signal && signal.addEventListener("abort", () => controller.abort());

        try {
            const res = await fetch(this.path(ViduEndpoint.TASK_GET).replace("{{id}}", id), {
                ...getRequestOptions(this.apiKey,"GET"),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;
        } catch (e) {
            console.error("[ViduProxy] failed to make a vidu get-task request", e);
            throw e;
        }
    }

}
