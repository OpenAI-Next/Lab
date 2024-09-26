// app/client/ViduProxy.ts

import { ViduEndpoint } from "@/constant";
import { api2ProviderBaseUrl } from "@/app/store";
import { getRequestOptions } from "@/app/client/helper";
import { noApiKeys } from "@/app/utils";

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
  upscale = "upscale",
  text2video = "text2video", // 无图片时
  img2video = "img2video", // 图片用途：用作起始帧（Use as First Frame）
  character2video = "character2video", // 图片用途：参考人物角色（Use for Character Reference）
}

export enum ViduModel {
  stable = "stable",
  vidu1 = "vidu-1",
}

export enum ViduStyle {
  general = "general",
  anime = "anime",
}

const vidu_task_generation_response_queueing_example: ViduTaskGenerationResponse = {
  id: "2375606842092581",
  input: {
    creation_id: "0",
    prompts: [
      {
        type: "text",
        content: "cloud",
        negative: false,
        enhance: false,
        recaption: "",
      },
      {
        type: "image",
        content:
          "https://vidu.cf.vidu.studio/infer/tasks/24/0805/04/2375606842092581/input/prompt-02.jpeg?Expires=1722918735&Signature=ihq-BYHZm8TKhCcT3bTiv0ryQNyiNkizZYT1crgCinMxPtMVTfkLcXWWHwTKzrPxSebHFshqd7dgou1mjf0MbG8anwTxZdohytf6xjlPbFL94tYnx5YdAfwuwQX0-pJ7rcSY3VFqqbMNFGyHsu2h4OINGV0GEYn~bKPoRbkwYyVwN6XcLEeabxByCKhpw75b8~4cOSr4NH~YhOSfk~~6JWwqdezafxj7g823P0tVXms3TolK0e1FWu7Y~jJ0MmBdsfwcRrvDC5yjuWKPFb10dH32QOjKHY3QP1zLQXkD4QES11ZA6sCv4aq9j0MLQmq97mJSIRczRmCzH8ZP~0AiRQ__&Key-Pair-Id=KNW0SL0E7LV4E",
        negative: false,
        enhance: false,
        recaption: "",
      },
    ],
    lang: "en",
  },
  settings: {
    style: "general",
    duration: 4,
    aspect_ratio: "16:9",
    model: "vidu-1",
  },
  type: "img2video",
  state: "queueing",
  creations: [],
  err_code: "",
  created_at: "2024-08-05T04:32:14.795273Z",
};
const vidu_task_generation_response_success_example: ViduTaskGenerationResponse = {
  id: "2375646005579044",
  input: {
    creation_id: "0",
    prompts: [
      {
        type: "text",
        content:
          "在经典的西部风格中，一个表情忧郁的男人凝视着镜头，微微颤抖的嘴唇吐出一口烟雾。他的香烟发出的温暖光芒照亮了他的脸，投下的阴影强调了他的忧郁情绪。他戴着宽边帽，穿着粗犷的衣服，配有弹带。他的靴子放在栏杆上，姿态放松，但眼神中透露出更深的悲伤。",
        negative: false,
        enhance: false,
        recaption: "",
      },
    ],
    lang: "zh",
  },
  settings: {
    style: "general",
    duration: 4,
    aspect_ratio: "16:9",
    model: "vidu-1",
  },
  type: "text2video",
  state: "success",
  creations: [
    {
      id: "2375646502238865",
      task_id: "2375646005579044",
      type: "video",
      grade: "draft",
      uri: "https://vidu.cf.vidu.studio/infer/tasks/24/0805/05/2375646005579044/creation-01/watermarked.mp4?Expires=1722838357&Signature=m4WAZQ~M3Xcwv2z3EBdHrRXWHakBXhxlaeCcI9DxjsDMf~DbcBS0h6S29A-EtymTyEUkYHJ6jFSIBt0kQitGvluT7oN5rA1H6zR~tVSUd6FM2jjRQg4FR0ff5P48I0pUtbnLNcyr2Kb-f873gNkm3WS78JTpsk0SZ1yObTFqoVBTaA2PX7FyttuEYES2Z8YrMPEVMRta0W9iV9GgB12N3cqzWrMAW9uNHftqH0T78Al4PCk9xv3TnjdZw9H3i3wyIE6kpBTfWeh2zBtNm2zzN6u5BGsX6ujPxX72X9JeRCIUpE~Rsj0dTPwJDARJhVPoTLbwvnchPdoOn3zHWQUfFA__&Key-Pair-Id=KNW0SL0E7LV4E&response-content-disposition=attachment;filename=vidu-1-general-4-2024-08-05T05%3A12%3A35Z.mp4",
      cover_uri:
        "https://vidu.cf.vidu.studio/infer/tasks/24/0805/05/2375646005579044/creation-01/cover.jpeg?Expires=1722838357&Signature=ppjg5IrEjp45-zU4w5H2cH~~ZP7AW4-n9kBpS0uOQnl2DiuWIAw6y517F9jk6smVu8Q8R~Mm0nscAvdCrNABc-p~lGmYmzBBSJknjrGZVjSlZuVifuzKDR2C93qI63A1ZOemXBDUs6Ogx0Z7qqanG4HthUj1yOrAXmdWQ-Fk1pjptbBfuPwKZUDrbfVpiJdQsux6tTrYRkK1esJU~1ooIGS-NXar20FD36qGbFycQ1dCs~eQhn1vCQJ63gDkhPhcd7HDrxaZDdsACNtpF-pQi-br7Ixo4GomM~LoSblA2tohPl2e1HH8G4L0zCvLEVj6mORbJU-R2Nj6YZ8UipErNw__&Key-Pair-Id=KNW0SL0E7LV4E",
      resolution: {
        width: 688,
        height: 384,
      },
      vote: "unspecified",
      is_favor: false,
      src_video_duration: 0,
      creator_id: "0",
      video: {
        duration: 3.85,
        fps: 16,
        resolution: {
          width: 688,
          height: 384,
        },
      },
      is_deleted: false,
      err_code: "",
      created_at: "2024-08-05T05:12:35.458210Z",
    },
  ],
  err_code: "",
  created_at: "2024-08-05T05:12:05.145617Z",
};
const vidu_task_upscale_request_example: ViduUpscaleTaskRequest = {
  input: {
    creation_id: "2375584778357517",
  },
  type: "upscale",
  settings: { model: "stable", duration: 4 },
};

