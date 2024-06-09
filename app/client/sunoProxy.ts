import {REQUEST_TIMEOUT_MS, SunoEndpoint} from "@/constant";
import {getRequestOptions} from "@/app/client/helper";
import {api2ProviderBaseUrl} from "@/app/store";

export interface SunoCreateRequest {
    title: string;                              // 音乐标题
    tags: string;                               // 音乐风格, 必填,空格分隔,建议使用英文
    prompt: string;                             // 音乐创作提示词,自定义创作且非纯音乐必填
    gpt_description_prompt: string;             // GPT描述提示，描述创作必填
    mv: string;                                 // 模型
    make_instrumental?: boolean;                // 是否纯音乐
    continue_at?: number;                       //继续剪辑时间，秒
    continue_clip_id?: string;                  //继续剪辑的clip_id
}

export interface SunoCreateResponse {
    server_id: string;
    id: string;
    clips: SunoClip[];
    metadata: SunoMetadata;
    major_model_version: string;
    status: "complete" | "streaming" | string;
    created_at: string;
    batch_size: number;
}

export interface SunoQueryRequest {
    ids: string;            // clips id 多个id逗号分割
    server_id: string;      // create接口中返回的id
}

export type SunoQueryResponse = SunoClip[]

interface SunoMetadata {
    tags: SunoCreateRequest["tags"];
    prompt: SunoCreateRequest["prompt"];
    gpt_description_prompt: SunoCreateRequest["gpt_description_prompt"];
    audio_prompt_id: string;
    history: {
        "id": string,
        "continue_at": number,
    };
    concat_history: string;
    type: string | "gen";
    duration: number
    refund_credits: boolean;
    stream: boolean;
    error_type: string | null;
    error_message: string | null;
}

export interface SunoClip {
    id: string;
    video_url: string;
    audio_url: string;
    image_url: string;
    image_large_url: string;
    is_video_pending: boolean;
    major_model_version: string | "v3";
    model_name: string | "chirp-v3";
    metadata: SunoMetadata;
    is_liked: boolean;
    user_id: string;
    display_name: string;
    handle: string;
    is_handle_updated: boolean;
    is_trashed: boolean;
    reaction: any | null;
    created_at: string;//"2024-05-12T16:51:35.325Z"
    status: string | "submitted" | "complete" | "streaming" | "queued";
    title: string;
    play_count: number;
    upvote_count: number;
    is_public: boolean;
}

