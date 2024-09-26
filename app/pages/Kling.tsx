import React, { useEffect, useState } from "react";
import {
  ProDescriptions,
  ProForm,
  ProFormInstance,
  ProFormItem,
  ProFormRadio,
  ProFormSelect,
  ProFormSlider,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS, SEGMENTED_PROPS } from "@/constant";
import { useAppConfig } from "@/app/store";
import { Alert, Col, Divider, App, Segmented, Descriptions, Button, Space } from "antd";
import { Kling, KlingApiTypes, KlingTask } from "@/app/providers/kling";
import { renderCode, RenderSubmitter } from "../render";
import { beforeUpload, safeJsonStringify } from "../utils";

const MODE_OPTIONS = [
  { label: "Std-标准模式（高性能）", value: "std" },
  { label: "Pro-专家模式（高表现）", value: "pro" },
];

const DURATION_OPTIONS = [
  { label: "5s", value: "5" },
  { label: "10s", value: "10" },
];

const TASK_TYPE_OPTIONS = [
  { label: "文生视频", value: "text2video" },
  { label: "图生视频", value: "image2video" },
  // { label: "图片生成", value: "generations", disabled: true },
  { label: "任务查询", value: "queryTask" },
];

const MODEL_OPTIONS = [{ label: "kling-v1", value: "kling-v1" }];

