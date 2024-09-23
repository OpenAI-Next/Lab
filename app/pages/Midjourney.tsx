import {
  App,
  AutoComplete,
  Button,
  Col,
  Divider,
  Empty,
  FloatButton,
  Image,
  Input,
  message,
  Segmented,
  Space,
  Spin,
  Tooltip,
} from "antd";
import {
  ProDescriptions,
  ProForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import React, { useRef, useState } from "react";
import {
  COL_SCROLL_STYLE,
  MidjourneyEndpoint,
  MidjourneyTaskResStatus,
  PRO_FORM_PROPS,
} from "@/constant";
import {
  CloudDownloadOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  FunctionOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  DrawAPI,
  MidjourneyDescribeTaskRequestPayload,
  MidjourneyDoActionQueryType,
  MidjourneyFetchTaskRequestPayload,
  MidjourneyGetSeedRequestPayload,
  MidjourneyImagineTaskRequestPayload,
  MidjourneyModalTaskRequestPayload,
  MidjourneyRefreshTaskResponseType,
  MidjourneyShortenTaskRequestPayload,
  MidjourneySubmitTaskResponseType,
  MidjourneyTaskList,
  newTask,
} from "@/app/client/midjourneyProxy";
import { CodeModal, renderCode, RenderSubmitter } from "@/app/render";
import { handelResponseError, safeJsonStringify } from "@/app/utils";
import { api2Provider, useAppConfig } from "@/app/store";
import ImageMaskModal from "@/app/components/ImageMask";
import { ProFormItem } from "@ant-design/pro-form";

const Midjourney_Preset_Description_Option = {
  styleList: [
    { label: "赛博朋克", value: "cyberpunk" },
    { label: "星际", value: "star" },
    { label: "动漫", value: "anime" },
    { label: "日本漫画", value: "japanese ComicsManga" },
    { label: "水墨画风格", value: "ink Wash Painting Style" },
    { label: "原创", value: "original" },
    { label: "风景画", value: "land scape" },
    { label: "插画", value: "illustration" },
    { label: "漫画", value: "manga" },
    { label: "现代自然", value: "modern Organic" },
    { label: "创世纪", value: "genesis" },
    { label: "海报风格", value: "poster style" },
    { label: "超现实主义", value: "surrealism" },
    { label: "素描", value: "sketch" },
    { label: "写实", value: "realism" },
    { label: "水彩画", value: "water color Painting" },
    { label: "立体主义", value: "cubism" },
    { label: "黑白", value: "black And White" },
    { label: "胶片摄影风格", value: "fm Photography" },
    { label: "电影化", value: "cinematic" },
    { label: "清晰的面部特征", value: "clear Facial Features" },
  ],
  viewList: [
    { label: "宽视角", value: "wide View" },
    { label: "鸟瞰视角", value: "bir dView" },
    { label: "顶视角", value: "top View" },
    { label: "仰视角", value: "up view" },
    { label: "正面视角", value: "front View" },
    { label: "头部特写", value: "head shot" },
    { label: "超广角视角", value: "Ultra-wide-angle view" },
    { label: "中景", value: "medium Shot" },
    { label: "远景", value: "long Shot" },
    { label: "景深", value: "depth Of Field" },
  ],
  shotList: [
    { label: "脸部特写", value: "face Shot" },
    { label: "大特写", value: "big CloseUp" },
    { label: "特写", value: "closeUp" },
    { label: "腰部以上", value: "waist Shot" },
    { label: "膝盖以上", value: "knee Shot" },
    { label: "全身照", value: "full Length Shot" },
    { label: "极远景", value: "extra Long Shot" },
  ],
  lightList: [
    { label: "冷光", value: "cold Light" },
    { label: "暖光", value: "warm Light" },
    { label: "硬光", value: "hardLighting" },
    { label: "戏剧性光线", value: "dramatic Light" },
    { label: "反射光", value: "reflection Light" },
    { label: "薄雾", value: "misty Foggy" },
    { label: "自然光", value: "natural Light" },
    { label: "阳光", value: "sun Light" },
    { label: "情绪化", value: "moody" },
  ],
};

// For more information, please visit https://docs.midjourney.com/docs/parameter-list
export interface MidjourneyImagineTaskConfigType {
  customParam: boolean;
  botType: "MID_JOURNEY" | "NIJI_JOURNEY";
  userPrompt: string;
  aspect?: string;
  chaos?: number;
  quality?: "1" | ".5" | ".25" | "";
  repeat?: number;
  stop?: number;
  stylize?: number;
  weird?: number;
  style?: "raw" | "cute" | "expressive" | "original" | "scenic";
  version?: "6" | "5.2" | "5.1" | "5" | "4";
  no?: string;
  seed?: number;
  tile?: boolean;
  video?: boolean;
  sref?: any[];
  iw?: number;
  cref?: any[];
  cw?: number;
  presetDescription?: {
    styleDes: string;
    viewDes: string;
    shotDes: string;
    lightDes: string;
  };
  // [key: string]: any;
}

export interface MidjourneyBlendTaskConfigType {
  // botType: "MID_JOURNEY" | "NIJI_JOURNEY",
  images: any[];
  dimensions: "PORTRAIT" | "SQUARE" | "LANDSCAPE"; // 图片尺寸，PORTRAIT(2:3); SQUARE(1:1); LANDSCAPE(3:2)
}

const handleSubmit = async (
  values: any,
  action: "IMAGINE" | "DESCRIBE" | "ACTION" | "BLEND" | "SHORTEN" | "MODAL",
  api: DrawAPI,
  updateResponse: (res: MidjourneyTaskList) => void,
  updateError: (error: any) => void,
  setSubmitting: (submitting: boolean) => void,
  setAbortController: (controller: AbortController | null) => void,
  noUpdateResponse?: boolean,
): Promise<void> => {
  noUpdateResponse = noUpdateResponse ?? false;

  updateError(null);
  const controller = new AbortController();
  setAbortController(controller);
  setSubmitting(true);
  try {
    let res: Response;
    switch (action) {
      case "IMAGINE":
        res = await api.submitImagineTask(values, controller.signal);
        break;
      case "DESCRIBE":
        res = await api.submitDescribeTask(values, controller.signal);
        break;
      case "ACTION":
        res = await api.submitActionTask(values, controller.signal);
        break;
      case "BLEND":
        res = await api.submitBlendTask(values, controller.signal);
        break;
      case "SHORTEN":
        res = await api.submitShortenTask(values, controller.signal);
        break;
      case "MODAL":
        res = await api.submitModalTask(values, controller.signal);
        break;
    }

    if (
      res.ok &&
      (res.status === MidjourneyTaskResStatus.OK ||
        res.status === MidjourneyTaskResStatus.CREATED)
    ) {
      if (!noUpdateResponse) {
        const resJson = await res.json();
        updateResponse({
          ...newTask,
          action,
          status: "SUBMITTED",
          description: resJson.description,
          id: resJson.result,
        });
      }
    } else {
      await handelResponseError(res, updateError);
    }
  } catch (e) {
    console.error(e);
    updateError(e);
  } finally {
    setAbortController(null);
    setSubmitting(false);
  }
};

const ImagineForm = (props: {
  form: ProFormInstance;
  api: DrawAPI;
  updateResponse: (res: MidjourneyTaskList) => void;
  updateError: (error: any) => void;
  fillShortenForm: (prompt: string) => void;
}) => {
  const appConfig = useAppConfig();

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedBotType = (ProForm.useWatch("botType", props.form) ||
    "MID_JOURNEY") as MidjourneyImagineTaskRequestPayload["botType"];
  const isCustomParam = ProForm.useWatch("customParam", props.form);
  const inputPrompt = ProForm.useWatch("userPrompt", props.form) || "";

  const differentModelsDetail: Record<
    MidjourneyImagineTaskRequestPayload["botType"],
    any
  > = {
    MID_JOURNEY: {
      versionOptions: ["6", "5.2", "5.1", "5", "4"],
      styleOptions: ["raw"],
    },
    NIJI_JOURNEY: {
      versionOptions: ["4", "5"],
      styleOptions: ["cute", "expressive", "original", "scenic"],
    },
  };

  return (
    <ProForm<MidjourneyImagineTaskConfigType>
      {...PRO_FORM_PROPS}
      form={props.form}
      initialValues={{
        customParam: false,
        botType: "MID_JOURNEY",
      }}
      onFinish={async (values) => {
        await handleSubmit(
          values,
          "IMAGINE",
          props.api,
          props.updateResponse,
          props.updateError,
          setSubmitting,
          setAbortController,
        );
      }}
      submitter={{
        render: (submitterProps) => {
          return (
            <RenderSubmitter
              abortController={abortController}
              submitting={submitting}
              submitterProps={submitterProps}
              getValues={() =>
                JSON.stringify(
                  props.api.getImagineTaskPayload(
                    props.form.getFieldsValue(),
                  ) || "",
                  null,
                  2,
                )
              }
            />
          );
        },
      }}
      autoFocusFirstInput={false}
    >
      <ProFormSwitch
        name={"customParam"}
        label={"Custom Mode"}
        tooltip={
          "If you are familiar with the parameters, you can enable this option to customize the parameters."
        }
      />

      <Divider />

      <ProFormRadio.Group
        name="botType"
        label="Bot Type"
        options={["MID_JOURNEY", "NIJI_JOURNEY"]}
        rules={[{ required: true }]}
      />

      <ProFormTextArea
        name="userPrompt"
        label={isCustomParam ? "Text Prompts & Parameters" : "Text Prompts"}
        placeholder={
          isCustomParam ? "Example: a cat --ar 4:3 --q 1" : "Example: a cat"
        }
        fieldProps={{
          autoSize: { minRows: isCustomParam ? 5 : 3, maxRows: 8 },
        }}
        rules={[{ required: true }]}
      />

      {!isCustomParam && inputPrompt.length > 30 && (
        <ProForm.Item>
          <Button
            block
            type="dashed"
            icon={<FunctionOutlined />}
            onClick={() => props.fillShortenForm(inputPrompt)}
          >
            Shorten Prompt
          </Button>
        </ProForm.Item>
      )}

      {!isCustomParam && (
        <>
          <Divider />

          <ProForm.Group title={"Parameters"}>
            <ProForm.Item
              name="aspect"
              label="Image Size"
              tooltip="The --ar (or --aspect) parameter changes the aspect ratio of the generated image. An aspect ratio is the width-to-height ratio of an image. It is typically expressed as two numbers separated by a colon, such as 7:4 or 4:3."
              convertValue={(value) => value && value.replace(/：/g, ":")}
              rules={[
                {
                  type: "string",
                  pattern: /^\d+:\d+$/,
                  message: "Invalid format",
                  warningOnly: true,
                },
              ]}
            >
              <AutoComplete
                options={[
                  { label: "1:1", value: "1:1" },
                  { label: "3:2", value: "3:2" },
                  { label: "3:4", value: "3:4" },
                  { label: "4:3", value: "4:3" },
                  { label: "5:4", value: "5:4" },
                  { label: "7:4", value: "7:4" },
                  { label: "16:9", value: "16:9" },
                ]}
                style={{ width: 104 }}
                placeholder="W:H"
              />
            </ProForm.Item>

            <ProFormDigit
              name="chaos"
              label="Variety"
              min={0}
              max={100}
              tooltip="The --chaos or --c parameter influences how varied the initial image grids are. High --chaos values will produce more unusual and unexpected results and compositions. Lower --chaos values have more reliable, repeatable results."
              width="xs"
            />

            <ProFormSelect
              name="quality"
              label="Quality"
              tooltip="The --quality or --q parameter changes how much time is spent generating an image. Higher-quality settings take longer to process and produce more details. Higher values also mean more GPU minutes are used per job. The quality setting does not impact resolution."
              options={["1", ".5", ".25"]}
              width="xs"
            />

            {/*--repeat accepts values 2–4 for Basic subscribers*/}
            {/*--repeat accepts values 2–10 for Standard subscribers*/}
            {/*--repeat accepts values 2–40 for Pro and Mega subscribers*/}
            {/*The --repeat parameter can only be used in Fast and Turbo GPU mode.*/}
            <ProFormDigit
              name="repeat"
              label="Repeat"
              tooltip="The --repeat or --r parameter runs a Job multiple times. Combine --repeat with other parameters, like --chaos to increase the pace of your visual exploration."
              min={2}
              max={40}
              width="xs"
            />

            {/*--stop accepts values: 10–100.*/}
            {/*The default --stop value is 100.*/}
            {/*--stop does not work while Upscaling.*/}
            <ProFormDigit
              name="stop"
              label="Stop"
              min={10}
              max={100}
              tooltip={
                "Use the --stop parameter to finish a Job partway through the process. Stopping a Job at an earlier percentage can generate blurrier, less detailed results."
              }
              width="xs"
            />

            {/*--stylize's default value is 100 and accepts integer values 0–1000 when using the current models*/}
            <ProFormDigit
              name="stylize"
              label="Stylization"
              min={0}
              max={1000}
              tooltip="The Midjourney Bot has been trained to produce images that favor artistic color, composition, and forms. The --stylize or --s parameter influences how strongly this training is applied. Low stylization values produce images that closely match the prompt but are less artistic. High stylization values create images that are very artistic but less connected to the prompt."
              width="xs"
            />

            {/*--weird accepts values: 0–3000.*/}
            {/*The default --weird value is 0.*/}
            {/*--weird is a highly experimental feature. What's weird may change over time*/}
            {/*--weird is compatible with Midjourney Model Versions 5, 5.1, 5.2, 6, niji 5 and niji 6*/}
            {/*--weird is not fully compatible with seeds*/}

            {/*What's the difference between --weird, --chaos, and --stylize?*/}
            {/*--chaos controls how diverse the initial grid images are from each other.*/}
            {/*--stylize controls how strongly Midjourney's default aesthetic is applied.*/}
            {/*--weird controls how unusual an image is compared to previous Midjourney images.*/}
            <ProFormDigit
              name="weird"
              label="Weirdness"
              min={0}
              max={3000}
              tooltip={
                "Explore unconventional aesthetics with the experimental --weird or --w parameter. This parameter introduces quirky and offbeat qualities to your generated images, resulting in unique and unexpected outcomes."
              }
              fieldProps={{ keyboard: false, step: 250 }}
              width="xs"
            />

            <ProFormSelect
              name="style"
              label="Style"
              options={differentModelsDetail[selectedBotType].styleOptions}
              width="xs"
              tooltip="The --style parameter replaces the default aesthetic of some Midjourney Model Versions."
              rules={[
                {
                  type: "enum",
                  enum: differentModelsDetail[selectedBotType].styleOptions,
                },
              ]}
            />

            {/*--version accepts the values 1, 2, 3, 4, 5, 5.0, 5.1, 5.2, and 6.*/}
            {/*--version can be abbreviated --v.*/}
            {/*--v 6 is the current default model.*/}
            <ProFormSelect
              name="version"
              label="Version"
              options={differentModelsDetail[selectedBotType].versionOptions}
              rules={[
                {
                  type: "enum",
                  enum: differentModelsDetail[selectedBotType].versionOptions,
                },
              ]}
              tooltip="Midjourney regularly introduces new model versions to improve coherency, efficiency, quality, and style. You can switch model versions using the --version or --v parameter or using the /settings command and selecting your preferred model version. Different models excel at producing different types of images."
              width="xs"
            />

            {/*--tile works with Model Versions 1 2 3 test testp 5 5.1 5.2 and 6.*/}
            {/*--tile only generates a single tile. Use a pattern making tool like this Seamless Pattern Checker to see the tile repeat.*/}
            <ProFormCheckbox
              name="tile"
              label="Tile"
              tooltip="The --tile parameter generates images that can be used as repeating tiles to create seamless patterns for fabrics, wallpapers and textures."
              width="xs"
            />

            {/*--video only works on image grids, not upscales.*/}
            {/*--video works with Model Versions 5.2 6 niji 5 and niji 6.*/}
            {/*--video works with Legacy Model Versions 1 2 3 5.0 5.1 test and testp.*/}
            {/*Generated videos are deleted 30 days after creation.*/}
            <ProFormCheckbox
              name="video"
              label="Video"
              tooltip="Use the --video parameter to create a short movie of your initial image grid being generated. React to the finished job with the envelope ✉️ emoji to have the Midjourney Bot send a link to the video to your Direct Messages."
              width="xs"
            />

            <ProFormTextArea
              name="no"
              label="No"
              placeholder={"item1, item2, item3, item4"}
              tooltip={
                "The No parameter tells the Midjourney Bot what not to include in your image. --no accepts multiple words separated with commas."
              }
              fieldProps={{ autoSize: { minRows: 1 } }}
              width={"lg"}
              convertValue={(value) => value && value.replace(/，/g, ",")}
              rules={[
                {
                  type: "string",
                  pattern: /^[^,\n]+(?:,[^,\n]+)*$/,
                  message: "There may be a problem with the format.",
                  warningOnly: true,
                },
              ]}
            />

            <ProFormDigit
              name="seed"
              label="Seeds"
              min={-1}
              max={4294967295}
              width={"lg"}
              fieldProps={{ keyboard: false, controls: false }}
              tooltip={
                "The Midjourney bot uses a seed number to generate a field of visual noise, like television static, as a starting point to generate the initial image grids. Seed numbers are generated randomly for each image but can be specified with the --seed parameter. If you use the same seed number and prompt, you will get similar final images."
              }
            />

            <ProFormUploadButton
              name="sref"
              label="Style Reference"
              tooltip={
                "You can use images as style references in your prompt to influence the style or aesthetic of images you want Midjourney to make.\n"
              }
              accept={"image/*"}
              max={2}
              fieldProps={{ listType: "picture-card" }}
              action={async (file) => {
                return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = (e) => resolve(e.target?.result as string);
                  reader.onerror = (error) => reject(error);
                  reader.readAsDataURL(file);
                });
              }}
              width="sm"
            />

            {/*--iw <0–3> Sets image prompt weight relative to text weight. The default value is 1.*/}
            <ProFormDigit
              name="iw"
              label="Image Weight"
              min={0}
              max={3}
              width="xs"
            />

            <ProFormUploadButton
              name="cref"
              label="Character Reference"
              tooltip={
                "You can use images as character references in your prompt to generate images of the same character in different situations."
              }
              max={2}
              action={appConfig.getUploadConfig().action}
              accept={"image/*"}
              fieldProps={{
                listType: "picture-card",
                headers: {
                  Authorization: appConfig.getUploadConfig().auth,
                },
                onChange: (info) => {
                  const getValueByPosition = (
                    obj: any,
                    position: readonly any[],
                  ) => {
                    return position.reduce((acc, key) => acc && acc[key], obj);
                  };

                  if (info.file.status === "done") {
                    try {
                      const response = info.file.response;
                      if (response) {
                        info.file.url = getValueByPosition(
                          response,
                          appConfig.getUploadConfig().position,
                        );
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }
                },
              }}
              width="sm"
            />

            {/*Use the character weight parameter --cw to set the strength of characterization. --cw accepts values from 0 to 100. --cw 0 focuses on the character's face only. Higher values use the character's face, hair, and clothing. --cw 100 is default.*/}

            {/*prompt example: /imagine prompt illustration of a man sitting in a cafe --cref https://url.com/BlueHairGuy.png*/}
            <ProFormDigit
              name="cw"
              label="Character Weight"
              min={0}
              max={100}
              width="xs"
            />
          </ProForm.Group>

          <Divider />

          <ProForm.Group title={"Description"}>
            <ProFormSelect
              name={["presetDescription", "styleDes"]}
              label="风格"
              width={170}
              options={Midjourney_Preset_Description_Option.styleList}
            />
            <ProFormSelect
              name={["presetDescription", "viewDes"]}
              label="视角"
              width={170}
              options={Midjourney_Preset_Description_Option.viewList}
            />
            <ProFormSelect
              name={["presetDescription", "shotDes"]}
              label="镜头"
              width={170}
              options={Midjourney_Preset_Description_Option.shotList}
            />
            <ProFormSelect
              name={["presetDescription", "lightDes"]}
              label="光线"
              width={170}
              options={Midjourney_Preset_Description_Option.lightList}
            />
          </ProForm.Group>
        </>
      )}
    </ProForm>
  );
};

const BlendForm = (props: {
  form: ProFormInstance;
  api: DrawAPI;
  updateResponse: (task: MidjourneyTaskList) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <ProForm<MidjourneyBlendTaskConfigType>
      {...PRO_FORM_PROPS}
      form={props.form}
      initialValues={{ dimensions: "SQUARE" }}
      onFinish={async (values) => {
        await handleSubmit(
          values,
          "BLEND",
          props.api,
          props.updateResponse,
          props.updateError,
          setSubmitting,
          setAbortController,
        );
      }}
      submitter={{
        render: (submitterProps) => {
          return (
            <RenderSubmitter
              abortController={abortController}
              submitting={submitting}
              submitterProps={submitterProps}
              getValues={() =>
                JSON.stringify(props.form.getFieldsValue(), null, 2) || ""
              }
            />
          );
        },
      }}
    >
      <ProFormRadio.Group
        name="dimensions"
        label="图片尺寸"
        options={[
          { label: "1:1", value: "SQUARE" },
          { label: "2:3", value: "PORTRAIT" },
          { label: "3:2", value: "LANDSCAPE" },
        ]}
        fieldProps={{ buttonStyle: "solid" }}
        rules={[{ required: true, message: "请选择图片尺寸" }]}
      />

      <ProFormUploadButton
        name="images"
        label="图片"
        max={5}
        validateTrigger={false} // 只在提交时校验
        fieldProps={{
          name: "file",
          listType: "picture-card",
          accept: "image/*",
          multiple: true,
        }}
        action={async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              resolve(base64);
            };
            reader.onerror = (error) => {
              reject(error);
            };
            reader.readAsDataURL(file);
          });
        }}
        rules={[
          { required: true, message: "请上传图片" },
          { type: "array", min: 2, message: "请上传至少两张图片" },
          { type: "array", max: 5, message: "最多上传五张图片" },
        ]}
      />
    </ProForm>
  );
};

