import { PikaEndpoint, REQUEST_TIMEOUT_MS } from "@/constant";
import { api2ProviderBaseUrl } from "@/app/store";
import { getRequestOptions } from "@/app/client/helper";

export type AvailablePikaModel = "pika-video";

export interface CreatePikaTaskRequest {
  model: AvailablePikaModel;
  prompt: string;
}

export interface CreatePikaTaskResponse {
  id: string; // e.g. "f6fef494-9b02-4ca1-b106-c93ca8a100e4|553d1e1b-a901-4f4c-8cc3-113c29c95c4d"
}

export interface QueryPikaTaskRequest {
  model: AvailablePikaModel;
  id: string;
}

export interface QueryPikaTaskResponse {
  url: {
    success: boolean;
    data?: {
      results: {
        id: string;
        promptText: string;
        params: {
          options: {
            aspectRatio: number;
            frameRate: number;
            camera: {
              zoom: any | null;
              pan: any | null;
              tilt: any | null;
              rotate: any | null;
            };
            parameters: {
              motion: number;
              guidanceScale: number;
              negativePrompt: string;
              seed: number | null;
            };
            extend: boolean;
          };
          userId: string;
          promptText: string;
          sfx: boolean;
          styleId: null;
        };
        adjusted: boolean;
        upscaled: boolean;
        extended: number;
        hasSfx: boolean;
        lipSynced: boolean;
        videos: {
          id: string;
          status: "finished" | "pending" | "";
          progress?: number;
          seed?: number;
          resultUrl?: string;
          videoPoster?: string;
          imageThumb?: string;
          duration?: number;
          feedback?: number;
          favorited?: boolean;
          folders?: [];
        }[];
      }[];
    };
    error?: string;
  };
}

const QUERY_PIKA_RESPONSE_EXAMPLE: QueryPikaTaskResponse = {
  url: {
    success: true,
    data: {
      results: [
        {
          id: "553d1e1b-a901-4f4c-8cc3-113c29c95c4d",
          promptText: "cats",
          params: {
            options: {
              aspectRatio: 1.7777777777777777,
              frameRate: 24,
              camera: {
                zoom: null,
                pan: null,
                tilt: null,
                rotate: null,
              },
              parameters: {
                motion: 1,
                guidanceScale: 12,
                negativePrompt: "",
                seed: null,
              },
              extend: false,
            },
            userId: "8d28bc41-156a-4e77-98ec-1ad2d0b67917",
            promptText: "cats",
            sfx: false,
            styleId: null,
          },
          adjusted: false,
          upscaled: false,
          extended: 0,
          hasSfx: false,
          lipSynced: false,
          videos: [
            {
              id: "553d1e1b-a901-4f4c-8cc3-113c29c95c4d",
              status: "finished",
              seed: 110324451202706,
              resultUrl:
                "https://cdn.pika.art/v1/553d1e1b-a901-4f4c-8cc3-113c29c95c4d/cats_seed110324451202706.mp4",
              videoPoster:
                "https://cdn.pika.art/v1/553d1e1b-a901-4f4c-8cc3-113c29c95c4d/poster.jpg",
              imageThumb:
                "https://cdn.pika.art/v1/553d1e1b-a901-4f4c-8cc3-113c29c95c4d/thumbnail.jpg",
              duration: 3,
              feedback: 0,
              favorited: false,
              folders: [],
            },
          ],
        },
      ],
    },
  },
};

const PENDING_PIKA_DATA_EXAMPLE: QueryPikaTaskResponse = {
  url: {
    success: true,
    data: {
      results: [
        {
          id: "80ad60ec-e355-43f4-ae0c-14dc726f8644",
          promptText: "Iphone 17",
          params: {
            options: {
              aspectRatio: 1.7777777777777777,
              frameRate: 24,
              camera: {
                zoom: null,
                pan: null,
                tilt: null,
                rotate: null,
              },
              parameters: {
                motion: 1,
                guidanceScale: 12,
                negativePrompt: "",
                seed: null,
              },
              extend: false,
            },
            userId: "cacee95c-d514-4881-b0de-5ca8f60217a5",
            promptText: "Iphone 17",
            sfx: false,
            styleId: null,
          },
          adjusted: false,
          upscaled: false,
          extended: 0,
          hasSfx: false,
          lipSynced: false,
          videos: [
            {
              id: "80ad60ec-e355-43f4-ae0c-14dc726f8644",
              status: "pending",
              progress: 13,
            },
          ],
        },
      ],
    },
  },
};

const SERVICE_ERROR_RESPONSE_EXAMPLE: QueryPikaTaskResponse = {
  url: {
    success: false,
    error: "Something went wrong",
  },
};

export class PikaAPI {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  path(endpoint: PikaEndpoint) {
    return [api2ProviderBaseUrl.Pika, endpoint].join("/");
  }

  async createPikaTask(
    request: CreatePikaTaskRequest,
    signal?: AbortSignal,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    try {
      const res = await fetch(this.path(PikaEndpoint.PIKA_CREATE), {
        ...getRequestOptions(this.apiKey, request),
        signal: abortSignal,
      });

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      console.error(
        "[PikaProxy] failed to make a pika generate-task request",
        e,
      );
      throw e;
    }
  }

  async queryPikaTask(
    request: QueryPikaTaskRequest,
    signal?: AbortSignal,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    try {
      const res = await fetch(
        this.path(PikaEndpoint.PIKA_QUERY)
          .replace("{{model}}", request.model)
          .replace("{{id}}", request.id),
        {
          ...getRequestOptions(this.apiKey, "GET"),
          signal: abortSignal,
        },
      );

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      console.error("[PikaProxy] failed to make a pika query-task request", e);
      throw e;
    }
  }
}
