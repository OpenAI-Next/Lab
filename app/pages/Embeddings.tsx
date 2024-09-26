// app/pages/Embeddings.tsx

import {
  ProForm,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { EmbeddingsAPI, EmbeddingsRequest } from "@/app/client/embeddings";
import React, { useState } from "react";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import { arrayValidationRule, handelResponseError, safeJsonStringify } from "@/app/utils";
import { renderCode, RenderSubmitter } from "@/app/render";
import { api2Provider, useAppConfig } from "@/app/store";
import { Col, Divider } from "antd";

const EmbeddingsForm = (props: {
  form: ProFormInstance;
  api: EmbeddingsAPI;
  updateResponse: (data: any) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [inputType, setInputType] = useState<"string" | "array">("string");

  function getFormatedInput(value: EmbeddingsRequest) {
    if (inputType === "array") {
      const copy = { ...value };
      try {
        const parsedInputs = JSON.parse(value.input as string);
        copy.input = Array.isArray(parsedInputs) ? parsedInputs : ["The input is not a valid array"];
      } catch (e) {
        copy.input = ["The input is not a valid array"];
      }
      return copy;
    }
    return value;
  }

  return (
    <ProForm<EmbeddingsRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        values = getFormatedInput(values);
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
              getValues={() => JSON.stringify(getFormatedInput(props.form.getFieldsValue()), null, 2) || ""}
            />
          );
        },
      }}
    >
      <ProFormText
        name={"model"}
        label={"Model"}
        tooltip={
          "ID of the model to use. You can use the List models API to see all of your available models, or see our Model overview for descriptions of them."
        }
        rules={[{ required: true }]}
      />

      <ProFormRadio.Group
        label={"Inputs Type"}
        options={["string", "array"]}
        tooltip={"Not a parameter, only for the form to switch between string and array input."}
        fieldProps={{
          value: inputType,
          onChange: (e) => setInputType(e.target.value),
        }}
        required
      />

      {inputType === "string" && (
        <ProFormTextArea
          name="input"
          label="Input"
          fieldProps={{
            maxLength: 8192,
            showCount: true,
            autoSize: { minRows: 3, maxRows: 7 },
          }}
          rules={[{ required: true }]}
        />
      )}

      {inputType === "array" && (
        <ProFormTextArea
          name="input"
          label="Input"
          fieldProps={{
            autoSize: { minRows: 3, maxRows: 7 },
          }}
          rules={[{ required: true }, arrayValidationRule]}
        />
      )}

      <ProFormSelect
        name={"encoding_format"}
        label={"Encoding Format"}
        options={["float", "base64"]}
        tooltip={"The format to return the embeddings in. Can be either float or base64. Default to float."}
        rules={[{ required: false }]}
      />

      <ProFormDigit
        name={"dimensions"}
        label={"Dimensions"}
        tooltip={
          "The number of dimensions the resulting output embeddings should have. Only supported in text-embedding-3 and later models."
        }
        rules={[{ required: false }]}
      />

      <ProFormText
        name={"user"}
        label={"User"}
        tooltip={"A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse."}
        rules={[{ required: false }]}
      />
    </ProForm>
  );
};

const EmbeddingsPage = () => {
  const appConfig = useAppConfig();
  const embeddingsApi = new EmbeddingsAPI(appConfig.getFirstApiKey(api2Provider.Embeddings));
  const [embeddingsForm] = ProForm.useForm();

  const [data, setData] = useState<any>();
  const [errorData, setErrorData] = useState<any>(null);

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <EmbeddingsForm
          form={embeddingsForm}
          api={embeddingsApi}
          updateResponse={(data: any) => setData(data)}
          updateError={(error: any) => setErrorData(error)}
        />
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <h1>Response</h1>
        {data && <>{renderCode(safeJsonStringify(data, data.toString()))}</>}
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

export default EmbeddingsPage;
