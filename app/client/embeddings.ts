// app/client/embeddings.ts

import { OpenaiPath, REQUEST_TIMEOUT_MS } from "@/constant";
import { getRequestOptions } from "@/app/client/helper";
import { api2ProviderBaseUrl } from "@/app/store";

export interface EmbeddingsRequest {
  /**
   * @description Input text to embed, encoded as a string or array of tokens.
   *              To embed multiple inputs in a single request, pass an array of strings or array of token arrays.
   *              The input must not exceed the max input tokens for the model (8192 tokens for text-embedding-ada-002),
   *              cannot be an empty string, and any array must be 2048 dimensions or fewer.
   * @description  Example Python code for counting tokens. https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken
   */
  input: string | Array<string | number | Array<number>>;

  /**
   * @description ID of the model to use. You can use the List models API to see all of your available models, or see our Model overview for descriptions of them.
   */
  model: string;

  /**
   * @description The format to return the embeddings in. Can be either float or base64.
   * @default "float"
   */
  encoding_format?: "float" | "base64";

  /**
   * @description The number of dimensions the resulting output embeddings should have. Only supported in text-embedding-3 and later models.
   * @type {number} (integer)
   */
  dimensions?: number;

  /**
   * @description A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. Learn more.
   */
  user?: string;
}

export interface EmbeddingsResponse {
  object: "list";
  data: {
    object: "embedding";
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

const EMBEDDINGS_RESPONSE_EXAMPLE: EmbeddingsResponse = {
  object: "list",
  data: [
    {
      object: "embedding",
      embedding: [
        0.0023064255,
        -0.009327292,
        -0.0028842222,
        0.0023064255, // ...
      ],
      index: 0,
    },
  ],
  model: "text-embedding-ada-002",
  usage: {
    prompt_tokens: 8,
    total_tokens: 8,
  },
};

// Creates an embedding vector representing the input text.
export class EmbeddingsAPI {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  path(): string {
    return [api2ProviderBaseUrl.Embeddings, OpenaiPath.EmbeddingsPath].join(
      "/",
    );
  }

  async request(
    options: EmbeddingsRequest,
    signal?: AbortSignal,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const abortSignal = signal || controller.signal;

      signal && signal.addEventListener("abort", () => controller.abort());

      const res = await fetch(this.path(), {
        ...getRequestOptions(this.apiKey, options),
        signal: abortSignal,
      });

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.warn("[Request] Embeddings request aborted");
      } else {
        console.error("[Request] Failed to make a Embeddings request", e);
      }
      throw e;
    }
  }
}
