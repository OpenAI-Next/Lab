import {LumaEndpoint, PikaEndpoint, REQUEST_TIMEOUT_MS} from "@/constant";
import {api2ProviderBaseUrl} from "@/app/store";
import {getRequestOptions} from "@/app/client/helper";
import {CreatePikaTaskRequest, QueryPikaTaskRequest} from "@/app/client/pika";

export interface LumaCreateTaskRequest {
    user_prompt: string; // "A teddy bear in sunglasses playing electric guitar, dancing and headbanging in the jungle in front of a large beautiful waterfall"
    aspect_ratio: string; // "16:9"
    expand_prompt: boolean;
}

export class LumaApi{
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    path(endpoint: LumaEndpoint) {
        return [api2ProviderBaseUrl.Pika, endpoint].join("/");
    }

    async createLumaTask(request: LumaCreateTaskRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const abortSignal = signal || controller.signal;

        signal && signal.addEventListener("abort", () => controller.abort());

        try {
            const res = await fetch(this.path(LumaEndpoint.LUMA_CREATE), {
                ...getRequestOptions(this.apiKey, request),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;
        } catch (e) {
            console.error("[LumaProxy] failed to make a pika create-task request", e);
            throw e;
        }
    }

    // async queryLumaTask(request: QueryPikaTaskRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
    //     const controller = new AbortController();
    //     const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    //     const abortSignal = signal || controller.signal;
    //
    //     signal && signal.addEventListener("abort", () => controller.abort());
    //
    //     try {
    //         const res = await fetch(this.path(PikaEndpoint.PIKA_QUERY).replace("{{model}}", request.model).replace("{{id}}", request.id), {
    //             ...getRequestOptions(this.apiKey, "GET"),
    //             signal: abortSignal
    //         });
    //
    //         clearTimeout(timeoutId);
    //
    //         return res;
    //     } catch (e) {
    //         console.error("[PikaProxy] failed to make a pika query-task request", e);
    //         throw e;
    //     }
    // }
}
