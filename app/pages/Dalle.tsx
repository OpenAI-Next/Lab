import { useAppConfig } from "@/app/store";
import {
  AvailableDalleModels,
  DallEAPI,
  DallECreateImageRequest,
  DallEEditImageRequest,
  DallePromptExamples,
  DallEResponse,
  DallEVariationRequest,
} from "@/app/client/dall-e";
import {
  ProForm,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import { Button, Col, Divider, Image, Row, Segmented } from "antd";
import React, { useState } from "react";
import { renderCode, RenderSubmitter } from "@/app/render";
import { handelResponseError, safeJsonStringify } from "@/app/utils";
import { BulbOutlined, EditOutlined, NodeExpandOutlined, UnorderedListOutlined } from "@ant-design/icons";

const CreateForm = (props: {
  form: ProFormInstance;
  api: DallEAPI;
  updateResponse: (data: DallEResponse | undefined) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedModel = (ProForm.useWatch("model", props.form) || "dall-e-2") as AvailableDalleModels;

  const differentModelsDetail: Record<AvailableDalleModels, any> = {
    "dall-e-2": {
      PromptMaxLength: 1000,
      NMax: 10,
      NTooltip: "The number of images to generate. Must be between 1 and 10. Default to 1.",
      SizeOptions: ["256x256", "512x512", "1024x1024"],
    },
    "dall-e-3": {
      PromptMaxLength: 4000,
      NMax: 1,
      NTooltip: "For dall-e-3, only n=1 is supported.",
      SizeOptions: ["1024x1024", "1792x1024", "1024x1792"],
    },
  };

  return (
    <ProForm<DallECreateImageRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        props.updateResponse(undefined);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.create(values, controller.signal);
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
              getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
            />
          );
        },
      }}
    >
      <ProFormSelect
        name={"model"}
        label={"Model"}
        options={["dall-e-2", "dall-e-3"]}
        rules={[{ required: false }]}
        tooltip={"The model to use for image generation. Default to dall-e-2."}
      />
      <ProFormTextArea
        name={"prompt"}
        label={"Prompt"}
        fieldProps={{
          autoSize: { minRows: 3, maxRows: 7 },
          showCount: true,
          maxLength: differentModelsDetail[selectedModel].PromptMaxLength,
        }}
        rules={[
          { required: true },
          {
            type: "string",
            max: differentModelsDetail[selectedModel].PromptMaxLength,
          },
        ]}
        tooltip={"A text description of the desired image(s). "}
      />
      <ProForm.Item>
        <Button
          onClick={() => {
            const getUniqueRandomPrompt = () => {
              const currentPrompt = props.form.getFieldValue("prompt");
              const randomPrompt = DallePromptExamples[Math.floor(Math.random() * DallePromptExamples.length)];

              if (randomPrompt !== currentPrompt) {
                props.form.setFieldsValue({ prompt: randomPrompt });
              } else {
                console.log("Same prompt, retrying...");
                getUniqueRandomPrompt();
              }
            };

            getUniqueRandomPrompt();
          }}
          type={"dashed"}
          icon={<BulbOutlined />}
          block
        >
          Random Prompt
        </Button>
      </ProForm.Item>
      <ProFormSelect
        name={"response_format"}
        label={"Response Format"}
        options={["url", "b64_json"]}
        rules={[{ required: false }]}
        tooltip={
          "The format in which the generated images are returned. URLs are only valid for 60 minutes after the image has been generated. Default to url."
        }
      />
      <ProFormDigit
        name={"n"}
        label={"N"}
        tooltip={`The number of images to generate. ${differentModelsDetail[selectedModel].NTooltip}`}
        min={1}
        max={differentModelsDetail[selectedModel].NMax}
      />
      <ProFormSelect
        name={"size"}
        label={"Size"}
        options={differentModelsDetail[selectedModel].SizeOptions}
        tooltip={"The size of the generated images. Default to 1024x1024."}
        rules={[
          { required: false },
          {
            type: "enum",
            enum: differentModelsDetail[selectedModel].SizeOptions,
          },
        ]}
      />
      {selectedModel === "dall-e-3" && (
        <>
          <ProFormSelect
            name={"quality"}
            label={"Quality"}
            options={["hd", "standard"]}
            tooltip={
              "The quality of the image that will be generated. hd creates images with finer details and greater consistency across the image. This param is only supported for dall-e-3."
            }
          />

          <ProFormSelect
            name={"style"}
            label={"Style"}
            options={["vivid", "natural"]}
            tooltip={
              "The style of the generated images. Must be one of vivid or natural. Vivid causes the model to lean towards generating hyper-real and dramatic images. Natural causes the model to produce more natural, less hyper-real looking images. This param is only supported for dall-e-3."
            }
          />
        </>
      )}
      <ProFormText
        name={"user"}
        label={"User"}
        rules={[{ required: false }]}
        tooltip={"A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse."}
      />
    </ProForm>
  );
};

