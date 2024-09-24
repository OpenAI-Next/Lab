export interface ApiRequestConfig {
  url: string;
  opt: RequestInit;
  name?: string;
  returnType?: keyof Pick<Response, "json" | "text" | "blob" | "arrayBuffer">;
}

export const makeApiRequest = async (config: ApiRequestConfig) => {
  const res = await fetch(config.url, {
    ...config.opt,
    body: config.opt.body ? JSON.stringify(config.opt.body) : undefined,
  });
  const data = await res[config.returnType || "json"]();
  console.log(`[Fetch Response] ${config.name || config.url}`, data);
  return data;
};
