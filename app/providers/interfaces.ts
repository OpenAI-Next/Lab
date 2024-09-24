export const BASE_URL_A = "https://api.openai-next.com";
export const BASE_URL_B = "https://draw.openai-next.com";

/**
 * AI 模型类别
 */
type ModelCategory =
  | "LLM" // 大型语言模型 (Large Language Model)
  | "TTS" // 文本转语音 (Text-to-Speech)
  | "ASR" // 自动语音识别 (Automatic Speech Recognition)
  | "TextEmbedding" // 文本嵌入 (Text Embedding)
  | "ImageGeneration" // 图像生成 (Image Generation)
  | "VideoGeneration" // 视频生成 (Video Generation)
  | "MultiModal" // 多模态模型 (MultiModal)
  | "AudioGeneration" // 音频生成 (Audio Generation)
  | "OCR" // 光学字符识别 (Optical Character Recognition)
  | "Other"; // 其他 AI 模型类别 (Other AI model categories)

/**
 * Logo 资源结构
 */
export interface LogoAsset {
  /**
   * 单色版本 Logo URL
   */
  monochrome?: string;

  /**
   * 彩色版本 Logo URL
   */
  color?: string;
}

/**
 * Logo 配置
 */
export interface LogoConfig {
  /**
   * 基础 Logo
   */
  basic?: LogoAsset;

  /**
   * 品牌 Logo
   */
  brand?: LogoAsset;

  /**
   * 文本 Logo
   */
  text?: LogoAsset;
}

/**
 * 模型系列
 */
export interface ModelSeries {
  /**
   * 系列名称
   */
  name: string;

  /**
   * 系列介绍（可选）
   */
  description?: string;

  /**
   * 模型类别
   */
  category: ModelCategory;

  /**
   * Logo 配置（可选）
   */
  logo?: LogoConfig;

  /**
   * 该系列包含的模型列表
   */
  models: Model[];
}

/**
 * 模型信息
 */
// export interface ModelInfo {
//   /**
//    * 最大上下文长度
//    */
//   max_context?: number;
//
//   /**
//    * 最大生成 token 数
//    */
//   max_tokens?: number;
//
//   /**
//    * 温度范围
//    */
//   temperature_range?: [number, number];
//
//   /**
//    * 是否支持函数调用
//    */
//   function_call_support?: boolean;
//
//   /**
//    * 是否支持工具选择
//    */
//   tool_choice_support?: boolean;
//
//   /**
//    * 是否支持网络搜索
//    */
//   network_search_support?: boolean;
//
//   /**
//    * 图像处理能力
//    */
//   image_ability?: {
//     /**
//      * 是否支持图像输入
//      */
//     input: boolean;
//
//     /**
//      * 是否支持图像输出
//      */
//     output: boolean;
//   };
//
//   /**
//    * 视频处理能力
//    */
//   video_ability?: {
//     /**
//      * 是否支持图像输入
//      */
//     input: boolean;
//
//     /**
//      * 是否支持图像输出
//      */
//     output: boolean;
//   };
//
//   /**
//    * 模型参数
//    */
//   parameters?: string;
//
//   /**
//    * 训练截止时间（Unix 时间戳）
//    */
//   training_data?: number;
// }

/**
 * 按 token 计费的价格结构
 */
export interface ModelPriceToken {
  type: "token";
  /**
   * 计价单位，默认为 1000000(1M)
   */
  unit?: string;

  /**
   * 价格信息
   */
  price: {
    /**
     * 单位 token 输入的价格，-1 表示不计费。
     */
    input: number;

    /**
     * 单位 token 输出的价格
     */
    output: number;
  };
}

/**
 * 按请求次数计费的价格结构
 */
export interface ModelPriceRequest {
  type: "request";
  /**
   * 货币单位，默认为 CNY
   * @default "CNY"
   */
  unit?: "CNY" | "USD";

  /**
   * 不同类型请求的价格
   */
  price: {
    [type: string]: number;
  };
}

/**
 * 按时长计费的价格结构
 */
export interface ModelPriceDuration {
  type: "duration";
  price: {
    /**
     * 时长（秒）和价格的映射关系
     * @example { 10: 1, 300: 5 } 表示 10秒 1 元，5 分钟 5 元
     */
    [second: number]: number;
  };
}

/**
 * 其他价格结构
 */
export interface ModelPriceOther {
  type: "other";
  /**
   * 价格描述，例如：免费、按需付费等
   */
  description: string;
}

/**
 * 模型
 */
export interface Model {
  /**
   * 模型名称
   */
  name: string;

  /**
   * 模型描述，没有可为空字符串
   */
  description: string;

  /**
   * 价格信息
   */
  price:
    | ModelPriceToken
    | ModelPriceRequest
    | ModelPriceDuration
    | ModelPriceOther;

  /**
   * 发布时间（Unix 时间戳），undefined 表示未知
   */
  release_time: number | undefined;

  /**
   * 停用时间（Unix 时间戳），-1 表示目前仍在运行，undefined 表示已停用但未知停用时间
   */
  shutdown_time: number | undefined;
}

export interface ProviderName {
  /** 英文名称 */
  en: string;

  /** 中文名称（可选）*/
  zh?: string;
}

export interface ProviderWebsite {
  /** 主页 URL */
  home: string;

  /** API 文档 URL（可选） */
  api_docs?: string;

  /** API 控制台 URL（可选） */
  api_console?: string;

  /** API 定价页面 URL（可选） */
  api_pricing?: string;
}

export interface CommonApiTypes {
  [key: string]: {
    req: any;
    res: any;
  };
}

export interface ProviderAPIConfig<ApiTypes extends CommonApiTypes> {
  base_url: string;
  authorization: string | { [key: string]: string };
  call_map: {
    [K in keyof ApiTypes]: {
      label: string;
      method: RequestInit["method"];
      endpoint: string;
    };
  };
}

export type CallApiFunction<ApiTypes extends CommonApiTypes> = <
  K extends keyof ApiTypes,
>(
  callKey: K,
  params: ApiTypes[K]["req"],
) => Promise<ApiTypes[K]["res"]>;

/**
 * AI 提供商接口
 */
export interface AIProvider {
  /**
   * 厂商名称
   */
  readonly name: ProviderName;

  /**
   * Logo 信息
   */
  readonly logo: LogoConfig;

  /**
   * 网站信息
   */
  readonly website: ProviderWebsite;

  /**
   * 提供的模型系列列表
   */
  readonly model_series: ModelSeries[];

  /**
   * API 调用信息
   */
  readonly api_config: ProviderAPIConfig<any>;

  callApi: CallApiFunction<any>;
}
