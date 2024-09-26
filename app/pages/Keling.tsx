import React, { useState } from "react";
import {
  ProForm,
  ProFormInstance,
  ProFormItem,
  ProFormRadio,
  ProFormSelect,
  ProFormSlider,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS, SEGMENTED_PROPS } from "@/constant";
import { useAppConfig } from "@/app/store";
import { Alert, Col, Divider, message, Segmented } from "antd";
import { KelingAI, KelingApiTypes } from "@/app/providers/keling-ai";
import { RenderSubmitter } from "../render";

const MODE_OPTIONS = [
  { label: "Std-标准模式（高性能）", value: "std" },
  { label: "Pro-专家模式（高表现）", value: "pro" },
];

const DURATION_OPTIONS = [
  { label: "5s", value: "5" },
  { label: "10s", value: "10" },
];

const MODEL_OPTIONS = [{ label: "kling-v1", value: "kling-v1" }];

const KelingPage = () => {
  const appConfig = useAppConfig();
  const api = new KelingAI("sk-sFplfAcnWY3sFCCs02Ac93Ce9cEf4984A7EdF93e70969c18");

  const [taskType, setTaskType] = useState<"text2video" | "image2video" | "queryTask">("text2video");
  const [klingText2VideoForm] = ProForm.useForm();
  const [klingImage2VideoForm] = ProForm.useForm();
  const [klingQueryTaskForm] = ProForm.useForm();

  const [taskData, setTaskData] = useState<any[]>([]);
  const [errorData, setErrorData] = useState<any>(null);

  const Text2VideoForm = (props: {
    form: ProFormInstance;
    api: KelingAI;
    updateTask: (data: any[]) => void;
    updateError: (error: any) => void;
  }) => {
    const selectedDuration = ProForm.useWatch("duration", props.form);
    const selectedMode = ProForm.useWatch("mode", props.form);
    const selectedCameraControlType = ProForm.useWatch(["camera_control", "type"], props.form);
    const selectedCameraControlConfig = ProForm.useWatch(["camera_control", "config"], props.form);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [submitting, setSubmitting] = useState(false);
    return (
      <ProForm<KelingApiTypes["generateText2VideoTask"]["req"]>
        {...PRO_FORM_PROPS}
        form={props.form}
        initialValues={{
          mode: "std",
          duration: "5",
          aspect_ratio: "16:9",
          model: "kling-v1",
          cfg_scale: 0.5,
        }}
        onFinish={async (values) => {
          setAbortController(new AbortController());
          setSubmitting(true);
          const res = await props.api.callApi({
            callKey: "generateText2VideoTask",
            params: values,
            signal: abortController?.signal,
          });
          // setTaskData(res.data as any);
          setSubmitting(false);
        }}
        submitter={{
          render: (submitterProps) => {
            return (
              <RenderSubmitter
                abortController={abortController}
                submitting={submitting}
                submitterProps={submitterProps}
                getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
              />
            );
          },
        }}
      >
        <ProFormSelect name={"model"} label={"Model"} options={MODEL_OPTIONS} />

        <ProFormSelect name={"mode"} label={"Mode"} options={MODE_OPTIONS} />
        <ProFormRadio.Group name={"duration"} label={"Duration"} options={DURATION_OPTIONS} />
        <ProFormRadio.Group
          name={"aspect_ratio"}
          label={"Aspect Ratio"}
          options={["16:9", "9:16", "1:1"]}
          tooltip={"生成视频的画面纵横比（宽:高）"}
        />
        <ProFormTextArea
          name={"prompt"}
          label={"Prompt"}
          rules={[
            { required: true },
            {
              type: "string",
              max: 2500,
            },
          ]}
          fieldProps={{ autoSize: { minRows: 3 } }}
          tooltip={"正向文本提示"}
        />
        <ProFormTextArea
          name={"negative_prompt"}
          label={"Negative Prompt"}
          rules={[
            {
              type: "string",
              max: 2500,
            },
          ]}
          fieldProps={{ autoSize: { minRows: 2 } }}
          tooltip={"负向文本提示，用于排除不需要的元素或风格"}
        />
        <ProFormSlider
          name={"cfg_scale"}
          label={"Cfg Scale"}
          min={0}
          max={1}
          step={0.01}
          marks={{
            0: "0",
            0.25: "0.25",
            0.5: "0.5",
            0.75: "0.75",
            1: "1",
          }}
          tooltip={"生成视频的自由度，值越大，模型自由度越小，与用户输入的提示词相关性越强"}
        />

        {selectedDuration === "5" && selectedMode === "std" && (
          <>
            <Divider />

            <ProForm.Group
              title={"Camera Control"}
              tooltip={
                "控制摄像机运动的协议，可选，未指定则智能匹配，截止 20240809：仅5s&高性能std的情况下支持镜头控制，其他情况不支持"
              }
            >
              <ProFormSelect
                name={["camera_control", "type"]}
                label={"Type"}
                options={[
                  {
                    label: "Simple",
                    value: "simple",
                  },
                  {
                    label: "Down Back",
                    value: "down_back",
                  },
                  {
                    label: "Forward Up",
                    value: "forward_up",
                  },
                  {
                    label: "Right Turn Forward",
                    value: "right_turn_forward",
                  },
                  {
                    label: "Left Turn Forward",
                    value: "left_turn_forward",
                  },
                ]}
                tooltip={
                  <>
                    <span>预定义的运镜类型</span>
                    <ul
                      style={{
                        fontSize: "0.9em",
                        padding: "0 0 0 15px",
                        margin: "5px 0",
                      }}
                    >
                      <li>
                        Simple: 简单运镜，可在<code>config</code>
                        中六选一（即只能有一个参数不为0，其余参数为0 ）进行运镜，其他类型下<code>config</code>
                        参数无需填写
                      </li>
                      <li> Down Back:镜头下压后退➡️下移拉远</li>
                      <li>Forward Up: 镜头前进上仰➡️推进上移</li>
                      <li>Right Turn Forward: 先右旋转后前进➡️右旋推进</li>
                      <li>Left Turn Forward: 先左旋并前进➡️左旋推进</li>
                    </ul>
                  </>
                }
                width={"md"}
              />
              {selectedCameraControlType === "simple" && (
                <>
                  {Object.values(selectedCameraControlConfig || {}).filter((value) => value !== 0).length !== 1 && (
                    <ProFormItem>
                      <Alert type="warning" showIcon message="简单运镜只能有一个参数不为 0" />
                    </ProFormItem>
                  )}
                  <ProFormSlider
                    name={["camera_control", "config", "horizontal"]}
                    label={"Horizontal"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"水平运镜，控制摄像机在水平方向上的移动量（沿x轴平移）"}
                  />
                  <ProFormSlider
                    name={["camera_control", "config", "vertical"]}
                    label={"Vertical"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"垂直运镜，控制摄像机在垂直方向上的移动量（沿y轴平移）"}
                  />

                  <ProFormSlider
                    name={["camera_control", "config", "pan"]}
                    label={"Pan"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"水平摇镜，控制摄像机在水平方向上的旋转量（沿x轴旋转）"}
                  />
                  <ProFormSlider
                    name={["camera_control", "config", "tilt"]}
                    label={"Tilt"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"垂直摇镜，控制摄像机在垂直方向上的旋转量（沿y轴旋转）"}
                  />
                  <ProFormSlider
                    name={["camera_control", "config", "roll"]}
                    label={"Roll"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"旋转运镜，控制摄像机的滚动量（绕z轴旋转）"}
                  />
                  <ProFormSlider
                    name={["camera_control", "config", "zoom"]}
                    label={"Zoom"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"变焦，控制摄像机的焦距变化，影响视野的远近"}
                  />
                </>
              )}
            </ProForm.Group>
            <Divider />
          </>
        )}
        <ProFormText
          name={"callback_url"}
          label={"Callback URL"}
          rules={[
            {
              type: "url",
              warningOnly: true,
            },
          ]}
          tooltip={"本次任务结果回调通知地址"}
        />
      </ProForm>
    );
  };

  const Image2VideoForm = (props: {
    form: ProFormInstance;
    api: KelingAI;
    updateTask: (data: any[]) => void;
    updateError: (error: any) => void;
  }) => {
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleImageUpload = async (file: File, fieldName: string) => {
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("只能上传 JPG/PNG 文件!");
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("图片大小不能超过 10MB!");
        return false;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        props.form.setFieldsValue({ [fieldName]: base64 });
      };
      return false;
    };

    return (
      <ProForm<KelingApiTypes["generateImage2VideoTask"]["req"]>
        {...PRO_FORM_PROPS}
        form={props.form}
        initialValues={{
          model: "kling-v1",
          mode: "std",
          duration: "5",
          cfg_scale: 0.5,
        }}
        onFinish={async (values) => {
          setAbortController(new AbortController());
          setSubmitting(true);
          const res = await props.api.callApi({
            callKey: "generateImage2VideoTask",
            params: values,
            signal: abortController?.signal,
          });
          setSubmitting(false);
        }}
        submitter={{
          render: (submitterProps) => {
            return (
              <RenderSubmitter
                abortController={abortController}
                submitting={submitting}
                submitterProps={submitterProps}
                getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
              />
            );
          },
        }}
      >
        <ProFormSelect name="model" label="Model" options={MODEL_OPTIONS} />
        <ProFormSelect name="mode" label="Mode" options={MODE_OPTIONS} />
        <ProFormRadio.Group name="duration" label="Duration" options={DURATION_OPTIONS} />

        <ProFormUploadButton
          accept=".jpg,.jpeg,.png"
          fieldProps={{
            maxCount: 1,
          }}
        />

        <ProFormUploadButton
          accept=".jpg,.jpeg,.png"
          fieldProps={{
            maxCount: 1,
          }}
        />
        <ProFormTextArea
          name="prompt"
          label="Prompt"
          rules={[
            {
              type: "string",
              max: 2500,
            },
          ]}
          fieldProps={{ autoSize: { minRows: 3 } }}
        />
        <ProFormTextArea
          name="negative_prompt"
          label="Negative Prompt"
          rules={[
            {
              type: "string",
              max: 2500,
            },
          ]}
          fieldProps={{ autoSize: { minRows: 2 } }}
        />
        <ProFormSlider
          name="cfg_scale"
          label="Cfg Scale"
          min={0}
          max={1}
          step={0.01}
          marks={{
            0: "0",
            0.25: "0.25",
            0.5: "0.5",
            0.75: "0.75",
            1: "1",
          }}
        />
        <ProFormText
          name="callback_url"
          label="Callback URL"
          rules={[
            {
              type: "url",
              warningOnly: true,
            },
          ]}
        />
      </ProForm>
    );
  };

  const QueryTaskForm = (props: {
    form: ProFormInstance;
    api: KelingAI;
    updateTask: (data: any[]) => void;
    updateError: (error: any) => void;
  }) => {
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [submitting, setSubmitting] = useState(false);
    return (
      <ProForm<KelingApiTypes["queryTask"]["endpoint_params"]>
        {...PRO_FORM_PROPS}
        form={props.form}
        initialValues={{
          task_id: "",
          action: "videos",
          action2: "text2video",
        }}
        onFinish={async (values) => {
          setSubmitting(true);
          const res = await props.api.callApi({
            callKey: "queryTask",
            endpoint_params: {
              action: values.action,
              action2: values.action2,
              task_id: values.task_id,
            },
            signal: abortController?.signal,
          });
          setSubmitting(false);
        }}
        submitter={{
          render: (submitterProps) => {
            return (
              <RenderSubmitter
                abortController={abortController}
                submitting={submitting}
                submitterProps={submitterProps}
                getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
              />
            );
          },
        }}
      >
        <ProFormRadio.Group
          name={"action"}
          // label={"Action"}
          label={"目标类型"}
          options={["images", "videos"]}
        />
        <ProFormRadio.Group
          name={"action2"}
          // label={"Action2"}
          label={"任务类型"}
          options={[
            // { label: "生成", value: "generations" },
            // { label: "视频", value: "text2video" },
            // { label: "图片", value: "image2video" },
            "generations",
            "text2video",
            "image2video",
          ]}
        />
        <ProFormText name={"task_id"} label={"任务ID"} rules={[{ required: true }, { type: "string" }]} />
      </ProForm>
    );
  };

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <Segmented
          {...SEGMENTED_PROPS}
          options={[
            {
              label: "文生视频",
              value: "text2video",
            },
            {
              label: "图生视频",
              value: "image2video",
            },
            {
              label: "任务查询",
              value: "queryTask",
            },
          ]}
          value={taskType}
          onChange={setTaskType}
        />
        {taskType === "text2video" && (
          <Text2VideoForm form={klingText2VideoForm} api={api} updateTask={setTaskData} updateError={setErrorData} />
        )}
        {taskType === "image2video" && (
          <Image2VideoForm form={klingImage2VideoForm} api={api} updateTask={setTaskData} updateError={setErrorData} />
        )}
        {taskType === "queryTask" && (
          <QueryTaskForm form={klingQueryTaskForm} api={api} updateTask={setTaskData} updateError={setErrorData} />
        )}
        <Divider />
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}></Col>
    </>
  );
};

export default KelingPage;