export const randomTextPrompt = [
  "在一个昏暗的火车车厢中框定一场激烈的对话。先是一个滴答作响的怀表的特写镜头，然后拉远，揭示出相对而坐的两个人物，紧张气氛扑面而来。通过使用窗户等反射表面展示两人短暂的担忧表情，营造出希区柯克式的紧张感。昏暗的灯光下，偶尔的光影闪烁，给对话增添了紧张感和神秘感，营造出典型希区柯克电影中的紧张氛围。",
  "在经典的西部风格中，一个表情忧郁的男人凝视着镜头，微微颤抖的嘴唇吐出一口烟雾。他的香烟发出的温暖光芒照亮了他的脸，投下的阴影强调了他的忧郁情绪。他戴着宽边帽，穿着粗犷的衣服，配有弹带。他的靴子放在栏杆上，姿态放松，但眼神中透露出更深的悲伤。",
  "在蒸汽朋克宇宙中，一艘带有小齿轮和蒸汽管的纸船在工业城市的金属河中漂浮。河道是由闪亮的黄铜和铜管组成的复杂网络，蒸汽从偶尔的泄漏中缓缓冒出。随着纸船在这片机械景观中航行，它与小机械生物微型机器人和自动装置互动。相机捕捉了船和周围环境的细节，强调了有机纸质和工业金属环境之间的对比。这一场景将维多利亚工业美学与幻想结合起来，突显了蒸汽朋克的创新精神。",
  "两个人举起茶杯小口抿了一口。左边的人轻抿双唇后微笑，右边的人专注于他们的茶，形成一种静雅和微妙互动的场景。布景精致，淡雅的颜色、花卉布置和古典家具增强了优雅氛围。",
  "捕捉一朵玫瑰花蕾在纯黑背景下绽放成全开的过程。延时摄影突出了玫瑰从紧闭的花蕾到开放的鲜花的细腻变化。相机固定不动，突出花朵绽放过程的自然美和细节。柔和的灯光增强了玫瑰的颜色和质感，营造出一种冥想般的纯植物视觉体验，展示了自然的优雅和微妙复杂性。",
  "美国动画风格，在一个灯光柔和的浴室里泰迪熊正在洗澡。它一部分沉浸在泡泡浴缸中，一只爪子拿着电话，另一只爪子在搓洗自己的身体。柔和的灯光营造出温暖和惬意的氛围，浴室的瓷砖是舒缓的粉彩色，增强了温馨和奇幻的氛围。泰迪熊的表情专注，表现出洗澡和打电话的同时进行。",
  "捕捉一个富有想象力的场景：一只三岁的拟人化白色英国垂耳兔，身穿鲜艳的赛车服，头戴小头盔。赛车车身印有“LUCKY”。在类似赛道的简约布景上，兔子坐在一辆小巧流线型的赛车中，准备起跑。背景是一个简单、模糊的赛道图像，传达出速度和运动感，焦点集中在兔子紧张而准备出发的姿态上。高分辨率镜头强调了兔子坚定的表情和赛车的流线型设计，通过鲜艳的颜色和动态角度增强了电影感。这个简洁的场景将幻想竞赛的奇幻与赛车运动的刺激结合在一起，创造了一个视觉上引人注目且令人难忘的画面，捕捉了起跑前的兴奋。",
  "以浅蓝色和淡琥珀色为风格的超现实时尚摄影中，一个宇航员穿着太空服走在雾中，背景为迷人的光白色和金色，构成极简主义静物和印象深刻的全景画面。",
  "影片捕捉了暴风雪中的午夜时分，坐落在积雪覆盖的悬崖顶上的孤立灯塔。相机逐渐放大灯塔的灯光，穿透飞舞的雪花，投射出幽幽的光芒。在白茫茫的环境中，灯塔的黑色轮廓显得格外醒目，呼啸的风声和远处海浪的撞击声增强了孤独的氛围。这一场景展示了灯塔的孤独力量。",
  "在经典的西部风格中，一个表情忧郁的男人凝视着镜头，微微颤抖的嘴唇吐出一口烟雾。他的香烟发出的温暖光芒照亮了他的脸，投下的阴影强调了他的忧郁情绪。他戴着宽边帽，穿着粗犷的衣服，配有弹带。他的靴子放在栏杆上，姿态放松，但眼神中透露出更深的悲伤。",
  "捕捉一只小柯基在阳光充足的大泳池中优雅游泳的宁静时刻。水下视角展示小狗，它温柔的微笑被柔和的黄金时段灯光照亮，光线和阴影在泳池底部交相辉映。场景采用柔和的粉彩色调，增强了梦幻的氛围。高分辨率摄影捕捉了水的质感和柯基愉快表情的每一个细节，创造了一个简单但富有电影感的宁静和纯真画面。这种简约但感性的布景传达了平静和幸福感，是一个宁静而视觉吸引力强的电影场景。",
];

export class ViduAPI {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  noKey(): boolean {
    return noApiKeys(this.apiKey);
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
          return [ViduStyle.general];
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

  randomTextPrompt(): string {
    return randomTextPrompt[Math.floor(Math.random() * randomTextPrompt.length)];
  }

  async generateViduTask(request: ViduTaskGenerationRequest, signal?: AbortSignal, timeoutMs: number = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    try {
      const res = await fetch(this.path(ViduEndpoint.GENERATION), {
        ...getRequestOptions(this.apiKey, request),
        signal: abortSignal,
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
        signal: abortSignal,
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
        signal: abortSignal,
      });

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      console.error("[ViduProxy] failed to make a vidu get-task request", e);
      throw e;
    }
  }
}