// const sunoCreateResponseExample = {
//     "server_id": "8869c0d9-07e1-45c4-b865-3ff0bedec3ba",
//     "id": "ebc4a87c-0601-4a94-a594-101671e3a710",
//     "clips": [
//         {
//             "id": "825cc02d-a2b5-43e9-af85-5e363a362531",
//             "video_url": "",
//             "audio_url": "",
//             "image_url": null,
//             "image_large_url": null,
//             "is_video_pending": false,
//             "major_model_version": "v3",
//             "model_name": "chirp-v3",
//             "metadata": {
//                 "tags": "classic",
//                 "prompt": "情歌",
//                 "gpt_description_prompt": null,
//                 "audio_prompt_id": null,
//                 "history": null,
//                 "concat_history": null,
//                 "type": "gen",
//                 "duration": null,
//                 "refund_credits": null,
//                 "stream": true,
//                 "error_type": null,
//                 "error_message": null
//             },
//             "is_liked": false,
//             "user_id": "51872c55-7954-48eb-a98e-089f576b9061",
//             "display_name": "EmpyrealMusicVideos094",
//             "handle": "empyrealmusicvideos094",
//             "is_handle_updated": false,
//             "is_trashed": false,
//             "reaction": null,
//             "created_at": "2024-05-10T16:03:32.267Z",
//             "status": "submitted",
//             "title": "ai",
//             "play_count": 0,
//             "upvote_count": 0,
//             "is_public": false
//         },
//         {
//             "id": "df0c7c32-f29a-43b8-bd98-4c93a356de01",
//             "video_url": "",
//             "audio_url": "",
//             "image_url": null,
//             "image_large_url": null,
//             "is_video_pending": false,
//             "major_model_version": "v3",
//             "model_name": "chirp-v3",
//             "metadata": {
//                 "tags": "classic",
//                 "prompt": "情歌",
//                 "gpt_description_prompt": null,
//                 "audio_prompt_id": null,
//                 "history": null,
//                 "concat_history": null,
//                 "type": "gen",
//                 "duration": null,
//                 "refund_credits": null,
//                 "stream": true,
//                 "error_type": null,
//                 "error_message": null
//             },
//             "is_liked": false,
//             "user_id": "51872c55-7954-48eb-a98e-089f576b9061",
//             "display_name": "EmpyrealMusicVideos094",
//             "handle": "empyrealmusicvideos094",
//             "is_handle_updated": false,
//             "is_trashed": false,
//             "reaction": null,
//             "created_at": "2024-05-10T16:03:32.267Z",
//             "status": "submitted",
//             "title": "ai",
//             "play_count": 0,
//             "upvote_count": 0,
//             "is_public": false
//         }
//     ],
//     "metadata": {
//         "tags": "classic",
//         "prompt": "情歌",
//         "gpt_description_prompt": null,
//         "audio_prompt_id": null,
//         "history": null,
//         "concat_history": null,
//         "type": "gen",
//         "duration": null,
//         "refund_credits": null,
//         "stream": true,
//         "error_type": null,
//         "error_message": null
//     },
//     "major_model_version": "v3",
//     "status": "complete",
//     "created_at": "2024-05-10T16:03:32.251Z",
//     "batch_size": 1
// }
//
// const sunoFullResponseExample = {
//     "nanoid": "DzBxuv3PBsSgtCnmkRJMH",
//     "server_id": "8848e19a-00ac-4857-980d-09c609a71e55",
//     "id": "3d9b9f19-a924-4f8f-9b6f-179ba3cf59e3",
//     "clips": [
//         {
//             "id": "936bef76-ea37-48e7-b30c-1b88bccea742",
//             "video_url": "https://cdn1.suno.ai/936bef76-ea37-48e7-b30c-1b88bccea742.mp4",
//             "audio_url": "https://cdn1.suno.ai/936bef76-ea37-48e7-b30c-1b88bccea742.mp3",
//             "image_url": "https://cdn1.suno.ai/image_936bef76-ea37-48e7-b30c-1b88bccea742.png",
//             "image_large_url": "https://cdn1.suno.ai/image_large_936bef76-ea37-48e7-b30c-1b88bccea742.png",
//             "is_video_pending": false,
//             "major_model_version": "v3",
//             "model_name": "chirp-v3",
//             "metadata": {
//                 "tags": "tag",
//                 "prompt": "I Like You",
//                 "gpt_description_prompt": null,
//                 "audio_prompt_id": null,
//                 "history": null,
//                 "concat_history": null,
//                 "type": "gen",
//                 "duration": 39.48,
//                 "refund_credits": false,
//                 "stream": true,
//                 "error_type": null,
//                 "error_message": null
//             },
//             "is_liked": false,
//             "user_id": "5ac03744-9ea4-4f2f-9660-590b3e575f45",
//             "display_name": "ChargingAudioQuality339",
//             "handle": "chargingaudioquality339",
//             "is_handle_updated": false,
//             "is_trashed": false,
//             "reaction": null,
//             "created_at": "2024-05-12T06:59:09.235Z",
//             "status": "complete",
//             "title": "title",
//             "play_count": 0,
//             "upvote_count": 0,
//             "is_public": false
//         },
//         {
//             "id": "c7a31bb8-fcc7-4bc3-a1ae-ae42f5fb62c2",
//             "video_url": "https://cdn1.suno.ai/c7a31bb8-fcc7-4bc3-a1ae-ae42f5fb62c2.mp4",
//             "audio_url": "https://cdn1.suno.ai/c7a31bb8-fcc7-4bc3-a1ae-ae42f5fb62c2.mp3",
//             "image_url": "https://cdn1.suno.ai/image_c7a31bb8-fcc7-4bc3-a1ae-ae42f5fb62c2.png",
//             "image_large_url": "https://cdn1.suno.ai/image_large_c7a31bb8-fcc7-4bc3-a1ae-ae42f5fb62c2.png",
//             "is_video_pending": false,
//             "major_model_version": "v3",
//             "model_name": "chirp-v3",
//             "metadata": {
//                 "tags": "tag",
//                 "prompt": "I Like You",
//                 "gpt_description_prompt": null,
//                 "audio_prompt_id": null,
//                 "history": null,
//                 "concat_history": null,
//                 "type": "gen",
//                 "duration": 120,
//                 "refund_credits": false,
//                 "stream": true,
//                 "error_type": null,
//                 "error_message": null
//             },
//             "is_liked": false,
//             "user_id": "5ac03744-9ea4-4f2f-9660-590b3e575f45",
//             "display_name": "ChargingAudioQuality339",
//             "handle": "chargingaudioquality339",
//             "is_handle_updated": false,
//             "is_trashed": false,
//             "reaction": null,
//             "created_at": "2024-05-12T06:59:09.235Z",
//             "status": "complete",
//             "title": "title",
//             "play_count": 0,
//             "upvote_count": 0,
//             "is_public": false
//         }
//     ],
//     "metadata": {
//         "tags": "tag",
//         "prompt": "I Like You",
//         "gpt_description_prompt": null,
//         "audio_prompt_id": null,
//         "history": null,
//         "concat_history": null,
//         "type": "gen",
//         "duration": null,
//         "refund_credits": null,
//         "stream": true,
//         "error_type": null,
//         "error_message": null
//     },
//     "major_model_version": "v3",
//     "status": "complete",
//     "created_at": "2024-05-12T06:59:09.224Z",
//     "batch_size": 1
// }

export class SunoAPI {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    path(endpoint: SunoEndpoint) {
        return [api2ProviderBaseUrl.Suno, endpoint].join("/");
    }

    async create(request: SunoCreateRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const abortSignal = signal || controller.signal;

        signal && signal.addEventListener("abort", () => controller.abort());

        try {
            const res = await fetch(this.path(SunoEndpoint.SUNO_CREATE), {
                ...getRequestOptions(this.apiKey, request),
                signal: abortSignal
            })

            clearTimeout(timeoutId);

            return res;

        } catch (e) {
            console.error("[SunoProxy] failed to make a suno create-task request", e);
            throw e;
        }
    }

    async query(request: SunoQueryRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const abortSignal = signal || controller.signal;

        signal && signal.addEventListener("abort", () => controller.abort());

        const path = this.path(SunoEndpoint.SUNO_QUERY).replace("{{ids}}", request.ids).replace("{{server_id}}", request.server_id);

        try {
            const res = await fetch(path, {
                ...getRequestOptions(this.apiKey, "GET"),
                signal: abortSignal
            })

            clearTimeout(timeoutId);

            return res;

        } catch (e) {
            console.error("[SunoProxy] failed to make a suno query-task request", e);
            throw e;
        }
    }

    finished(clip: SunoClip): boolean {
        return !(!clip.image_large_url || !clip.image_url || !clip.video_url || !clip.audio_url || clip.is_video_pending || clip.status !== "complete");
    }
}