const KlingPage = () => {
  const { message, modal } = App.useApp();
  const appConfig = useAppConfig();
  const api = new Kling("sk-sFplfAcnWY3sFCCs02Ac93Ce9cEf4984A7EdF93e70969c18");

  const [taskType, setTaskType] = useState("text2video");
  const [klingText2VideoForm] = ProForm.useForm();
  const [klingImage2VideoForm] = ProForm.useForm();
  const [klingQueryTaskForm] = ProForm.useForm();

  const [taskData, setTaskData] = useState<KlingTask[]>([]);
  const [errorData, setErrorData] = useState<any>(null);

  // 更新任务数据
  const updateTaskData = (data: KlingTask) => {
    // 检查本地 id 是否已存在
    const index = taskData.findIndex((item) => item.id === data.id);
    // 检查 task_id 是否已存在
    const index2 = taskData.findIndex((item) => item.latest_task_info?.task_id === data.latest_task_info?.task_id);
    // 如果不存在，添加到末尾
    if (index === -1 && index2 === -1) {
      setTaskData((prev) => [...prev, data]);
    } else {
      // 如果已存在，则覆盖
      const targetIndex = index !== -1 ? index : index2;
      setTaskData((prev) => [...prev.slice(0, targetIndex), data, ...prev.slice(targetIndex + 1)]);
    }
  };

  const updateError = (error: any) => {
    setErrorData(error);
  };

  // 轮询任务，5秒一次
  useEffect(() => {
    const interval = setInterval(() => {
      if (taskData.length > 0) {
        api.pollTasks(taskData, updateTaskData);
      }
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskData]);

  const Text2VideoForm = (props: {
    form: ProFormInstance;
    api: Kling;
    updateTask: (data: KlingTask) => void;
    updateError: (error: any) => void;
  }) => {
    const selectedDuration = ProForm.useWatch("duration", props.form);
    const selectedMode = ProForm.useWatch("mode", props.form);
    const selectedCameraControlType = ProForm.useWatch(["camera_control", "type"], props.form);
    const selectedCameraControlConfig = ProForm.useWatch(["camera_control", "config"], props.form);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [submitting, setSubmitting] = useState(false);
    return (
      <ProForm<KlingApiTypes["generateText2VideoTask"]["req"]>
        {...PRO_FORM_PROPS}
        form={props.form}
        initialValues={{
          mode: "std",
          duration: "5",
          aspect_ratio: "16:9",
          model: "kling-v1",
          cfg_scale: 0.5,
        }}
        onFinish={async (values) => {
          const controller = new AbortController();
          setAbortController(controller);
          setSubmitting(true);
          controller.signal.addEventListener("abort", () => setSubmitting(false));
          try {
            const res = await props.api.callApi({
              callKey: "generateText2VideoTask",
              params: values,
              signal: controller?.signal,
            });
            props.updateTask(props.api.updateTask(res));
          } catch (e) {
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
        <ProFormSelect name={"model"} label={"Model"} options={MODEL_OPTIONS} />

        <ProFormSelect name={"mode"} label={"Mode"} options={MODE_OPTIONS} />
        <ProFormRadio.Group name={"duration"} label={"Duration"} options={DURATION_OPTIONS} />
        <ProFormRadio.Group
          name={"aspect_ratio"}
          label={"Aspect Ratio"}
          options={["16:9", "9:16", "1:1"]}
          tooltip={"生成视频的画面纵横比（宽:高）"}
        />
        <ProFormTextArea
          name={"prompt"}
          label={"Prompt"}
          rules={[{ required: true }, { type: "string", max: 2500 }]}
          fieldProps={{ autoSize: { minRows: 3 } }}
          tooltip={"正向文本提示"}
        />
        <ProFormTextArea
          name={"negative_prompt"}
          label={"Negative Prompt"}
          rules={[{ type: "string", max: 2500 }]}
          fieldProps={{ autoSize: { minRows: 2 } }}
          tooltip={"负向文本提示，用于排除不需要的元素或风格"}
        />
        <ProFormSlider
          name={"cfg_scale"}
          label={"Cfg Scale"}
          min={0}
          max={1}
          step={0.01}
          marks={{ 0: "0", 0.25: "0.25", 0.5: "0.5", 0.75: "0.75", 1: "1" }}
          tooltip={"生成视频的自由度，值越大，模型自由度越小，与用户输入的提示词相关性越强"}
        />

        {selectedDuration === "5" && selectedMode === "std" && (
          <>
            <Divider />

            <ProForm.Group
              title={"Camera Control"}
              tooltip={
                "控制摄像机运动的协议，可选，未指定则智能匹配，截止 20240809：仅5s&高性能std的情况下支持镜头控制，其他情况不支持"
              }
            >
              <ProFormSelect
                name={["camera_control", "type"]}
                label={"Type"}
                options={[
                  { label: "Simple", value: "simple" },
                  { label: "Down Back", value: "down_back" },
                  { label: "Forward Up", value: "forward_up" },
                  { label: "Right Turn Forward", value: "right_turn_forward" },
                  { label: "Left Turn Forward", value: "left_turn_forward" },
                ]}
                tooltip={
                  <>
                    <span>预定义的运镜类型</span>
                    <ul
                      style={{
                        fontSize: "0.9em",
                        padding: "0 0 0 15px",
                        margin: "5px 0",
                      }}
                    >
                      <li>
                        Simple: 简单运镜，可在<code>config</code>
                        中六选一（即只能有一个参数不为0，其余参���为0 ）进行运镜，其他类型下<code>config</code>
                        参数无需填写
                      </li>
                      <li> Down Back:镜头下压后退➡️下移拉远</li>
                      <li>Forward Up: 镜头前进上仰➡️推进上移</li>
                      <li>Right Turn Forward: 先右旋转后前进➡️右旋推进</li>
                      <li>Left Turn Forward: 先左旋并前进➡️左旋推进</li>
                    </ul>
                  </>
                }
                width={"md"}
              />
              {selectedCameraControlType === "simple" && (
                <>
                  {Object.values(selectedCameraControlConfig || {}).filter((value) => value !== 0).length !== 1 && (
                    <ProFormItem>
                      <Alert type="warning" showIcon message="简单运镜只能有一个参数不为 0" />
                    </ProFormItem>
                  )}
                  <ProFormSlider
                    name={["camera_control", "config", "horizontal"]}
                    label={"Horizontal"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"水平运镜，控制摄像机在水平方向上的移动量（沿x轴平移）"}
                  />
                  <ProFormSlider
                    name={["camera_control", "config", "vertical"]}
                    label={"Vertical"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"垂直运镜，控制摄像机在垂直方向上的移动量（沿y轴平移）"}
                  />

                  <ProFormSlider
                    name={["camera_control", "config", "pan"]}
                    label={"Pan"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"水平摇镜，控制摄像机在水平方向上的旋转量（沿x轴旋转）"}
                  />
                  <ProFormSlider
                    name={["camera_control", "config", "tilt"]}
                    label={"Tilt"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"垂直摇镜，控制摄像机在垂直方向上的旋转量（沿y轴旋转）"}
                  />
                  <ProFormSlider
                    name={["camera_control", "config", "roll"]}
                    label={"Roll"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"旋转运镜，控制摄像机的滚动量（绕z轴旋转）"}
                  />
                  <ProFormSlider
                    name={["camera_control", "config", "zoom"]}
                    label={"Zoom"}
                    min={-10}
                    max={10}
                    step={0.1}
                    marks={{
                      [-10]: "-10",
                      0: "0",
                      10: "10",
                    }}
                    initialValue={0}
                    tooltip={"变焦，控制摄像机的焦距变化，影响视野的远近"}
                  />
                </>
              )}
            </ProForm.Group>
            <Divider />
          </>
        )}
        <ProFormText
          name={"callback_url"}
          label={"Callback URL"}
          rules={[
            {
              type: "url",
              warningOnly: true,
            },
          ]}
          tooltip={"本次任务结果回调通知地址"}
        />
      </ProForm>
    );
  };

  const Image2VideoForm = (props: {
    form: ProFormInstance;
    api: Kling;
    updateTask: (data: KlingTask) => void;
    updateError: (error: any) => void;
  }) => {
    const [uploadType, setUploadType] = useState<"base64" | "url">("base64");
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [submitting, setSubmitting] = useState(false);

    return (
      <ProForm<KlingApiTypes["generateImage2VideoTask"]["req"]>
        {...PRO_FORM_PROPS}
        form={props.form}
        initialValues={{
          model: "kling-v1",
          mode: "std",
          duration: "5",
          cfg_scale: 0.5,
        }}
        onFinish={async (values) => {
          const controller = new AbortController();
          setAbortController(controller);
          setSubmitting(true);
          controller.signal.addEventListener("abort", () => setSubmitting(false));
          try {
            const res = await props.api.callApi({
              callKey: "generateImage2VideoTask",
              params: values,
              signal: controller?.signal,
            });
            props.updateTask(props.api.updateTask(res));
          } catch (e) {
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
        <ProFormSelect name="model" label="Model" options={MODEL_OPTIONS} />
        <ProFormSelect name="mode" label="Mode" options={MODE_OPTIONS} />
        <ProFormRadio.Group name="duration" label="Duration" options={DURATION_OPTIONS} />
        <Divider />
        <ProForm.Group title={"Upload"}>
          {/* 这个只作为展示，不是表单项 */}
          <ProFormRadio.Group
            label="Upload Type"
            options={[
              { label: "Base64", value: "base64" },
              // TODO: 支持url上传，目前接口维护，后续开放
              { label: "URL", value: "url", disabled: true },
            ]}
            fieldProps={{
              value: uploadType,
              onChange: (e) => {
                // 当上传类型改变时，清空图片和图片尾帧当上传类型改变时，清空图片和图片尾帧
                props.form.resetFields(["image", "image_tail"]);
                setUploadType(e.target.value);
              },
            }}
            tooltip={"上传图片的方式，支持base64和url两种方式"}
          />
          <br />
          <ProFormUploadButton
            name="image"
            label="Image"
            accept=".jpg,.jpeg,.png"
            max={1}
            rules={[{ required: true }]}
            tooltip={
              <>
                <p>支持传入图片Base64编码或图片URL（确保可访问）</p>
                <p>图片格式支持.jpg / .jpeg / .png</p>
                <p>图片文件大小不能超过10MB，图片分辨率不小于300*300px</p>
              </>
            }
            action={uploadType === "url" ? appConfig.getUploadConfig().action : undefined}
            fieldProps={{
              listType: "picture-card",
              beforeUpload: async (file) =>
                await beforeUpload(
                  file,
                  [-1, 10],
                  [
                    [300, 300],
                    [-1, -1],
                  ],
                  (msg) => message.error(msg),
                ),
              ...(uploadType === "url" && {
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
              }),
            }}
            transform={(value: Array<{ thumbUrl: string; url: string }> | undefined) => {
              if (!value) {
                return undefined;
              }
              if (uploadType === "base64") {
                return value?.[0]?.thumbUrl.replace(/^data:image\/\w+;base64,/, "");
              } else {
                return value?.[0]?.url;
              }
            }}
          />

          <ProFormUploadButton
            name="image_tail"
            label="Image Tail"
            accept=".jpg,.jpeg,.png"
            max={1}
            tooltip={
              <>
                <p>支持传入图片Base64编码或图片URL（确保可访问）</p>
                <p>图片格式支持.jpg / .jpeg / .png</p>
                <p>图片文件大小不能超过10MB，图片分辨率不小于300*300px</p>
              </>
            }
            action={uploadType === "url" ? appConfig.getUploadConfig().action : undefined}
            fieldProps={{
              listType: "picture-card",
              beforeUpload: async (file) =>
                await beforeUpload(
                  file,
                  [-1, 10],
                  [
                    [300, 300],
                    [-1, -1],
                  ],
                  (msg) => message.error(msg),
                ),
              ...(uploadType === "url" && {
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
              }),
            }}
            transform={(value: Array<{ thumbUrl: string; url: string }> | undefined) => {
              if (!value) {
                return undefined;
              }
              if (uploadType === "base64") {
                return value?.[0]?.thumbUrl.replace(/^data:image\/\w+;base64,/, "");
              } else {
                return value?.[0]?.url;
              }
            }}
          />
        </ProForm.Group>
        <Divider />
        <ProFormTextArea
          name="prompt"
          label="Prompt"
          rules={[
            {
              type: "string",
              max: 2500,
            },
          ]}
          fieldProps={{ autoSize: { minRows: 3 } }}
        />
        <ProFormTextArea
          name="negative_prompt"
          label="Negative Prompt"
          rules={[
            {
              type: "string",
              max: 2500,
            },
          ]}
          fieldProps={{ autoSize: { minRows: 2 } }}
        />
        <ProFormSlider
          name="cfg_scale"
          label="Cfg Scale"
          min={0}
          max={1}
          step={0.01}
          marks={{
            0: "0",
            0.25: "0.25",
            0.5: "0.5",
            0.75: "0.75",
            1: "1",
          }}
        />
        <ProFormText
          name="callback_url"
          label="Callback URL"
          rules={[
            {
              type: "url",
              warningOnly: true,
            },
          ]}
        />
      </ProForm>
    );
  };

  const QueryTaskForm = (props: {
    form: ProFormInstance;
    api: Kling;
    updateTask: (data: KlingTask) => void;
    updateError: (error: any) => void;
  }) => {
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [submitting, setSubmitting] = useState(false);
    return (
      <ProForm<KlingApiTypes["queryTask"]["endpoint_params"]>
        {...PRO_FORM_PROPS}
        form={props.form}
        initialValues={{
          task_id: "",
          action: "videos",
          action2: "text2video",
        }}
        onFinish={async (values) => {
          const controller = new AbortController();
          setAbortController(controller);
          setSubmitting(true);
          controller.signal.addEventListener("abort", () => setSubmitting(false));
          try {
            const res = await props.api.callApi({
              callKey: "queryTask",
              endpoint_params: {
                action: values.action,
                action2: values.action2,
                task_id: values.task_id,
              },
              signal: controller?.signal,
            });
            props.updateTask(props.api.updateTask(res));
          } catch (error) {
            props.updateError(error);
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
        <ProFormRadio.Group
          name={"action"}
          label={"目标类型"}
          options={[
            { label: "视频", value: "videos" },
            { label: "图片", value: "images", disabled: true },
          ]}
        />
        <ProFormRadio.Group
          name={"action2"}
          label={"任务类型"}
          options={[
            { label: "文生视频", value: "text2video" },
            { label: "图生视频", value: "image2video" },
            { label: "图片生成", value: "generations", disabled: true },
          ]}
        />
        <ProFormText name={"task_id"} label={"任务ID"} rules={[{ required: true }, { type: "string" }]} />
      </ProForm>
    );
  };

  return (
    <>
      <Col flex="360px" style={COL_SCROLL_STYLE}>
        <Segmented {...SEGMENTED_PROPS} options={TASK_TYPE_OPTIONS} value={taskType} onChange={setTaskType} />
        {taskType === "text2video" && (
          <Text2VideoForm form={klingText2VideoForm} api={api} updateTask={updateTaskData} updateError={setErrorData} />
        )}
        {taskType === "image2video" && (
          <Image2VideoForm
            form={klingImage2VideoForm}
            api={api}
            updateTask={updateTaskData}
            updateError={setErrorData}
          />
        )}
        {taskType === "queryTask" && (
          <QueryTaskForm form={klingQueryTaskForm} api={api} updateTask={updateTaskData} updateError={setErrorData} />
        )}
        <Divider />
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        {taskData?.map((task, index) => (
          <ProDescriptions<KlingTask>
            key={index}
            title={`任务 ${index + 1}`}
            style={{ marginBottom: 24 }}
            bordered
            dataSource={task}
            column={1}
            size={"small"}
            columns={[
              {
                title: "任务ID",
                dataIndex: ["latest_task_info", "task_id"],
                copyable: true,
              },
              {
                title: "请求信息",
                render: (_, record) => {
                  return (
                    <Space>
                      <Button
                        size={"small"}
                        onClick={() => {
                          modal.info({
                            title: "原始请求信息",
                            content: (
                              <div
                                style={{
                                  maxHeight: "70vh",
                                  overflow: "auto",
                                }}
                              >
                                <b>Request:</b>
                                {renderCode(safeJsonStringify(record.original_fetch_info.request), undefined)}
                                <Divider />
                                <b>Response:</b>
                                {renderCode(safeJsonStringify(record.original_fetch_info.response), undefined)}
                              </div>
                            ),
                            width: "80vw",
                          });
                        }}
                      >
                        原始
                      </Button>
                      <Button
                        size={"small"}
                        onClick={() => {
                          modal.info({
                            title: "最新请求信息",
                            content: (
                              <div
                                style={{
                                  maxHeight: "70vh",
                                  overflow: "auto",
                                }}
                              >
                                <b>Request:</b>
                                {renderCode(safeJsonStringify(record.latest_fetch_info.request), undefined, true)}
                                <Divider />
                                <b>Response:</b>
                                {renderCode(safeJsonStringify(record.latest_fetch_info.response), undefined, true)}
                              </div>
                            ),
                            width: "80vw",
                          });
                        }}
                      >
                        最新
                      </Button>
                    </Space>
                  );
                },
              },
              {
                title: "任务状态",
                dataIndex: ["latest_task_info", "task_status"],
                valueEnum: {
                  processing: { text: "Processing", status: "Processing" },
                  submitted: { text: "Submitted", status: "Processing" },
                  succeed: { text: "Succeed", status: "Success" },
                  failed: { text: "Failed", status: "Error" },
                },
              },
              {
                title: "创建时间",
                dataIndex: ["latest_task_info", "created_at"],
                valueType: "dateTime",
              },
              {
                title: "更新时间",
                dataIndex: ["latest_task_info", "updated_at"],
                valueType: "dateTime",
              },
              {
                title: "预览",
                render: (_, record) => {
                  if (record?.latest_task_info?.task_result?.videos?.[0]?.url) {
                    return (
                      <video
                        src={record.latest_task_info.task_result.videos[0].url}
                        controls
                        style={{ maxWidth: 320, maxHeight: 240 }}
                      />
                    );
                  }
                  return null;
                },
              },
            ]}
          />
        ))}
      </Col>
    </>
  );
};

export default KlingPage;
