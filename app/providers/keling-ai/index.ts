import {
  AIProvider,
  BASE_URL_B,
  CallApiFunction,
  CommonApiTypes,
  LogoConfig,
  ModelSeries,
  ProviderAPIConfig,
  ProviderName,
  ProviderWebsite,
} from "@/app/providers/interfaces";
import { ApiRequestConfig, makeApiRequest, replaceEndpointParams } from "@/app/utils/fetch";

interface GenerateText2VideoTaskRequest {
  /**
   * 生成视频的画面纵横比，可选，枚举值：16:9, 9:16, 1:1
   */
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  /**
   * 本次任务结果回调通知地址，可选
   */
  callback_url?: string;
  /**
   * 控制摄像机运动的协议，可选，未指定则智能匹配
   */
  camera_control?: {
    /**
     * 包含六个字段，用于指定摄像机的运动或变化
     */
    config?: {
      /**
       * 水平运镜，可选，取值范围：[-10, 10]
       */
      horizontal?: number;
      /**
       * 水平摇镜，可选，取值范围：[-10, 10]
       */
      pan?: number;
      /**
       * 旋转运镜，可选，取值范围：[-10, 10]
       */
      roll?: number;
      /**
       * 垂直摇镜，可选，取值范围：[-10, 10]
       */
      tilt?: number;
      /**
       * 垂直运镜，可选，取值范围：[-10, 10]
       */
      vertical?: number;
      /**
       * 变焦，可选，取值范围：[-10, 10]
       */
      zoom?: number;
      [property: string]: any;
    };
    type?: string;
    [property: string]: any;
  };
  /**
   * 生成视频的自由度，可选，值越大，相关性越强，取值范围：[0,1]
   */
  cfg_scale?: number;
  /**
   * 生成视频时长，单位秒，可选，枚举值：5，10
   */
  duration?: "5" | "10";
  /**
   * 生成视频的模式，可选，枚举值：std（高性能）或 pro（高表现）
   */
  mode?: "std" | "pro";
  model?: string;
  /**
   * 负向文本提示，可选，不能超过200个字符
   */
  negative_prompt?: string;
  /**
   * 正向文本提示，必须，不能超过500个字符
   */
  prompt: string;
}

interface GenerateText2VideoTaskResponse {
  /**
   * 错误码；具体定义错误码
   */
  code: number;
  data: {
    /**
     * 任务创建时间，Unix时间戳、单位ms
     */
    created_at: number;
    /**
     * 任务ID，系统生成
     */
    task_id: string;
    /**
     * 任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）
     */
    task_status: "submitted" | "processing" | "succeed" | "failed";
    /**
     * 任务更新时间，Unix时间戳、单位ms
     */
    updated_at: number;
    [property: string]: any;
  };
  /**
   * 错误信息
   */
  message: string;
  /**
   * 请求ID，系统生成，用于跟踪请求、排查问题
   */
  request_id: string;
}

interface QueryTaskResponse {
  /**
   * 错误码；具体定义见错误码
   */
  code: number;
  /**
   * 错误信息
   */
  message: string;
  /**
   * 请求ID，系统生成，用于跟踪请求、排查问题
   */
  request_id: string;
  data: {
    /**
     * 任务ID，系统生成
     */
    task_id: string;
    /**
     * 任务状态，枚举值：submitted（已提交）、processing（处理中）、succeed（成功）、failed（失败）
     */
    task_status: "submitted" | "processing" | "succeed" | "failed";
    /**
     * 任务状态信息，当任务失败时展示失败原因（如触发平台的内容风控等）
     */
    task_status_msg: string;
    /**
     * 任务创建时间，Unix时间戳、单位ms
     */
    created_at: number;
    /**
     * 任务更新时间，Unix时间戳、单位ms
     */
    updated_at: number;
    task_result: {
      videos: Array<{
        /**
         * 生成的视频ID；全局唯一
         */
        id: string;
        /**
         * 生成视频的URL
         */
        url: string;
        /**
         * 视频总时长，单位s
         */
        duration: string;
      }>;
      /**
       * 官方文档没有说明，但是实际返回有这个字段
       */
      images: any;
    };
  };
}

/**
 * 图生视频任务请求接口
 */
interface GenerateImage2VideoTaskRequest {
  /**
   * 模型名称
   * @default "kling-v1"
   */
  model?: "kling-v1" | string;

  /**
   * 参考图像
   * 支持传入图片Base64编码或图片URL（确保可访问）
   * 图片格式支持.jpg / .jpeg / .png
   * 图片文件大小不能超过10MB，图片分辨率不小于300*300px
   */
  image: string;

  /**
   * 参考图像 - 尾帧控制
   * 支持传入图片Base64编码或图片URL（确保可访问）
   * 图片格式支持.jpg / .jpeg / .png
   * 图片文件大小不能超过10MB，图片分辨率不小于300*300px
   */
  image_tail?: string;

  /**
   * 正向文本提示词
   * 不能超过2500个字符
   */
  prompt?: string;

  /**
   * 负向文本提示词
   * 不能超过2500个字符
   */
  negative_prompt?: string;

  /**
   * 生成视频的自由度
   * 值越大，模型自由度越小，与用户输入的提示词相关性越强
   * @min 0
   * @max 1
   * @default 0.5
   */
  cfg_scale?: number;

  /**
   * 生成视频的模式
   * std：标准模式（高性能），耗时短、生成速度快
   * pro：专家模式（高表现），耗时长但生成视频质量更佳
   * @default "std"
   */
  mode?: "std" | "pro";

  /**
   * 生成视频时长，单位秒
   * 包含尾帧（image_tail）的请求目前仅支持生成5s的视频
   * @default "5"
   */
  duration?: "5" | "10";

