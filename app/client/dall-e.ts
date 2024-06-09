import {OpenaiPath, REQUEST_TIMEOUT_MS} from "@/constant";
import {getAuthHeaderWithApiKey, getRequestOptions} from "@/app/client/helper";
import {api2ProviderBaseUrl} from "@/app/store";

export type AvailableDalleModels = "dall-e-2" | "dall-e-3";

interface CommonDallERequest {
    /**
     * @description A text description of the desired image(s). The maximum length is 1000 characters for dall-e-2 and 4000 characters for dall-e-3.
     * @type {string}
     */
    prompt: string;

    /**
     * @description The number of images to generate. Must be between 1 and 10.
     * @description For dall-e-3, only n=1 is supported.
     * @default 1
     */
    n?: number;

    /**
     * @description The format in which the generated images are returned. Must be one of "url" or "base64". URLs are only valid for 60 minutes after the image has been generated.
     * @default "url"
     * @type {("url" | "base64")}
     */
    response_format?: "url" | "b64_json";

    /**
     * @description A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
     * @type {string}
     */
    user?: string;
}

interface DallE2CreateImageRequest extends CommonDallERequest {
    model?: "dall-e-2";

    /**
     * @description The size of the generated images. Must be one of 256x256, 512x512, or 1024x1024 for dall-e-2.
     * @default 1024x1024
     * @type {("256x256" | "512x512" | "1024x1024")}
     */
    size?: "256x256" | "512x512" | "1024x1024";
}

interface DallE3CreateImageRequest extends CommonDallERequest {
    /**
     * @description The model to use for image generation.
     * @type {("dall-e-3")}
     */
    model: "dall-e-3"; // 必须显式指定 "dall-e-3"


    /**
     * @description The quality of the image that will be generated. hd creates images with finer details and greater consistency across the image. This param is only supported for dall-e-3.
     * @default "standard"
     * @type {("hd" | "standard")}
     */
    quality?: "hd" | "standard";

    /**
     * @description The size of the generated images. Must be one of 1024x1024, 1792x1024, or 1024x1792 for dall-e-3 models.
     * @default "1024x1024"
     * @type {("1024x1024" | "1792x1024" | "1024x1792")}
     */
    size?: "1024x1024" | "1792x1024" | "1024x1792";

    /**
     * @description The style of the generated images. Must be one of vivid or natural. Vivid causes the model to lean towards generating hyper-real and dramatic images. Natural causes the model to produce more natural, less hyper-real looking images. This param is only supported for dall-e-3.
     * @default "vivid"
     * @type {("vivid" | "natural")}
     */
    style?: "vivid" | "natural";
}

export type DallECreateImageRequest = DallE2CreateImageRequest | DallE3CreateImageRequest;

export interface DallEEditImageRequest extends CommonDallERequest {
    /**
     * @description The model to use for image generation. Only dall-e-2 is supported at this time.
     * @default "dall-e-2"
     */
    model?: "dall-e-2";

    /**
     * @description The image to edit. Must be a valid PNG file, less than 4MB, and square.
     * @description If mask is not provided, image must have transparency, which will be used as the mask.
     */
    image: any;

    /**
     * @description An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where image should be edited.
     * @description Must be a valid PNG file, less than 4MB, and have the same dimensions as image.
     */
    mask?: any;

    /**
     * @description The size of the generated images. Must be one of 256x256, 512x512, or 1024x1024.
     * @default 1024x1024
     */
    size?: "256x256" | "512x512" | "1024x1024";
}

export interface DallEVariationRequest extends CommonDallERequest {
    /**
     * @description The model to use for image generation. Only dall-e-2 is supported at this time.
     * @default "dall-e-2"
     */
    model?: "dall-e-2";

    /**
     * @description The image to use as the basis for the variation(s).
     * @description Must be a valid PNG file, less than 4MB, and square.
     */
    image: any;

    /**
     * @description The size of the generated images. Must be one of 256x256, 512x512, or 1024x1024.
     * @default 1024x1024
     */
    size?: "256x256" | "512x512" | "1024x1024";
}

export type DallEResponse = {
    created: number;// the time the request was created
    data: {
        url?: string; // the URL or Base64 of the generated image
        b64_json?: string; // the Base64 of the generated image in JSON format. Only available for response_format=b64_json.
        revised_prompt?: string; // the revised prompt used to generate the image. Only available for dall-e-3.
    }[];
};

