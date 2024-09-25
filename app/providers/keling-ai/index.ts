import {
  AIProvider,
  BASE_URL_B,
  CallApiFunction,
  CommonApiTypes,
  LogoConfig,
  ModelSeries,
  ProviderAPIConfig,
  ProviderName,
  ProviderWebsite
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

  [property: string]: any;
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

  [property: string]: any;
}

export interface KelingApiTypes extends CommonApiTypes {
  generateText2VideoTask: {
    req: GenerateText2VideoTaskRequest;
    res: GenerateText2VideoTaskResponse;
    endpoint_params: never;
  };
  queryTask: {
    req: never;
    res: any;
    endpoint_params: {
      action: "images" | "videos";
      action2: "generations" | "text2video" | "image2video";
      task_id: string;
    };
  };
}

export class KelingAI implements AIProvider {
  readonly name: ProviderName = {
    en: "Keling AI",
    zh: "可灵 AI"
  };

  readonly logo: LogoConfig = {
    basic: {
      monochrome: "./assets/logo_basic_mono.svg"
    }
  };

  readonly website: ProviderWebsite = {
    home: "https://klingai.com",
    api_docs: "https://docs.qingque.cn/d/home/eZQDT9y_PeLL-HOb7fWz1POgu"
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
              "10s": 2
            }
          },
          release_time: undefined,
          shutdown_time: -1
        },
        {
          name: "text2video-pro",
          description: "高性能文生视频模型",
          price: {
            type: "request",
            price: {
              "5s": 3.5,
              "10s": 7
            }
          },
          release_time: undefined,
          shutdown_time: -1
        }
      ]
    }
  ];

  readonly api_config: ProviderAPIConfig<KelingApiTypes> = {
    base_url: BASE_URL_B,
    authorization: "Bearer xxx",
    call_map: {
      generateText2VideoTask: {
        label: "生成文生视频任务",
        method: "GET",
        endpoint: "kling/v1/videos/text2video"
      },
      queryTask: {
        label: "查询任务",
        method: "GET",
        endpoint: "kling/v1/{action}/{action2}/{task_id}"
      }
    }
  };

  constructor(apiKey: string) {
    this.api_config.authorization = apiKey;
  }

  callApi: CallApiFunction<KelingApiTypes> = ({
                                                callKey,
                                                params,
                                                endpoint_params
                                              }) => {
    const headers: HeadersInit = {
      Authorization: `Bearer ${this.api_config.authorization}`
    };

    switch (callKey) {
      case "generateText2VideoTask":
        const opt: ApiRequestConfig = {
          endpoint: this.api_config.call_map[callKey].endpoint,
          options: {
            method: this.api_config.call_map[callKey].method,
            headers,
            body: params
          }
        };
        return makeApiRequest(opt);
      case "queryTask":
        const opt2: ApiRequestConfig = {
          endpoint: replaceEndpointParams<KelingApiTypes, "queryTask">(
            endpoint_params,
            this.api_config.call_map[callKey].endpoint
          ),
          options: {
            method: this.api_config.call_map[callKey].method,
            headers
          }
        };
        return makeApiRequest(opt2);
      default:
        throw new Error(`Unknown API call key: ${callKey}`);
    }
  };
}
