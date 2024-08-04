// app/client/ViduProxy.ts

export interface ViduTaskGenerationRequest {
    input: {
        prompts: {
            content: string;
            enhance: boolean;
            type: "text"| "image";
        }[];
    };
    settings: {
        style: string;
        aspect_ratio: string;
        duration: number;
        model: string;
    };
    type: string;
}

export class ViduAPI {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }


}
