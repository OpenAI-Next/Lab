// /app/pages/Flux.tsx

import {api2Provider, useAppConfig} from "@/app/store";
import {FluxAPI, FluxGetRequest, FluxGetResponse, FluxImageRequest, FluxImageResponse,} from "@/app/client/FluxProxy";
import {
    ProDescriptions,
    ProForm,
    ProFormDigit,
    ProFormInstance,
    ProFormText,
    ProFormTextArea
} from "@ant-design/pro-components";
import React, {ReactNode, useState} from "react";
import {FileTextOutlined, UnorderedListOutlined} from "@ant-design/icons";
import {Col, Divider, Empty, Image, Segmented, Spin} from "antd";
import {COL_SCROLL_STYLE, PRO_FORM_PROPS} from "@/constant";
import {CodeModal, renderCode, RenderSubmitter} from "@/app/render";
import {CloseAllSound, handelResponseError, safeJsonStringify} from "@/app/utils";

interface FluxTask {
    id: string;
    status: string;
    result: string;
}

const GenerationForm = (props: {
    form: ProFormInstance,
    api: FluxAPI,
    updateResponse: (data: FluxTask) => void,
    updateError: (error: any) => void,
}) => {
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // const inputPrompt = ProForm.useWatch("prompt", props.form);
    // const [enhanceLoading, setEnhanceLoading] = useState(false);
    // const {modal} = App.useApp();

    return (
        <ProForm<FluxImageRequest>
            {...PRO_FORM_PROPS}
            form={props.form}
            onFinish={async (values) => {
                props.updateError(null);
                const controller = new AbortController();
                setAbortController(controller);
                setSubmitting(true);
                try {
                    const res = await props.api.onImage(values, controller.signal);
                    if (res.ok) {
                        const resJson = await res.json() as FluxImageResponse;
                        props.updateResponse({
                            ...resJson,
                            status: "Submitted",
                            result: "",
                        });
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
                    return <RenderSubmitter
                        abortController={abortController}
                        submitting={submitting}
                        submitterProps={submitterProps}
                        getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
                        noApiKeys={props.api.noKey()}
                    />
                }
            }}
        >
            <ProFormTextArea
                name="prompt"
                label="Prompt"
                fieldProps={{
                    autoSize: {minRows: 3,}
                }}
                rules={[{required: true}]}
                width={"md"}
            />
            {/*<ProForm.Item>*/}
            {/*    <Button*/}
            {/*        onClick={async () => {*/}
            {/*            if (!inputPrompt) {*/}
            {/*                props.form.validateFields(["prompt"]);*/}
            {/*            } else {*/}
            {/*                try {*/}
            {/*                    setEnhanceLoading(true);*/}
            {/*                    const res = await props.api.promptEnhance({messages: inputPrompt});*/}
            {/*                    if (res.ok) {*/}
            {/*                        const resJson = await res.json() as FluxPromptEnhanceResponse;*/}
            {/*                        modal.confirm({*/}
            {/*                            title: "Enhance Prompt",*/}
            {/*                            content: resJson?.data,*/}
            {/*                            okText:"Accept",*/}
            {/*                            onOk: () => props.form.setFieldsValue({prompt: resJson.data}),*/}
            {/*                        })*/}

            {/*                    } else {*/}
            {/*                        await handelResponseError(res, props.updateError);*/}
            {/*                    }*/}
            {/*                } catch (e) {*/}
            {/*                    modal.error({title: "Failed to enhance prompt", content: e?.toString()});*/}
            {/*                    console.error(e);*/}
            {/*                } finally {*/}
            {/*                    setEnhanceLoading(false);*/}
            {/*                }*/}
            {/*            }*/}
            {/*        }}*/}
            {/*        type={"dashed"}*/}
            {/*        icon={<RiseOutlined/>}*/}
            {/*        loading={enhanceLoading}*/}
            {/*        block*/}
            {/*    >*/}
            {/*        Enhance Prompt*/}
            {/*    </Button>*/}
            {/*</ProForm.Item>*/}

            <Divider/>

            <ProForm.Group>
                <ProFormDigit
                    name="width"
                    label="Width"
                    rules={[{required: true}]}
                    width={134}
                />
                <ProFormDigit
                    name="height"
                    label="Height"
                    rules={[{required: true}]}
                    width={134}
                />
            </ProForm.Group>
        </ProForm>
    )
}

const QueryForm = (props: {
    form: ProFormInstance,
    api: FluxAPI,
    updateResponse: (data: FluxTask) => void,
    updateError: (error: any) => void,
}) => {
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [submitting, setSubmitting] = useState(false);

    return (
        <ProForm<FluxGetRequest>
            {...PRO_FORM_PROPS}
            form={props.form}
            onFinish={async (values) => {
                props.updateError(null);
                const controller = new AbortController();
                setAbortController(controller);
                setSubmitting(true);
                try {
                    const res = await props.api.getImage(values, controller.signal);
                    if (res.ok) {
                        const resJson = await res.json() as FluxGetResponse;
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
                    return <RenderSubmitter
                        abortController={abortController}
                        submitting={submitting}
                        submitterProps={submitterProps}
                        getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
                        noApiKeys={props.api.noKey()}
                    />
                }
            }}
        >
            <ProFormText
                name="request_id"
                label="Request ID"
                rules={[{required: true}]}
            />
        </ProForm>
    )
}

const FluxTaskRender = (props: {
    task: FluxTask[]
    api: FluxAPI,
    updateResponse: (data: FluxTask) => void,
    onDeletion: (id: string) => void,
    updateError: (error: any) => void,
}) => {
    const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({0: false, 1: false});
    const [showCodeModal, setShowCodeModal] = useState(false);

    const [codeContent, setCodeContent] = useState({});

    if (!props.task || props.task.length === 0) return <Empty/>

    const handleRefresh = async (index: number) => {
        setLoadingStates(prevStates => ({...prevStates, [index]: true}));

        try {
            const res = await props.api.getImage({request_id: props.task[index].id}, new AbortController().signal);
            if (res.ok) {
                const resJson = await res.json() as unknown as any;
                props.updateResponse(resJson);
            } else {
                await handelResponseError(res, props.updateError);
            }
        } catch (e) {
            props.updateError(e);
        } finally {
            setLoadingStates(prevStates => ({...prevStates, [index]: false}));
        }
    }

    return (
        <>
            {props.task.map((task, index) => (
                <Spin spinning={loadingStates[index] ?? false} key={task.id}>
                    <ProDescriptions<FluxTask>
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
                                title: "ID",
                                dataIndex: ["id"],
                                copyable: true,
                            },
                            {
                                title: "Status",
                                dataIndex: ["status"],
                                valueEnum: {
                                    "Pending": {text: "Pending", status: "Processing"},
                                    "Submitted": {text: "Submitted", status: "Processing"},
                                    "Ready": {text: "Ready", status: "Success"},
                                }
                            },
                            {
                                title: "Result",
                                dataIndex: ["result"],
                                copyable:true,
                                ellipsis: true,
                            },
                            {
                                title: "Preview",
                                key: "preview",
                                render: (_, record) => {
                                    if (!record?.result) return null;
                                    return (
                                        <Image
                                            alt={record?.id}
                                            src={record?.result}
                                            width={160}
                                        />
                                    )
                                }
                            },
                            {
                                title: 'Option',
                                valueType: 'option',
                                render: () => [
                                    <a
                                        key="query"
                                        onClick={() => handleRefresh(index)}
                                    >
                                        Refresh
                                    </a>,
                                    <a
                                        key="detail"
                                        onClick={() => {
                                            setCodeContent(task)
                                            setShowCodeModal(true)
                                        }}
                                    >
                                        Detail
                                    </a>,
                                    <a
                                        key="del"
                                        style={{color: "red"}}
                                        onClick={() => props.onDeletion(task.id)}
                                    >
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
                code={safeJsonStringify(codeContent, "Failed to stringify the code")}
            />
        </>
    )
}

export function FluxPage() {
    const appConfig = useAppConfig();
    const fluxApi = new FluxAPI(appConfig.getFirstApiKey(api2Provider.Flux));
    const [generationForm] = ProForm.useForm();
    const [queryForm] = ProForm.useForm();

    const [taskData, setTaskData] = useState<FluxTask[]>([]);
    const [errorData, setErrorData] = useState<any>(null)

    const type_options = [
        {label: "Generate", value: "generate", icon: <UnorderedListOutlined/>},
        {label: "Query", value: "query", icon: <FileTextOutlined/>},
    ]

    const [formType, setFormType] = useState<"generate" | "query">("generate");

    const updateTaskData = (data: FluxTask) => {
        if (!data?.id) return;
        const updatedTaskData = taskData.slice(); // 创建 taskData 的副本
        const index = updatedTaskData.findIndex((c: any) => c.id === data.id);
        if (index === -1) {
            updatedTaskData.push(data);
        } else {
            updatedTaskData[index] = data;
        }
        setTaskData(updatedTaskData);
    }

    const deleteTask = (id: string) => {
        setTaskData(taskData.filter((c: any) => c.id !== id));
    }

    const RenderFluxForms: { [key in typeof formType]: ReactNode } = {
        "generate": <GenerationForm
            api={fluxApi}
            form={generationForm}
            updateResponse={(data) => updateTaskData(data)}
            updateError={(e) => setErrorData(e)}
        />,
        "query": <QueryForm
            api={fluxApi}
            form={queryForm}
            updateResponse={(data) => updateTaskData(data)}
            updateError={(e) => setErrorData(e)}
        />
    }

    return (
        <>
            <Col flex="340px" style={COL_SCROLL_STYLE}>
                <Segmented
                    value={formType}
                    style={{marginBottom: 20}}
                    options={type_options}
                    block
                    onChange={(value) => setFormType(value as typeof formType)}
                />
                {RenderFluxForms[formType as keyof typeof RenderFluxForms]}
            </Col>

            <Col flex={"none"}>
                <Divider type={"vertical"} style={{height: "100%"}}/>
            </Col>

            <Col flex="auto" style={COL_SCROLL_STYLE}>
                <h1>Tasks Info</h1>
                <FluxTaskRender
                    task={taskData}
                    api={fluxApi}
                    onDeletion={(id) => deleteTask(id)}
                    updateResponse={(data) => updateTaskData(data)}
                    updateError={(e) => setErrorData(e)}
                />
                {errorData && <>
                    <h1>Error</h1>
                    {renderCode(safeJsonStringify(errorData, errorData.toString()))}
                </>}
            </Col>
        </>
    )
}
