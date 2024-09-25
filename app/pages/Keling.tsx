import React, { useState } from "react";
import {
  ProForm,
  ProFormInstance,
  ProFormText,
} from "@ant-design/pro-components";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import { useAppConfig } from "@/app/store";
import { Col, Divider, Segmented } from "antd";
import { KelingAI } from "@/app/providers/keling-ai";

const KelingPage = () => {
  const appConfig = useAppConfig();
  const api = new KelingAI(
    "sk-sFplfAcnWY3sFCCs02Ac93Ce9cEf4984A7EdF93e70969c18",
  );

  const response = api.callApi({
    callKey: "generateText2VideoTask",
    params: {
      prompt: "",
    },
  });

  const [taskType, setTaskType] = useState<
    "text2video" | "image2video" | "queryTask"
  >("text2video");
  const [klingText2VideoForm] = ProForm.useForm();
  const [klingImage2VideoForm] = ProForm.useForm();
  const [klingQueryTaskForm] = ProForm.useForm();
  const [taskData, setTaskData] = useState<any[]>([]);
  const [errorData, setErrorData] = useState<any>(null);

  const text2VideoForm = (props: {
    form: ProFormInstance;
    api: KelingAI;
    updateTask: (data: any[]) => void;
    updateError: (error: any) => void;
  }) => {
    return (
      <ProForm
        {...PRO_FORM_PROPS}
        form={props.form}
        initialValues={{
          video_style: "2d",
          video_format: "mp4",
          video_resolution: "1920x1080",
          video_fps: "30",
          video_bitrate: "5000",
          video_codec: "h264",
          video_quality: "high",
          video_duration: "10",
          video_size: "100",
        }}
        onFinish={async (values) => {}}
      >
        <ProFormText name={"prompt"} label={"Prompt"} />
        <ProFormText name={"video_style"} label={"Video Style"} />
        <ProFormText name={"video_format"} label={"Video Format"} />
        <ProFormText name={"video_resolution"} label={"Video Resolution"} />
        <ProFormText name={"video_fps"} label={"Video FPS"} />
        <ProFormText name={"video_bitrate"} label={"Video Bitrate"} />
        <ProFormText name={"video_codec"} label={"Video Codec"} />
        <ProFormText name={"video_quality"} label={"Video Quality"} />
        <ProFormText name={"video_duration"} label={"Video Duration"} />
        <ProFormText name={"video_size"} label={"Video Size"} />
        <ProFormText name={"video_background"} label={"Video Background"} />
        <ProFormText name={"video_theme"} label={"Video Theme"} />
        <ProFormText name={"video_mood"} label={"Video Mood"} />
        <ProFormText name={"video_tone"} label={"Video Tone"} />
        <ProFormText name={"video_style"} label={"Video Style"} />
        <ProFormText name={"video_format"} label={"Video Format"} />
        <ProFormText name={"video_resolution"} label={"Video Resolution"} />
        <ProFormText name={"video_fps"} label={"Video FPS"} />
        <ProFormText name={"video_bitrate"} label={"Video Bitrate"} />
        <ProFormText name={"video_codec"} label={"Video Codec"} />
        <ProFormText name={"video_quality"} label={"Video Quality"} />
        <ProFormText name={"video_duration"} label={"Video Duration"} />
        <ProFormText name={"video_size"} label={"Video Size"} />
        <ProFormText name={"video_background"} label={"Video Background"} />
        <ProFormText name={"video_theme"} label={"Video Theme"} />
        <ProFormText name={"video_mood"} label={"Video Mood"} />
        <ProFormText name={"video_tone"} label={"Video Tone"} />
      </ProForm>
    );
  };

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <Segmented
          block
          options={[
            { label: "Text2Video", value: "text2video" },
            { label: "Image2Video", value: "image2video" },
            { label: "Query", value: "queryTask" },
          ]}
          value={taskType}
          onChange={setTaskType}
          style={{ marginBottom: 20 }}
        />

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
