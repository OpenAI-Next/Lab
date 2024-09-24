// app/pages/Vidu.tsx

import { api2Provider, useAppConfig } from "@/app/store";
import {
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormGroup,
  ProFormInstance,
  ProFormList,
  ProFormRadio,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import React, { ReactNode, useState } from "react";
import {
  ExpandAltOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Empty,
  Image,
  Segmented,
  Spin,
  Typography,
} from "antd";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import { CodeModal, renderCode, RenderSubmitter } from "@/app/render";
import {
  CloseAllSound,
  handelResponseError,
  safeJsonStringify,
} from "@/app/utils";
import {
  ViduAPI,
  ViduTaskGenerationRequest,
  ViduTaskGenerationResponse,
  ViduUpscaleTaskRequest,
} from "@/app/client/ViduProxy";

const GenerationForm = (props: {
  form: ProFormInstance;
  api: ViduAPI;
  updateResponse: (data: ViduTaskGenerationResponse) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const UserPrompt = ProForm.useWatch(["input", "prompts"], props.form);

  return (
    <ProForm<ViduTaskGenerationRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.generateViduTask(
            values,
            controller.signal,
          );
          if (res.ok) {
            const resJson = (await res.json()) as ViduTaskGenerationResponse;
            props.updateResponse(resJson);
          } else {
            await handelResponseError(res, props.updateError);
          }
        } catch (e) {
          props.updateError(e);
          console.error(e);
        } finally {
          setAbortController(null);
          setSubmitting(false);
        }
      }}
      initialValues={{
        settings: {
          aspect_ratio: "16:9",
          duration: 4,
          model: "vidu-1",
        },
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
              noApiKeys={props.api.noKey()}
            />
          );
        },
      }}
    >
      <ProFormList
        name={["input", "prompts"]}
        label={"Prompts"}
        tooltip={
          "Just input text or add an image as a reference, and you are all set to start creating your video!"
        }
        required
        itemRender={({ listDom, action }, { index }) => (
          <ProCard
            bordered
            style={{ marginBlockEnd: 8 }}
            title={`Prompts ${index + 1}`}
            extra={action}
            bodyStyle={{ paddingBlockEnd: 0 }}
          >
            {listDom}
          </ProCard>
        )}
        max={2}
        rules={[
          {
            required: true,
            validator: async (_rule, value) => {
              if (!value || value.length < 1)
                throw new Error("Prompts is required");
              if (value.length === 2 && value[0].type === value[1].type)
                throw new Error("Only one prompt of each type is allowed");
              return Promise.resolve();
            },
          },
        ]}
      >
        {(_f, index) => {
          return (
            <ProFormGroup>
              <ProFormRadio.Group
                name={"type"}
                label={"Type"}
                options={[
                  { label: "Text", value: "text" },
                  { label: "Image", value: "image" },
                ]}
                width={"xs"}
                rules={[{ required: true }]}
                fieldProps={{
                  // reset other fields when type changes, to avoid unavailable options
                  onChange: () => {
                    props.form.resetFields(["settings", "type"]);
                    props.form.resetFields(["settings", "style"]);
                  },
                }}
              />
              <ProFormSwitch
                name={"enhance"}
                label={"Enhance"}
                fieldProps={{
                  checkedChildren: "Yes",
                  unCheckedChildren: "No",
                }}
                tooltip={
                  "Automatically expand short prompts into detailed descriptions to enhance generation. This increases richness but may lead to over embellishment."
                }
                rules={[{ required: true }]}
                initialValue={true}
              />
              <ProFormTextArea
                name={"content"}
                label={"Content"}
                fieldProps={{
                  autoSize: { minRows: 2, maxRows: 4 },
                }}
                placeholder={
                  UserPrompt?.[index]?.type === "text"
                    ? "Text prompt"
                    : UserPrompt?.[index]?.type === "image"
                      ? "Image URL"
                      : "Select type first"
                }
                width={"md"}
                rules={[{ required: true }]}
              />

              {UserPrompt?.[index]?.type === "text" && (
                <ProForm.Item>
                  <Button
                    type={"dashed"}
                    icon={<ExperimentOutlined />}
                    onClick={() => {
                      props.form.setFieldValue(
                        ["input", "prompts", index, "content"],
                        props.api.randomTextPrompt(),
                      );
                    }}
                    block
                  >
                    Random Prompt
                  </Button>
                </ProForm.Item>
              )}
            </ProFormGroup>
          );
        }}
      </ProFormList>

      <ProFormSelect
        name={"type"}
        label={"Type"}
        options={props.api.availableTaskTypes(UserPrompt)}
        rules={[{ required: true }]}
      />

      <ProFormSelect
        name={["settings", "style"]}
        label={"Style"}
        options={props.api.availableStyles(UserPrompt)}
        tooltip={"Select the video style, available for text-to-video only."}
        rules={[{ required: true }]}
      />

      <ProFormSelect
        name={["settings", "aspect_ratio"]}
        label={"Aspect Ratio"}
        options={["16:9"]}
        rules={[{ required: true }]}
      />

      <ProFormRadio.Group
        name={["settings", "duration"]}
        label={"Duration"}
        options={[
          { label: "4s", value: 4 },
          { label: "8s", value: 8 },
        ]}
        rules={[{ required: true }]}
        tooltip={
          "Supports 4s/8s video creation. Longer durations will take more time."
        }
      />

      <ProFormSelect
        name={["settings", "model"]}
        label={"Model"}
        options={props.api.availableModels(false)}
        rules={[{ required: true }]}
      />
    </ProForm>
  );
};

