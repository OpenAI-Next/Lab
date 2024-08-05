// app/client/ViduProxy.ts

import {ViduEndpoint} from "@/constant";
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
    type: keyof typeof ViduTaskType;
    settings: {
        style: keyof typeof ViduStyle;
        aspect_ratio: string;
        duration: 4 | 8;
        model: "vidu-1" | "stable";
    };
}

export interface ViduTaskGenerationResponse {
    id: string;
    input: {
        creation_id: string;
        prompts: {
            type: string;
            content: string;
            negative: boolean;
            enhance: boolean;
            recaption: string;
        }[];
        lang: "zh" | "en";
    };
    settings: ViduTaskGenerationRequest["settings"];
    type: ViduTaskGenerationRequest["type"];
    state: "queueing" | "processing" | "success" | string;
    creations: {
        id: string;
        task_id: string;
        type: "video" | string;
        grade: "draft" | string;
        uri: string;
        cover_uri: string;
        resolution: {
            width: number;
            height: number;
        };
        vote: "unspecified" | string;
        is_favor: boolean;
        src_video_duration: number;
        creator_id: string;
        video: {
            duration: number;
            fps: number;
            resolution: {
                width: number;
                height: number;
            };
        };
        is_deleted: boolean;
        err_code: string;
        created_at: string;
    }[];
    err_code: string;
    created_at: string;
}

export interface ViduUpscaleTaskRequest {
    input: {
        creation_id: string;
    };
    type: "upscale";
    settings: {
        model: "stable";
        duration: 4 | 8;
    };
}

export enum ViduTaskType {
    upscale = 'upscale',
    text2video = 'text2video',              // 无图片时
    img2video = 'img2video',                // 图片用途：用作起始帧（Use as First Frame）
    character2video = 'character2video',    // 图片用途：参考人物角色（Use for Character Reference）
}

export enum ViduModel {
    stable = 'stable',
    vidu1 = 'vidu-1',
}

export enum ViduStyle {
    general = 'general',
    anime = 'anime',
}

const vidu_task_generation_response_queueing_example: ViduTaskGenerationResponse = {
    "id": "2375606842092581",
    "input": {
        "creation_id": "0",
        "prompts": [
            {
                "type": "text",
                "content": "cloud",
                "negative": false,
                "enhance": false,
                "recaption": ""
            },
            {
                "type": "image",
                "content": "https://vidu.cf.vidu.studio/infer/tasks/24/0805/04/2375606842092581/input/prompt-02.jpeg?Expires=1722918735&Signature=ihq-BYHZm8TKhCcT3bTiv0ryQNyiNkizZYT1crgCinMxPtMVTfkLcXWWHwTKzrPxSebHFshqd7dgou1mjf0MbG8anwTxZdohytf6xjlPbFL94tYnx5YdAfwuwQX0-pJ7rcSY3VFqqbMNFGyHsu2h4OINGV0GEYn~bKPoRbkwYyVwN6XcLEeabxByCKhpw75b8~4cOSr4NH~YhOSfk~~6JWwqdezafxj7g823P0tVXms3TolK0e1FWu7Y~jJ0MmBdsfwcRrvDC5yjuWKPFb10dH32QOjKHY3QP1zLQXkD4QES11ZA6sCv4aq9j0MLQmq97mJSIRczRmCzH8ZP~0AiRQ__&Key-Pair-Id=KNW0SL0E7LV4E",
                "negative": false,
                "enhance": false,
                "recaption": ""
            }
        ],
        "lang": "en"
    },
    "settings": {
        "style": "general",
        "duration": 4,
        "aspect_ratio": "16:9",
        "model": "vidu-1"
    },
    "type": "img2video",
    "state": "queueing",
    "creations": [],
    "err_code": "",
    "created_at": "2024-08-05T04:32:14.795273Z"
}
const vidu_task_generation_response_success_example: ViduTaskGenerationResponse = {
    "id": "2375646005579044",
    "input": {
        "creation_id": "0",
        "prompts": [
            {
                "type": "text",
                "content": "在经典的西部风格中，一个表情忧郁的男人凝视着镜头，微微颤抖的嘴唇吐出一口烟雾。他的香烟发出的温暖光芒照亮了他的脸，投下的阴影强调了他的忧郁情绪。他戴着宽边帽，穿着粗犷的衣服，配有弹带。他的靴子放在栏杆上，姿态放松，但眼神中透露出更深的悲伤。",
                "negative": false,
                "enhance": false,
                "recaption": ""
            }
        ],
        "lang": "zh"
    },
    "settings": {
        "style": "general",
        "duration": 4,
        "aspect_ratio": "16:9",
        "model": "vidu-1"
    },
    "type": "text2video",
    "state": "success",
    "creations": [
        {
            "id": "2375646502238865",
            "task_id": "2375646005579044",
            "type": "video",
            "grade": "draft",
            "uri": "https://vidu.cf.vidu.studio/infer/tasks/24/0805/05/2375646005579044/creation-01/watermarked.mp4?Expires=1722838357&Signature=m4WAZQ~M3Xcwv2z3EBdHrRXWHakBXhxlaeCcI9DxjsDMf~DbcBS0h6S29A-EtymTyEUkYHJ6jFSIBt0kQitGvluT7oN5rA1H6zR~tVSUd6FM2jjRQg4FR0ff5P48I0pUtbnLNcyr2Kb-f873gNkm3WS78JTpsk0SZ1yObTFqoVBTaA2PX7FyttuEYES2Z8YrMPEVMRta0W9iV9GgB12N3cqzWrMAW9uNHftqH0T78Al4PCk9xv3TnjdZw9H3i3wyIE6kpBTfWeh2zBtNm2zzN6u5BGsX6ujPxX72X9JeRCIUpE~Rsj0dTPwJDARJhVPoTLbwvnchPdoOn3zHWQUfFA__&Key-Pair-Id=KNW0SL0E7LV4E&response-content-disposition=attachment;filename=vidu-1-general-4-2024-08-05T05%3A12%3A35Z.mp4",
            "cover_uri": "https://vidu.cf.vidu.studio/infer/tasks/24/0805/05/2375646005579044/creation-01/cover.jpeg?Expires=1722838357&Signature=ppjg5IrEjp45-zU4w5H2cH~~ZP7AW4-n9kBpS0uOQnl2DiuWIAw6y517F9jk6smVu8Q8R~Mm0nscAvdCrNABc-p~lGmYmzBBSJknjrGZVjSlZuVifuzKDR2C93qI63A1ZOemXBDUs6Ogx0Z7qqanG4HthUj1yOrAXmdWQ-Fk1pjptbBfuPwKZUDrbfVpiJdQsux6tTrYRkK1esJU~1ooIGS-NXar20FD36qGbFycQ1dCs~eQhn1vCQJ63gDkhPhcd7HDrxaZDdsACNtpF-pQi-br7Ixo4GomM~LoSblA2tohPl2e1HH8G4L0zCvLEVj6mORbJU-R2Nj6YZ8UipErNw__&Key-Pair-Id=KNW0SL0E7LV4E",
            "resolution": {
                "width": 688,
                "height": 384
            },
            "vote": "unspecified",
            "is_favor": false,
            "src_video_duration": 0,
            "creator_id": "0",
            "video": {
                "duration": 3.85,
                "fps": 16,
                "resolution": {
                    "width": 688,
                    "height": 384
                }
            },
            "is_deleted": false,
            "err_code": "",
            "created_at": "2024-08-05T05:12:35.458210Z"
        }
    ],
    "err_code": "",
    "created_at": "2024-08-05T05:12:05.145617Z"
}
const vidu_task_upscale_request_example: ViduUpscaleTaskRequest = {
    "input": {
        "creation_id": "2375584778357517"
    },
    "type": "upscale",
    "settings": {"model": "stable", "duration": 4}
}

