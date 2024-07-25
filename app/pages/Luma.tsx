// app/pages/Luma.tsx

import React, {useState} from "react";
import {ProForm, ProFormRadio, ProFormSwitch, ProFormText, ProFormTextArea} from "@ant-design/pro-components";
import {COL_SCROLL_STYLE, PRO_FORM_PROPS} from "@/constant";
import {handelResponseError, safeJsonStringify} from "@/app/utils";
import {renderCode, RenderSubmitter} from "@/app/render";
import {api2Provider, useAppConfig} from "@/app/store";
import {Col, Divider} from "antd";
import {LumaApi, LumaCreateTaskRequest} from "@/app/client/Luma";

const LumaCreateForm = (props: {
    form: any,
    api: LumaApi,
    updateTask: (task: any) => void,
    updateError: (error: any) => void,
}) => {
    const [submitting, setSubmitting] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    return (
        <ProForm<LumaCreateTaskRequest>
            {...PRO_FORM_PROPS}
            form={props.form}
            onFinish={async (values) => {
                props.updateError(null);
                props.updateTask(undefined);
                const controller = new AbortController();
                setAbortController(controller);
                setSubmitting(true);
                try {
                    const res = await props.api.createLumaTask(values, controller.signal);
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
                <LumaCreateForm
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

