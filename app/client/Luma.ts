import {LumaEndpoint, REQUEST_TIMEOUT_MS} from "@/constant";
import {api2ProviderBaseUrl} from "@/app/store";
import {getRequestOptions} from "@/app/client/helper";

export interface LumaGenerationTaskRequest {
    user_prompt: string;                    // 提示词
    aspect_ratio: string;                   // 固定为16:9, luma官方暂时不支持更改，请暂时固定传"16:9"
    expand_prompt: boolean;                 // 是否优化扩展提示词
    image_url?: any;                        // 开始帧图片
    image_end_url?: any;                    // 结束帧图片，关键帧
}

export interface LumaExtendTaskRequest {
    user_prompt: string;                    // 提示词
    aspect_ratio: string;                   // 固定为16:9, luma官方暂时不支持更改，请暂时固定传"16:9"
    expand_prompt: boolean;                 // 是否优化扩展提示词
    video_url: string;                      // 需要扩展的视频 URL，可以不是 luma 生成的视频，任意第三方视频或者 luma 的视频都可
    image_end_url?: string;                 // 结束帧图片，关键帧
}

type AccountType = "relax" | "vip";

const AccountType2Path = {
    relax: "luma",
    vip: "lumavip",
} as const;

export class LumaApi {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    path(accountType: AccountType, endpoint: LumaEndpoint) {
        return [api2ProviderBaseUrl.Pika, endpoint].join("/").replace("{{luma_account_type}}", AccountType2Path[accountType]);
    }

    async generateLumaTask(request: LumaGenerationTaskRequest, accountType: AccountType, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {

        // convert image_url and image_end_url to url
        request.image_url && (request.image_url = request.image_url.url);
        request.image_end_url && (request.image_end_url = request.image_end_url.url);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const abortSignal = signal || controller.signal;

        signal && signal.addEventListener("abort", () => controller.abort());

        try {
            const res = await fetch(this.path(accountType, LumaEndpoint.CREATE), {
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
