// FileCodeBox

const SERVER_URL = "https://uploader.shell-api.com";

// 上传
// curl 'https://uploader.shell-api.com/share/file/' \
//   -H 'accept: */*' \
//   -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary45julFmDaGJVCTNt' \
//   --data-raw $'------WebKitFormBoundary45julFmDaGJVCTNt\r\nContent-Disposition: form-data; name="file"; filename="a5163c4c-ed8a-4251-bd4e-56cbf7689c49 (2).ico"\r\nContent-Type: image/vnd.microsoft.icon\r\n\r\n\r\n------WebKitFormBoundary45julFmDaGJVCTNt\r\nContent-Disposition: form-data; name="expire_value"\r\n\r\n1\r\n------WebKitFormBoundary45julFmDaGJVCTNt\r\nContent-Disposition: form-data; name="expire_style"\r\n\r\nminute\r\n------WebKitFormBoundary45julFmDaGJVCTNt--\r\n'

interface UploadToServerResponse {
  /**
   * 200 - 成功
   */
  code: number;
  message: string;
  detail: {
    /**
     * xxxxx，五位数密码
     */
    code: number;
    /**
     * 文件名
     */
    name: string;
  };
}

// 查询
// http://uploader.shell-api.com/#/?code=84340

// curl 'http://uploader.shell-api.com/share/select/' \
//   --data-raw '{"code":"89577"}' \
//   --insecure

// {
//     "code": 200,
//     "message": "ok",
//     "detail": {
//         "code": "89577",
//         "name": "a5163c4c-ed8a-4251-bd4e-56cbf7689c49 (3).ico",
//         "size": 9259,
//         "text": "/share/download?key=1fe9d27aed68a599abd5cf0fea068a2ccc9f5c7482c509a97129e52b600d831d&code=89577"
//     }
// }

// {"code":404,"message":"ok","detail":"文件不存在"}
// {"detail":"请求次数过多，请稍后再试"}

interface GetFileUrlResponse {
  /**
   * 200 - 成功
   */
  code: number;
  message: string;
  detail: {
    /**
     * 五位数密码
     */
    code: number;
    /**
     * 文件名
     */
    name: string;
    /**
     * 文件大小
     */
    size: number;
    /**
     * 下载链接
     */
    text: string;
  };
}

async function _uploadToServer(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("expire_value", "10");
  formData.append("expire_style", "minute");

  try {
    const response = await fetch(`${SERVER_URL}/share/file/`, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as UploadToServerResponse;
    if (data.code !== 200) {
      throw new Error(data.message);
    }
    return data.detail.code;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function _getFileUrl(code: string): Promise<string> {
  try {
    const response = await fetch(`${SERVER_URL}/share/select/`, {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = (await response.json()) as GetFileUrlResponse;
    if (data.code !== 200) {
      throw new Error(data?.message);
    }
    return `${SERVER_URL}${data.detail.text}`;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function uploadToGetFileUrl(file: File): Promise<string> {
  try {
    const code = await _uploadToServer(file);
    return await _getFileUrl(code.toString());
  } catch (error) {
    console.error(error);
    throw error;
  }
}
