// app/pages/Doc2X.tsx

import { api2Provider, useAppConfig } from "@/app/store";
import { Doc2XAPI } from "@/app/client/doc2X";
import { ProForm, ProFormInstance, ProFormRadio, ProFormSwitch, ProFormUploadButton } from "@ant-design/pro-components";
import React, { useState } from "react";
import { Col, Divider } from "antd";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import { renderCode, RenderSubmitter } from "@/app/render";
import { handelResponseError, safeJsonStringify } from "@/app/utils";

export interface Doc2XFormFields {
  response_format: "text" | "json";
  ocr: boolean;
  progress?: boolean;
  file: any;
}

const Doc2XForm = (props: {
  form: ProFormInstance;
  api: Doc2XAPI;
  updateResponse: (data: any) => void;
  updateError: (error: any) => void;
}) => {
  const appConfig = useAppConfig();
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // const selectedResponseFormat = (ProForm.useWatch("response_format", props.form) || "text") as "text" | "json";

  return (
    <ProForm<Doc2XFormFields>
      {...PRO_FORM_PROPS}
      form={props.form}
      initialValues={{
        response_format: "text",
        ocr: false,
        // progress: false,
      }}
      onFinish={async (values) => {
        props.updateError(null);
        props.updateResponse(null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.request(values, controller.signal);
          if (res.ok) {
            const resJson = await res.json();
            props.updateResponse(resJson);
          } else {
            await handelResponseError(res, props.updateError);
          }
        } catch (e) {
          console.error(e);
          props.updateError(e);
        } finally {
          setSubmitting(false);
          setAbortController(null);
        }
      }}
      submitter={{
        render: (submitterProps) => {
          return (
            <RenderSubmitter
              abortController={abortController}
              submitting={submitting}
              submitterProps={submitterProps}
              getValues={() => JSON.stringify(props.api.payload(props.form.getFieldsValue()), null, 2)}
            />
          );
        },
      }}
    >
      <ProFormRadio.Group
        name={"response_format"}
        label={"Response Format"}
        options={[
          { label: "Text", value: "text" },
          { label: "JSON", value: "json" },
        ]}
        rules={[{ required: true }]}
      />

      <ProFormSwitch name={"ocr"} label={"OCR"} rules={[{ required: true }]} />

      {/*{selectedResponseFormat === "text" && <ProFormSwitch*/}
      {/*    name={"progress"}*/}
      {/*    label={"Progress"}*/}
      {/*    disabled*/}
      {/*    rules={[{required: true}]}*/}
      {/*/>}*/}

      <ProFormUploadButton
        name="file"
        label="File"
        max={1}
        action={appConfig.getUploadConfig().action}
        accept={"application/pdf"}
        rules={[{ required: true, message: "Please upload a file" }]}
        fieldProps={{
          listType: "picture",
          headers: {
            Authorization: appConfig.getUploadConfig().auth,
          },
          onChange: (info) => {
            const getValueByPosition = (obj: any, position: readonly any[]) => {
              return position.reduce((acc, key) => acc && acc[key], obj);
            };

            if (info.file.status === "done") {
              try {
                const response = info.file.response;
                if (response) {
                  info.file.url = getValueByPosition(response, appConfig.getUploadConfig().position);
                }
              } catch (e) {
                console.error(e);
              }
            }
          },
        }}
        width="sm"
      />
    </ProForm>
  );
};

const Doc2XPage = () => {
  const appConfig = useAppConfig();
  const doc2XApi = new Doc2XAPI(appConfig.getFirstApiKey(api2Provider.Doc2X));

  const [doc2XForm] = ProForm.useForm();

  const [response, setResponse] = useState<any>(null);
  const [errorData, setErrorData] = useState<any>(null);

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <Doc2XForm
          form={doc2XForm}
          api={doc2XApi}
          updateResponse={(data) => setResponse(data)}
          updateError={(error) => setErrorData(error)}
        />
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <h1>Response</h1>
        {response && (
          <>
            {renderCode(safeJsonStringify(response, "failed to stringify response data"))}
            {response?.choices?.[0]?.message?.content &&
              typeof response?.choices?.[0]?.message?.content === "string" && (
                <>
                  <h2>Content</h2>
                  {renderCode(response.choices[0].message.content.replace(/\\n/g, "\n"), "36vh", true)}
                </>
              )}
          </>
        )}
        {errorData && (
          <>
            <h1>Error</h1>
            {renderCode(safeJsonStringify(errorData, errorData.toString()))}
          </>
        )}
      </Col>
    </>
  );
};

export default Doc2XPage;