const EditForm = (props: {
  form: ProFormInstance;
  api: DallEAPI;
  updateResponse: (data: DallEResponse | undefined) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const [maskFile, setMaskFile] = useState<Blob | null>(null);

  return (
    <ProForm<DallEEditImageRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        props.updateResponse(undefined);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.edit({ ...values, image: imageFile, mask: maskFile }, controller.signal);
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
              getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
            />
          );
        },
      }}
    >
      <ProFormSelect
        name={"model"}
        label={"Model"}
        options={["dall-e-2"]}
        rules={[{ required: false }]}
        tooltip={"The model to use for image generation. Default to dall-e-2."}
      />
      <ProFormUploadButton
        name={"image"}
        label={"Image"}
        tooltip={
          "The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square."
        }
        rules={[{ required: true }]}
        accept={"image/png"}
        fieldProps={{
          multiple: false,
          beforeUpload: (file: Blob) => {
            if (file.size < 1 || file.size > 4 * 1024 * 1024) {
              throw new Error("File uploads must not be empty and are currently limited to 4MB");
            }
            setImageFile(file);
            return false; // 阻止自动上传
          },
        }}
      />
      <ProFormTextArea
        name={"prompt"}
        label={"Prompt"}
        fieldProps={{
          autoSize: { minRows: 3, maxRows: 7 },
          showCount: true,
          maxLength: 1000,
        }}
        rules={[{ required: true }, { type: "string", max: 1000 }]}
        tooltip={"A text description of the desired image(s). "}
      />
      <ProFormUploadButton
        name={"mask"}
        label={"Mask"}
        tooltip={
          "An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where image should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as image."
        }
        accept={"image/png"}
        fieldProps={{
          multiple: false,
          beforeUpload: (file: Blob) => {
            if (file.size < 1 || file.size > 4 * 1024 * 1024) {
              throw new Error("File uploads must not be empty and are currently limited to 4MB");
            }
            setMaskFile(file);
            return false; // 阻止自动上传
          },
        }}
      />

      <ProFormSelect
        name={"response_format"}
        label={"Response Format"}
        options={["url", "b64_json"]}
        rules={[{ required: false }]}
        tooltip={
          "The format in which the generated images are returned. URLs are only valid for 60 minutes after the image has been generated. Default to url."
        }
      />
      <ProFormDigit
        name={"n"}
        label={"N"}
        tooltip="The number of images to generate. The number of images to generate. Must be between 1 and 10. Default to 1."
        min={1}
        max={10}
      />
      <ProFormSelect
        name={"size"}
        label={"Size"}
        options={["256x256", "512x512", "1024x1024"]}
        tooltip={"The size of the generated images. Default to 1024x1024."}
        rules={[{ required: false }, { type: "enum", enum: ["256x256", "512x512", "1024x1024"] }]}
      />

      <ProFormText
        name={"user"}
        label={"User"}
        rules={[{ required: false }]}
        tooltip={"A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse."}
      />
    </ProForm>
  );
};

