import { Doc2XEndpoint, REQUEST_TIMEOUT_MS } from "@/constant";
import { Doc2XFormFields } from "@/app/pages/Doc2X";
import { getRequestOptions } from "@/app/client/helper";
import { BASE_URL_B } from "@/app/providers/interfaces";

// {"uuid":"1ac0240c-2a30-46b6-8b17-a57df2479d34","status":"error","data":"add pages error"}

// {"uuid":"d169d051-96c0-4896-9fe8-6a94cbcc2dc5","status":"processing","data":{"progress":8,"msg":"upload_img_multi_thread successful","remain":928,"pages":7}}

interface Pdf2JsonResponse {
  uuid: string;
  status: "error" | "processing";
  data:
    | string
    | {
        progress: number;
        msg: string;
        remain: number;
        pages: number;
      };
}

export class Doc2XAPI {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  path(): string {
    return [BASE_URL_B, Doc2XEndpoint.Default].join("/");
  }

  model(response_format: "text" | "json", ocr: boolean = false, progress: boolean = false): string {
    if (response_format) {
      switch (response_format) {
        case "text":
          if (ocr && progress) {
            return "pdf-to-text-progress-ocr";
          } else if (ocr) {
            return "pdf-to-text-ocr";
          } else if (progress) {
            return "pdf-to-text-progress";
          } else {
            return "pdf-to-text";
          }
        case "json":
          if (ocr) {
            return "pdf-to-json-ocr";
          } else {
            return "pdf-to-json";
          }
        default:
          return "";
      }
    } else {
      return "";
    }
  }

  payload(request: Doc2XFormFields): any {
    return request
      ? {
          model: this.model(request.response_format, request.ocr, request.progress),
          messages: [{ role: "user", content: request?.file }],
        }
      : {};
  }

  async request(request: Doc2XFormFields, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const abortSignal = signal || controller.signal;

      signal && signal.addEventListener("abort", () => controller.abort());

      const res = await fetch(this.path(), {
        ...getRequestOptions(this.apiKey, this.payload(request)),
        signal: abortSignal,
      });

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.warn("[Request] Doc2X request aborted");
      } else {
        console.error("[Request] Failed to make a Doc2X request", e);
      }
      throw e;
    }
  }
}
