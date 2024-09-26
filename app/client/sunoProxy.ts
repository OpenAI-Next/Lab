import { REQUEST_TIMEOUT_MS, SunoEndpoint } from "@/constant";
import { getRequestOptions } from "@/app/client/helper";
import { api2ProviderBaseUrl } from "@/app/store";

export interface SunoGenerateRequest {
  mv: string; // 模型
  prompt: string; // 音乐创作提示词,自定义创作且非纯音乐必填
  gpt_description_prompt?: string; // 音乐描述提示词
  make_instrumental?: boolean; // 是否去掉人声
  tags?: string; // 音乐风格, 必填,空格分隔,建议使用英文
  title?: string; // 音乐标题
  continue_clip_id?: string; // 继续剪辑的clip_id
  continue_at?: number; // 继续剪辑时间，秒
  infill_start_s?: null;
  infill_end_s?: null;
}

export interface SunoGenerateResponse {
  id: string;
  clips: SunoClip[];
  metadata: SunoGenerateResponseMetadata;
  major_model_version: string;
  status: string | "complete";
  created_at: string; // e.g."2024-08-03T16:52:14.136Z"
  batch_size: number;
}

export interface SunoQueryRequest {
  ids: string; // clips id 多个id逗号分割
}

export type SunoQueryResponse = {
  clips: SunoClip[];
  num_total_results: number;
  current_page: number;
};

export interface SunoClip {
  id: string; // e.g. "7b2f99b9-d50c-4863-a536-5d10ff3ff7aa"
  video_url: string; // e.g. ""
  audio_url: string; // e.g. ""
  image_url: string | null;
  image_large_url: string | null;
  is_video_pending: boolean;
  major_model_version: string; // e.g. "v3"
  model_name: string; // e.g. "chirp-v3"
  metadata: {
    audio_prompt_id: null | string;
    concat_history: null;
    duration: null;
    error_message: null;
    error_type: null;
    gpt_description_prompt: null;
    has_vocal: boolean;
    stem_from_id: null;
    history: {
      continue_at: number;
      id: null | string;
      infill: boolean;
      source: null | string;
      type: null | string;
    }[];
    infill: boolean;
    is_audio_upload_tos_accepted: boolean;
    prompt: null | string;
    refund_credits: null;
    stream: boolean;
    tags: null | string;
    type: null | string;
  };
  is_liked: boolean;
  user_id: string; // e.g. "f0a2f008-5e56-4825-ac91-47583e6dae3e"
  display_name: string; // e.g. "NonStopAudioStream930"
  handle: string; // e.g. "nonstopaudiostream930"
  is_handle_updated: boolean;
  avatar_image_url: string;
  is_trashed: boolean;
  reaction: any | null;
  created_at: string;
  status: string | "submitted" | "queued" | "streaming" | "complete";
  title: string; // e.g.""
  play_count: number;
  upvote_count: number;
  is_public: boolean;
}

interface SunoGenerateResponseMetadata {
  tags: string;
  prompt: string;
  gpt_description_prompt: string | null;
  audio_prompt_id: string | null;
  history:
    | {
        continue_at?: number;
        id?: string;
        infill?: boolean;
        source?: string;
        type?: string;
      }[]
    | null;
  concat_history: any;
  stem_from_id: any | null;
  type: string;
  duration: any | null;
  refund_credits: any | null;
  stream: boolean;
  infill: boolean;
  has_vocal: boolean | null;
  is_audio_upload_tos_accepted: boolean | null;
  error_message: null;
  error_type: null;
}

