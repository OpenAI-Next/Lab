// app/pages/Luma.tsx

import React, {useState} from "react";
import {
    FormInstance,
    ProForm,
    ProFormRadio,
    ProFormSwitch,
    ProFormText,
    ProFormTextArea,
    ProFormUploadButton
} from "@ant-design/pro-components";
import {COL_SCROLL_STYLE, PRO_FORM_PROPS} from "@/constant";
import {handelResponseError, safeJsonStringify} from "@/app/utils";
import {renderCode, RenderSubmitter} from "@/app/render";
import {api2Provider, useAppConfig} from "@/app/store";
import {Col, Divider, Segmented} from "antd";
import {AccountType, LumaApi, LumaExtendTaskRequest, LumaGenerationTaskRequest} from "@/app/client/Luma";
import {ExpandAltOutlined, FileTextOutlined, UnorderedListOutlined} from "@ant-design/icons";

const luma_generations_response_example = {
    "id": "66bcb5f6-7c32-449d-9742-d5b6a3fc69d2",
    "prompt": "小猫",
    "state": "pending",
    "created_at": "2024-07-26T08:35:54.731114Z",
    "video": null,
    "liked": null,
    "estimate_wait_seconds": null,
    "thumbnail": null,
    "last_frame": null,
    "server_id": "e9c19de3-bf11-43aa-991d-f42d5894cf3c"
} as LumaGenerationTaskResponse

const luma_query_response_example = {
    "id": "66bcb5f6-7c32-449d-9742-d5b6a3fc69d2",
    "prompt": "小猫",
    "state": "completed",
    "created_at": "2024-07-26T08:35:54.731000Z",
    "video": {
        "url": "https://filesystem.site/cdn/20240726/MFwOo74O9tK3j3462o7gPCDW7SqHcc.mp4",
        "width": 1360,
        "height": 752
    },
    "liked": null,
    "estimate_wait_seconds": null,
    "thumbnail": {
        "url": "https://storage.cdn-luma.com/dream_machine/bdb20025-68de-4e20-8f52-5dbe59a083ce/video_1_thumb.jpg",
        "width": 1360,
        "height": 752
    },
    "last_frame": {
        "url": "https://storage.cdn-luma.com/dream_machine/bdb20025-68de-4e20-8f52-5dbe59a083ce/video_1_last_frame.jpg",
        "width": 1360,
        "height": 752
    }
} as LumaGenerationTaskResponse

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

type LumaQueryTaskResponse = Omit<LumaGenerationTaskResponse, 'server_id'>;

