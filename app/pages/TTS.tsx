import { Col, Divider } from "antd";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import React, { useState } from "react";
import {
  ProForm,
  ProFormInstance,
  ProFormSelect,
  ProFormSlider,
  ProFormTextArea,
} from "@ant-design/pro-components";
import {
  OpenAITTSAPI,
  TTS_MODEL_OPTIONS,
  TTS_RESPONSE_FORMAT_OPTIONS,
  TTS_VOICE_OPTIONS,
  TtsRequest,
} from "@/app/client/tts";
import { api2Provider, useAppConfig } from "@/app/store";
import {
  renderCode,
  renderRequestTimeDuration,
  RenderSubmitter,
} from "@/app/render";

const TtsForm = (props: {
  form: ProFormInstance;
  api: OpenAITTSAPI;
  updateData: (
    startTimestamp?: number,
    endTimestamp?: number,
    task?: any,
    audioUrl?: string,
  ) => void;
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  return (
    <ProForm<TtsRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateData(Date.now(), 0, null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          debugger;
          const res = await props.api.request(values, controller.signal);
          if (res.ok) {
            const audioUrl = URL.createObjectURL(await res.blob());
            props.updateData(undefined, undefined, undefined, audioUrl);
          } else {
            try {
              const resJson = await res.json();
              props.updateData(undefined, undefined, resJson);
            } catch (e) {
              props.updateData(undefined, undefined, e);
            }
          }
        } catch (e) {
          props.updateData(undefined, undefined, e);
        } finally {
          setSubmitting(false);
          props.updateData(undefined, Date.now());
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
      <ProFormSelect
        name={"model"}
        label={"Model"}
        options={TTS_MODEL_OPTIONS}
        tooltip={"One of the available TTS models."}
        rules={[{ required: true }]}
      />
      <ProFormTextArea
        name={"input"}
        label={"Input"}
        tooltip={
          "The text to generate audio for. The maximum length is 4096 characters."
        }
        fieldProps={{ autoSize: { minRows: 3, maxRows: 8 } }}
        rules={[{ required: true }, { type: "string", max: 4096 * 3 }]}
      />
      <ProFormSelect
        name={"voice"}
        label={"Voice"}
        options={TTS_VOICE_OPTIONS}
        tooltip={"The voice to use when generating the audio."}
        rules={[{ required: true }]}
      />
      <ProFormSelect<TtsRequest["response_format"]>
        name={"response_format"}
        label={"Response Format"}
        options={TTS_RESPONSE_FORMAT_OPTIONS}
        tooltip={"The format to audio in."}
        rules={[{ required: false }]}
        // initialValue={"mp3"}
        placeholder={"Defaults to mp3"}
      />
      <ProFormSlider
        name={"speed"}
        label={"Speed"}
        min={0.25}
        max={4.0}
        marks={{ 0.25: "0.25", 1.0: "1.0", 4.0: "4.0" }}
        initialValue={undefined}
        step={0.05}
        tooltip={"The speed of the generated audio. 1.0 is the default."}
        rules={[{ required: false }]}
      />
    </ProForm>
  );
};

export function TTSPage() {
  const appConfig = useAppConfig();
  const ttsApi = new OpenAITTSAPI(appConfig.getFirstApiKey(api2Provider.TTS));
  const [ttsForm] = ProForm.useForm<TtsRequest>();

  const [startTimestamp, setStartTimestamp] = useState<number>(0);
  const [endTimestamp, setEndTimestamp] = useState<number>(0);
  const [task, setTask] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const updateData = (
    startTimestamp?: number,
    endTimestamp?: number,
    task?: any,
    audioUrl?: string,
  ) => {
    if (startTimestamp !== undefined) setStartTimestamp(startTimestamp);
    if (endTimestamp !== undefined) setEndTimestamp(endTimestamp);
    if (task !== undefined) setTask(task);
    if (audioUrl !== undefined) setAudioUrl(audioUrl);
  };

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <TtsForm form={ttsForm} api={ttsApi} updateData={updateData} />
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <h1>Response</h1>
        {renderRequestTimeDuration(startTimestamp, endTimestamp)}

        {task && renderCode(JSON.stringify(task, null, 2))}

        {audioUrl && (
          <audio
            controls
            src={audioUrl}
            style={{ width: "360px", marginTop: "20px" }}
          >
            Your browser does not support the audio element.
          </audio>
        )}
      </Col>
    </>
  );
}
