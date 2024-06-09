import {MidjourneyEndpoint, REQUEST_TIMEOUT_MS} from "@/constant";
import {MidjourneyBlendTaskConfigType, MidjourneyImagineTaskConfigType} from "@/app/pages/Midjourney";
import {getRequestOptions} from "@/app/client/helper";
import {api2ProviderBaseUrl} from "@/app/store";

export interface MidjourneyImagineTaskRequestPayload {
    botType: "MID_JOURNEY" | "NIJI_JOURNEY";
    prompt: string;
    base64Array: string[];//垫图base64数组
}

export interface MidjourneyBlendTaskRequestPayload {
    botType: "MID_JOURNEY" | "NIJI_JOURNEY";
    base64Array: string[];                              // base64数组，最多5张
    dimensions: "PORTRAIT" | "SQUARE" | "LANDSCAPE";    // 图片尺寸，PORTRAIT(2:3); SQUARE(1:1); LANDSCAPE(3:2)
}

export interface MidjourneySubmitTaskResponseType {
    code: 1 | 2 | 4 | 22 | number;          // 1-提交成功, 22-排队中, other-错误
    description: string;                    // 描述
    result: string;                         // 任务ID
    properties: {                           // 扩展字段
        discordChannelId: string;           // 任务提交的discord频道ID
        discordInstanceId: string;          // 任务提交的discord实例ID
    }
}

export interface MidjourneyFetchTaskRequestPayload {
    taskId: string;
}

export interface MidjourneyShortenTaskRequestPayload {
    prompt: string;
    botType?: "MID_JOURNEY" | "NIJI_JOURNEY";
}

export interface MidjourneyGetSeedRequestPayload {
    taskId: string;
}

export interface MidjourneyDescribeTaskRequestPayload {
    images: any[];
}

export interface MidjourneyRefreshTaskResponseType {
    action: string;                       // 任务类型
    buttons: {                           // 按钮
        customId: string;                   // 自定义ID
        emoji: string;                      // 表情
        label: string;                      // 标签
        style: number;                      // 样式
        type: number;                       // 类型
    }[]
    description: string;                  // 描述
    failReason: string;                   // 失败原因
    finishTime: number;                   // 完成时间
    id: string;                           // 任务ID
    imageUrl: string;                     // 图片URL
    progress: string;                     // 进度
    prompt: string;                       // 提示
    promptEn: string;                     // 英文提示
    properties: {                        // 扩展字段
        discordChannelId: string;           // 任务提交的discord频道ID
        discordInstanceId: string;          // 任务提交的discord实例ID
        finalPrompt: string;                // 最终的prompt
        finalZhPrompt: string;              // 最终的中文prompt
    }
    startTime: number;                    // 开始时间
    state: string;                        // 状态
    status: "NOT_START" | "SUBMITTED" | "MODAL" | "IN_PROGRESS" | "FAILURE" | "SUCCESS" | "CANCEL";                       // 状态
    submitTime: number;                   // 提交时间
}

export interface MidjourneyTaskList extends MidjourneyRefreshTaskResponseType {
    seed?: string | null;                  // 种子
}

export const newTask: MidjourneyTaskList = {
    action: "",
    buttons: [],
    description: "",
    failReason: "",
    finishTime: 0,
    id: "",
    seed: null,
    imageUrl: "",
    progress: "",
    prompt: "",
    promptEn: "",
    properties: {
        discordChannelId: "",
        discordInstanceId: "",
        finalPrompt: "",
        finalZhPrompt: ""
    },
    startTime: 0,
    state: "",
    status: "SUBMITTED",
    submitTime: 0
}

export interface MidjourneyGetSeedResponseType {
    code: number;
    description: string;
    result: string;//种子
}

export interface MidjourneyModalTaskRequestPayload {
    taskId: string;                         // 任务ID,
    prompt?: string,                        // 提示词
    maskBase64?: string,                    // 局部重绘的蒙版base64
}

// {
//     "code": 4,
//     "description": "The task type does not support getting image seed",
//     "properties": null,
//     "result": ""
// }

// {
//     "code": 4,
//     "description": "The associated task status error",
//     "result": null,
//     "properties": {}
// }

export interface MidjourneyDoActionQueryType {
    chooseSameChannel?: boolean;            // 是否选择同一频道下的账号，默认只使用任务关联的账号
    customId: string;                       // 动作标识，示例值(MJ::JOB::upsample::2::3dbbd469-36af-4a0f-8f02-df6c579e7011)
    taskId: string;                         // 任务ID，示例值(14001934816969359)
    accountFilter?: {
        channelId: string;
        instanceId: string;
        modes: string[];
        remark: string;
        remix: boolean;
        remixAutoConsidered: boolean;
    }
    notifyHook?: string;
    state?: string;
}

export interface MidjourneyCancelTaskResponseType {
    code: number;
    description: string;
}

export class DrawAPI {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    path(action: MidjourneyEndpoint) {
        return [api2ProviderBaseUrl.Midjourney, action].join("/");
    }