const DescribeForm = (props: {
  form: ProFormInstance;
  api: DrawAPI;
  updateResponse: (task: MidjourneyTaskList) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <ProForm<MidjourneyDescribeTaskRequestPayload>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        await handleSubmit(
          values,
          "DESCRIBE",
          props.api,
          props.updateResponse,
          props.updateError,
          setSubmitting,
          setAbortController,
        );
      }}
      submitter={{
        render: (submitterProps) => {
          return (
            <RenderSubmitter
              abortController={abortController}
              submitting={submitting}
              submitterProps={submitterProps}
              getValues={() =>
                JSON.stringify(props.form.getFieldsValue(), null, 2) || ""
              }
            />
          );
        },
      }}
    >
      <ProFormUploadButton
        name="images"
        label="图片"
        max={1}
        fieldProps={{
          name: "file",
          listType: "picture-card",
          accept: "image/*",
        }}
        action={async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              resolve(base64);
            };
            reader.onerror = (error) => {
              reject(error);
            };
            reader.readAsDataURL(file);
          });
        }}
        rules={[{ required: true, message: "请上传图片" }]}
      />
    </ProForm>
  );
};

const ShortenForm = (props: {
  form: ProFormInstance;
  api: DrawAPI;
  updateResponse: (task: MidjourneyTaskList) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <ProForm<MidjourneyShortenTaskRequestPayload>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        await handleSubmit(
          values,
          "SHORTEN",
          props.api,
          props.updateResponse,
          props.updateError,
          setSubmitting,
          setAbortController,
        );
      }}
      submitter={{
        render: (submitterProps) => {
          return (
            <RenderSubmitter
              abortController={abortController}
              submitting={submitting}
              submitterProps={submitterProps}
              getValues={() =>
                JSON.stringify(props.form.getFieldsValue(), null, 2) || ""
              }
            />
          );
        },
      }}
    >
      <ProFormTextArea
        name="prompt"
        label="Prompt"
        placeholder=""
        fieldProps={{ autoSize: { minRows: 5 } }}
        rules={[{ required: true }]}
      />
    </ProForm>
  );
};

