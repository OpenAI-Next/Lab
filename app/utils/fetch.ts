import { BASE_URL_B } from "@/app/providers/interfaces";

export interface ApiRequestConfig {
  endpoint: string;
  options: RequestInit;
  returnType?: keyof Pick<Response, "json" | "text" | "blob" | "arrayBuffer">;
}

export const makeApiRequest = async (config: ApiRequestConfig) => {
  const res = await fetch([BASE_URL_B, config.endpoint].join("/"), {
    ...config.options,
    ...(config.options.body
      ? { body: JSON.stringify(config.options.body) }
      : {}),
  });
  const data = await res[config.returnType || "json"]();
  console.log(`[Fetch Response] ${config.endpoint}`, data);
  return data;
};
