import {api2ProviderBaseUrl} from "@/app/store";
import {GptsSearchEndpoint, REQUEST_TIMEOUT_MS} from "@/constant";
import {getHeadersWithApiKey} from "@/app/client/helper";

export interface GptsSearchRequest {
    keywords: string;
}

export interface GptsSearchResponse {
    code: number;
    msg: string;
    sn: string;
    data: {
        id: string;//g-xxxxxx
        title: string;
        link?: string;
        description: string;
        favicon?: string;
    }[];
}

export class GPTsAPI {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    path() {
        return [api2ProviderBaseUrl.Gpts, GptsSearchEndpoint.Default].join("/");
    }

    requestOptions(): RequestInit {
        return {
            method: "GET",
            headers: getHeadersWithApiKey(this.apiKey, "GET")
        }
    }

    async search(request: GptsSearchRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path().replace("{{keywords}}", request.keywords), {
                ...this.requestOptions(),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;

        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    }


    // async searchGptsByKeywords(keywords: string) {
    //     if (!keywords) return Promise.resolve({data: []} as unknown as GptsSearchResponse);
    //     const res = await fetch(GptGodPath.SEARCH_GPTS.replace("{{keywords}}", keywords), {
    //         method: "GET",
    //         headers: {
    //             "Authorization": "Bearer " + GPT_GOD_API_KEY,
    //         }
    //     })
    //     return await res.json() as Promise<GptsSearchResponse>;
    // }

}