const ActionForm = (props: {
  form: ProFormInstance;
  api: DrawAPI;
  updateResponse: (task: MidjourneyTaskList) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <ProForm<MidjourneyDoActionQueryType>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        await handleSubmit(
          values,
          "ACTION",
          props.api,
          props.updateResponse,
          props.updateError,
          setSubmitting,
          setAbortController,
        );
      }}
      submitter={{
        render: (submitterProps) => {
          return (
            <RenderSubmitter
              abortController={abortController}
              submitting={submitting}
              submitterProps={submitterProps}
              getValues={() =>
                JSON.stringify(props.form.getFieldsValue(), null, 2) || ""
              }
            />
          );
        },
      }}
    >
      <ProFormTextArea
        name="customId"
        label="Custom ID"
        tooltip={"Action sign"}
        placeholder="MJ::JOB::action::xxxx"
        rules={[{ required: true }]}
        fieldProps={{ autoSize: { minRows: 1, maxRows: 2 } }}
        allowClear={true}
      />

      <ProFormText
        name="taskId"
        label="Task ID"
        tooltip={"Task ID"}
        rules={[{ required: true }]}
      />
    </ProForm>
  );
};

const ModalForm = (props: {
  form: ProFormInstance;
  api: DrawAPI;
  updateResponse: (task: MidjourneyTaskList) => void;
  updateError: (error: any) => void;
  queryTask: (taskId: string) => void;
}) => {
  // 某些场景discord那边会出现一个modal弹框，需要二次输入确认
  // - 执行CustomZoom(自定义变焦)
  // - 执行️Region(局部重绘)
  // - 执行PicReader(Describe后选择生图)
  // - 执行PromptAnalyzer(Shorten后选择生图)
  // - 以及开启Remix模式时，执行Reroll、Variation、Pan也需要弹框确认
  // 这个时候该接口会返回21，并且任务状态会进入MODAL（窗口等待），需要执行提交Modal的接口进行操作

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showImageMaskModal, setShowImageMaskModal] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");

  return (
    <>
      <ProForm<MidjourneyModalTaskRequestPayload>
        form={props.form}
        onFinish={async (values) => {
          // Modal 任务返回的不是完整的任务信息，不需要更新任务列表，而是刷新当前任务的状态

          props.updateError(null);
          const controller = new AbortController();
          setAbortController(controller);
          setSubmitting(true);
          try {
            const res = await props.api.submitModalTask(
              values,
              controller.signal,
            );
            const resJson =
              (await res.json()) as MidjourneySubmitTaskResponseType;
            if (res.ok && resJson.code === 1) {
              message.success(
                resJson.description + " . Please manually refresh the task.",
              );
              // 重置表单，避免重复提交
              props.form.resetFields();
              props.queryTask(values.taskId);
            } else {
              props.updateError(resJson);
            }
          } catch (e) {
            console.error(e);
            props.updateError(e);
          } finally {
            setAbortController(null);
            setSubmitting(false);
          }
        }}
        submitter={{
          render: (submitterProps) => {
            return (
              <RenderSubmitter
                abortController={abortController}
                submitting={submitting}
                submitterProps={submitterProps}
                getValues={() =>
                  JSON.stringify(props.form.getFieldsValue(), null, 2) || ""
                }
              />
            );
          },
        }}
      >
        <ProFormText
          name="taskId"
          label="Task ID"
          rules={[{ required: true }]}
        />

        <ProFormTextArea
          name="prompt"
          label="Prompt"
          placeholder="Example (Custom Zoom) : {{Changed Prompt}} --zoom 1  --ar 1:2"
          tooltip="This parameter needs to be passed most of the time."
          fieldProps={{ autoSize: { minRows: 4, maxRows: 10 } }}
          rules={[{ required: false }]}
        />

        <ProFormTextArea
          name="maskBase64"
          label="Mask Base64"
          tooltip="This field is used to be passed in when partially redrawing."
          fieldProps={{ autoSize: { minRows: 4, maxRows: 10 } }}
          rules={[{ required: false }]}
        />

        <Divider />

        <ProFormItem label="Redraw Mask Helper">
          <Input.TextArea
            placeholder="Original Image URL"
            onChange={(e) => setOriginalImageUrl(e.target.value)}
            value={originalImageUrl}
            style={{ marginBottom: 8 }}
            autoSize={{ minRows: 1, maxRows: 3 }}
          />
          <Button
            onClick={() => {
              setShowImageMaskModal(true);
            }}
            disabled={!originalImageUrl}
          >
            Open Redraw Mask Helper
          </Button>
        </ProFormItem>
      </ProForm>
      <ImageMaskModal
        open={showImageMaskModal}
        originalImageUrl={originalImageUrl}
        onClose={() => setShowImageMaskModal(false)}
        onFinished={(maskBase64) => {
          console.log("maskBase64", maskBase64);
          props.form.setFieldsValue({ maskBase64 });
          setShowImageMaskModal(false);
        }}
      />
    </>
  );
};

