// app/pages/Pika.tsx

import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import { Col, Divider, Empty, Image, Segmented, Spin } from "antd";
import React, { useState } from "react";
import { ProDescriptions, ProForm, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components";
import { api2Provider, useAppConfig } from "@/app/store";
import {
  CreatePikaTaskRequest,
  CreatePikaTaskResponse,
  PikaAPI,
  QueryPikaTaskRequest,
  QueryPikaTaskResponse,
} from "@/app/client/pika";
import { FileTextOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { CodeModal, renderCode, RenderSubmitter } from "@/app/render";
import { handelResponseError, safeJsonStringify } from "@/app/utils";

export interface PikaTask extends QueryPikaTaskResponse {
  // 查询所需要的 id 格式为 xxx|yyy，其中 xxx 为 “preId”
  preId: string;
}

export const NEW_PIKA_TASK: PikaTask = {
  preId: "",
  url: {
    success: true,
    data: {
      results: [
        {
          id: "",
          promptText: "",
          params: {
            options: {
              aspectRatio: 0,
              frameRate: 0,
              camera: {
                zoom: null,
                pan: null,
                tilt: null,
                rotate: null,
              },
              parameters: {
                motion: 0,
                guidanceScale: 0,
                negativePrompt: "",
                seed: null,
              },
              extend: false,
            },
            userId: "",
            promptText: "",
            sfx: false,
            styleId: null,
          },
          adjusted: false,
          upscaled: false,
          extended: 0,
          hasSfx: false,
          lipSynced: false,
          videos: [
            {
              id: "",
              status: "",
              seed: 0,
              resultUrl: "",
              videoPoster: "",
              imageThumb: "",
              duration: 0,
              feedback: 0,
              favorited: false,
              folders: [],
            },
          ],
        },
      ],
    },
  },
};

const PikaCreateForm = (props: {
  form: any;
  api: PikaAPI;
  updateTask: (task: PikaTask | undefined) => void;
  updateError: (error: any) => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  return (
    <ProForm<CreatePikaTaskRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        props.updateTask(undefined);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.createPikaTask(values, controller.signal);
          if (res.ok) {
            const resJson = await res.json();
            const task = { ...NEW_PIKA_TASK };
            task.preId = (resJson as CreatePikaTaskResponse).id.split("|")[0];
            task.url.data && task.url.data.results[0] && (task.url.data.results[0].promptText = values.prompt);
            task.url.data &&
              task.url.data.results[0] &&
              (task.url.data.results[0].id = (resJson as CreatePikaTaskResponse).id);
            props.updateTask(task);
            props.form.resetFields();
          } else {
            await handelResponseError(res, props.updateError);
          }
        } catch (e) {
          if (e instanceof Error) {
            props.updateError(e.message);
          } else {
            props.updateError(String(e));
          }
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
      <ProFormSelect name={"model"} label={"Model"} options={["pika-video"]} rules={[{ required: true }]} />

      <ProFormTextArea name={"prompt"} label={"Prompt"} rules={[{ required: true }]} />
    </ProForm>
  );
};

const PikaQueryForm = (props: {
  form: any;
  api: PikaAPI;
  updateTask: (task: PikaTask | undefined) => void;
  updateError: (error: any) => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  return (
    <ProForm<QueryPikaTaskRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.queryPikaTask(values, controller.signal);
          if (res.ok) {
            const resJson = await res.json();
            props.updateTask({
              preId: values.id.split("|")[0],
              ...(resJson as QueryPikaTaskResponse),
            });
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
      <ProFormSelect name={"model"} label={"Model"} options={["pika-video"]} rules={[{ required: true }]} />
      <ProFormTextArea
        name={"id"}
        label={"ID"}
        fieldProps={{ autoSize: { minRows: 3, maxRows: 4 } }}
        rules={[{ required: true }]}
      />
    </ProForm>
  );
};

const PikaTaskRenderer = (props: {
  task: PikaTask | undefined;
  api: PikaAPI;
  updateTask: (task: PikaTask) => void;
  updateError: (error: any) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  if (!props.task) return <Empty />;

  // preId 是为了方便查询才加上的，实际接口中并没有这个字段
  const { preId, ...originalTask } = props.task;

  const handleRefresh = async () => {
    if (!props?.task?.url?.data?.results?.[0]?.id || !props?.task?.preId) {
      props.updateError("Task ID or Pre ID is empty");
      return;
    } else {
      props.updateError(null);
    }

    setLoading(true);
    try {
      const data: QueryPikaTaskRequest = {
        // FIXME：这里的模型名称暂时写死了，如果未来有新增模型，需要修改这里
        model: "pika-video",
        id: [props.task?.preId, props.task?.url?.data?.results?.[0]?.id].join("|"),
      };
      const res = await props.api.queryPikaTask(data);

      if (res.ok) {
        const resJson = (await res.json()) as QueryPikaTaskResponse;
        if (resJson.url.success) {
          props.updateTask({
            preId: data.id.split("|")[0],
            ...(resJson as QueryPikaTaskResponse),
          });
        } else {
          props.updateError(resJson);
        }
      } else {
        await handelResponseError(res, props.updateError);
      }
    } catch (e) {
      props.updateError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Spin spinning={loading}>
        <ProDescriptions
          title={"Task 1"}
          dataSource={props?.task?.url?.data?.results[0]}
          column={1}
          bordered
          size={"small"}
          columns={[
            {
              title: "Task ID",
              dataIndex: ["id"],
              copyable: true,
            },
            {
              title: "Status",
              dataIndex: ["videos", 0, "status"],
              valueEnum: {
                finished: { text: "Finished", status: "Success" },
                pending: { text: "Pending", status: "Processing" },
                submitted: { text: "Submitted", status: "Processing" },
              },
            },
            {
              title: "Progress",
              dataIndex: ["videos", 0, "progress"],
              valueType: "progress",
              // tooltip: "Only visible when status is Pending",
            },
            {
              title: "Seed",
              dataIndex: ["videos", 0, "seed"],
              copyable: true,
            },
            {
              title: "Prompt Text",
              dataIndex: ["promptText"],
              copyable: true,
            },
            {
              title: "Result Url",
              dataIndex: ["videos", 0, "resultUrl"],
              copyable: true,
            },
            {
              title: "Video Preview",
              key: "video_render",
              render: (_dom, record) => {
                if (record?.videos?.[0]?.resultUrl) {
                  return <video src={record.videos[0].resultUrl} controls style={{ maxWidth: 240 }} />;
                }
              },
            },
            {
              title: "Video Poster",
              dataIndex: ["videos", 0, "videoPoster"],
              copyable: true,
            },
            {
              title: "Poster Preview",
              key: "image_render",
              render: (_dom, record) => {
                if (record?.videos?.[0]?.videoPoster) {
                  return <Image src={record.videos[0].videoPoster} alt={record.id} style={{ maxWidth: 240 }} />;
                }
              },
            },
            {
              title: "Duration",
              dataIndex: ["videos", 0, "duration"],
              // valueType: "second",
            },
            {
              title: "操作",
              valueType: "option",
              render: () => [
                <a key="query" onClick={() => handleRefresh()}>
                  Refresh
                </a>,
                <a key="code" onClick={() => setShowCodeModal(true)}>
                  Code
                </a>,
              ],
            },
          ]}
        />
      </Spin>
      <CodeModal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        code={JSON.stringify(originalTask, null, 2)}
      />
    </>
  );
};

const PikaPage = () => {
  const appConfig = useAppConfig();
  const pikaApi = new PikaAPI(appConfig.getFirstApiKey(api2Provider.Pika));
  const [pikaCreateForm] = ProForm.useForm();
  const [pikaQueryForm] = ProForm.useForm();

  const [taskData, setTaskData] = useState<PikaTask>();
  const [errorData, setErrorData] = useState<any>(null);

  // Pika 直接覆盖，不使用增量更新
  const updateTask = (res: PikaTask | undefined) => setTaskData(res);

  const updateError = (error: any) => setErrorData(error);

  const type_options = [
    { label: "Create", value: "create", icon: <UnorderedListOutlined /> },
    { label: "Query", value: "query", icon: <FileTextOutlined /> },
  ];

  const [formType, setFormType] = useState<(typeof type_options)[0]["value"]>(type_options[0]["value"]);

  const renderForms = {
    create: <PikaCreateForm form={pikaCreateForm} api={pikaApi} updateTask={updateTask} updateError={updateError} />,
    query: <PikaQueryForm form={pikaQueryForm} api={pikaApi} updateTask={updateTask} updateError={updateError} />,
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
        {renderForms[formType as keyof typeof renderForms]}
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <h1>Task Data</h1>
        <PikaTaskRenderer task={taskData} api={pikaApi} updateTask={updateTask} updateError={updateError} />
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

export default PikaPage;
