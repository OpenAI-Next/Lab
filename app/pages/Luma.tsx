// app/pages/Luma.tsx

import React, {useState} from "react";
import {ProForm, ProFormRadio, ProFormSwitch, ProFormTextArea, ProFormUploadButton} from "@ant-design/pro-components";
import {COL_SCROLL_STYLE, PRO_FORM_PROPS} from "@/constant";
import {handelResponseError, safeJsonStringify} from "@/app/utils";
import {renderCode, RenderSubmitter} from "@/app/render";
import {api2Provider, useAppConfig} from "@/app/store";
import {Col, Divider} from "antd";
import {LumaApi, LumaGenerationTaskRequest} from "@/app/client/Luma";

const LumaGenerateForm = (props: {
    form: any,
    api: LumaApi,
    updateTask: (task: any) => void,
    updateError: (error: any) => void,
}) => {
    const appConfig = useAppConfig();


    const [submitting, setSubmitting] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const [accountType, setAccountType] = useState<"relax" | "vip">("relax");

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
                    const res = await props.api.generateLumaTask(values, accountType, controller.signal);
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

            <ProFormRadio.Group
                label={"Account Type"}
                rules={[{required: true}]}
                options={[
                    {label: "Relax", value: "relax"},
                    {label: "Luma VIP", value: "vip"},
                ]}
                fieldProps={{
                    value: accountType,
                    onChange: (e) => setAccountType(e.target.value)
                }}
                radioType="button"
            />

            <Divider/>

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
            />

            <ProFormUploadButton
                name={"image_url"}
                label={"Image URL"}
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

const LumaQueryForm = () => {

}

const LumaPage = () => {
    const appConfig = useAppConfig();
    const lumaApi = new LumaApi(appConfig.getFirstApiKey(api2Provider.Luma));
    const [lumaCreateForm] = ProForm.useForm();

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
                <LumaGenerateForm
                    form={lumaCreateForm}
                    api={lumaApi}
                    updateTask={updateTask}
                    updateError={updateError}
                />
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