const QueryTaskForm = (props: {
  form: ProFormInstance;
  api: DrawAPI;
  updateResponse: (task: MidjourneyTaskList) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inputTaskId = ProForm.useWatch("taskId", props.form) || "{{TASK_ID}}";

  return (
    <ProForm<MidjourneyFetchTaskRequestPayload>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        const controller = new AbortController();
        setAbortController(controller);
        props.updateError(null);
        setSubmitting(true);
        try {
          const res = await props.api.fetchTask(values, controller.signal);
          const resJson = await res.json();
          if (res.status === MidjourneyTaskResStatus.OK) {
            props.updateResponse(resJson as MidjourneyRefreshTaskResponseType);
          } else {
            props.updateError(resJson);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setAbortController(null);
          setSubmitting(false);
        }
      }}
      submitter={{
        render: (submitterProps) => {
          return (
            <RenderSubmitter
              abortController={abortController}
              submitting={submitting}
              submitterProps={submitterProps}
              getValues={() =>
                `GET ${props.api.path(MidjourneyEndpoint.IMAGINE).replace("{id}", inputTaskId)}`
              }
            />
          );
        },
      }}
    >
      <ProFormText
        name="taskId"
        label="Task ID"
        tooltip={"Task ID"}
        rules={[{ required: true }]}
      />
    </ProForm>
  );
};