const suno_generate_response_example = {
  id: "582d713f-d382-42cf-898e-dd3051437663",
  clips: [
    {
      id: "7b2f99b9-d50c-4863-a536-5d10ff3ff7aa",
      video_url: "",
      audio_url: "",
      image_url: null,
      image_large_url: null,
      is_video_pending: false,
      major_model_version: "v3",
      model_name: "chirp-v3",
      metadata: {
        tags: null,
        prompt: "",
        gpt_description_prompt: "happy new year",
        audio_prompt_id: null,
        history: null,
        concat_history: null,
        stem_from_id: null,
        type: "gen",
        duration: null,
        refund_credits: null,
        stream: true,
        infill: null,
        has_vocal: null,
        is_audio_upload_tos_accepted: null,
        error_type: null,
        error_message: null,
      },
      is_liked: false,
      user_id: "f0a2f008-5e56-4825-ac91-47583e6dae3e",
      display_name: "NonStopAudioStream930",
      handle: "nonstopaudiostream930",
      is_handle_updated: false,
      avatar_image_url: "https://cdn1.suno.ai/defaultBlue.webp",
      is_trashed: false,
      reaction: null,
      created_at: "2024-08-03T16:52:14.147Z",
      status: "submitted",
      title: "",
      play_count: 0,
      upvote_count: 0,
      is_public: false,
    },
    {
      id: "ae9ca24e-1da0-4f0e-83c3-f21a22e95929",
      video_url: "",
      audio_url: "",
      image_url: null,
      image_large_url: null,
      is_video_pending: false,
      major_model_version: "v3",
      model_name: "chirp-v3",
      metadata: {
        tags: null,
        prompt: "",
        gpt_description_prompt: "happy new year",
        audio_prompt_id: null,
        history: null,
        concat_history: null,
        stem_from_id: null,
        type: "gen",
        duration: null,
        refund_credits: null,
        stream: true,
        infill: null,
        has_vocal: null,
        is_audio_upload_tos_accepted: null,
        error_type: null,
        error_message: null,
      },
      is_liked: false,
      user_id: "f0a2f008-5e56-4825-ac91-47583e6dae3e",
      display_name: "NonStopAudioStream930",
      handle: "nonstopaudiostream930",
      is_handle_updated: false,
      avatar_image_url: "https://cdn1.suno.ai/defaultBlue.webp",
      is_trashed: false,
      reaction: null,
      created_at: "2024-08-03T16:52:14.147Z",
      status: "submitted",
      title: "",
      play_count: 0,
      upvote_count: 0,
      is_public: false,
    },
  ],
  metadata: {
    tags: null,
    prompt: "",
    gpt_description_prompt: "happy new year",
    audio_prompt_id: null,
    history: null,
    concat_history: null,
    stem_from_id: null,
    type: "gen",
    duration: null,
    refund_credits: null,
    stream: true,
    infill: null,
    has_vocal: null,
    is_audio_upload_tos_accepted: null,
    error_type: null,
    error_message: null,
  },
  major_model_version: "v3",
  status: "complete",
  created_at: "2024-08-03T16:52:14.136Z",
  batch_size: 1,
};