  /**
   * 本次任务结果回调通知地址
   * 如果配置，服务端会在任务状态发生变更时主动通知
   */
  callback_url?: string;
}

export interface KelingApiTypes extends CommonApiTypes {
  generateText2VideoTask: {
    req: GenerateText2VideoTaskRequest;
    res: GenerateText2VideoTaskResponse;
    endpoint_params: never;
  };
  queryTask: {
    req: never;
    res: QueryTaskResponse;
    endpoint_params: {
      action: "images" | "videos";
      action2: "generations" | "text2video" | "image2video";
      task_id: string;
    };
  };
  generateImage2VideoTask: {
    req: GenerateImage2VideoTaskRequest;
    res: any;
    endpoint_params: never;
  };
}

export class KelingAI implements AIProvider {
  readonly name: ProviderName = {
    en: "Keling AI",
    zh: "可灵 AI",
  };

  readonly logo: LogoConfig = {
    basic: {
      monochrome: "./assets/logo_basic_mono.svg",
    },
  };

  readonly website: ProviderWebsite = {
    home: "https://klingai.com",
    api_docs: "https://docs.qingque.cn/d/home/eZQClW07IFEuX1csc-VejdY2M",
  };

  readonly model_series: ModelSeries[] = [
    {
      name: "Video Generation",
      description: "Powered by KLING®",
      category: "VideoGeneration",
      models: [
        {
          name: "text2video-std",
          description: "高性能文生视频模型",
          price: {
            type: "request",
            price: {
              "5s": 1,
              "10s": 2,
            },
          },
          release_time: undefined,
          shutdown_time: -1,
        },
        {
          name: "text2video-pro",
          description: "高表现文生视频模型",
          price: {
            type: "request",
            price: {
              "5s": 3.5,
              "10s": 7,
            },
          },
          release_time: undefined,
          shutdown_time: -1,
        },
      ],
    },
  ];

  readonly api_config: ProviderAPIConfig<KelingApiTypes> = {
    base_url: BASE_URL_B,
    authorization: "Bearer xxx",
    call_map: {
      generateText2VideoTask: {
        label: "生成文生视频任务",
        method: "POST",
        endpoint: "kling/v1/videos/text2video",
        req_example: {
          mode: "std",
          duration: "5",
          aspect_ratio: "16:9",
          model: "kling-v1",
          prompt: " 一只白猫在车里驾驶，穿过繁忙的市区街道，背景是高楼和行人",
          cfg_scale: 0.5,
          camera_control: {},
        },
        res_example: {
          code: 0,
          message: "SUCCEED",
          request_id: "CmYgjmbyMToAAAAAADUuvA",
          data: {
            task_id: "CmYgjmbyMToAAAAAADUuvA",
            task_status: "submitted",
            created_at: 1727252542438,
            updated_at: 1727252542438,
          },
        },
      },
      queryTask: {
        label: "查询任务",
        method: "GET",
        endpoint: "kling/v1/{action}/{action2}/{task_id}",
        endpoint_params_example: {
          action: "videos",
          action2: "text2video",
          task_id: "CmYgjmbyMToAAAAAADUuvA",
        },
        res_example: {
          code: 0,
          message: "成功",
          request_id: "CmYgjmbyMToAAAAAADUuvA",
          data: {
            task_id: "CmYgjmbyMToAAAAAADUuvA",
            task_status: "succeed",
            task_status_msg: "",
            created_at: 1727252542438,
            updated_at: 1727252844002,
            task_result: {
              images: null,
              videos: [
                {
                  id: "b39fd23a-58fb-4ca7-8f99-20d98f06639d",
                  url: "https://cdn.klingai.com/bs2/upload-kling-api/9575341070/text2video/CmYgjmbyMToAAAAAADUuvA-0_raw_video_1.mp4",
                  duration: "5.1",
                },
              ],
            },
          },
        },
      },
      generateImage2VideoTask: {
        label: "生成图生视频任务",
        method: "POST",
        endpoint: "kling/v1/videos/image2video",
        req_example: {
          model: "kling-v1",
          image: "base64_encoded_image_or_url",
          prompt: "A cat driving a car through a busy city street",
          cfg_scale: 0.5,
          mode: "std",
          duration: "5",
        },
      },
    },
  };

  constructor(apiKey: string) {
    this.api_config.authorization = apiKey;
  }

  callApi: CallApiFunction<KelingApiTypes> = ({ callKey, params, endpoint_params, signal }) => {
    console.log(`KelingAI callApi triggered for ${callKey}`, {
      params,
      endpoint_params,
    });

    const headers: HeadersInit = {
      Authorization: `Bearer ${this.api_config.authorization}`,
    };

    switch (callKey) {
      case "generateText2VideoTask":
        const opt: ApiRequestConfig = {
          endpoint: this.api_config.call_map[callKey].endpoint,
          options: {
            method: this.api_config.call_map[callKey].method,
            headers,
            signal,
            body: params,
          },
        };
        return makeApiRequest(opt);
      case "queryTask":
        const opt2: ApiRequestConfig = {
          endpoint: replaceEndpointParams(endpoint_params, this.api_config.call_map[callKey].endpoint),
          options: {
            method: this.api_config.call_map[callKey].method,
            headers,
            signal,
          },
        };
        return makeApiRequest(opt2);
      case "generateImage2VideoTask":
        const opt3: ApiRequestConfig = {
          endpoint: this.api_config.call_map[callKey].endpoint,
          options: {
            method: this.api_config.call_map[callKey].method,
            headers,
            signal,
            body: params,
          },
        };
        return makeApiRequest(opt3);
      default:
        throw new Error(`Unknown API call key: ${callKey}`);
    }
  };
}