const LumaGenerateForm = (props: {
    accountType: AccountType,
    form: FormInstance,
    api: LumaApi,
    updateTask: (task: any) => void,
    updateError: (error: any) => void,
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
                props.updateTask(undefined);
                const controller = new AbortController();
                setAbortController(controller);
                setSubmitting(true);
                try {
                    const res = await props.api.generateLumaTask(values, props.accountType, controller.signal);
                    if (res.ok) {
                        const resJson = await res.json();
                        // const task = {} as any;
                        // task.preId = (resJson as CreatePikaTaskResponse).id.split("|")[0];
                        // task.url.data && task.url.data.results[0] && (task.url.data.results[0].promptText = values.prompt);
                        // task.url.data && task.url.data.results[0] && (task.url.data.results[0].id = (resJson as CreatePikaTaskResponse).id);
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
                    return <RenderSubmitter
                        abortController={abortController}
                        submitting={submitting}
                        submitterProps={submitterProps}
                        getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
                    />
                }
            }}
            initialValues={{
                aspect_ratio: "16:9",
                expand_prompt: true,
            }}
        >

            <ProFormTextArea
                name={"user_prompt"}
                label={"User Prompt"}
                rules={[{required: true}]}
            />
            <ProFormRadio.Group
                name={"aspect_ratio"}
                label={"Aspect Ratio"}
                options={["16:9"]}
                rules={[{required: true}]}
            />
            <ProFormSwitch
                name={"expand_prompt"}
                label={"Expand Prompt"}
                rules={[{required: true}]}
            />

            <ProFormUploadButton
                name={"image_url"}
                label={"Image URL"}
                accept={"image/*"}
                max={1}
                action={appConfig.getUploadConfig().action}
                fieldProps={{
                    listType: "picture-card",
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
            />

            <ProFormUploadButton
                name={"image_end_url"}
                label={"Image End URL"}
                accept={"image/*"}
                max={1}
                action={appConfig.getUploadConfig().action}
                fieldProps={{
                    listType: "picture-card",
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
            />
        </ProForm>
    )
}

const LumaExtendForm = (props: {
    accountType: AccountType,
    form: FormInstance,
    api: LumaApi,
    updateTask: (task: any) => void,
    updateError: (error: any) => void,
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
                props.updateTask(undefined);
                const controller = new AbortController();
                setAbortController(controller);
                setSubmitting(true);
                try {
                    const res = await props.api.lumaExtendTask(values, props.accountType, controller.signal);
                    if (res.ok) {
                        const resJson = await res.json();
                        // const task = {} as any;
                        // task.preId = (resJson as CreatePikaTaskResponse).id.split("|")[0];
                        // task.url.data && task.url.data.results[0] && (task.url.data.results[0].promptText = values.prompt);
                        // task.url.data && task.url.data.results[0] && (task.url.data.results[0].id = (resJson as CreatePikaTaskResponse).id);
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
                    return <RenderSubmitter
                        abortController={abortController}
                        submitting={submitting}
                        submitterProps={submitterProps}
                        getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
                    />
                }
            }}
            initialValues={{
                aspect_ratio: "16:9",
                expand_prompt: true,
            }}
        >
            <ProFormTextArea
                name={"user_prompt"}
                label={"User Prompt"}
                rules={[{required: true}]}
            />
            <ProFormRadio.Group
                name={"aspect_ratio"}
                label={"Aspect Ratio"}
                options={["16:9"]}
                rules={[{required: true}]}
            />
            <ProFormSwitch
                name={"expand_prompt"}
                label={"Expand Prompt"}
                rules={[{required: true}]}
            />
            <ProFormUploadButton
                name={"image_end_url"}
                label={"Image End URL"}
                max={1}
                action={appConfig.getUploadConfig().action}
                accept={"image/*"}
                fieldProps={{
                    listType: "picture-card",
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
            />
            <ProFormUploadButton
                name={"video_url"}
                label={"Video URL"}
                accept={"video/*"}
                max={1}
                action={appConfig.getUploadConfig().action}
                fieldProps={{
                    listType: "picture-card",
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
                rules={[{required: true}]}
            />
        </ProForm>
    )
}

const LumaQueryForm = (props: {
    accountType: AccountType,
    form: FormInstance,
    api: LumaApi,
    updateTask: (task: any) => void,
    updateError: (error: any) => void,
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
                        // const task = {} as any;
                        // task.preId = (resJson as CreatePikaTaskResponse).id.split("|")[0];
                        // task.url.data && task.url.data.results[0] && (task.url.data.results[0].promptText = values.prompt);
                        // task.url.data && task.url.data.results[0] && (task.url.data.results[0].id = (resJson as CreatePikaTaskResponse).id);
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
                    return <RenderSubmitter
                        abortController={abortController}
                        submitting={submitting}
                        submitterProps={submitterProps}
                        getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
                    />
                }
            }}
        >
            <ProFormText
                name={"id"}
                label={"ID"}
                rules={[{required: true}]}
            />
        </ProForm>
    )
}

const LumaPage = () => {
    const appConfig = useAppConfig();
    const lumaApi = new LumaApi(appConfig.getFirstApiKey(api2Provider.Luma));
    const [accountType, setAccountType] = useState<AccountType>("relax");

    const operate_type_options = [
        {label: "Create", value: "create", icon: <UnorderedListOutlined/>},
        {label: "Extend", value: "extend", icon: <ExpandAltOutlined/>},
        {label: "Query", value: "query", icon: <FileTextOutlined/>},
    ];

    const [operateType, setOperateType] = useState<"create" | "extend" | "query">("create");


    const [lumaCreateForm] = ProForm.useForm();
    const [lumaExtendForm] = ProForm.useForm();
    const [lumaQueryForm] = ProForm.useForm();

    const [taskData, setTaskData] = useState<any>();
    const [errorData, setErrorData] = useState<any>(null)

    const updateTask = (task: undefined) => {
        setTaskData(task)
    }

    const updateError = (error: any) => {
        setErrorData(error)
    }

    return (
        <>
            <Col flex="340px" style={COL_SCROLL_STYLE}>
                <Segmented
                    style={{marginBottom: 20}}
                    options={operate_type_options}
                    block
                    onChange={(value) => setOperateType(value as "create" | "query")}
                    value={operateType}
                />

                <ProForm layout={"vertical"} submitter={false}>
                    <ProFormRadio.Group
                        label={"Account Type"}
                        rules={[{required: true}]}
                        options={[
                            {label: "Luma Relax", value: "relax"},
                            {label: "Luma VIP", value: "vip"},
                        ]}
                        fieldProps={{
                            value: accountType,
                            onChange: (e) => setAccountType(e.target.value)
                        }}
                        radioType="button"
                    />
                </ProForm>

                <Divider/>

                {operateType === "create" && <LumaGenerateForm
                    accountType={accountType}
                    form={lumaCreateForm}
                    api={lumaApi}
                    updateTask={updateTask}
                    updateError={updateError}
                />}

                {operateType === "query" && <LumaQueryForm
                    accountType={accountType}
                    form={lumaQueryForm}
                    api={lumaApi}
                    updateTask={updateTask}
                    updateError={updateError}
                />}

                {operateType === "extend" && <LumaExtendForm
                    accountType={accountType}
                    form={lumaExtendForm}
                    api={lumaApi}
                    updateTask={updateTask}
                    updateError={updateError}
                />}

            </Col>
            <Col flex={"none"}>
                <Divider type={"vertical"} style={{height: "100%"}}/>
            </Col>
            <Col flex="auto" style={COL_SCROLL_STYLE}>
                <h1>Task Data</h1>

                {errorData && <>
                    <h1>Error</h1>
                    {renderCode(safeJsonStringify(errorData, errorData.toString()))}
                </>}
            </Col>
        </>
    )
}

export default LumaPage;