    getImagineTaskPayload(config: MidjourneyImagineTaskConfigType): MidjourneyImagineTaskRequestPayload {

        let payload: MidjourneyImagineTaskRequestPayload = {
            botType: config.botType,
            prompt: "",
            base64Array: []
        };

        let fullPrompt = {
            ImagePrompts: "",
            TextPrompts: "",
            Parameters: ""
        }

        // 1. TextPrompt
        // 1.1 add presetDescription if not empty
        if (config?.presetDescription) {
            for (const key in config.presetDescription) {
                if (config.presetDescription[key as keyof typeof config.presetDescription]) {
                    fullPrompt.TextPrompts += `${config.presetDescription[key as keyof typeof config.presetDescription]}, `;
                }
            }
        }

        // 1.2 add textPrompt, This is the last one, no need to add a comma.
        fullPrompt.TextPrompts += config.userPrompt ?? "";

        // 2. base64Array
        // 2.1 sref(Style Reference)
        if (config.sref && config.sref.length) {
            payload.base64Array = payload.base64Array.concat(config.sref.map((item) => item.thumbUrl));
        }

        // 3. Parameters
        if (!config.customParam) {
            const defaultStrParams = ['aspect', 'chaos', 'quality', "repeat", "stop", 'stylize', 'weird', "style", 'version', 'no', 'seed', 'iw', 'cw'];
            const defaultBoolParams = ['tile', 'video'];

            for (const param of defaultStrParams) {
                if (config[param as keyof MidjourneyImagineTaskConfigType]) {
                    fullPrompt.Parameters += `--${param} ${config[param as keyof MidjourneyImagineTaskConfigType]} `;
                }
            }

            for (const param of defaultBoolParams) {
                if (config[param as keyof MidjourneyImagineTaskConfigType]) {
                    fullPrompt.Parameters += `--${param} `;
                }
            }

            if (config.cref && config.cref.length) {
                fullPrompt.Parameters += `--cref ${config.cref.map((item) => item.url).join(' ')} `;
            }
        }

        payload.prompt = [fullPrompt.ImagePrompts, fullPrompt.TextPrompts, fullPrompt.Parameters]
            .filter(item => item !== '')
            .join(" ");

        return payload;
    }

    async submitDescribeTask(config: MidjourneyDescribeTaskRequestPayload, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const data = {base64: config.images[0].thumbUrl}

            const res = await fetch(this.path(MidjourneyEndpoint.DESCRIBE), {
                ...getRequestOptions(this.apiKey,data),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;
        } catch (e) {
            console.error("[Midjourney] failed to make a Describe request", e);
            throw e;
        }
    }


    async submitImagineTask(config: MidjourneyImagineTaskConfigType, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path(MidjourneyEndpoint.IMAGINE), {
                ...getRequestOptions(this.apiKey,this.getImagineTaskPayload(config)),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;

        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                console.warn("[Request] Midjourney ImagineTask request aborted");
            } else {
                console.error("[Request] Failed to make a Midjourney ImagineTask request", e);
            }
            throw e;
        }
    }

    async submitBlendTask(config: MidjourneyBlendTaskConfigType, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const data: MidjourneyBlendTaskRequestPayload = {
                botType: "MID_JOURNEY",
                base64Array: [],
                dimensions: config.dimensions
            };

            if (config.images && config.images.length) {
                data.base64Array = data.base64Array.concat(config.images.map((item) => item.thumbUrl));
            }

            const res = await fetch(this.path(MidjourneyEndpoint.BLEND), {
                ...getRequestOptions(this.apiKey,data),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;
        } catch (e) {
            console.error("[Midjourney] failed to make a Blend request", e);
            throw e;
        }
    }

    async submitShortenTask(config: MidjourneyShortenTaskRequestPayload, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path(MidjourneyEndpoint.SHORTEN), {
                ...getRequestOptions(this.apiKey,config),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;

        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                console.warn("[Request] Midjourney ImagineTask request aborted");
            } else {
                console.error("[Request] Failed to make a Midjourney ImagineTask request", e);
            }
            throw e;
        }
    }

    async submitActionTask(config: MidjourneyDoActionQueryType, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path(MidjourneyEndpoint.ACTION), {
                ...getRequestOptions(this.apiKey,config),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;

        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                console.warn("[Request] Midjourney ImagineTask request aborted");
            } else {
                console.error("[Request] Failed to make a Midjourney ImagineTask request", e);
            }
            throw e;
        }
    }

    async submitModalTask(config: MidjourneyModalTaskRequestPayload, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path(MidjourneyEndpoint.MODAL), {
                ...getRequestOptions(this.apiKey,config),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;

        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                console.warn("[Request] Midjourney ImagineTask request aborted");
            } else {
                console.error("[Request] Failed to make a Midjourney ImagineTask request", e);
            }
            throw e;
        }
    }

    async fetchTask(config: MidjourneyFetchTaskRequestPayload, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path(MidjourneyEndpoint.FETCH).replace("{id}", config.taskId), {
                ...getRequestOptions(this.apiKey,"GET"),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;

        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                console.warn("[Request] Midjourney FetchTask request aborted");
            } else {
                console.error("[Request] Failed to make a Midjourney FetchTask request", e);
            }
            throw e;
        }
    }

    async getTaskSeed(config: MidjourneyGetSeedRequestPayload, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path(MidjourneyEndpoint.SEED).replace("{id}", config.taskId), {
                ...getRequestOptions(this.apiKey,"GET"),
                signal: abortSignal
            });

            clearTimeout(timeoutId);

            return res;

        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                console.warn("[Request] Midjourney GetTaskSeed request aborted");
            } else {
                console.error("[Request] Failed to make a Midjourney GetTaskSeed request", e);
            }
            throw e;
        }
    }
}