const suno_query_response_example = {
  clips: [
    {
      id: "7b2f99b9-d50c-4863-a536-5d10ff3ff7aa",
      video_url: "https://cdn1.suno.ai/7b2f99b9-d50c-4863-a536-5d10ff3ff7aa.mp4",
      audio_url: "https://cdn1.suno.ai/7b2f99b9-d50c-4863-a536-5d10ff3ff7aa.mp3",
      image_url: "https://cdn2.suno.ai/image_7b2f99b9-d50c-4863-a536-5d10ff3ff7aa.jpeg",
      image_large_url: "https://cdn2.suno.ai/image_large_7b2f99b9-d50c-4863-a536-5d10ff3ff7aa.jpeg",
      is_video_pending: false,
      major_model_version: "v3.5",
      model_name: "chirp-v3",
      metadata: {
        tags: "pop cheerful",
        prompt:
          "[Verse]\nMidnight strikes a brand new song\nNew year light and nights are long\nLaugh and dance the past is gone\nHold my hand let's move on\n\n[Verse 2]\nSparkle lights across the sky\nHopes are soaring let dreams fly\nSay goodbye no need to cry\nTogether now you and I\n\n[Chorus]\nHappy new year cheers and smiles\nMiles and miles down every aisle\nGive your dreams a little while\nDance my friend in happy style\n\n[Verse 3]\nCold outside but hearts are warm\nLove and joy in every form\nWinter fades here comes the storm\nNew adventures to transform\n\n[Bridge]\nLeave the old and start anew\nPromises we'll see it through\nHand in hand just me and you\nDreams and wishes all come true\n\n[Verse 4]\nCelebrate with hearts so bright\nFuture shining oh so light\nEvery wrong we'll make it right\nCheers to new year every night",
        gpt_description_prompt: "happy new year",
        audio_prompt_id: null,
        history: null,
        concat_history: null,
        stem_from_id: null,
        type: "gen",
        duration: 175,
        refund_credits: false,
        stream: true,
        infill: null,
        has_vocal: null,
        is_audio_upload_tos_accepted: null,
        error_type: null,
        error_message: null,
      },
      is_liked: false,
      user_id: "f0a2f008-5e56-4825-ac91-47583e6dae3e",
      display_name: "NonStopAudioStream930",
      handle: "nonstopaudiostream930",
      is_handle_updated: false,
      avatar_image_url: "https://cdn1.suno.ai/defaultBlue.webp",
      is_trashed: false,
      reaction: null,
      created_at: "2024-08-03T16:52:14.147Z",
      status: "complete",
      title: "Happy New Year",
      play_count: 0,
      upvote_count: 0,
      is_public: false,
    },
    {
      id: "ae9ca24e-1da0-4f0e-83c3-f21a22e95929",
      video_url: "https://cdn1.suno.ai/ae9ca24e-1da0-4f0e-83c3-f21a22e95929.mp4",
      audio_url: "https://cdn1.suno.ai/ae9ca24e-1da0-4f0e-83c3-f21a22e95929.mp3",
      image_url: "https://cdn2.suno.ai/image_ae9ca24e-1da0-4f0e-83c3-f21a22e95929.jpeg",
      image_large_url: "https://cdn2.suno.ai/image_large_ae9ca24e-1da0-4f0e-83c3-f21a22e95929.jpeg",
      is_video_pending: false,
      major_model_version: "v3.5",
      model_name: "chirp-v3",
      metadata: {
        tags: "pop cheerful",
        prompt:
          "[Verse]\nMidnight strikes a brand new song\nNew year light and nights are long\nLaugh and dance the past is gone\nHold my hand let's move on\n\n[Verse 2]\nSparkle lights across the sky\nHopes are soaring let dreams fly\nSay goodbye no need to cry\nTogether now you and I\n\n[Chorus]\nHappy new year cheers and smiles\nMiles and miles down every aisle\nGive your dreams a little while\nDance my friend in happy style\n\n[Verse 3]\nCold outside but hearts are warm\nLove and joy in every form\nWinter fades here comes the storm\nNew adventures to transform\n\n[Bridge]\nLeave the old and start anew\nPromises we'll see it through\nHand in hand just me and you\nDreams and wishes all come true\n\n[Verse 4]\nCelebrate with hearts so bright\nFuture shining oh so light\nEvery wrong we'll make it right\nCheers to new year every night",
        gpt_description_prompt: "happy new year",
        audio_prompt_id: null,
        history: null,
        concat_history: null,
        stem_from_id: null,
        type: "gen",
        duration: 227.36,
        refund_credits: false,
        stream: true,
        infill: null,
        has_vocal: null,
        is_audio_upload_tos_accepted: null,
        error_type: null,
        error_message: null,
      },
      is_liked: false,
      user_id: "f0a2f008-5e56-4825-ac91-47583e6dae3e",
      display_name: "NonStopAudioStream930",
      handle: "nonstopaudiostream930",
      is_handle_updated: false,
      avatar_image_url: "https://cdn1.suno.ai/defaultBlue.webp",
      is_trashed: false,
      reaction: null,
      created_at: "2024-08-03T16:52:14.147Z",
      status: "complete",
      title: "Happy New Year",
      play_count: 0,
      upvote_count: 0,
      is_public: false,
    },
  ],
  num_total_results: 2,
  current_page: 0,
};

export interface SunoUploadRequest {
  url: any[]; // 音乐链接，这里写的是数组，但是实际上只需要一个链接
}

export interface SunoUploadResponse {
  clip_id: string; // 音乐 id
  duration: number; // 音乐时长，单位秒
}

export interface SunoLyricsGenerateRequest {
  prompt: string; // 歌词创作提示词，留空则随机生成
}

export interface SunoLyricsGenerateResponse {
  code: number;
  data: {
    task_id: string;
  };
  message: string;
}

export interface SunoLyricsFeedRequest {
  id: string; // 歌词 id
}

