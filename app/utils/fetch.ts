import { BASE_URL_B } from "@/app/providers/interfaces";
import { safeJsonStringify } from "../utils";

export interface ApiRequestConfig {
  endpoint: string;
  options: RequestInit & {
    method: RequestInit["method"];
    headers: RequestInit["headers"];
    signal: AbortSignal | undefined;
  };
}

export interface MakeApiRequestResult<T = any> {
  resData: T;
  metaData: {
    request: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body: XMLHttpRequestBodyInit | undefined;
    };
    response: {
      status: number;
      headers: Record<string, string>;
      res: any;
    };
  };
}

export const makeApiRequest = async <T = any>(config: ApiRequestConfig): Promise<MakeApiRequestResult<T>> => {
  const url = [BASE_URL_B, config.endpoint].join("/");
  const options = {
    ...config.options,
    ...(config.options.body ? { body: safeJsonStringify(config.options.body, "{}") } : {}),
  };

  const res = await fetch(url, options);
  const resData = await res.json();

  // 将 Headers 对象转换为普通对象
  const convertHeadersToObject = (headers: Headers) => {
    const headersObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    return headersObj;
  };

  const metaData = {
    request: {
      url: res.url,
      method: options.method || "GET",
      headers: options.headers ? convertHeadersToObject(new Headers(options.headers)) : {},
      body: options.body && !(options.body instanceof ReadableStream) ? options.body : undefined,
    },
    response: {
      status: res.status,
      headers: convertHeadersToObject(res.headers),
      res: resData,
    },
  };

  console.log(`[Fetch Data] ${config.endpoint}`, metaData);

  return { resData: resData, metaData };
};

/**
 * 替换 endpoint 中的参数, 例如 /api/v1/user/{id} => /api/v1/user/123
 * @param params - endpoint 参数，例如 { id: "123", name: "test" }
 * @param endpoint - 带有参数的 endpoint，例如 /api/v1/user/{id}
 * @returns 替换后的 endpoint
 * @example replaceEndpointParams({ id: "123" }, "/api/v1/user/{id}") => "/api/v1/user/123"
 */
export const replaceEndpointParams = (params: Record<string, string> | undefined, endpoint: string): string => {
  if (!params) {
    console.warn("No params provided for endpoint", endpoint);
    return endpoint;
  }
  return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`{${key}}`, value), endpoint);
};
