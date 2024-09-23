import Ajv from "ajv";

export function safeJsonParse(jsonString: any, defaultValue: object): object {
  if (typeof jsonString !== "string") return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("safeJsonParseError, original string:", jsonString);
    return defaultValue;
  }
}

export function safeJsonStringify(
  jsonObject: any,
  defaultValue: string,
): string {
  try {
    return JSON.stringify(jsonObject, null, 2);
  } catch (e) {
    console.error("safeJsonStringifyError, original object:", jsonObject);
    return defaultValue;
  }
}

export function validateApiKey(
  apiKey: string,
): "error" | "warning" | undefined {
  if (apiKey.startsWith("sk-")) {
    return apiKey.length === 51 ? undefined : "error";
  }
  return apiKey.startsWith("eyJhbGciOiJ") ? undefined : "warning";
}

export async function copyText(text: string) {
  let success = true;
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error("Failed to copy text to clipboard", e);
    success = false;
  }
  return success;
}

// verifyJSON 用于验证是否是合法的JSON字符串
export const verifyJSON = (str: string): boolean => {
  try {
    const obj = JSON.parse(str);
    return typeof obj === "object" && obj !== null;
  } catch (e) {
    return false;
  }
};

// jsonValidationRule 用于验证是否是合法的JSON字符串的 antd 表单验证规则
export const jsonValidationRule = {
  validator: async (_: any, value: string) => {
    if (verifyJSON(value) || value === "" || value === undefined) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("输入内容不是有效的JSON字符串"));
  },
};

// arrayValidationRule 用于验证是否是合法的数组的 antd 表单验证规则
export const arrayValidationRule = {
  validator: async (_: any, value: string) => {
    if (value === "" || value === undefined) {
      return Promise.resolve();
    }
    try {
      const obj = JSON.parse(value);
      if (Array.isArray(obj)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Input content is not a valid array"));
    } catch (e) {
      return Promise.reject(
        new Error("Input content is not a valid JSON string"),
      );
    }
  },
};

export const jsonMapValidationRule = {
  validator: async (_: any, value: string) => {
    if (value === "" || value === undefined) {
      return Promise.resolve();
    }
    try {
      const obj = JSON.parse(value);
      if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("输入内容可能不是有效的 JSON 对象映射"));
    } catch (e) {
      return Promise.reject(new Error("输入内容可能不是有效的 JSON 字符串"));
    }
  },
};

// jsonSchemaValidationRule 用于验证是否符合 JSON Schema 的 antd 表单验证规则
export const jsonSchemaValidationRule = {
  validator: async (_: any, value: string) => {
    if (value === "" || value === undefined) {
      return Promise.resolve();
    }
    const parsedValue = JSON.parse(value);

    const ajv = new Ajv();
    const valid = ajv.validateSchema(parsedValue);
    return valid
      ? Promise.resolve()
      : Promise.reject(new Error("输入内容可能不符合 JSON Schema 规则"));
  },
};

export function transformObject(obj: any, paths: string | any[]) {
  if (!Array.isArray(paths) || paths.length === 0) {
    throw new Error("Invalid paths parameter. Expected a non-empty array.");
  }

  const transformedObj = { ...obj };

  for (const path of paths) {
    const keys = path.split(".");
    let nestedObj = transformedObj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (nestedObj.hasOwnProperty(key) && typeof nestedObj[key] === "object") {
        nestedObj = nestedObj[key];
      } else {
        return { error: `Invalid path: ${path}` };
      }
    }

    const lastKey = keys[keys.length - 1];
    if (
      nestedObj.hasOwnProperty(lastKey) &&
      typeof nestedObj[lastKey] === "string"
    ) {
      try {
        nestedObj[lastKey] = JSON.parse(nestedObj[lastKey]);
      } catch (error) {
        return { error: `Failed to parse value for path "${path}"` };
      }
    }
  }

  return transformedObj;
}

export function getErrorObject(res: Response): {
  error: { [key: string]: any };
} {
  return {
    error: {
      url: res.url,
      status: res.status,
      statusText: res.statusText,
    },
  };
}

export const handelResponseError = async (
  res: Response,
  updateError: (error: any) => void,
) => {
  const resClone = res.clone();
  try {
    const resJson = await resClone.json();
    updateError(resJson);
  } catch (e) {
    updateError(getErrorObject(resClone));
  }
};

/**
 * @description 关闭所有可能存在的音乐播放、弹窗、视频播放
 * @returns {void}
 * @example CloseAllSound()
 */
export function CloseAllSound(audio?: any): void {
  // 关闭所有可能存在的音乐播放
  document.querySelectorAll("audio").forEach((audio) => audio.pause());
  // 关闭可能存在的弹窗
  document
    .querySelectorAll("div[style*='z-index: 8998']")
    .forEach((element) => document.body.removeChild(element));
  // 关闭可能存在的视频播放
  document.querySelectorAll("video").forEach((video) => video.pause());
  // 关闭可能存在的音频播放
  window.speechSynthesis?.cancel();
  // audio
  if (audio && audio instanceof HTMLAudioElement) {
    audio.pause(); // 停止播放音频
    audio.currentTime = 0; // 重置音频播放位置
  }
}

export function noApiKeys(key: string): boolean {
  return key === "" || key === undefined || key === null;
}
