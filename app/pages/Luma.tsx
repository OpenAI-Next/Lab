// app/pages/Luma.tsx

import React, { useState } from "react";
import {
  FormInstance,
  ProDescriptions,
  ProForm,
  ProFormRadio,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import { handelResponseError, safeJsonStringify } from "@/app/utils";
import { CodeModal, renderCode, RenderSubmitter } from "@/app/render";
import { useAppConfig } from "@/app/store";
import { Col, Divider, Empty, Image, Segmented, Spin } from "antd";
import { AccountType, LumaApi, LumaExtendTaskRequest, LumaGenerationTaskRequest } from "@/app/client/Luma";
import { ExpandAltOutlined, FileTextOutlined, UnorderedListOutlined } from "@ant-design/icons";

// const luma_generations_response_example = {
//     "id": "66bcb5f6-7c32-449d-9742-d5b6a3fc69d2",
//     "prompt": "小猫",
//     "state": "pending",
//     "created_at": "2024-07-26T08:35:54.731114Z",
//     "video": null,
//     "liked": null,
//     "estimate_wait_seconds": null,
//     "thumbnail": null,
//     "last_frame": null,
//     "server_id": "e9c19de3-bf11-43aa-991d-f42d5894cf3c"
// } as LumaGenerationTaskResponse
//
// const luma_query_response_example = {
//     "id": "66bcb5f6-7c32-449d-9742-d5b6a3fc69d2",
//     "prompt": "小猫",
//     "state": "completed",
//     "created_at": "2024-07-26T08:35:54.731000Z",
//     "video": {
//         "url": "https://filesystem.site/cdn/20240726/MFwOo74O9tK3j3462o7gPCDW7SqHcc.mp4",
//         "width": 1360,
//         "height": 752
//     },
//     "liked": null,
//     "estimate_wait_seconds": null,
//     "thumbnail": {
//         "url": "https://storage.cdn-luma.com/dream_machine/bdb20025-68de-4e20-8f52-5dbe59a083ce/video_1_thumb.jpg",
//         "width": 1360,
//         "height": 752
//     },
//     "last_frame": {
//         "url": "https://storage.cdn-luma.com/dream_machine/bdb20025-68de-4e20-8f52-5dbe59a083ce/video_1_last_frame.jpg",
//         "width": 1360,
//         "height": 752
//     }
// } as LumaQueryTaskResponse

interface LumaGenerationTaskResponse {
  id: string;
  prompt: string;
  state: "pending" | "processing" | "completed";
  created_at: string;
  video: {
    url: string;
    width: number;
    height: number;
  } | null;
  liked: any;
  estimate_wait_seconds: any;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  } | null;
  last_frame: {
    url: string;
    width: number;
    height: number;
  } | null;
  server_id: string;
}

type LumaQueryTaskResponse = Omit<LumaGenerationTaskResponse, "server_id">;

