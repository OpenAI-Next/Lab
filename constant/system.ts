export const SITE_TITLE = "OpenAI Next Lab";
export const SITE_DESCRIPTION = "Online Test Platform";
export const REQUEST_TIMEOUT_MS = 60 * 1000;

export enum Path {
    Home = "/",
    Chat = "/chat",
    Embeddings = "/embeddings",
    Dalle = "/dalle",
    Flux = "/flux",
    TTS = "/tts",
    ASR = "/asr",
    Settings = "/settings",
    Midjourney = "/midjourney",
    Suno = "/suno",
    Vidu = "/vidu",
    Pika = "/pika",
    Luma = "/luma",
    GPTs = "/gpts",
    Doc2X = "/doc2x",
    BiBiGPT = "/bibi-gpt",
    StableDiffusion = "/stable-diffusion",
    Pricing = "/pricing",
    Tools = "/tools",
}

// OpenAI 请求端点
export enum OpenaiPath {
    ChatCompletionsPath = "v1/chat/completions",
    ImageCreatePath = "v1/images/generations",
    ImageEditPath = "v1/images/edits",
    ImageVariationPath = "v1/images/variations",
    SpeechPath = "v1/audio/speech",
    TranscriptionPath = "v1/audio/transcriptions",
    EmbeddingsPath = "v1/embeddings",
}

// SunoProxy 请求端点
export enum SunoEndpoint {
    SUNO_UPLOAD = "suno/v2/uploads/audio",
    SUNO_GENERATE = "suno/v2/generate",
    SUNO_QUERY = "suno/v2/feed?ids={{ids}}",// 此处需传clips id 而非 任务 id，多个用英文逗号分割
    SUNO_LYRICS_GENERATE = "suno/v1/v3.0/lyrics",
    SUNO_LYRICS_FEED = "suno/v1/v3.0/lyrics/{{id}}",
}

// ViduProxy 请求端点
export enum ViduEndpoint {
    GENERATION = "vidu/v1/tasks",
    TASK_GET = "vidu/v1/tasks/{{id}}",
}

export enum PikaEndpoint {
    PIKA_CREATE = "v1/video/create",
    PIKA_QUERY = "v1/video/query?site=pika&model={{model}}&id={{id}}",
}

export enum LumaEndpoint {
    CREATE = "v1/{{luma_account_type}}/generations",
    EXTEND = "v1/{{luma_account_type}}/extend",
    QUERY = "v1/{{luma_account_type}}/task?id={{id}}",
}

// MidjourneyProxy 请求端点
export enum MidjourneyEndpoint {
    IMAGINE = "mj/submit/imagine",
    BLEND = "mj/submit/blend",
    DESCRIBE = "mj/submit/describe",
    MODAL = "mj/submit/modal",
    SHORTEN = "mj/submit/shorten",
    FETCH = "mj/task/{id}/fetch",
    SEED = "mj/task/{id}/image-seed",
    ACTION = "mj/submit/action",
    CANCEL = "mj/task/{id}/cancel",
}

// MidjourneyProxy 响应状态码
export enum MidjourneyTaskResStatus {
    OK = 200,
    CREATED = 201,
}

// Doc2X 请求端点
export enum Doc2XEndpoint {
    Default = "v1/chat/completions",
}

export enum GptsSearchEndpoint {
    Default = "v1/gpts/search?search={{keywords}}",
}

export enum UrlAnalysisEndpoint {
    SUMMARY = "v1/urlanalysis/summary",                 // 链接总结
    CHAT = "v1/urlanalysis/chat",                        // 链接聊天
    SUBTITLE = "v1/urlanalysis/subtitle",                // 字幕导出
}

export enum StableDiffusionEndpoint {
    ImageUltra = "sd/v2beta/stable-image/generate/ultra",
    ImageCore = "sd/v2beta/stable-image/generate/core",
    StableDiffusion3 = "sd/v2beta/stable-image/generate/sd3",
    TextToImage = "sd/v1/generation/{{engine_id}}/text-to-image",
}
