import { useAppConfig } from "@/app/store";
import {
  ProForm,
  ProFormInstance,
  ProFormSelect,
  ProFormSlider,
  ProFormTextArea,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import React, { useState } from "react";
import {
  OpenAIWhisperAPI,
  WHISPER_MODEL_OPTIONS,
  WHISPER_RESPONSE_FORMAT_OPTIONS,
  WhisperRequest,
} from "@/app/client/whisper";
import { Col, Divider, message } from "antd";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import { renderCode, renderRequestTimeDuration, RenderSubmitter } from "@/app/render";

const WhisperForm = (props: {
  form: ProFormInstance;
  api: OpenAIWhisperAPI;
  updateData: (startTimestamp?: number, endTimestamp?: number, task?: any) => void;
}) => {
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [file, setFile] = useState<any>(null);

  return (
    <ProForm<WhisperRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateData(Date.now(), 0, null);
        setSubmitting(true);
        const controller = new AbortController();
        setAbortController(controller);
        try {
          const res = await props.api.request({ ...values, file }, controller.signal);
          let responseInfo;
          try {
            if (res.ok) {
              if (
                values.response_format === "json" ||
                values.response_format === "verbose_json" ||
                values.response_format === undefined
              ) {
                responseInfo = await res.json();
              } else if (
                values.response_format === "text" ||
                values.response_format === "vtt" ||
                values.response_format === "srt"
              ) {
                responseInfo = await res.text();
              }
            } else {
              responseInfo = await res.json();
            }
          } catch (e) {
            responseInfo = e;
          }
          props.updateData(undefined, undefined, responseInfo);
        } catch (e) {
          props.updateData(undefined, undefined, e);
          message.error("Request failed");
        } finally {
          props.updateData(undefined, Date.now());
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
              getValues={false}
            />
          );
        },
      }}
    >
      <ProFormUploadButton
        name={"file"}
        label={"File"}
        tooltip={
          "File uploads are currently limited to 25 MB and the following input file types are supported: mp3, mp4, mpeg, mpga, m4a, wav, webm."
        }
        rules={[{ required: true }]}
        max={1}
        accept={"audio/mp3, audio/mp4, audio/mpeg, audio/mpga, audio/m4a, audio/wav, audio/webm"}
        fieldProps={{
          multiple: false,
          beforeUpload: (file: Blob) => {
            if (file.size < 1 || file.size > 25 * 1024 * 1024) {
              throw new Error("File uploads must not be empty and are currently limited to 25 MB");
            }
            setFile(file);
            return false; // 阻止自动上传
          },
        }}
      />

      <ProFormSelect
        name={"model"}
        label={"Model"}
        options={WHISPER_MODEL_OPTIONS}
        tooltip={"ID of the model to use. "}
        rules={[{ required: true }]}
      />

      <ProFormTextArea
        name={"prompt"}
        label={"Prompt"}
        tooltip={
          "An optional text to guide the model's style or continue a previous audio segment. The prompt should be in English."
        }
        fieldProps={{ autoSize: { minRows: 3, maxRows: 8 } }}
        rules={[{ required: false }]}
      />

      <ProFormSelect
        name={"response_format"}
        label={"Response Format"}
        options={WHISPER_RESPONSE_FORMAT_OPTIONS}
        tooltip={"The format of the transcript output,"}
        placeholder={"Defaults to json"}
        rules={[{ required: false }]}
      />
      <ProFormSlider
        name={"temperature"}
        label={"Temperature"}
        min={0.0}
        max={1.0}
        marks={{ 0.0: "0.0", 0.5: "0.5", 1.0: "1.0" }}
        initialValue={0.0}
        step={0.1}
        tooltip={
          "The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use log probability to automatically increase the temperature until certain thresholds are hit."
        }
        rules={[{ required: false }]}
      />
    </ProForm>
  );
};

export function WhisperPage() {
  const appConfig = useAppConfig();
  const whisperApi = new OpenAIWhisperAPI(appConfig.getApiKey());
  const [whisperForm] = ProForm.useForm<WhisperRequest>();

  const [startTimestamp, setStartTimestamp] = useState<number>(0);
  const [endTimestamp, setEndTimestamp] = useState<number>(0);
  const [task, setTask] = useState<any>(null);

  const updateData = (startTimestamp?: number, endTimestamp?: number, task?: any) => {
    if (startTimestamp !== undefined) setStartTimestamp(startTimestamp);
    if (endTimestamp !== undefined) setEndTimestamp(endTimestamp);
    if (task !== undefined) setTask(task);
  };

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <WhisperForm form={whisperForm} api={whisperApi} updateData={updateData} />
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <div>
          <h1>Response</h1>
          {renderRequestTimeDuration(startTimestamp, endTimestamp)}
          {task && renderCode(JSON.stringify(task, null, 2))}
        </div>
      </Col>
    </>
  );
}
