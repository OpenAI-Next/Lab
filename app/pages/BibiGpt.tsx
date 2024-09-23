// app/pages/BibiGpt.tsx

import { Col, Divider } from "antd";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import {
  FormInstance,
  ProForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import React, { useState } from "react";
import { BibiGPTAPI } from "@/app/client/BibiGPT";
import { api2Provider, useAppConfig } from "@/app/store";
import { RenderSubmitter } from "@/app/render";

const BibiGptOpenForm = (props: {
  form: FormInstance;
  api: BibiGPTAPI;
  updateTask: (task: any) => void;
  updateError: (error: any) => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  return (
    <ProForm
      {...PRO_FORM_PROPS}
      form={props.form}
      // onFinish={async (values) => {
      //     props.updateError(null);
      //     props.updateTask(undefined);
      //     const controller = new AbortController();
      //     setAbortController(controller);
      //     setSubmitting(true);
      //     try {
      //         const res = await props.api.queryLumaTask(values, props.accountType, controller.signal);
      //         if (res.ok) {
      //             const resJson = await res.json();
      //             props.updateTask(resJson);
      //             props.form.resetFields();
      //         } else {
      //             await handelResponseError(res, props.updateError);
      //         }
      //     } catch (e) {
      //         if (e instanceof Error) {
      //             props.updateError(e.message);
      //         } else {
      //             props.updateError(String(e));
      //         }
      //     } finally {
      //         setAbortController(null);
      //         setSubmitting(false);
      //     }
      // }}
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
      <ProFormText name={"url"} label={"URL"} />
      <ProFormTextArea name={"prompt"} label={"Prompt"} />

      <Divider />

      <ProForm.Group title={"Limitation"}>
        <ProFormDigit
          name={["limitation", "maxDuration"]}
          label={"Max Duration"}
          fieldProps={{ suffix: "s" }}
        />
      </ProForm.Group>

      <Divider />

      <ProForm.Group title={"Prompt Config"}>
        <ProFormSwitch
          name={["promptConfig", "showEmoji"]}
          label={"Show Emoji"}
        />
        <ProFormSwitch
          name={["promptConfig", "showTimestamp"]}
          label={"Show Timestamp"}
        />
        <ProFormDigit
          name={["promptConfig", "outlineLevel"]}
          label={"Outline Level"}
          width={"xs"}
        />
        <ProFormDigit
          name={["promptConfig", "sentenceNumber"]}
          label={"Sentence Number"}
          width={"xs"}
        />
        <ProFormDigit
          name={["promptConfig", "detailLevel"]}
          label={"Detail Level"}
          width={"xs"}
        />
        <ProFormText
          name={["promptConfig", "outputLanguage"]}
          label={"Output Language"}
          width={"xs"}
        />
      </ProForm.Group>

      <Divider />

      <ProFormSwitch name={"includeDetail"} label={"Include Detail"} />
    </ProForm>
  );
};

const BibiGptPage = () => {
  const appConfig = useAppConfig();
  const bibiGptAPI = new BibiGPTAPI(
    appConfig.getFirstApiKey(api2Provider.BibiGPT),
  );
  const [bibiGptOpenForm] = ProForm.useForm();
  const [bibiGptChatForm] = ProForm.useForm();
  const [bibiGptSubtitleForm] = ProForm.useForm();
  const [task, setTask] = React.useState<any>(null);
  const [error, setError] = React.useState<any>(null);

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <BibiGptOpenForm
          form={bibiGptOpenForm}
          api={bibiGptAPI}
          updateTask={setTask}
          updateError={setError}
        />
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <h1>Task Data</h1>
      </Col>
    </>
  );
};

export default BibiGptPage;