const QuerySeedForm = (props: {
  form: ProFormInstance;
  api: DrawAPI;
  updateTaskSeed: (taskId: string, seed: string, error?: string) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inputTaskId = ProForm.useWatch("taskId", props.form) || "{{TASK_ID}}";

  return (
    <ProForm<MidjourneyGetSeedRequestPayload>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.getTaskSeed(values, controller.signal);
          const status = res.status;
          const resJson = await res.json();
          if (status === MidjourneyTaskResStatus.OK && resJson?.result) {
            props.updateTaskSeed(values.taskId, resJson.result);
          } else {
            props.updateTaskSeed(
              values.taskId,
              "",
              resJson?.message || "Error",
            );
            props.updateError(resJson);
          }
        } catch (e) {
          console.error(e);
          props.updateError(e);
        } finally {
          setAbortController(null);
          setSubmitting(false);
        }
      }}
      submitter={{
        render: (submitterProps) => {
          return (
            <RenderSubmitter
              abortController={abortController}
              submitting={submitting}
              submitterProps={submitterProps}
              getValues={() =>
                `GET ${props.api.path(MidjourneyEndpoint.SEED).replace("{id}", inputTaskId)}`
              }
            />
          );
        },
      }}
    >
      <ProFormText
        name="taskId"
        label="Task ID"
        tooltip={"Task ID"}
        rules={[{ required: true }]}
      />
    </ProForm>
  );
};