const UpscaleForm = (props: {
  form: ProFormInstance;
  api: ViduAPI;
  updateResponse: (data: ViduTaskGenerationResponse) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <ProForm<ViduUpscaleTaskRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.submitUpscaleTask(
            values,
            controller.signal,
          );
          if (res.ok) {
            const resJson = (await res.json()) as ViduTaskGenerationResponse;
            props.updateResponse(resJson);
          } else {
            await handelResponseError(res, props.updateError);
          }
        } catch (e) {
          props.updateError(e);
          console.error(e);
        } finally {
          setAbortController(null);
          setSubmitting(false);
        }
      }}
      initialValues={{
        type: "upscale",
        settings: {
          duration: 4,
          model: "stable",
        },
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
              noApiKeys={props.api.noKey()}
            />
          );
        },
      }}
    >
      <ProFormText
        name={["input", "creation_id"]}
        label={"Creation ID"}
        rules={[{ required: true }]}
      />

      <ProFormSelect
        name={["type"]}
        label={"Type"}
        options={props.api.availableTaskTypes([], true)}
        rules={[{ required: true }]}
      />

      <ProFormSelect
        name={["settings", "model"]}
        label={"Model"}
        options={props.api.availableModels(true)}
        rules={[{ required: true }]}
      />

      <ProFormRadio.Group
        name={["settings", "duration"]}
        label={"Duration"}
        options={[
          { label: "4s", value: 4 },
          { label: "8s", value: 8 },
        ]}
        rules={[{ required: true }]}
        tooltip={
          "Supports 4s/8s video creation. Longer durations will take more time."
        }
      />
    </ProForm>
  );
};

const QueryForm = (props: {
  form: ProFormInstance;
  api: ViduAPI;
  updateResponse: (data: ViduTaskGenerationResponse) => void;
  updateError: (error: any) => void;
}) => {
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <ProForm
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.getViduTask(values.id, controller.signal);
          if (res.ok) {
            const resJson = (await res.json()) as ViduTaskGenerationResponse;
            props.updateResponse(resJson);
          } else {
            await handelResponseError(res, props.updateError);
          }
        } catch (e) {
          props.updateError(e);
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
                JSON.stringify(props.form.getFieldsValue(), null, 2) || ""
              }
              noApiKeys={props.api.noKey()}
            />
          );
        },
      }}
    >
      <ProFormText name={"id"} label={"Task ID"} rules={[{ required: true }]} />
    </ProForm>
  );
};