export class ViduAPI {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    path(endpoint: ViduEndpoint) {
        return [api2ProviderBaseUrl.Vidu, endpoint].join("/");
    }

    // 根据用户输入的提示，返回可选用的任务类型
    availableTaskTypes(prompts: ViduTaskGenerationRequest["input"]["prompts"], isUpscale = false) {
        if (isUpscale) {
            return [ViduTaskType.upscale];
        }
        if (Array.isArray(prompts)) {

            if (prompts.length === 0) {
                return Object.values(ViduTaskType);
            }

            if (prompts.length === 1) {
                const prompt = prompts[0];
                if (prompt.type === "text") {
                    return [ViduTaskType.text2video];
                }

                if (prompt.type === "image") {
                    return [ViduTaskType.img2video, ViduTaskType.character2video];
                }
            }

            if (prompts.length === 2) {
                return [ViduTaskType.img2video, ViduTaskType.character2video];
            }
        }

        return [];
    }

    // 根据用户输入的提示，返回可选用的风格
    availableStyles(prompts: ViduTaskGenerationRequest["input"]["prompts"]) {
        if (Array.isArray(prompts)) {
            if (prompts.length === 0) {
                return Object.values(ViduStyle);
            }

            if (prompts.length === 1) {
                const prompt = prompts[0];
                if (prompt.type === "text") {
                    return [ViduStyle.general, ViduStyle.anime];
                }

                if (prompt.type === "image") {
                    return [ViduStyle.general,];
                }
            }

            if (prompts.length === 2) {
                return [ViduStyle.general];
            }
        }

        return [];
    }

    availableModels(isUpscale: boolean) {
        return isUpscale ? [ViduModel.stable] : [ViduModel.vidu1];
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

    async submitUpscaleTask(request: ViduUpscaleTaskRequest, signal?: AbortSignal, timeoutMs: number = 10000) {
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
            console.error("[ViduProxy] failed to make a vidu upscale-task request", e);
            throw e;
        }
    }

    async getViduTask(id: ViduTaskGenerationResponse["id"], signal?: AbortSignal, timeoutMs: number = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const abortSignal = signal || controller.signal;

        signal && signal.addEventListener("abort", () => controller.abort());

        try {
            const res = await fetch(this.path(ViduEndpoint.TASK_GET).replace("{{id}}", id), {
                ...getRequestOptions(this.apiKey, "GET"),
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
