// app/pages/GPTs.tsx

import { Col, Divider, Segmented } from "antd";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import { renderCode, RenderSubmitter } from "@/app/render";
import { handelResponseError, safeJsonStringify } from "@/app/utils";
import React, { useState } from "react";
import { FileSearchOutlined } from "@ant-design/icons";
import { useAppConfig } from "@/app/store";
import { ProForm, ProFormInstance, ProFormText } from "@ant-design/pro-components";
import { GPTsAPI, GptsSearchRequest, GptsSearchResponse } from "@/app/client/Gpts";

const GPTsSearchForm = (props: {
  form: ProFormInstance;
  api: GPTsAPI;
  updateResponse: (data: any) => void;
  updateError: (e: any) => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  return (
    <ProForm<GptsSearchRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.search(values, controller.signal);
          if (res.ok) {
            const resJson = (await res.json()) as GptsSearchResponse;
            props.updateResponse(resJson);
          } else {
            await handelResponseError(res, props.updateError);
          }
        } catch (e) {
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
              getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
            />
          );
        },
      }}
    >
      <ProFormText name="keywords" label="Keywords" rules={[{ required: true, message: "Please enter keywords" }]} />
    </ProForm>
  );
};

const GPTsPage = () => {
  const appConfig = useAppConfig();
  const gptsApi = new GPTsAPI(appConfig.getApiKey());
  const [searchForm] = ProForm.useForm();

  const type_options = [{ label: "Search", value: "search", icon: <FileSearchOutlined /> }];

  const [formType, setFormType] = React.useState<"search">("search");
  const [errorData, setErrorData] = React.useState<any>();
  const [response, setResponse] = React.useState<any>();

  const renderForm = () => {
    switch (formType) {
      case "search":
        return (
          <GPTsSearchForm
            form={searchForm}
            api={gptsApi}
            updateResponse={(data) => setResponse(data)}
            updateError={(e) => setErrorData(e)}
          />
        );
    }
  };

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <Segmented
          style={{ marginBottom: 20 }}
          options={type_options}
          block
          onChange={(value) => setFormType(value as typeof formType)}
        />
        {renderForm()}
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <h1>Response</h1>
        {response && <>{renderCode(safeJsonStringify(response, response.toString()))}</>}
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

export default GPTsPage;