const MidjourneyTasksRenderer = (props: {
  tasks: MidjourneyTaskList[];
  api: DrawAPI;
  onUpdated: (res: MidjourneyTaskList, isDelete?: boolean) => void;
  onError: (error: any) => void;
  onFillActionForm: (action: MidjourneyDoActionQueryType) => void;
}) => {
  const [loadingStates, setLoadingStates] = useState<{
    [key: number]: boolean;
  }>({ 0: false, 1: false });
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [code, setCode] = useState<string>("");

  if (!props.tasks || props.tasks.length === 0) return <Empty />;

  const handleRefresh = async (index: number) => {
    setLoadingStates((prevStates) => ({ ...prevStates, [index]: true }));
    try {
      if (props.tasks) {
        const res = await props.api.fetchTask({
          taskId: props.tasks[index].id,
        });
        const status = res.status;
        const resJson = await res.json();
        if (status === MidjourneyTaskResStatus.OK) {
          props.onUpdated(resJson as MidjourneyRefreshTaskResponseType);
        } else {
          props.onError(resJson);
        }
      }
    } finally {
      setLoadingStates((prevStates) => ({ ...prevStates, [index]: false }));
    }
  };

  return (
    <>
      {props.tasks.map((task: MidjourneyTaskList, index: number) => (
        <Spin
          spinning={loadingStates[index] || false}
          key={task.id}
          tip={"Refreshing..."}
        >
          <ProDescriptions
            title={"Task " + (index + 1)}
            dataSource={task}
            column={1}
            bordered
            size={"small"}
            style={{
              marginBottom: 20,
            }}
            columns={[
              {
                title: "Task ID",
                dataIndex: "id",
                copyable: true,
              },
              {
                title: "Status",
                dataIndex: "status",
                valueEnum: {
                  NOT_START: { text: "NOT_START", status: "Warning" },
                  SUBMITTED: { text: "SUBMITTED", status: "Processing" },
                  IN_PROGRESS: { text: "IN_PROGRESS", status: "Processing" },
                  FAILURE: { text: "FAILURE", status: "Error" },
                  SUCCESS: { text: "SUCCESS", status: "Success" },
                  CANCEL: { text: "CANCEL", status: "Default" },
                  MODAL: { text: "MODAL", status: "Default" },
                },
              },
              {
                title: "Progress",
                dataIndex: "progress",
                valueType: "progress",
              },
              {
                title: "Prompt",
                dataIndex: "prompt",
                valueType: "textarea",
              },
              {
                title: "Prompt En",
                dataIndex: "promptEn",
                valueType: "textarea",
              },
              {
                title: "Final Prompt",
                dataIndex: ["properties", "finalPrompt"],
                valueType: "textarea",
              },
              {
                title: "Action",
                dataIndex: "action",
              },
              {
                title: "Seed",
                dataIndex: "seed",
                copyable: true,
              },
              {
                title: "Description",
                dataIndex: "description",
              },
              {
                title: "Fail Reason",
                dataIndex: "failReason",
              },
              {
                title: "Image URL",
                dataIndex: "imageUrl",
                copyable: true,
              },
              {
                title: "Image",
                key: "image_render",
                render: (_dom, record) => {
                  if (!record.imageUrl) return null;
                  return (
                    <Image src={record.imageUrl} alt={record.id} height={150} />
                  );
                },
              },
              {
                title: "Submit Time",
                dataIndex: "submitTime",
                valueType: "dateTime",
              },
              {
                title: "Start Time",
                dataIndex: "startTime",
                valueType: "dateTime",
              },
              {
                title: "Finish Time",
                dataIndex: "finishTime",
                valueType: "dateTime",
              },
              {
                title: "Buttons",
                key: "buttons",
                render: (_dom, record) => {
                  if (!record.buttons) return null;
                  const buttons = record.buttons;
                  return (
                    <Space wrap>
                      {buttons.map((button) => (
                        <Tooltip key={button.customId} title={button.customId}>
                          <Button
                            onClick={() => {
                              props.onFillActionForm({
                                customId: button.customId,
                                taskId: record.id,
                              });
                            }}
                          >
                            {button.emoji} {button.label}
                          </Button>
                        </Tooltip>
                      ))}
                    </Space>
                  );
                },
              },
              {
                title: "操作",
                valueType: "option",
                render: () => [
                  <a key="query" onClick={() => handleRefresh(index)}>
                    Refresh
                  </a>,
                  <a
                    key="code"
                    onClick={() => {
                      setCode(safeJsonStringify(task, task.toString()));
                      setShowCodeModal(true);
                    }}
                  >
                    Code
                  </a>,
                  <a key="delete" onClick={() => props.onUpdated(task, true)}>
                    Delete
                  </a>,
                ],
              },
            ]}
          />
        </Spin>
      ))}
      <CodeModal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        code={code}
      />
    </>
  );
};