const LumaGenerateForm = (props: {
  accountType: AccountType;
  form: FormInstance;
  api: LumaApi;
  updateTask: (task: LumaQueryTaskResponse) => void;
  updateError: (error: any) => void;
}) => {
  const appConfig = useAppConfig();

  const [submitting, setSubmitting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  return (
    <ProForm<LumaGenerationTaskRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.generateLumaTask(values, props.accountType, controller.signal);
          if (res.ok) {
            const resJson = (await res.json()) as LumaGenerationTaskResponse;
            props.updateTask(resJson);
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
      initialValues={{
        aspect_ratio: "16:9",
        expand_prompt: true,
      }}
    >
      <ProFormTextArea name={"user_prompt"} label={"User Prompt"} rules={[{ required: true }]} />
      <ProFormRadio.Group
        name={"aspect_ratio"}
        label={"Aspect Ratio"}
        options={["16:9"]}
        rules={[{ required: true }]}
      />
      <ProFormSwitch name={"expand_prompt"} label={"Expand Prompt"} rules={[{ required: true }]} />

      <ProFormUploadButton
        name={"image_url"}
        label={"Image URL"}
        tooltip={"Start frame picture"}
        accept={"image/*"}
        {...appConfig.getProFormUploadConfig("url", 1, "picture-card")}
      />

      <ProFormUploadButton
        name={"image_end_url"}
        label={"Image End URL"}
        tooltip={"End frame image, key frame"}
        accept={"image/*"}
        {...appConfig.getProFormUploadConfig("url", 1, "picture-card")}
      />
    </ProForm>
  );
};

const LumaExtendForm = (props: {
  accountType: AccountType;
  form: FormInstance;
  api: LumaApi;
  updateTask: (task: LumaQueryTaskResponse) => void;
  updateError: (error: any) => void;
}) => {
  const appConfig = useAppConfig();

  const [submitting, setSubmitting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  return (
    <ProForm<LumaExtendTaskRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.lumaExtendTask(values, props.accountType, controller.signal);
          if (res.ok) {
            const resJson = await res.json();
            props.updateTask(resJson);
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
      initialValues={{
        aspect_ratio: "16:9",
        expand_prompt: true,
      }}
    >
      <ProFormTextArea name={"user_prompt"} label={"User Prompt"} rules={[{ required: true }]} />
      <ProFormRadio.Group
        name={"aspect_ratio"}
        label={"Aspect Ratio"}
        options={["16:9"]}
        rules={[{ required: true }]}
      />
      <ProFormSwitch name={"expand_prompt"} label={"Expand Prompt"} rules={[{ required: true }]} />
      <ProFormUploadButton
        name={"image_end_url"}
        label={"Image End URL"}
        accept={"image/*"}
        {...appConfig.getProFormUploadConfig("url", 1, "picture-card")}
      />
      <ProFormUploadButton
        name={"video_url"}
        label={"Video URL"}
        accept={"video/*"}
        {...appConfig.getProFormUploadConfig("url", 1, "picture-card")}
        rules={[{ required: true }]}
      />
    </ProForm>
  );
};

const LumaQueryForm = (props: {
  accountType: AccountType;
  form: FormInstance;
  api: LumaApi;
  updateTask: (task: any) => void;
  updateError: (error: any) => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  return (
    <ProForm<{ id: string }>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        props.updateTask(undefined);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.queryLumaTask(values, props.accountType, controller.signal);
          if (res.ok) {
            const resJson = await res.json();
            props.updateTask(resJson);
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
      <ProFormText name={"id"} label={"ID"} rules={[{ required: true }]} />
    </ProForm>
  );
};

const LumaTaskRenderer = (props: {
  accountType: AccountType;
  task: LumaQueryTaskResponse[];
  api: LumaApi;
  updateTask: (task: LumaQueryTaskResponse) => void;
  updateError: (error: any) => void;
}) => {
  const [loadingStates, setLoadingStates] = useState<{
    [key: number]: boolean;
  }>({ 0: false, 1: false });
  const [showCodeModal, setShowCodeModal] = useState(false);

  if (!props.task || props.task.length === 0) return <Empty />;

  const handleRefresh = async (index: number) => {
    setLoadingStates((prevStates) => ({ ...prevStates, [index]: true }));

    try {
      const res = await props.api.queryLumaTask({ id: props.task[index].id }, props.accountType);
      if (res.ok) {
        const resJson = (await res.json()) as LumaQueryTaskResponse;
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
          <ProDescriptions
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
                title: "State",
                dataIndex: ["state"],
                valueEnum: {
                  completed: { text: "completed", status: "Success" },
                  pending: { text: "Pending", status: "Processing" },
                  processing: { text: "processing", status: "Processing" },
                },
              },
              {
                title: "created_at",
                dataIndex: ["created_at"],
              },
              {
                title: "Prompt",
                dataIndex: ["prompt"],
                copyable: true,
              },
              {
                title: "Video URL",
                render: (_, record) => record.video?.url,
              },
              {
                title: "Video Preview",
                key: "video_render",
                render: (_dom, record) => {
                  if (record?.video?.url) {
                    return <video src={record.video.url} controls style={{ maxWidth: 240 }} />;
                  }
                },
              },
              {
                title: "Thumbnail URL",
                dataIndex: ["thumbnail"],
                render: (_, record) => record.thumbnail?.url,
              },
              {
                title: "Thumbnail Preview",
                key: "thumbnail_render",
                render: (_dom, record) => {
                  if (record?.thumbnail?.url) {
                    return <Image src={record.thumbnail.url} alt={record.id} style={{ maxWidth: 240 }} />;
                  }
                  return null;
                },
              },
              {
                title: "Last Frame URL",
                render: (_, record) => record.last_frame?.url,
              },
              {
                title: "Last Frame Preview",
                key: "last_frame_render",
                render: (_dom, record) => {
                  if (record?.last_frame?.url) {
                    return <Image src={record.last_frame.url} alt={record.id} style={{ maxWidth: 240 }} />;
                  }
                  return null;
                },
              },
              {
                title: "操作",
                valueType: "option",
                render: () => [
                  <a key="query" onClick={() => handleRefresh(index)}>
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
      ))}
      <CodeModal
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        code={safeJsonStringify(props.task, props.task.toString())}
      />
    </>
  );
};

const LumaPage = () => {
  const appConfig = useAppConfig();
  const lumaApi = new LumaApi(appConfig.getApiKey());
  const [accountType, setAccountType] = useState<AccountType>("relax");

  const operate_type_options = [
    { label: "Create", value: "create", icon: <UnorderedListOutlined /> },
    { label: "Extend", value: "extend", icon: <ExpandAltOutlined /> },
    { label: "Query", value: "query", icon: <FileTextOutlined /> },
  ];

  const [operateType, setOperateType] = useState<"create" | "extend" | "query">("create");

  const [lumaCreateForm] = ProForm.useForm();
  const [lumaExtendForm] = ProForm.useForm();
  const [lumaQueryForm] = ProForm.useForm();

  const [taskData, setTaskData] = useState<LumaQueryTaskResponse[]>([]);
  const [errorData, setErrorData] = useState<any>(null);

  const updateTask = (task: LumaQueryTaskResponse) => {
    if (!task) return;
    // 如果这个 id 已经存在于taskData,那么更新这个 id 的数据,否则插入taskData
    const index = taskData!.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      setTaskData((prevData) => {
        if (!prevData) return [task];
        const newData = [...prevData];
        newData[index] = task;
        return newData;
      });
    } else {
      setTaskData((prevData) => [...(prevData ?? []), task]);
    }
  };

  const updateError = (error: any) => setErrorData(error);

  return (
    <>
      <Col flex="340px" style={COL_SCROLL_STYLE}>
        <Segmented
          style={{ marginBottom: 20 }}
          options={operate_type_options}
          block
          onChange={(value) => setOperateType(value as "create" | "query")}
          value={operateType}
        />

        <ProForm layout={"vertical"} submitter={false}>
          <ProFormRadio.Group
            label={"Account Type"}
            rules={[{ required: true }]}
            options={[
              { label: "Luma Relax", value: "relax" },
              { label: "Luma VIP", value: "vip" },
            ]}
            fieldProps={{
              value: accountType,
              onChange: (e) => setAccountType(e.target.value),
            }}
            radioType="button"
          />
        </ProForm>

        <Divider />

        {operateType === "create" && (
          <LumaGenerateForm
            accountType={accountType}
            form={lumaCreateForm}
            api={lumaApi}
            updateTask={updateTask}
            updateError={updateError}
          />
        )}

        {operateType === "query" && (
          <LumaQueryForm
            accountType={accountType}
            form={lumaQueryForm}
            api={lumaApi}
            updateTask={updateTask}
            updateError={updateError}
          />
        )}

        {operateType === "extend" && (
          <LumaExtendForm
            accountType={accountType}
            form={lumaExtendForm}
            api={lumaApi}
            updateTask={updateTask}
            updateError={updateError}
          />
        )}
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <h1>Task Data</h1>
        <LumaTaskRenderer
          accountType={accountType}
          api={lumaApi}
          task={taskData}
          updateTask={updateTask}
          updateError={updateError}
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
};

export default LumaPage;
