import OSS from "ali-oss";


export class AliyunOSS {

    private readonly apiKey: string = "q"

    private client = new OSS({
        // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
        region: 'yourregion',
        // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
        accessKeyId: process.env.OSS_ACCESS_KEY_ID as string,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET as string,
        // 填写Bucket名称。
        bucket: 'examplebucket',
    });

    private commonRequestHeaders = {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Length": 0,
        "Content-Type": "application/xml",
    };
}
