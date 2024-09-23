export function getHeadersWithApiKey(
  apiKey: string,
  method: "GET" | "POST" = "POST",
): HeadersInit {
  const headers: HeadersInit = {
    Authorization: `Bearer ${apiKey}`,
  };

  if (method === "POST") {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export function getAuthHeaderWithApiKey(ApiKey: string) {
  return {
    Authorization: `Bearer ${ApiKey}`,
  };
}

export function getRequestOptions(apiKey: string, method: "GET"): RequestInit;
export function getRequestOptions(apiKey: string, data: any): RequestInit;
export function getRequestOptions(
  apiKey: string,
  methodOrData: "GET" | any,
): RequestInit {
  const headers: HeadersInit = new Headers();
  headers.append("Authorization", `Bearer ${apiKey}`);

  if (methodOrData === "GET") {
    return {
      method: "GET",
      headers,
    };
  } else {
    headers.append("Content-Type", "application/json");
    return {
      method: "POST",
      headers,
      body: JSON.stringify(methodOrData, null, 2),
    };
  }
}