const VariationForm = (props: {
  form: ProFormInstance;
  api: DallEAPI;
  updateResponse: (data: DallEResponse | undefined) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState<any>(null);

  return (
    <ProForm<DallEVariationRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        props.updateResponse(undefined);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.variation({ ...values, image: imageFile }, controller.signal);
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
              getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
            />
          );
        },
      }}
    >
      <ProFormSelect
        name={"model"}
        label={"Model"}
        options={["dall-e-2"]}
        rules={[{ required: false }]}
        tooltip={"The model to use for image generation. Default to dall-e-2."}
      />
      <ProFormUploadButton
        name={"image"}
        label={"Image"}
        tooltip={
          "The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square."
        }
        rules={[{ required: true }]}
        accept={"image/png"}
        fieldProps={{
          multiple: false,
          beforeUpload: (file: Blob) => {
            if (file.size < 1 || file.size > 4 * 1024 * 1024) {
              throw new Error("Must be a valid PNG file, less than 4MB, and square.");
            }
            setImageFile(file);
            return false; // 阻止自动上传
          },
        }}
      />

      <ProFormSelect
        name={"response_format"}
        label={"Response Format"}
        options={["url", "b64_json"]}
        rules={[{ required: false }]}
        tooltip={
          "The format in which the generated images are returned. URLs are only valid for 60 minutes after the image has been generated. Default to url."
        }
      />
      <ProFormDigit
        name={"n"}
        label={"N"}
        tooltip="The number of images to generate. The number of images to generate. Must be between 1 and 10. Default to 1."
        min={1}
        max={10}
      />
      <ProFormSelect
        name={"size"}
        label={"Size"}
        options={["256x256", "512x512", "1024x1024"]}
        tooltip={"The size of the generated images. Default to 1024x1024."}
        rules={[{ required: false }, { type: "enum", enum: ["256x256", "512x512", "1024x1024"] }]}
      />

      <ProFormText
        name={"user"}
        label={"User"}
        rules={[{ required: false }]}
        tooltip={"A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse."}
      />
    </ProForm>
  );
};

const renderPicture = (data: DallEResponse) => {
  const result = data?.data.map((item) => item.url) || [];

  return (
    <Row gutter={[16, 16]}>
      {result.map((url, index) => (
        <Col span={5} key={index}>
          <Image src={url} alt={`Generated Image ${index}`} />
        </Col>
      ))}
    </Row>
  );
};

const DallePage = () => {
  const appConfig = useAppConfig();
  const dallEApi = new DallEAPI(appConfig.getApiKey());
  const [createForm] = ProForm.useForm();
  const [editForm] = ProForm.useForm();
  const [variationForm] = ProForm.useForm();

  const [taskData, setTaskData] = useState<DallEResponse>();
  const [errorData, setErrorData] = useState<any>(null);

  const operate_type_options = [
    { label: "Create", value: "create", icon: <UnorderedListOutlined /> },
    { label: "Edit", value: "edit", icon: <EditOutlined /> },
    { label: "Variation", value: "variation", icon: <NodeExpandOutlined /> },
  ];

  const [operateType, setOperateType] = useState<"create" | "edit" | "variation">("create");

  const renderForm = () => {
    switch (operateType) {
      case "create":
        return (
          <CreateForm
            form={createForm}
            api={dallEApi}
            updateResponse={(data: DallEResponse | undefined) => setTaskData(data)}
            updateError={(error: any) => setErrorData(error)}
          />
        );
      case "edit":
        return (
          <EditForm
            form={editForm}
            api={dallEApi}
            updateResponse={(data: DallEResponse | undefined) => setTaskData(data)}
            updateError={(error: any) => setErrorData(error)}
          />
        );
      case "variation":
        return (
          <VariationForm
            form={variationForm}
            api={dallEApi}
            updateResponse={(data: DallEResponse | undefined) => setTaskData(data)}
            updateError={(error: any) => setErrorData(error)}
          />
        );
    }
  };

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <Segmented
          style={{ marginBottom: 20 }}
          options={operate_type_options}
          block
          onChange={(value) => setOperateType(value as "create" | "edit" | "variation")}
          value={operateType}
        />
        {renderForm()}
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <h1>Response</h1>
        {taskData && (
          <>
            {renderCode(safeJsonStringify(taskData, taskData.toString()))}
            {renderPicture(taskData)}
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

export default DallePage;
