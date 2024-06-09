export const US2CNY = 8;

export interface ProviderModelListType {
    name_cn: string;
    name_en: string;
    website?: {
        home: string;
        docs: string;
        price: string;
    };
    model_list: {
        model: string;
        category: "LLM" | "IMAGE" | "AUDIO" | "EMBEDDING" | "OTHER";
        price: {
            prompt: number | null;
            complete: number | null;
            times: number | null | { columns: any[]; dataSource: any[]; } | string;
            unit?: string;
            comment?: string;
        };
        description?: string;
        mark?: string;
        max_tokens?: number;
        outdated?: boolean;
    }[];
}

export type ModelListType = ProviderModelListType["model_list"][0];

const PROVIDER_MODEL_LIST: { [provider_name: string]: ProviderModelListType } = {
    OPENAI: {
        name_cn: "OpenAI",
        name_en: "OpenAI",
        website: {
            home: "https://openai.com/",
            docs: "https://beta.openai.com/docs/api-reference",
            price: "https://beta.openai.com/pricing",
        },
        model_list: [
            {
                model: "gpt-4o",
                category: "LLM",
                description: "",
                price: {
                    prompt: 5,
                    complete: 15,
                    times: null
                }
            },
            {
                model: "gpt-4o-2024-05-13",
                category: "LLM",
                description: "",
                price: {
                    prompt: 5,
                    complete: 15,
                    times: null
                }
            },
            {
                model: "gpt-4-turbo",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null
                }
            },
            {
                model: "gpt-4-turbo-2024-04-09",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null
                }
            },
            {
                model: "gpt-4",
                category: "LLM",
                description: "",
                price: {
                    prompt: 30,
                    complete: 60,
                    times: null
                }
            },
            {
                model: "gpt-4-32k",
                category: "LLM",
                description: "",
                price: {
                    prompt: 60,
                    complete: 120,
                    times: null
                }
            },
            {
                model: "gpt-4-vision-preview",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null
                },
                outdated: true
            },
            {
                model: "gpt-4-0125-preview",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null
                },
                outdated: true,
            },
            {
                model: "gpt-4-1106-preview",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null
                },
                outdated: true,
            },
            {
                model: "gpt-3.5-turbo-0125",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.5,
                    complete: 1.5,
                    times: null
                },
                max_tokens: 16 * 1024
            },
            {
                model: "gpt-3.5-turbo-instruct",
                category: "LLM",
                description: "",
                price: {
                    prompt: 1.5,
                    complete: 2,
                    times: null
                },
                max_tokens: 4 * 1024
            },
            {
                model: "gpt-3.5-turbo-1106",
                category: "LLM",
                description: "",
                price: {
                    prompt: 1,
                    complete: 2,
                    times: null
                },
                outdated: true,
            },
            {
                model: "gpt-3.5-turbo-0613",
                category: "LLM",
                description: "",
                price: {
                    prompt: 1.5,
                    complete: 2,
                    times: null
                },
                outdated: true,
            },
            {
                model: "gpt-3.5-turbo-16k-0613",
                category: "LLM",
                description: "",
                price: {
                    prompt: 3,
                    complete: 4,
                    times: null
                },
                outdated: true,
            },
            {
                model: "gpt-3.5-turbo-0301",
                category: "LLM",
                description: "",
                price: {
                    prompt: 1.5,
                    complete: 2,
                    times: null
                },
                outdated: true,
            },
            {
                model: "dall-e-3",
                category: "IMAGE",
                description: "",
                price: {
                    unit: "张",
                    prompt: null,
                    complete: null,
                    times: {
                        columns: [
                            {title: "质量", name: "quality",},
                            {title: "分辨率", name: "resolution",},
                            {title: "价格", name: "price",},
                        ],
                        dataSource: [
                            {
                                quality: "Standard",
                                resolution: "1024×1024",
                                price: 0.04,
                            },
                            {
                                quality: "Standard",
                                resolution: "1024×1792",
                                price: 0.08,
                            },
                            {
                                quality: "Standard",
                                resolution: "1792×1024",
                                price: 0.08,
                            },
                            {
                                quality: "HD",
                                resolution: "1024×1024",
                                price: 0.08,
                            },
                            {
                                quality: "HD",
                                resolution: "1024×1792",
                                price: 0.12,
                            },
                            {
                                quality: "HD",
                                resolution: "1792×1024",
                                price: 0.12,
                            }
                        ]
                    }
                }
            },
            {
                model: "dall-e-2",
                category: "IMAGE",
                description: "",
                price: {
                    unit: "张",
                    prompt: null,
                    complete: null,
                    times: {
                        columns: [
                            {title: "分辨率", name: "resolution",},
                            {title: "价格", name: "price",},
                        ],
                        dataSource: [
                            {
                                quality: "Standard",
                                resolution: "1024×1024",
                                price: 0.02,
                            },
                            {
                                quality: "Standard",
                                resolution: "512×512",
                                price: 0.018,
                            },
                            {
                                quality: "Standard",
                                resolution: "256×256",
                                price: 0.016,
                            },
                        ]
                    }
                },
            },
            {
                model: "whisper",
                category: "AUDIO",
                description: "",
                price: {
                    unit: "minute",
                    prompt: null,
                    complete: 0.006,
                    times: null
                },
            },
            {
                model: "tts-1",
                category: "AUDIO",
                description: "",
                price: {
                    unit: "1M characters",
                    prompt: null,
                    complete: 15,
                    times: null
                },
            },
            {
                model: "tts-1-hd",
                category: "AUDIO",
                description: "",
                price: {
                    unit: "1M characters",
                    prompt: null,
                    complete: 30,
                    times: null
                },
            },
            {
                model: "tts-1-hd-1106",
                category: "AUDIO",
                mark: "快照版本",
                description: "",
                price: {
                    unit: "1M characters",
                    prompt: null,
                    complete: 30,
                    times: null
                },
            },
            {
                model: "text-embedding-3-small",
                category: "EMBEDDING",
                description: "",
                price: {
                    prompt: 0.02,
                    complete: null,
                    times: null,
                },
            },
            {
                model: "text-embedding-3-large",
                category: "EMBEDDING",
                description: "",
                price: {
                    prompt: 0.13,
                    complete: null,
                    times: null,
                },
            },
            {
                model: "ada v2",
                category: "EMBEDDING",
                description: "",
                price: {
                    prompt: 0.1,
                    complete: null,
                    times: null,
                },
            },
        ],
    },
    OPENAI_PLUS: {
        name_cn: "OpenAI-PLUS",
        name_en: "OpenAI-PLUS",
        website: {
            home: "https://openai.com/",
            docs: "https://beta.openai.com/docs/api-reference",
            price: "https://beta.openai.com/pricing",
        },
        model_list: [
            {
                model: "gpt-4-all",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: 0.2,
                },
            },
            {
                model: "gpt-4-gizmo",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: 0.2,
                },
            },
            {
                model: "gpt-4-gizmo-*",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: 0.2,
                },
            },

        ],
    },
    ANTHROPIC: {
        name_cn: "Anthropic",
        name_en: "Anthropic",
        website: {
            home: "https://www.anthropic.com/",
            docs: "https://www.anthropic.com/",
            price: "https://www.anthropic.com/",
        },
        model_list: [
            {
                model: "claude-3-opus-20240229",
                category: "LLM",
                description: "",
                price: {
                    prompt: 15,
                    complete: 75,
                    times: null
                },
                max_tokens: 200 * 1024,
            },
            {
                model: "claude-3-sonnet-20240229",
                category: "LLM",
                description: "",
                price: {
                    prompt: 3,
                    complete: 15,
                    times: null
                },
                max_tokens: 200 * 1024,
            },
            {
                model: "claude-3-haiku-20240307",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.25,
                    complete: 1.25,
                    times: null
                },
                max_tokens: 200 * 1024,
            },
            {
                model: "claude-2.1",
                category: "LLM",
                description: "",
                price: {
                    prompt: 8,
                    complete: 24,
                    times: null
                },
                max_tokens: 200 * 1024,
            },
            {
                model: "claude-2.0",
                category: "LLM",
                description: "",
                price: {
                    prompt: 8,
                    complete: 24,
                    times: null
                },
                max_tokens: 200 * 1024,
            },
            {
                model: "claude-instant-1.2",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.8,
                    complete: 2.4,
                    times: null
                },
                max_tokens: 100 * 1024,
            },
        ],
    },
    MIDJOURNEY: {
        name_cn: "Midjourney",
        name_en: "Midjourney",
        website: {
            home: "https://midjourney.com/",
            docs: "https://midjourney.com/",
            price: "https://midjourney.com/",
        },
        model_list: [
            {
                model: "IMAGINE",
                category: "IMAGE",
                description: "生成图像",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "VARIATION",
                category: "IMAGE",
                description: "生成图像的变体，提供不同风格或细节",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "RE_ROLL",
                category: "IMAGE",
                description: "重新生成或调整已生成的图像",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "PAN",
                category: "IMAGE",
                description: "允许用户在图像中平移，查看更大的图像区域",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "IN_PAINT",
                category: "IMAGE",
                description: "局部重绘，用于修复或更改图像的特定区域",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "OUT_PAINT",
                category: "IMAGE",
                description: "外延绘画，用于扩展图像的边界，创造更广阔的视角",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "BLEND",
                category: "IMAGE",
                description: "将多个图像层次混合，创造更丰富的视觉效果",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "mj_ricreader_retry",
                category: "IMAGE",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "mj_pic_reader",
                category: "IMAGE",
                description: "图片阅读器",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "mj_ric_reader",
                category: "IMAGE",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "UPSCALE",
                category: "IMAGE",
                description: "图像放大",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.1,
                    unit: "次",
                },
            },
            {
                model: "UPSCALE_2X",
                category: "IMAGE",
                description: "将图像分辨率放大2倍，提高图像的清晰度",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.1,
                    unit: "次",
                },
            },
            {
                model: "UPSCALE_4X",
                category: "IMAGE",
                description: "将图像分辨率放大4倍，提高图像的清晰度",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.1,
                    unit: "次",
                },
            },
            {
                model: "DESCRIBE",
                category: "IMAGE",
                description: "生成图像的描述或解释图像内容",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.1,
                    unit: "次",
                },
            },
            {
                model: "mj_picreader_retry",
                category: "IMAGE",
                description: "重新理解图片",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "ACTION",
                category: "IMAGE",
                description: "执行特定操作的功能",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "SHORTEN",
                category: "IMAGE",
                description: "缩短文本或简化图像描述",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "FACE_SWAP",
                category: "IMAGE",
                description: "面部交换功能，可以在图像中替换人物的面部",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
            {
                model: "mj-chat",
                category: "OTHER",
                description: "以对话的形式与模型进行交互",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                    unit: "次",
                },
            },
        ],
    },
    SUNO: {
        name_cn: "Suno",
        name_en: "Suno",
        website: {
            home: "https://suno.ai/",
            docs: "https://suno.ai/",
            price: "https://suno.ai/",
        },
        model_list: [
            {
                model: "suno-v3",
                category: "OTHER",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                },
            },
            {
                model: "chirp-v3-0",
                category: "OTHER",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.3,
                },
            },
            {
                model: "chirp-v2-xxl-alpha",
                category: "OTHER",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.1,
                },
            },
        ],
    },
    GOOGLE_GEMINI: {
        name_cn: "Google Gemini",
        name_en: "Google Gemini",
        website: {
            home: "https://www.google.com/",
            docs: "https://www.google.com/",
            price: "https://www.google.com/",
        },
        model_list: [
            {
                model: "gemini-pro-1.5",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null,
                },
            },
            {
                model: "gemini-1.0-pro-001",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null,
                },
            },
            {
                model: "gemini-1.0-pro-vision-001",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null,
                },
            },
            {
                model: "gemini-pro",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null,
                },
            },
            {
                model: "gemini-pro-vision",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null,
                },
            },
            {
                model: "google-palm",
                category: "LLM",
                description: "",
                price: {
                    prompt: 10,
                    complete: 30,
                    times: null,
                },
            },
        ],
    },
    GOOGLE_GEMMA: {
        name_cn: "Google Gemma",
        name_en: "Google Gemma",
        website: {
            home: "https://www.google.com/",
            docs: "https://www.google.com/",
            price: "https://www.google.com/",
        },
        model_list: [
            {
                model: "gemma-2b-it",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.5,
                    complete: 0.5,
                    times: null,
                },
            },
            {
                model: "gemma-7b-it",
                category: "LLM",
                description: "",
                price: {
                    prompt: 1.5,
                    complete: 1.5,
                    times: null,
                },
            }
        ],
    },
    ZHIPU: {
        name_cn: "智谱",
        name_en: "ChatGLM",
        website: {
            home: "https://www.zhipu.ai/",
            docs: "https://www.zhipu.ai/",
            price: "https://www.zhipu.ai/",
        },
        model_list: [
            {
                model: "glm-4",
                category: "LLM",
                description: "",
                mark: "",
                price: {
                    prompt: 0.1 * 1000 / US2CNY,
                    complete: 0.1 * 1000 / US2CNY,
                    times: null,
                    comment: "0.1元 / 千tokens"
                },
                max_tokens: 128 * 1024
            },
            {
                model: "glm-4v",
                category: "LLM",
                description: "",
                mark: "",
                price: {
                    prompt: 0.1 * 1000 / US2CNY,
                    complete: 0.1 * 1000 / US2CNY,
                    times: null,
                    comment: "0.1元 / 千tokens，处理一幅图片约消耗1047tokens"
                },
                max_tokens: 2 * 1024
            },
            {
                model: "glm-3-turbo",
                category: "LLM",
                description: "",
                mark: "",
                price: {
                    prompt: 0.001 * 1000 / US2CNY,
                    complete: 0.001 * 1000 / US2CNY,
                    times: null,
                    comment: "0.001元 / 千tokens"
                },
                max_tokens: 128 * 1024
            },
            {
                model: "cogview-3",
                category: "IMAGE",
                description: "",
                mark: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: 0.25 / US2CNY,
                    unit: "张",
                    comment: "0.25元 / 张"
                },
                max_tokens: 128 * 1024
            },
        ],
    },
    GROQ: {
        name_cn: "GROQ",
        name_en: "GROQ",
        website: {
            home: "https://www.groq.com/",
            docs: "https://www.groq.com/",
            price: "https://www.groq.com/",
        },
        model_list: [],
    },
    BAIDU_WENXIN: {
        name_cn: "百度文心",
        name_en: "Baidu Wenxin",
        website: {
            home: "https://wenxin.baidu.com/",
            docs: "https://wenxin.baidu.com/",
            price: "https://wenxin.baidu.com/",
        },
        model_list: [
            {
                model: "ERNIE-4.0-8K",
                category: "LLM",
                description: "相较ERNIE 3.5实现了模型能力全面升级，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。",
                price: {
                    prompt: 0.12 * 1000 / US2CNY,
                    complete: 0.12 * 1000 / US2CNY,
                    times: null,
                    comment: "ERNIE 4.0系列 0.12元 / 千tokens"
                }
            },
            {
                model: "ERNIE-3.5-8K",
                category: "LLM",
                description: "百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力。",
                price: {
                    prompt: 0.12 * 1000 / US2CNY,
                    complete: 0.12 * 1000 / US2CNY,
                    times: null,
                    comment: "ERNIE 3.5系列 0.12元 / 千tokens"
                }
            },
            {
                model: "ERNIE-Lite-8K-0922",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.008 * 1000 / US2CNY,
                    complete: 0.012 * 1000 / US2CNY,
                    times: null,
                    comment: "输入 0.008元/千tokens，输出 0.008元/千tokens (限时优惠，原价0.012元/千tokens)"
                }
            },
            {
                model: "ERNIE Speed-AppBuilder",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.004 * 1000 / US2CNY,
                    complete: 0.008 * 1000 / US2CNY,
                    times: null,
                    comment: "输入 0.004元/千tokens，输出 0.012元/千tokens (限时优惠，原价0.008元/千tokens)"
                }
            },
            {
                model: "ERNIE-Lite-8K",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.003 * 1000 / US2CNY,
                    complete: 0.006 * 1000 / US2CNY,
                    times: null,
                    comment: "输入 0.003元/千tokens 输出 0.006元/千tokens"
                }
            },
        ],
    },
    ALI_TONGYI: {
        name_cn: "阿里通义",
        name_en: "Ali Tongyi",
        website: {
            home: "https://www.aliyun.com",
            docs: "",
            price: "https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-thousand-questions-metering-and-billing?spm=a2c4g.11186623.0.0.6d1b12b0bkLnOS",
        },
        model_list: [
            {
                model: "qwen-turbo",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.008 * 1000 / US2CNY,
                    complete: 0.008 * 1000 / US2CNY,
                    times: null,
                    comment: "0.008元/1,000 tokens"
                }
            },
            {
                model: "qwen-plus",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.02 * 1000 / US2CNY,
                    complete: 0.02 * 1000 / US2CNY,
                    times: null,
                    comment: "0.02元/1,000 tokens"
                }
            },
            {
                model: "qwen-max",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.12 * 1000 / US2CNY,
                    complete: 0.12 * 1000 / US2CNY,
                    times: null,
                    comment: "0.12元/1,000 tokens"
                }
            },
            {
                model: "qwen-max-0428",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.12 * 1000 / US2CNY,
                    complete: 0.12 * 1000 / US2CNY,
                    times: null,
                    comment: "0.12元/1,000 tokens"
                }
            },
            {
                model: "qwen-max-0403",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.12 * 1000 / US2CNY,
                    complete: 0.12 * 1000 / US2CNY,
                    times: null,
                    comment: "0.12元/1,000 tokens"
                }
            },
            {
                model: "qwen-max-0107",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.12 * 1000 / US2CNY,
                    complete: 0.12 * 1000 / US2CNY,
                    times: null,
                    comment: "0.12元/1,000 tokens"
                }
            },
            {
                model: "qwen-max-longcontext",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.12 * 1000 / US2CNY,
                    complete: 0.12 * 1000 / US2CNY,
                    times: null,
                    comment: "0.12元/1,000 tokens"
                }
            },
            {
                model: "qwen-vl-plus",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.008 * 1000 / US2CNY,
                    complete: 0.008 * 1000 / US2CNY,
                    times: null,
                    comment: "0.008元/1,000 tokens"
                }
            },
            {
                model: "qwen-vl-max",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.02 * 1000 / US2CNY,
                    complete: 0.02 * 1000 / US2CNY,
                    times: null,
                    comment: "0.02元/1,000 tokens"
                },
            },
            {
                model: "qwen-audio-turbo",
                category: "AUDIO",
                description: "",
                price: {
                    prompt: 0,
                    complete: 0,
                    times: null,
                    comment: "限时免费"
                }
            },
        ],
    },
    YI: {
        name_cn: "零一万物",
        name_en: "Yi",
        website: {
            home: "https://platform.lingyiwanwu.com",
            docs: "https://platform.lingyiwanwu.com/docs",
            price: "https://platform.lingyiwanwu.com/docs#%E4%BA%A7%E5%93%81%E5%AE%9A%E4%BB%B7",
        },
        model_list: [
            {
                model: "yi-large",
                category: "LLM",
                description: "千亿参数 SOTA 基座模型，适用于复杂推理、预测，深度内容创作等场景",
                price: {
                    prompt: 20 / US2CNY,
                    complete: 20 / US2CNY,
                    times: null,
                    comment: "20元/ M tokens"
                }
            },
            {
                model: "yi-large-turbo",
                category: "LLM",
                description: "超高性价比、卓越性能，根据性能和推理速度、成本，进行平衡性高精度调优，适用于全场景、高品质的推理及文本生成等场景",
                price: {
                    prompt: 12 / US2CNY,
                    complete: 12 / US2CNY,
                    times: null,
                    comment: "12元/ M tokens"
                }
            },
            {
                model: "yi-large-rag",
                category: "LLM",
                description: "RAG 检索增强，基于Yi-Large超强模型的高阶服务，结合检索与生成技术提供精准答案",
                price: {
                    prompt: 25 / US2CNY,
                    complete: 25 / US2CNY,
                    times: null,
                    comment: "25元/ M tokens"
                }
            },
            {
                model: "yi-medium",
                category: "LLM",
                description: "中型尺寸升级微调，适用于常规场景下的聊天、对话、翻译等场景",
                price: {
                    prompt: 2.5 / US2CNY,
                    complete: 2.5 / US2CNY,
                    times: null,
                    comment: "2.5元/ M tokens"
                }
            },
            {
                model: "yi-medium-200k",
                category: "LLM",
                description: "200k超长文本窗口，提供长文本深度理解和生成能力，适用于文档阅读、问答、构建知识库等场景",
                price: {
                    prompt: 12 / US2CNY,
                    complete: 12 / US2CNY,
                    times: null,
                    comment: "12元/ M tokens"
                },
                max_tokens: 200 * 1024
            },
            {
                model: "yi-spark",
                category: "LLM",
                description: "小而精悍轻量极速，适用于轻量化数学分析、代码生成、文本聊天等场景",
                price: {
                    prompt: 1 / US2CNY,
                    complete: 1 / US2CNY,
                    times: null,
                    comment: "1元/ M tokens"
                }
            },
            {
                model: "yi-vision",
                category: "LLM",
                description: "视觉语言集成，提供高性能图片理解、分析能力，适用于基于图片的聊天、分析等场景",
                price: {
                    prompt: 6 / US2CNY,
                    complete: 6 / US2CNY,
                    times: null,
                    comment: "6元/ M tokens"
                }
            },
        ],
    },
    IFLYTEK_SPARK: {
        name_cn: "讯飞星火",
        name_en: "iFlytek Spark",
        website: {
            home: "https://www.iflytek.com/",
            docs: "https://www.iflytek.com/",
            price: "https://www.iflytek.com/",
        },
        model_list: [
            // SparkDesk-v3.5,SparkDesk-v3.1,SparkDesk-v1.1
            {
                model: "SparkDesk-v3.5",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.33 * 100 / US2CNY,
                    complete: 0.33 * 100 / US2CNY,
                    times: null,
                    comment: "0.24元/万tokens~0.33元/万tokens"
                }
            },
            {
                model: "SparkDesk-v3.1",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.3 * 100 / US2CNY,
                    complete: 0.3 * 100 / US2CNY,
                    times: null,
                    comment: "0.24元/万tokens~0.3元/万tokens"
                }
            },
            {
                model: "SparkDesk-v1.1",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.15 * 100 / US2CNY,
                    complete: 0.15 * 100 / US2CNY,
                    times: null,
                    comment: "0.15元/万tokens~0.12元/万tokens"
                }
            },
        ],
    },
    BAICHUAN: {
        name_cn: "百川",
        name_en: "Baichuan",
        website: {
            home: "https://www.baichuan-ai.com/home",
            docs: "https://platform.baichuan-ai.com",
            price: "https://platform.baichuan-ai.com/price",
        },
        model_list: [
            {
                model: "Baichuan2-Turbo",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.008 * 1000 / US2CNY,
                    complete: 0.008 * 1000 / US2CNY,
                    times: null,
                    comment: "0.008元/千tokens"
                }
            },
            {
                model: "Baichuan2-Turbo-192k",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.016 * 1000 / US2CNY,
                    complete: 0.016 * 1000 / US2CNY,
                    times: null,
                    comment: "0.016元/千tokens"
                }
            },
            {
                model: "Baichuan2-53B",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.02 * 1000 / US2CNY,
                    complete: 0.02 * 1000 / US2CNY,
                    times: null,
                    comment: "00:00 ~ 8:00 0.01元/千tokens,8:00 ~ 24:00 0.02元/千tokens"
                }
            },
        ]
    },
    MOONSHOT: {
        name_cn: "月之暗面",
        name_en: "Moonshot",
        website: {
            home: "https://moonshot.ai/",
            docs: "https://moonshot.ai/",
            price: "https://moonshot.ai/",
        },
        model_list: [
            // moonshot-v1-8k
            // moonshot-v1-32k
            // moonshot-v1-128k
            {
                model: "moonshot-v1-8k",
                category: "LLM",
                description: "",
                price: {
                    prompt: 12 / US2CNY,
                    complete: 12 / US2CNY,
                    times: null,
                    comment: "12元/ M tokens"
                },
                max_tokens: 8 * 1024,
            },
            {
                model: "moonshot-v1-32k",
                category: "LLM",
                description: "",
                price: {
                    prompt: 24 / US2CNY,
                    complete: 24 / US2CNY,
                    times: null,
                    comment: "24元/ M tokens"
                },
                max_tokens: 32 * 1024
            },
            {
                model: "moonshot-v1-128k",
                category: "LLM",
                description: "",
                price: {
                    prompt: 60 / US2CNY,
                    complete: 60 / US2CNY,
                    times: null,
                    comment: "60元/ M tokens"
                },
                max_tokens: 128 * 1024,
            }
        ],
    },
    MINIMAX: {
        name_cn: "MiniMax",
        name_en: "MiniMax",
        website: {
            home: "https://www.minimaxi.com",
            docs: "",
            price: "https://www.minimaxi.com/document/price?id=6433f32294878d408fc8293e",
        },
        model_list: [
            {
                model: "abab6.5",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.03 * 1000 / US2CNY,
                    complete: 0.03 * 1000 / US2CNY,
                    times: null,
                    comment: "0.03元/千tokens"
                }
            },
            {
                model: "abab6.5s",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.1 * 1000 / US2CNY,
                    complete: 0.1 * 1000 / US2CNY,
                    times: null,
                    comment: "0.1元/千tokens"
                }
            },
            {
                model: "abab6",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.1 * 1000 / US2CNY,
                    complete: 0.1 * 1000 / US2CNY,
                    times: null,
                    comment: "0.1元/千tokens"
                }
            },
            {
                model: "abab5.5",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.015 * 1000 / US2CNY,
                    complete: 0.015 * 1000 / US2CNY,
                    times: null,
                    comment: "0.015元/千tokens"
                }
            },
            {
                model: "abab5.5s",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.005 * 1000 / US2CNY,
                    complete: 0.005 * 1000 / US2CNY,
                    times: null,
                    comment: "0.005元/千tokens"
                }
            },
            {
                model: "embo-01",
                category: "EMBEDDING",
                description: "",
                price: {
                    prompt: 0.0005 * 1000 / US2CNY,
                    complete: null,
                    times: null,
                    comment: "0.0005元/千tokens"
                }
            },
        ],
    },
    MISTRAL: {
        name_cn: "Mistral",
        name_en: "Mistral",
        website: {
            home: "",
            docs: "",
            price: "https://mistral.ai/technology/#pricing",
        },
        model_list: [
            {
                model: "open-mistral-7b",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.25,
                    complete: 0.25,
                    times: null,
                },
                max_tokens: 32 * 1024,
            },
            {
                model: "open-mixtral-8x7b",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.7,
                    complete: 0.7,
                    times: null,
                },
                max_tokens: 32 * 1024,
            },
            {
                model: "open-mixtral-8x22b",
                category: "LLM",
                description: "",
                price: {
                    prompt: 2,
                    complete: 6,
                    times: null,
                }
            },
            {
                model: "mistral-small",
                category: "LLM",
                description: "Cost-efficient reasoning for low-latency workloads.",
                price: {
                    prompt: 1,
                    complete: 3,
                    times: null,
                },
                max_tokens: 32 * 1024,
            },
            {
                model: "mistral-medium",
                category: "LLM",
                description: "Will soon be deprecated",
                price: {
                    prompt: 2.7,
                    complete: 8.1,
                    times: null,
                },
                max_tokens: 32 * 1024,
            },
            {
                model: "mistral-large",
                category: "LLM",
                description: "Top-tier reasoning for high-complexity tasks. The most powerful model of the Mistral AI family.",
                price: {
                    prompt: 4,
                    complete: 12,
                    times: null,
                },
                max_tokens: 32 * 1024,
            },
        ],
    },
    TENCENT_HUNYUAN: {
        name_cn: "腾讯混元",
        name_en: "Tencent Hunyuan",
        website: {
            home: "",
            docs: "",
            price: "https://cloud.tencent.com/document/product/1729/97731",
        },
        model_list: [
            {
                model: "hunyuan-pro",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.1 * 1000 / US2CNY,
                    complete: 0.1 * 1000 / US2CNY,
                    times: null,
                    comment: "0.1元/千tokens"
                }
            },
            {
                model: "hunyuan-standard",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.01 * 1000 / US2CNY,
                    complete: 0.01 * 1000 / US2CNY,
                    times: null,
                    comment: "0.01元/千tokens"
                }
            },
            {
                model: "hunyuan-standard-256k",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.12 * 1000 / US2CNY,
                    complete: 0.12 * 1000 / US2CNY,
                    times: null,
                    comment: "0.12元/千tokens"
                }
            },
            {
                model: "hunyuan-lite",
                category: "LLM",
                description: "",
                price: {
                    prompt: 0.008 * 1000 / US2CNY,
                    complete: 0.008 * 1000 / US2CNY,
                    times: null,
                    comment: "0.008元/千tokens"
                }
            },
            {
                model: "hunyuan-embedding",
                category: "EMBEDDING",
                description: "",
                price: {
                    prompt: 0.0007 * 1000 / US2CNY,
                    complete: 0.0007 * 1000 / US2CNY,
                    times: null,
                    comment: "0.0007元/千tokens"
                }
            },
        ],
    },
    META: {
        name_cn: "Meta",
        name_en: "Meta",
        website: {
            home: "",
            docs: "",
            price: "",
        },
        model_list: [
            {
                model: "llama-2-70b",
                category: "LLM",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: null,
                }
            },
            {
                model: "llama-2-13b",
                category: "LLM",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: null,
                }
            },
            {
                model: "llama-2-7b",
                category: "LLM",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: null,
                }
            },
            {
                model: "code-llama-34b",
                category: "LLM",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: null,
                }
            },
            {
                model: "code-llama-13b",
                category: "LLM",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: null,
                }
            },
            {
                model: "code-llama-7b",
                category: "LLM",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: null,
                }
            },
            {
                model: "llama-3-8b",
                category: "LLM",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: null,
                }
            },
            {
                model: "llama-3-70b",
                category: "LLM",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: null,
                }
            },
            {
                model: "codellama-70b-instruct",
                category: "LLM",
                description: "",
                price: {
                    prompt: null,
                    complete: null,
                    times: null,
                }
            },
        ],
    },
}

export const PROVIDER_MODEL_LIST_WITHOUT_OUTDATED: {
    [provider_name: string]: ProviderModelListType
} = Object.entries(PROVIDER_MODEL_LIST)
    .reduce((acc, [provider_name, provider_model_list]) => {
        if (provider_model_list && provider_model_list.model_list) {
            const filteredModelList = provider_model_list.model_list.filter(model => !model.outdated);
            if (filteredModelList.length > 0) {
                acc[provider_name] = {
                    ...provider_model_list,
                    model_list: filteredModelList,
                };
            }
        }
        return acc;
    }, {} as { [provider_name: string]: ProviderModelListType });
