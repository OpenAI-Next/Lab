// app/client/FluxProxy.ts

export interface FluxImageRequest {
    prompt: string;
    width: number;
    height: number;
}

export interface FluxImageResponse {
    id: string
}

export interface FluxGetRequest {
    request_id: string;
}

export interface FluxGetResponse {
    id: string;
    status: string | "Ready";
    result: string;
}

export class FluxAPI {
    private readonly apiKey: string;

    private readonly website = "https://blackforestlabs.ai";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }


}
