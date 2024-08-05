// app/pages/Vidu.tsx

import {api2Provider, useAppConfig} from "@/app/store";
import {SunoClip, SunoGenerateResponse, SunoUploadRequest} from "@/app/client/sunoProxy";
import {
    ProCard,
    ProForm,
    ProFormDigit,
    ProFormGroup,
    ProFormInstance,
    ProFormList,
    ProFormSelect,
    ProFormSwitch,
    ProFormTextArea
} from "@ant-design/pro-components";
import React, {ReactNode, useState} from "react";
import {FileTextOutlined, UnorderedListOutlined} from "@ant-design/icons";
import {Col, Divider, Segmented} from "antd";
import {COL_SCROLL_STYLE, PRO_FORM_PROPS} from "@/constant";
import {renderCode, RenderSubmitter} from "@/app/render";
import {handelResponseError, safeJsonStringify} from "@/app/utils";
import {ViduAPI, ViduTaskGenerationRequest} from "@/app/client/ViduProxy";

const GenerationForm = (props: {
    form: ProFormInstance<SunoUploadRequest>,
    api: ViduAPI,
    updateResponse: (data: any) => void,
    updateError: (error: any) => void,
}) => {
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [submitting, setSubmitting] = useState(false);

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
                    const res = await props.api.generateViduTask(values, controller.signal);
                    if (res.ok) {
                        const resJson = await res.json() as SunoGenerateResponse
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
            initialValues={{}}
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
            <ProFormList
                name={["input", "prompts"]}
                label={"Prompts"}
                required
                itemRender={({listDom, action}, {index}) => (
                    <ProCard
                        bordered
                        style={{marginBlockEnd: 8}}
                        title={`Prompts ${index + 1}`}
                        extra={action}
                        bodyStyle={{paddingBlockEnd: 0}}
                    >
                        {listDom}
                    </ProCard>
                )}
                min={1}
                rules={[
                    {
                        required: true,
                        validator: async (rule, value) => {
                            if (!value) throw new Error("Prompts is required");
                            if (value.length === 0) throw new Error("At least one prompt is required");
                            return Promise.resolve();
                        }
                    }
                ]}
            >
                <ProFormGroup>
                    <ProFormSelect
                        name={"type"}
                        label={"Type"}
                        options={[
                            {label: "Text", value: "text"},
                            {label: "Image", value: "image"},
                        ]}
                        fieldProps={{
                            allowClear: true,
                        }}
                        width={"xs"}
                        rules={[{required: true}]}
                    />
                    <ProFormSwitch
                        name={"enhance"}
                        label={"Enhance"}
                        fieldProps={{
                            checkedChildren: "Yes",
                            unCheckedChildren: "No",
                        }}
                        rules={[{required: true}]}
                    />
                    <ProFormTextArea
                        name={"content"}
                        label={"Content"}
                        fieldProps={{
                            placeholder: "Content",
                            autoSize: {minRows: 2},
                        }}
                        width={"md"}
                        rules={[{required: true}]}
                    />
                </ProFormGroup>
            </ProFormList>

            <ProFormSelect
                name={"type"}
                label={"Type"}
                options={[
                    {label: "img2video", value: "img2video"},
                ]}
                rules={[{required: true}]}
            />

            <ProFormSelect
                name={["settings", "style"]}
                label={"Style"}
                options={["general"]}
                rules={[{required: true}]}
            />

            <ProFormSelect
                name={["settings", "aspect_ratio"]}
                label={"Aspect Ratio"}
                options={["16:9"]}
                rules={[{required: true}]}
            />

            <ProFormDigit
                name={["settings", "duration"]}
                label={"Duration"}
                rules={[{required: true}]}
            />

            <ProFormSelect
                name={["settings", "model"]}
                label={"Model"}
                options={[
                    {label: "vidu-1", value: "vidu-1"},
                ]}
                rules={[{required: true}]}
            />

        </ProForm>
    );
}

export function ViduPage() {
    const appConfig = useAppConfig();
    const viduApi = new ViduAPI(appConfig.getFirstApiKey(api2Provider.Vidu));
    const [generationForm] = ProForm.useForm();
    const [queryForm] = ProForm.useForm();

    const [taskData, setTaskData] = useState<SunoClip[]>([]);
    const [errorData, setErrorData] = useState<any>(null)

    const type_options = [
        {label: "Generate", value: "generate", icon: <UnorderedListOutlined/>},
        {label: "Query", value: "query", icon: <FileTextOutlined/>},
    ]

    const [formType, setFormType] = useState<"generate" | "query">("generate");

    const updateTaskData = (data: SunoClip[]) => {
        const updatedTaskData = taskData.slice(); // 创建 taskData 的副本

        data.forEach((clip: SunoClip) => {
            const index = updatedTaskData.findIndex((c: SunoClip) => c.id === clip.id);
            if (index === -1) {
                // 如果 id 不存在，添加新数据
                updatedTaskData.push(clip);
            } else {
                // 如果 id 已存在，更新数据
                updatedTaskData[index] = {...updatedTaskData[index], ...clip};
            }
        });

        setTaskData(updatedTaskData);
    }

    const RenderSunoForms: { [key in typeof formType]: ReactNode } = {
        "generate": <GenerationForm
            form={generationForm}
            api={viduApi}
            updateResponse={updateTaskData}
            updateError={setErrorData}
        />,
        "query": <></>,
    }

    return (
        <>
            <Col flex="400px" style={COL_SCROLL_STYLE}>
                <Segmented
                    value={formType}
                    style={{marginBottom: 20}}
                    options={type_options}
                    block
                    onChange={(value) => setFormType(value as typeof formType)}
                />
                {RenderSunoForms[formType as keyof typeof RenderSunoForms]}
            </Col>
            <Col flex={"none"}>
                <Divider type={"vertical"} style={{height: "100%"}}/>
            </Col>
            <Col flex="auto" style={COL_SCROLL_STYLE}>
                <h1>Clips Info</h1>


                {errorData && <>
                    <h1>Error</h1>
                    {renderCode(safeJsonStringify(errorData, errorData.toString()))}
                </>}
            </Col>
        </>
    )
}