export interface SunoLyricsFeedResponse {
  code: number;
  data: {
    input: string;
    status: string;
    task_id: string;
    text: string;
    title: string;
  };
  message: string;
}

export class SunoAPI {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  path(endpoint: SunoEndpoint) {
    return [api2ProviderBaseUrl.Suno, endpoint].join("/");
  }

  async generate(request: SunoGenerateRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    try {
      const res = await fetch(this.path(SunoEndpoint.SUNO_GENERATE), {
        ...getRequestOptions(this.apiKey, request),
        signal: abortSignal,
      });

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      console.error("[SunoProxy] failed to make a suno generate-task request", e);
      throw e;
    }
  }

  async query(request: SunoQueryRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    const path = this.path(SunoEndpoint.SUNO_QUERY).replace("{{ids}}", request.ids);

    try {
      const res = await fetch(path, {
        ...getRequestOptions(this.apiKey, "GET"),
        signal: abortSignal,
      });

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      console.error("[SunoProxy] failed to make a suno query-task request", e);
      throw e;
    }
  }

  async upload(request: SunoUploadRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
    const actualRequest = {
      url: request.url[0].url,
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    try {
      const res = await fetch(this.path(SunoEndpoint.SUNO_UPLOAD), {
        ...getRequestOptions(this.apiKey, actualRequest),
        signal: abortSignal,
      });

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      console.error("[SunoProxy] failed to make a suno upload request", e);
      throw e;
    }
  }

  // 提交歌词生成任务
  async _lyricsGenerate(
    request: SunoLyricsGenerateRequest,
    signal?: AbortSignal,
    timeoutMs: number = REQUEST_TIMEOUT_MS,
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    try {
      const res = await fetch(this.path(SunoEndpoint.SUNO_LYRICS_GENERATE), {
        ...getRequestOptions(this.apiKey, request),
        signal: abortSignal,
      });

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      console.error("[SunoProxy] failed to make a suno lyrics-generate request", e);
      throw e;
    }
  }

  // 查询歌词生成任务
  async _lyricsFeed(request: SunoLyricsFeedRequest, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = signal || controller.signal;

    signal && signal.addEventListener("abort", () => controller.abort());

    const path = this.path(SunoEndpoint.SUNO_LYRICS_FEED).replace("{{id}}", request.id);

    try {
      const res = await fetch(path, {
        ...getRequestOptions(this.apiKey, "GET"),
        signal: abortSignal,
      });

      clearTimeout(timeoutId);

      return res;
    } catch (e) {
      console.error("[SunoProxy] failed to make a suno lyrics-feed request", e);
      throw e;
    }
  }

  // 获取歌词，内部调用_lyricsGenerate和轮询_lyricsFeed
  async getLyricsText(prompt: string, signal?: AbortSignal, timeoutMs: number = REQUEST_TIMEOUT_MS): Promise<string> {
    const request: SunoLyricsGenerateRequest = {
      prompt: prompt,
    };
    // 提交歌词生成任务
    const generateResponse = await this._lyricsGenerate(request, signal, timeoutMs);
    const generateData: SunoLyricsGenerateResponse = await generateResponse.json();

    if (generateData.code !== 200) {
      throw new Error(`Failed to generate lyrics: ${generateData.message}`);
    }

    const taskId = generateData.data.task_id;

    // 轮询查询歌词生成任务
    const maxAttempts = 10; // 最大尝试次数
    const pollingInterval = 1000; // 轮询间隔（毫秒）

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const feedResponse = await this._lyricsFeed({ id: taskId }, signal, timeoutMs);
      const feedData: SunoLyricsFeedResponse = await feedResponse.json();

      // if (feedData.code !== 200) {
      //     throw new Error(`Failed to fetch lyrics: ${feedData.message}`);
      // }

      if (feedData.data.status === "completed") {
        return feedData.data.text;
      }

      // if (feedData.data.status === 'failed') {
      //     throw new Error('Lyrics generation failed');
      // }

      // 等待一段时间后再次查询
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    }

    return "Lyrics generation timeout";
  }

  finished(clip: SunoClip): boolean {
    return !(
      !clip.image_large_url ||
      !clip.image_url ||
      !clip.video_url ||
      !clip.audio_url ||
      clip.is_video_pending ||
      clip.status !== "complete"
    );
  }
}
