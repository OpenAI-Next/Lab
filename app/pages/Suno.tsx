// PATH: app/components/suno.tsx
import {
  ProDescriptions,
  ProForm,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from "@ant-design/pro-components";
import { App, Avatar, Button, Col, Divider, Empty, Image, Segmented, Spin, Typography } from "antd";
import { COL_SCROLL_STYLE, PRO_FORM_PROPS } from "@/constant";
import {
  SunoAPI,
  SunoClip,
  SunoGenerateRequest,
  SunoGenerateResponse,
  SunoQueryRequest,
  SunoQueryResponse,
  SunoUploadRequest,
  SunoUploadResponse,
} from "@/app/client/sunoProxy";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  CloudUploadOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  HighlightOutlined,
  TagsOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { CloseAllSound, handelResponseError, safeJsonStringify } from "@/app/utils";
import { CodeModal, QuickFillStyleModal, renderCode, RenderSubmitter } from "@/app/render";
import { useAppConfig } from "@/app/store";

const SunoGenerateForm = (props: {
  form: ProFormInstance<SunoGenerateRequest>;
  api: SunoAPI;
  updateResponse: (data: SunoClip[]) => void;
  updateError: (error: any) => void;
}) => {
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isMakeInstrumental = ProForm.useWatch("make_instrumental", props.form);
  const inputContinueClipId = ProForm.useWatch("continue_clip_id", props.form);
  const isExtend = inputContinueClipId !== undefined && inputContinueClipId !== "";
  const promptContent = ProForm.useWatch("prompt", props.form);

  const [makingLyrics, setMakingLyrics] = useState(false);

  const [showQuickFillModal, setShowQuickFillModal] = useState(false);

  // 继续创作需要使用自定义模式
  useEffect(() => {
    isExtend && setCustomMode(true);
  }, [isExtend]);

  return (
    <>
      <ProForm<SunoGenerateRequest>
        {...PRO_FORM_PROPS}
        form={props.form}
        onFinish={async (values) => {
          if (!values.prompt) values.prompt = "";
          props.updateError(null);
          const controller = new AbortController();
          setAbortController(controller);
          setSubmitting(true);
          try {
            const res = await props.api.generate(values, controller.signal);
            if (res.ok) {
              const resJson = (await res.json()) as SunoGenerateResponse;
              props.updateResponse(resJson.clips);
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
          mv: "chirp-v3-5",
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
        <ProFormSwitch
          label={"Custom Mode"}
          fieldProps={{
            checked: customMode,
            onChange: (v) => setCustomMode(v),
          }}
        />

        <Divider />

        <ProFormSelect
          name={"mv"}
          label={"Model Version"}
          tooltip={"If continuing to write user-uploaded music, please select model suffix with '-upload'."}
          options={["chirp-v3-5", "chirp-v3-5-upload", "chirp-v3-0", "chirp-v2-xxl-alpha"]}
          rules={[{ required: true }]}
          allowClear={false}
        />

        <ProFormSwitch
          name={"make_instrumental"}
          label={"Instrumental"}
          rules={[{ required: false }]}
          tooltip={"Create a song without lyrics."}
        />

        {customMode ? (
          <>
            {!isMakeInstrumental && (
              <>
                <ProFormTextArea
                  name={"prompt"}
                  label={"Lyrics"}
                  placeholder={
                    isExtend
                      ? "Enter additional lyrics to extend the song based on your previous verses..."
                      : "Enter your own lyrics..."
                  }
                  rules={[{ required: !isExtend }]}
                  fieldProps={{ autoSize: { minRows: 3, maxRows: 12 } }}
                />
                <ProForm.Item>
                  <Button
                    onClick={async () => {
                      setMakingLyrics(true);
                      try {
                        const text = await props.api.getLyricsText(promptContent || "");
                        props.form.setFieldsValue({ prompt: text });
                      } catch (e) {
                        props.updateError(e);
                      } finally {
                        setMakingLyrics(false);
                      }
                    }}
                    type={"dashed"}
                    icon={promptContent ? <HighlightOutlined /> : <ExperimentOutlined />}
                    loading={makingLyrics}
                    block
                  >
                    {promptContent ? "Generate Lyrics" : "Make Random Lyrics"}
                  </Button>
                </ProForm.Item>
              </>
            )}

            <ProFormText
              name={"tags"}
              label={"Style of Music"}
              rules={[
                { required: true },
                {
                  pattern: /^\S+( \S+)*$/,
                  message: "Style of Music should be separated by spaces",
                },
                {
                  pattern: /^[^\u4e00-\u9fa5]+$/,
                  message: "Style of Music should not contain Chinese characters",
                },
              ]}
              tooltip={
                "Describe the style of music you want (e.g., 'acoustic pop'). Suno's models do not recognize artists' names, but do understand genres and vibes."
              }
            />

            <ProForm.Item>
              <Button onClick={() => setShowQuickFillModal(true)} type={"dashed"} icon={<TagsOutlined />} block>
                Style Presets Helper
              </Button>
            </ProForm.Item>

            <ProFormText
              name={"title"}
              label={"Title"}
              rules={[{ required: true }]}
              tooltip={"Give your song a title for sharing, discovery and organization."}
            />

            <Divider />

            <ProForm.Group
              title={"Extend"}
              tooltip={"If you want to extend the song, please fill in the information below."}
            >
              <ProFormText name={"continue_clip_id"} label={"Clip ID"} width={"md"} />
              <ProFormDigit
                name={"continue_at"}
                label={"Extend from"}
                min={0}
                fieldProps={{ precision: 0, suffix: "s", controls: false }}
                width={"md"}
                rules={[
                  {
                    required: isExtend,
                    message: "Extend from is required when extending",
                  },
                ]}
              />
            </ProForm.Group>
          </>
        ) : (
          <>
            <ProFormTextArea
              name={"gpt_description_prompt"}
              label={"Song description"}
              placeholder={"an infectious anime song about wanting to be with you"}
              tooltip={
                "Describe the style of music and topic you want (e.g. acoustic pop about the holidays). Use genres and vibes instead of specific artists and songs."
              }
              rules={[{ required: true }]}
              fieldProps={{ autoSize: { minRows: 3, maxRows: 12 } }}
            />
          </>
        )}
      </ProForm>
      <QuickFillStyleModal
        open={showQuickFillModal}
        onClose={() => setShowQuickFillModal(false)}
        onFill={(style) => {
          props.form.setFieldsValue({ tags: style });
          setShowQuickFillModal(false);
        }}
      />
    </>
  );
};

const SunoUploadForm = (props: {
  form: ProFormInstance<SunoUploadRequest>;
  api: SunoAPI;
  updateError: (error: any) => void;
}) => {
  const appConfig = useAppConfig();
  const { modal } = App.useApp();
  const { Text } = Typography;
  const [submitting, setSubmitting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  return (
    <ProForm<SunoUploadRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      onFinish={async (values) => {
        props.updateError(null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.upload(values, controller.signal);
          if (res.ok) {
            const resJson = (await res.json()) as SunoUploadResponse;
            modal.success({
              title: "Upload Success",
              content: (
                <>
                  <Text>
                    Clip ID:{" "}
                    <Text copyable strong>
                      {resJson.clip_id}
                    </Text>
                  </Text>
                  <br />
                  <Text>Duration: {resJson.duration} s</Text>
                </>
              ),
            });
          } else {
            await handelResponseError(res, props.updateError);
          }
        } catch (e) {
          console.error(e);
          props.updateError(e);
        } finally {
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
      <ProFormUploadButton
        name={"url"}
        label={"Audio URL"}
        title={"Upload Audio"}
        rules={[{ required: true }]}
        accept={"audio/*"}
        {...appConfig.getProFormUploadConfig("url", 1, "picutre")}
      />
    </ProForm>
  );
};

const SunoQueryForm = (props: {
  form: ProFormInstance<SunoQueryRequest>;
  api: SunoAPI;
  updateResponse: (data: SunoClip[]) => void;
  updateError: (error: any) => void;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const formRef = useRef<ProFormInstance<SunoQueryRequest>>();

  return (
    <ProForm<SunoQueryRequest>
      {...PRO_FORM_PROPS}
      form={props.form}
      formRef={formRef}
      onFinish={async (values) => {
        props.updateError(null);
        const controller = new AbortController();
        setAbortController(controller);
        setSubmitting(true);
        try {
          const res = await props.api.query(values, controller.signal);
          if (res.ok) {
            const resJson = (await res.json()) as SunoQueryResponse;
            props.updateResponse(resJson.clips);
          } else {
            await handelResponseError(res, props.updateError);
          }
        } catch (e) {
          console.error(e);
          props.updateError(e);
        } finally {
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
              getValues={() => JSON.stringify(formRef.current?.getFieldFormatValue?.(), null, 2) || ""}
            />
          );
        },
      }}
    >
      <ProFormTextArea
        name={"ids"}
        label={"Clip ID"}
        tooltip={"ID of the clip to query."}
        placeholder={"Enter clip IDs, one per line."}
        fieldProps={{ autoSize: { minRows: 2, maxRows: 12 } }}
        transform={(value) =>
          value
            .split("\n")
            .map((v: string) => v.trim())
            .join(",")
        }
        rules={[
          { required: true, message: "Clip ID is required" },
          {
            type: "string",
            pattern: /^(?:(?!.*\n\n)[\na-z0-9-])+$/,
            message: "The content may not meet the requirements.",
            warningOnly: true,
          },
        ]}
      />
    </ProForm>
  );
};

const SunoTaskInfo = (props: {
  clips: SunoClip[] | undefined;
  onContinue: (clip: SunoClip) => void;
  api: SunoAPI;
  onUpdate: (clip: SunoClip) => void;
  onDeletion: (id: string) => void;
  onError: (error: any) => void;
}) => {
  const [loadingStates, setLoadingStates] = useState<{
    [key: number]: boolean;
  }>({ 0: false, 1: false });
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [code, setCode] = useState<any>("Please select a clip to view the code.");

  if (!props.clips || props.clips.length === 0) return <Empty />;

  const handleRefresh = async (index: number) => {
    setLoadingStates((prevStates) => ({ ...prevStates, [index]: true }));
    try {
      if (props.clips) {
        const res = await props.api.query({
          ids: props.clips[index].id,
        });
        if (res.ok) {
          const resJson = (await res.json()) as SunoQueryResponse;
          props.onUpdate(resJson.clips[0]);
        } else {
          await handelResponseError(res, props.onError);
        }
      }
    } finally {
      setLoadingStates((prevStates) => ({ ...prevStates, [index]: false }));
    }
  };

  return (
    <>
      {props?.clips?.map((clip: SunoClip, index: number) => (
        <Spin spinning={loadingStates[index] || false} key={index} tip={"Refreshing..."}>
          <ProDescriptions
            title={"Clip " + (index + 1)}
            dataSource={clip}
            column={1}
            bordered
            size={"small"}
            style={{
              marginBottom: 20,
            }}
            columns={[
              {
                title: "Clip ID",
                dataIndex: "id",
                copyable: true,
              },
              {
                title: "Status",
                dataIndex: "status",
                valueEnum: {
                  complete: { text: "Complete", status: "Success" },
                  streaming: { text: "Streaming", status: "Processing" },
                  queued: { text: "Queued", status: "Warning" },
                  submitted: { text: "Submitted", status: "Processing" },
                  failed: { text: "Failed", status: "Error" },
                },
              },
              {
                title: "Image URL",
                dataIndex: "image_url",
                copyable: true,
              },
              {
                title: "Image Large URL",
                dataIndex: "image_large_url",
                copyable: true,
              },
              {
                title: "Audio URL",
                dataIndex: "audio_url",
                copyable: true,
              },
              {
                title: "Video URL",
                dataIndex: "video_url",
                copyable: true,
              },
              {
                title: "Avatar Image URL",
                dataIndex: "avatar_image_url",
                copyable: true,
              },
              {
                title: "Avatar Image Preview",
                dataIndex: "avatar_image_preview",
                render: () => {
                  return <Avatar alt={clip.title} src={clip?.avatar_image_url || ""} size={50} />;
                },
              },
              {
                title: "Image & Video",
                key: "image_and_video_preview",
                render: () => {
                  return (
                    <Image
                      alt={clip.title}
                      src={clip.image_large_url || ""}
                      preview={
                        clip?.video_url && !clip.is_video_pending
                          ? {
                              imageRender: () => (
                                <video controls src={clip?.video_url || ""} style={{ maxHeight: "90vh" }} />
                              ),
                              toolbarRender: () => null,
                              onVisibleChange: (visible: boolean) => !visible && CloseAllSound(),
                            }
                          : false
                      }
                      width={120}
                    />
                  );
                },
              },
              {
                title: "Audio Preview",
                key: "audio_preview",
                render: () =>
                  clip?.audio_url !== "" && <audio controls src={clip?.audio_url || ""} style={{ padding: 8 }} />,
              },
              {
                title: "Created At",
                dataIndex: "created_at",
              },
              {
                title: "Title",
                dataIndex: "title",
              },
              {
                title: "Prompt",
                dataIndex: ["metadata", "prompt"],
                valueType: "code",
              },
              {
                title: "Description",
                dataIndex: ["metadata", "gpt_description_prompt"],
              },
              {
                title: "Duration",
                dataIndex: ["metadata", "duration"],
                // valueType: "second"
              },
              {
                title: "Tags",
                dataIndex: ["metadata", "tags"],
              },
              {
                title: "Option",
                valueType: "option",
                render: () => [
                  ...(props.api.finished(clip)
                    ? [
                        <a key="continue" onClick={() => props.onContinue(clip)}>
                          Continue
                        </a>,
                      ]
                    : []),
                  <a key="query" onClick={() => handleRefresh(index)}>
                    Refresh
                  </a>,
                  <a
                    key="code"
                    onClick={() => {
                      setCode(clip);
                      setShowCodeModal(true);
                    }}
                  >
                    Detail
                  </a>,
                  <a key="del" style={{ color: "red" }} onClick={() => props.onDeletion(clip.id)}>
                    Delete
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
        code={safeJsonStringify(code, "Failed to stringify the code")}
      />
    </>
  );
};

export function SunoPage() {
  const appConfig = useAppConfig();
  const sunoApi = new SunoAPI(appConfig.getApiKey());
  const [generateForm] = ProForm.useForm();
  const [uploadForm] = ProForm.useForm();
  const [queryForm] = ProForm.useForm();

  const [taskData, setTaskData] = useState<SunoClip[]>([]);
  const [errorData, setErrorData] = useState<any>(null);

  const type_options = [
    { label: "Generate", value: "generate", icon: <UnorderedListOutlined /> },
    { label: "Upload", value: "upload", icon: <CloudUploadOutlined /> },
    { label: "Query", value: "query", icon: <FileTextOutlined /> },
  ];

  const [formType, setFormType] = useState<"generate" | "query" | "upload">("generate");

  const updateTaskData = (data: SunoClip[]) => {
    const updatedTaskData = taskData.slice(); // 创建 taskData 的副本

    data.forEach((clip: SunoClip) => {
      const index = updatedTaskData.findIndex((c: SunoClip) => c.id === clip.id);
      if (index === -1) {
        // 如果 id 不存在，添加新数据
        updatedTaskData.push(clip);
      } else {
        // 如果 id 已存在，更新数据
        updatedTaskData[index] = { ...updatedTaskData[index], ...clip };
      }
    });

    setTaskData(updatedTaskData);
  };

  const RenderSunoForms: { [key in typeof formType]: ReactNode } = {
    generate: (
      <SunoGenerateForm
        form={generateForm}
        api={sunoApi}
        updateResponse={(data: SunoClip[]) => updateTaskData(data)}
        updateError={(error: any) => setErrorData(error)}
      />
    ),
    upload: <SunoUploadForm form={uploadForm} api={sunoApi} updateError={(error: any) => setErrorData(error)} />,
    query: (
      <SunoQueryForm
        form={queryForm}
        api={sunoApi}
        updateResponse={(data: SunoClip[]) => updateTaskData(data)}
        updateError={(error: any) => setErrorData(error)}
      />
    ),
  };

  return (
    <>
      <Col flex="400px" style={COL_SCROLL_STYLE}>
        <Segmented
          value={formType}
          style={{ marginBottom: 20 }}
          options={type_options}
          block
          onChange={(value) => setFormType(value as typeof formType)}
        />
        {RenderSunoForms[formType as keyof typeof RenderSunoForms]}
      </Col>
      <Col flex={"none"}>
        <Divider type={"vertical"} style={{ height: "100%" }} />
      </Col>
      <Col flex="auto" style={COL_SCROLL_STYLE}>
        <h1>Clips Info</h1>
        <SunoTaskInfo
          clips={taskData}
          onContinue={(clip: SunoClip) => {
            setFormType("generate");
            generateForm.resetFields();
            generateForm.setFieldsValue({
              continue_clip_id: clip.id,
              continue_at: clip.metadata.duration,
              title: clip.title,
              tags: clip.metadata.tags,
            });
          }}
          api={sunoApi}
          onUpdate={(singleClip: SunoClip) => updateTaskData([singleClip])}
          onDeletion={(id: string) => {
            setTaskData(taskData.filter((clip: SunoClip) => clip.id !== id));
          }}
          onError={(error: any) => setErrorData(error)}
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