export const DallePromptExamples = [
    "An expressive oil painting of a chocolate chip cookie being dipped in a glass of milk, depicted as an explosion of flavors.",
    "Digital illustration of a beach scene crafted from yarn. The sandy beach is depicted with beige yarn, waves are made of blue and white yarn crashing onto the shore. A yarn sun sets on the horizon, casting a warm glow. Yarn palm trees sway gently, and little yarn seashells dot the shoreline.",
    "A star-shaped object glowing warmly amidst dark blue clouds of felt material, with soft lighting highlighting the texture of the fuzzy fibers and a deep night sky in the background.",
    "A large, textured cactus with a gradient of green hues and prominent spikes, composed of toy building blocks. It's amidst smaller cacti on a desert floor, with a sandy brick texture under clear blue skies, casting sharp shadows.",
    "A middle-aged woman of Asian descent, her dark hair streaked with silver, appears fractured and splintered, intricately embedded within a sea of broken porcelain. The porcelain glistens with splatter paint patterns in a harmonious blend of glossy and matte blues, greens, oranges, and reds, capturing her dance in a surreal juxtaposition of movement and stillness. Her skin tone, a light hue like the porcelain, adds an almost mystical quality to her form.",
    "An origami-inspired goat with geometric folds in a surreal land: candy-colored trees, a smiling sun with sunbeams, and small 3D-animated children playing under cotton-like clouds. Bright, fantastical lighting enhances the joyful mood.",
    "An adobe-style dome building bathed in the warm glow of a desert sunset, with large stained glass windows casting colorful reflections. Surrounded by cacti, the scene captures the tranquil beauty of a desert at dusk.",
    "A red mushroom with white spots, crafted from play clay, features a distinct, wrinkled stalk. It's surrounded by green clay foliage, with a backdrop that casts a warm, inviting glow, emphasizing the shapes and playful colors.",
    "Astronaut on an alien planet with cracked ground and distant mountains, under a sky with a large planet rising, a spaceship zooming, and stars. The scene has a cinematic feel with vivid colors, combining digital art and sci-fi elements.",
    "Imagine a botanical illustration with a vintage feel, depicting a large, vibrant yellow flower in full bloom, alongside buds and rich green leaves with intricate details. The medium is reminiscent of a hand-painted watercolor with precise, delicate strokes that give a lifelike representation of the plant. It has an overall classic and scientific aesthetic, as if taken from an old-world herbarium collection.",
    "A steaming bowl of ramen with soft noodles, succulent charred slices of tofu, vibrant green onions, a soft-boiled egg with a runny yolk, golden corn, and a sprinkle of sesame seeds, all bathed in a rich, savory broth under warm lighting.",
    "An elegant crystal bowl on a pedestal, filled with glossy, translucent glass cherries, sits on a lace-covered table. The warm lighting casts soft shadows, highlighting the bowl’s intricate design and the delicate fabric texture. The composition has depth and a cozy ambiance in a wide crop ratio.",
    "Imagine a vibrant and picturesque street in La Perla, Puerto Rico, styled in a digital art medium. Colorful houses line the way, with lush, tropical flora accentuating the architecture. Umbrellas add pops of color along the street, which leads to a serene beach where gentle waves meet the shore under a sunset sky.",
    "A cozy and well-lit corner of a room during the daytime. A large window with a rounded top, dressed with heavy cream-colored drapes, allows plenty of natural light to flood in. The walls are painted in a warm, golden yellow tone, giving the space an inviting glow, with a beige comfortable lounge chair in the center.",
    "A realistic embroidered depiction of a clownfish amidst seaweed on a round hoop, showcasing vibrant shades of orange, white, black, and green with high detail and texture on a fabric background, surrounded by scattered yarn skeins and embroidery tools.",
    "A vintage travel poster for Venus in portrait orientation. The scene portrays the thick, yellowish clouds of Venus with a silhouette of a vintage rocket ship approaching. Mysterious shapes hint at mountains and valleys below the clouds. The bottom text reads, 'Explore Venus: Beauty Behind the Mist'. The color scheme consists of golds, yellows, and soft oranges, evoking a sense of wonder.",
    "A minimap diorama of a cafe adorned with indoor plants. Wooden beams crisscross above, and a cold brew station stands out with tiny bottles and glasses."
]

export class DallEAPI {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async create(options: DallECreateImageRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path(OpenaiPath.ImageCreatePath), {
                ...getRequestOptions(this.apiKey, options),
                signal: abortSignal,
            });

            clearTimeout(timeoutId);

            return res;
        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                console.warn("[Request] DallE create request aborted");
            } else {
                console.error("[Request] Failed to make a DallE create request", e);
            }
            throw e;
        }
    }

    async edit(options: DallEEditImageRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path(OpenaiPath.ImageEditPath), {
                ...this.getRequestOptions(options),
                signal: abortSignal,
            });

            clearTimeout(timeoutId);

            return res;
        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                console.warn("[Request] DallE edit request aborted");
            } else {
                console.error("[Request] Failed to make a DallE edit request", e);
            }
            throw e;
        }
    }

    async variation(options: DallEVariationRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const abortSignal = signal || controller.signal;

            signal && signal.addEventListener("abort", () => controller.abort());

            const res = await fetch(this.path(OpenaiPath.ImageVariationPath), {
                ...this.getRequestOptions(options),
                signal: abortSignal,
            });

            clearTimeout(timeoutId);

            return res;
        } catch (e) {
            if (e instanceof Error && e.name === "AbortError") {
                console.warn("[Request] DallE variation request aborted");
            } else {
                console.error("[Request] Failed to make a DallE variation request", e);
            }
            throw e;
        }
    }

    private path(endpoint: OpenaiPath): string {
        return [api2ProviderBaseUrl.DallE, endpoint].join("/");
    }

    private getRequestOptions(options: DallEEditImageRequest | DallEVariationRequest): RequestInit {
        const formData = new FormData();

        // 处理 DallEEditImageRequest 和 DallEVariationRequest 共有的参数
        const convertedImageFile = new File([options.image], "image.png", {type: options.image.type});
        formData.append("image", convertedImageFile);

        options.model && formData.append("model", options.model);
        options.prompt && formData.append("prompt", options.prompt);
        options.n && formData.append("n", options.n.toString());
        options.size && formData.append("size", options.size);
        options.response_format && formData.append("response_format", options.response_format);
        options.user && formData.append("user", options.user);

        // 处理 DallEEditImageRequest 特有的参数
        if ("mask" in options && options.mask) {
            const convertedMaskFile = new File([options.mask], "mask.png", {type: options.mask.type});
            formData.append("mask", convertedMaskFile);
        }

        return {
            method: "POST",
            headers: getAuthHeaderWithApiKey(this.apiKey),
            body: formData,
        }
    }
}