export function MidjourneyPage() {
  const appConfig = useAppConfig();
  const drawApi = new DrawAPI(
    appConfig.getFirstApiKey(api2Provider.Midjourney),
  );
  const [mjImagineTaskForm] = ProForm.useForm();
  const [mjBlendTaskForm] = ProForm.useForm();
  const [mjDescribeTaskForm] = ProForm.useForm();
  const [mjShortenTaskForm] = ProForm.useForm();
  const [mjModalTaskForm] = ProForm.useForm();
  const [mjActionTaskForm] = ProForm.useForm();
  const [mjQueryTaskForm] = ProForm.useForm();
  const { message } = App.useApp();

  const dataAreaRef = useRef<HTMLDivElement>(null);

  const type_options = [
    { label: "Create", value: "create", icon: <UnorderedListOutlined /> },
    { label: "Query", value: "query", icon: <FileTextOutlined /> },
  ];

  const midjourneySubmitFormOptions = [
    "IMAGINE",
    "BLEND",
    "DESCRIBE",
    "SHORTEN",
    "ACTION",
    "MODAL",
  ];
  const midjourneyQueryFormOptions = ["TASK", "SEED"];

  const [operateType, setOperateType] = useState<"create" | "query">("create");
  const [submitFormType, setSubmitFormType] = useState(
    midjourneySubmitFormOptions[0],
  );
  const [queryFormType, setQueryFormType] = useState(
    midjourneyQueryFormOptions[0],
  );

  const [taskData, setTaskData] = useState<MidjourneyTaskList[]>([]);
  const [errorData, setErrorData] = useState<any>(null);

  const onScrollToBottom = () => {
    requestAnimationFrame(() => {
      dataAreaRef.current?.scrollTo({
        top: dataAreaRef.current.scrollHeight + 1000,
        behavior: "smooth",
      });
    });
  };

  const updateResponse = (res: MidjourneyTaskList, isDelete = false) => {
    // 有时候池子炸了，任务提交失败，不会返回任务id
    if (!res.id) {
      updateError(res);
      return;
    }
    if (
      res.status === "MODAL" ||
      res.description === "Waiting for window confirm"
    ) {
      if (operateType !== "create" || submitFormType !== "MODAL") {
        message.info("Waiting for window confirm.").then();
        setOperateType("create");
        setSubmitFormType("MODAL");
        mjModalTaskForm.setFieldsValue({ taskId: res.id });
      }
    }
    if (isDelete) {
      setTaskData((prevTaskData) => {
        return prevTaskData.filter((item) => item.id !== res.id);
      });
    } else {
      setTaskData((prevTaskData) => {
        const index = prevTaskData.findIndex((item) => item.id === res.id);
        if (index >= 0) {
          return prevTaskData.map((item, i) =>
            i === index ? { seed: item.seed, ...res } : item,
          );
        } else {
          onScrollToBottom();
          return [...prevTaskData, res];
        }
      });
    }
  };

  const updateTaskSeed = (taskId: string, seed: string, message = "") => {
    if (message) {
      // TODO:showAntdMessage
    }
    setTaskData((prevTaskData) => {
      const index = prevTaskData.findIndex((item) => item.id === taskId);
      if (index >= 0) {
        const task = prevTaskData[index];
        task.seed = seed;
        return prevTaskData.map((item, i) => (i === index ? task : item));
      } else {
        return prevTaskData;
      }
    });
  };

  const updateError = (error: any) => {
    if (error !== null) {
      message
        .error({
          content: "Error occurred.",
          key: "midjourney-error",
          duration: 2,
        })
        .then();
      onScrollToBottom();
    }
    setErrorData(error);
  };

  const queryTask = async (taskId: string, timeOut = 5000) => {
    // 为了避免任务还没有提交到 Discord 就查询，这里增加一个延迟
    await new Promise((resolve) => {
      setTimeout(resolve, timeOut);
    });
    try {
      const res = await drawApi.fetchTask({ taskId });
      const status = res.status;
      const resJson = await res.json();
      if (status === MidjourneyTaskResStatus.OK) {
        updateResponse(resJson as MidjourneyRefreshTaskResponseType);
      } else {
        updateError(resJson);
      }
    } catch (e) {
      console.error(e);
      updateError(e);
    }
  };

  const renderSubmitForm: Record<
    (typeof midjourneySubmitFormOptions)[number],
    any
  > = {
    IMAGINE: (
      <ImagineForm
        form={mjImagineTaskForm}
        api={drawApi}
        updateResponse={updateResponse}
        updateError={updateError}
        fillShortenForm={(prompt: string) => {
          setOperateType("create");
          setSubmitFormType("SHORTEN");
          mjShortenTaskForm.setFieldsValue({ prompt });
        }}
      />
    ),
    BLEND: (
      <BlendForm
        form={mjBlendTaskForm}
        api={drawApi}
        updateResponse={updateResponse}
        updateError={updateError}
      />
    ),
    DESCRIBE: (
      <DescribeForm
        form={mjDescribeTaskForm}
        api={drawApi}
        updateResponse={updateResponse}
        updateError={updateError}
      />
    ),
    SHORTEN: (
      <ShortenForm
        form={mjShortenTaskForm}
        api={drawApi}
        updateResponse={updateResponse}
        updateError={updateError}
      />
    ),
    ACTION: (
      <ActionForm
        form={mjActionTaskForm}
        api={drawApi}
        updateResponse={updateResponse}
        updateError={updateError}
      />
    ),
    MODAL: (
      <ModalForm
        form={mjModalTaskForm}
        api={drawApi}
        updateResponse={updateResponse}
        updateError={updateError}
        queryTask={queryTask}
      />
    ),
  };

  const renderQueryForm: Record<
    (typeof midjourneyQueryFormOptions)[number],
    any
  > = {
    TASK: (
      <QueryTaskForm
        form={mjQueryTaskForm}
        api={drawApi}
        updateResponse={updateResponse}
        updateError={updateError}
      />
    ),
    SEED: (
      <QuerySeedForm
        form={mjQueryTaskForm}
        api={drawApi}
        updateTaskSeed={updateTaskSeed}
        updateError={updateError}
      />
    ),
  };

  return (
    <>
      <Col flex="420px" style={COL_SCROLL_STYLE}>
        <Segmented
          style={{ marginBottom: 20 }}
          options={type_options}
          block
          onChange={(value) => setOperateType(value as "create" | "query")}
          value={operateType}
        />
        {operateType === "create" && (
          <>
            <ProForm layout={"vertical"} submitter={false}>
              <ProFormSelect
                label="Task Type"
                options={midjourneySubmitFormOptions}
                fieldProps={{
                  variant: "filled",
                  value: submitFormType,
                  onChange: (v) => setSubmitFormType(v),
                }}
                allowClear={false}
              />
            </ProForm>
            <Divider />
            {renderSubmitForm[submitFormType]}
          </>
        )}
        {operateType === "query" && (
          <>
            <ProForm layout={"vertical"} submitter={false}>
              <ProFormSelect
                label="Query Type"
                options={midjourneyQueryFormOptions}
                fieldProps={{
                  variant: "filled",
                  autoFocus: false,
                  value: queryFormType,
                  onChange: (v) => setQueryFormType(v),
                }}
                allowClear={false}
              />
            </ProForm>
            <Divider />
            {renderQueryForm[queryFormType]}
          </>
        )}
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE} ref={dataAreaRef}>
        <h1>Task Data</h1>
        <MidjourneyTasksRenderer
          tasks={taskData}
          api={drawApi}
          onUpdated={updateResponse}
          onError={updateError}
          onFillActionForm={(config: MidjourneyDoActionQueryType) => {
            setOperateType("create");
            setSubmitFormType("ACTION");
            mjActionTaskForm.setFieldsValue(config);
          }}
        />
        {errorData && (
          <>
            <h1>Error</h1>
            {renderCode(safeJsonStringify(errorData, errorData.toString()))}
          </>
        )}
      </Col>
      <FloatButton.Group shape="square" style={{ right: 24 }}>
        <FloatButton
          icon={<CloudUploadOutlined />}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const content = e.target?.result as string;
                  try {
                    const data = JSON.parse(content) as MidjourneyTaskList[];
                    let ok = true;
                    const requiredProperties = [
                      "id",
                      "status",
                      "progress",
                      "prompt",
                      "promptEn",
                      "action",
                      "description",
                      "failReason",
                      "imageUrl",
                      "submitTime",
                      "startTime",
                      "finishTime",
                      "buttons",
                    ];
                    for (const item of data) {
                      if (
                        !requiredProperties.every((prop) =>
                          item.hasOwnProperty(prop),
                        )
                      ) {
                        ok = false;
                        break;
                      }
                    }
                    if (ok) {
                      setTaskData(data);
                    } else {
                      alert("Invalid data format");
                    }
                  } catch (e) {
                    console.error(e);
                  }
                };
                reader.readAsText(file);
              }
            };
            input.click();
          }}
        />
        <FloatButton
          icon={<CloudDownloadOutlined />}
          onClick={() => {
            // download taskData
            const dataStr =
              "data:text/json;charset=utf-8," +
              encodeURIComponent(JSON.stringify(taskData, null, 2));
            const downloadAnchorNode = document.createElement("a");
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "taskData.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }}
        />
        {/*<FloatButton icon={<SyncOutlined/>}/>*/}
        {/*<FloatButton.BackTop visibilityHeight={0}/>*/}
      </FloatButton.Group>
    </>
  );
}