const ViduTaskRenderer = (props: {
  task: ViduTaskGenerationResponse[];
  api: ViduAPI;
  updateTask: (task: ViduTaskGenerationResponse) => void;
  updateError: (error: any) => void;
}) => {
  const [loadingStates, setLoadingStates] = useState<{
    [key: number]: boolean;
  }>({ 0: false, 1: false });
  const [showCodeModal, setShowCodeModal] = useState(false);

  const [codeContent, setCodeContent] = useState({});

  if (!props.task || props.task.length === 0) return <Empty />;

  const handleRefresh = async (index: number) => {
    setLoadingStates((prevStates) => ({ ...prevStates, [index]: true }));

    try {
      const res = await props.api.getViduTask(props.task[index].id);
      if (res.ok) {
        const resJson = (await res.json()) as unknown as any;
        props.updateTask(resJson);
      } else {
        await handelResponseError(res, props.updateError);
      }
    } catch (e) {
      props.updateError(e);
    } finally {
      setLoadingStates((prevStates) => ({ ...prevStates, [index]: false }));
    }
  };

  return (
    <>
      {props.task.map((task, index) => (
        <Spin spinning={loadingStates[index] ?? false} key={task.id}>
          <ProDescriptions<ViduTaskGenerationResponse>
            title={`Task ${index + 1}`}
            dataSource={task}
            column={1}
            bordered
            style={{
              marginBottom: 20,
            }}
            size={"small"}
            columns={[
              {
                title: "Task ID",
                dataIndex: ["id"],
                copyable: true,
              },
              {
                title: "Type",
                dataIndex: ["type"],
              },
              {
                title: "State",
                dataIndex: ["state"],
                valueEnum: {
                  queueing: { text: "Queueing", status: "Processing" },
                  processing: { text: "Processing", status: "Processing" },
                  success: { text: "Success", status: "Success" },
                },
              },
              {
                title: "created_at",
                dataIndex: ["created_at"],
              },
              {
                title: "Prompts",
                render: (_, record) => {
                  return record.input.prompts.map((prompt, index) => (
                    <div key={index}>
                      {prompt.type}: {prompt.content}
                    </div>
                  ));
                },
              },
              {
                title: "Creation ID",
                render: (_, record) => {
                  if (!record?.creations?.[0]?.id) return null;
                  return (
                    <Typography.Text copyable>
                      {record?.creations?.[0]?.id}
                    </Typography.Text>
                  );
                },
              },
              {
                title: "Creation_Preview",
                key: "creation-preview",
                render: (_, record) => {
                  if (!record?.creations?.[0]?.cover_uri) return null;
                  return (
                    <Image
                      alt={record?.id}
                      src={record?.creations?.[0]?.cover_uri}
                      preview={
                        record?.creations?.[0]?.uri &&
                        record?.state === "success"
                          ? {
                              imageRender: () => (
                                <video
                                  controls
                                  src={record?.creations?.[0]?.uri || ""}
                                  style={{ maxHeight: "80vh" }}
                                />
                              ),
                              toolbarRender: () => null,
                              onVisibleChange: (visible: boolean) =>
                                !visible && CloseAllSound(),
                            }
                          : false
                      }
                      width={240}
                    />
                  );
                },
              },
              {
                title: "URI",
                dataIndex: ["creations", 0, "uri"],
                ellipsis: true,
                copyable: true,
              },
              {
                title: "Cover URI",
                dataIndex: ["creations", 0, "cover_uri"],
                ellipsis: true,
                copyable: true,
              },
              {
                title: "Option",
                valueType: "option",
                render: () => [
                  <a key="query" onClick={() => handleRefresh(index)}>
                    Refresh
                  </a>,
                  <a
                    key="detail"
                    onClick={() => {
                      setCodeContent(task);
                      setShowCodeModal(true);
                    }}
                  >
                    Detail
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
        code={safeJsonStringify(codeContent, "Failed to stringify the code")}
      />
    </>
  );
};

export function ViduPage() {
  const appConfig = useAppConfig();
  const viduApi = new ViduAPI(appConfig.getFirstApiKey(api2Provider.Vidu));
  const [generationForm] = ProForm.useForm();
  const [upscaleForm] = ProForm.useForm();
  const [queryForm] = ProForm.useForm();

  const [taskData, setTaskData] = useState<ViduTaskGenerationResponse[]>([]);
  const [errorData, setErrorData] = useState<any>(null);

  const type_options = [
    { label: "Generate", value: "generate", icon: <UnorderedListOutlined /> },
    { label: "Upscale", value: "upscale", icon: <ExpandAltOutlined /> },
    { label: "Query", value: "query", icon: <FileTextOutlined /> },
  ];

  const [formType, setFormType] = useState<"generate" | "query" | "upscale">(
    "generate",
  );

  const updateTaskData = (data: ViduTaskGenerationResponse) => {
    const updatedTaskData = taskData.slice(); // 创建 taskData 的副本

    const index = updatedTaskData.findIndex(
      (c: ViduTaskGenerationResponse) => c.id === data.id,
    );

    if (index === -1) {
      // 如果 id 不存在，添加新数据
      updatedTaskData.push(data);
    } else {
      // 如果 id 已存在，更新数据
      updatedTaskData[index] = data;
    }

    setTaskData(updatedTaskData);
  };

  const RenderViduForms: { [key in typeof formType]: ReactNode } = {
    generate: (
      <GenerationForm
        form={generationForm}
        api={viduApi}
        updateResponse={updateTaskData}
        updateError={setErrorData}
      />
    ),
    upscale: (
      <UpscaleForm
        form={upscaleForm}
        api={viduApi}
        updateResponse={updateTaskData}
        updateError={setErrorData}
      />
    ),
    query: (
      <QueryForm
        form={queryForm}
        api={viduApi}
        updateResponse={updateTaskData}
        updateError={setErrorData}
      />
    ),
  };

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <Segmented
          value={formType}
          style={{ marginBottom: 20 }}
          options={type_options}
          block
          onChange={(value) => setFormType(value as typeof formType)}
        />
        {RenderViduForms[formType as keyof typeof RenderViduForms]}
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <h1>Tasks Info</h1>
        <ViduTaskRenderer
          task={taskData}
          api={viduApi}
          updateTask={updateTaskData}
          updateError={setErrorData}
        />

        {errorData && (
          <>
            <h1>Error</h1>
            {renderCode(safeJsonStringify(errorData, errorData.toString()))}
          </>
        )}
      </Col>
    </>
  );
}
