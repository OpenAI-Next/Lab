import { REQUEST_TIMEOUT_MS, StableDiffusionEndpoint } from "@/constant";
import { api2ProviderBaseUrl } from "@/app/store";
import { getAuthHeaderWithApiKey } from "@/app/client/helper";
// https://platform.stability.ai/docs/api-reference
// https://apifox.com/apidoc/shared-ff6085ac-315b-4497-bd70-5e954f30f503

export interface StableDiffusionImageUltraRequest {
  /**
   * What you wish to see in the output image. A strong, descriptive prompt that clearly
   * defines
   * elements, colors, and subjects will lead to better results.
   *
   * To control the weight of a given word use the format `(word:weight)`,
   * where `word` is the word you'd like to control the weight of and `weight`
   * is a value between 0 and 1. For example: `The sky was a crisp (blue:0.3) and (green:0.8)`
   * would convey a sky that was blue and green, but more green than blue.
   */
  prompt: string;
  /**
   * Controls the aspect ratio of the generated image.
   * Important: This parameter is only valid for text-to-image requests.
   * @default "1:1"
   */
  aspect_ratio?: "1:1" | "16:9" | "21:9" | "2:3" | "3:2" | "4:5" | "5:4" | "9:16" | "9:21";
  /**
   * A blurb of text describing what you **do not** wish to see in the output image.
   * This is an advanced feature.
   */
  negative_prompt?: string;
  /**
   * Dictates the `content-type` of the generated image.
   * @default "png"
   */
  output_format?: "jpeg" | "png" | "webp";
  /**
   * A specific value that is used to guide the 'randomness' of the generation. (Omit this parameter or pass `0` to use a random seed.)
   * @default 0
   */
  seed?: number;
}

export interface StableDiffusionImageCoreRequest extends StableDiffusionImageUltraRequest {
  /**
   * Guides the image model towards a particular style.
   */
  style_preset?:
    | "analog-film"
    | "anime"
    | "cinematic"
    | "comic-book"
    | "digital-art"
    | "enhance"
    | "fantasy-art"
    | "isometric"
    | "line-art"
    | "low-poly"
    | "modeling-compound"
    | "neon-punk"
    | "origami"
    | "photographic"
    | "pixel-art"
    | "3d-model"
    | "tile-texture";
}

export interface StableDiffusion3Request extends StableDiffusionImageUltraRequest {
  /**
   * Controls whether this is a text-to-image or image-to-image generation, which affects which parameters are required:
   * text-to-image requires only the prompt parameter
   * image-to-image requires the prompt, image, and strength parameters
   */
  mode: "image-to-image" | "text-to-image";
  /**
   * The image to use as the starting point for the generation.
   * Supported formats: JPEG, PNG, WEBP
   * Supported dimensions: Every side must be at least 64 pixels
   * Important: This parameter is only valid for image-to-image requests.
   */
  image?: any;
  /**
   * Sometimes referred to as denoising, this parameter controls how much influence the
   * image parameter has on the generated image. A value of 0 would yield an image that
   * is identical to the input. A value of 1 would be as if you passed in no image at all.
   * Important: This parameter is only valid for image-to-image requests.
   * @range 0.0 - 1.0
   */
  strength?: number;
  /**
   * The model to use for generation.
   * @default "sd3-large"
   */
  model?: "sd3-large" | "sd3-large-turbo" | "sd3-medium";
  output_format?: "jpeg" | "png";
  /**
   * Keywords of what you do not wish to see in the output image.
   * This is an advanced feature.
   * Important: This parameter does not work with `sd3-large-turbo`.
   */
  negative_prompt?: string;
  style_preset: never;
}

export class StableDiffusionAPI {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  path(sdType: "imageUltra" | "imageCore" | "sd3") {
    let endpoint: string;
    switch (sdType) {
      case "imageUltra":
        endpoint = StableDiffusionEndpoint.ImageUltra;
        break;
      case "imageCore":
        endpoint = StableDiffusionEndpoint.ImageCore;
        break;
      case "sd3":
        endpoint = StableDiffusionEndpoint.StableDiffusion3;
        break;
    }
    return [api2ProviderBaseUrl.StableDiffusion, endpoint].join("/");
  }

  async submit(
    sdType: "imageUltra" | "imageCore" | "sd3",
    request: StableDiffusionImageUltraRequest | StableDiffusionImageCoreRequest | StableDiffusion3Request,
    signal?: AbortSignal,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    try {
      const res = await fetch(this.path(sdType), {
        ...this.getRequestOptions(request),
        signal: abortSignal,
      });

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      console.error("[StableDiffusionProxy] failed to make a stable diffusion submit request", e);
      throw e;
    }
  }

  private getRequestOptions(
    request: StableDiffusionImageUltraRequest | StableDiffusionImageCoreRequest | StableDiffusion3Request,
  ): RequestInit {
    const formData = new FormData();

    for (let paramsKey in request) {
      if (paramsKey === "image" && "image" in request) {
        const imageData = request.image;
        if (Array.isArray(imageData) && imageData.length > 0) {
          const fileData = imageData[0];
          if (fileData && fileData.originFileObj instanceof File) {
            // console.log("File object:", fileData.originFileObj);
            // console.log("File name:", fileData.name);
            // console.log("File type:", fileData.originFileObj.type);
            // console.log("File size:", fileData.originFileObj.size);
            const blob = fileData.originFileObj.slice(0, fileData.originFileObj.size, fileData.originFileObj.type);
            formData.append("image", blob, fileData.name);
          } else {
            console.error("The image is not a valid File object.");
          }
        } else {
          console.error("Invalid image data structure or no image uploaded.");
        }
      } else {
        // 对于非文件类型的属性，直接追加
        formData.append(paramsKey, (request as any)[paramsKey]);
      }
    }

    // for (let [key, value] of formData.entries()) {
    //     console.log(key, value);
    // }

    return {
      method: "POST",
      headers: getAuthHeaderWithApiKey(this.apiKey),
      body: formData,
    };
  }
}
