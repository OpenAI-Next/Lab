import {COL_SCROLL_STYLE, PRO_FORM_PROPS} from "@/constant";
import React, {lazy, useRef, useState} from "react";
import {Col, Divider, FloatButton} from "antd";
import {
    ProCard,
    ProForm,
    ProFormCheckbox,
    ProFormDependency,
    ProFormDigit,
    ProFormInstance,
    ProFormList,
    ProFormRadio,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
    ProFormTextArea
} from "@ant-design/pro-components";
import {jsonMapValidationRule, jsonSchemaValidationRule, safeJsonParse} from "@/app/utils";
import {ChatCompletionAPI, ChatCompletionRequest} from "@/app/client/chatCompletions";
import {PictureOutlined} from "@ant-design/icons";
import {renderCode, renderRequestTimeDuration, RenderSubmitter} from "@/app/render";
import {api2Provider, useAppConfig} from "@/app/store";

const Upload2B64 = lazy(() => import("@/app/components/Upload2B64"));

// TODO: https://platform.openai.com/playground
export function ChatCompletionsPage() {
    const appConfig = useAppConfig();
    const chatCompletionApi = new ChatCompletionAPI(appConfig.getFirstApiKey(api2Provider.Chat));

    const [chatCompletionsForm] = ProForm.useForm();
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [showImg2B64Modal, setShowImg2B64Modal] = useState<boolean>(false);

    const [startTimestamp, setStartTimestamp] = useState<number>(0);
    const [endTimestamp, setEndTimestamp] = useState<number>(0);
    const [responseBody, setResponseBody] = useState<any>(null);

    const LogprobsEnabled = ProForm.useWatch("logprobs", chatCompletionsForm);
    const isStream = ProForm.useWatch("stream", chatCompletionsForm);

    const formRef = useRef<ProFormInstance<ChatCompletionRequest>>();

    function transformChatCompletionsFormValue(value: ChatCompletionRequest) {
        try {
            return {
                ...value,
                tools: value?.tools?.map((tool: any) => {
                    return {
                        ...tool,
                        function: tool?.function?.map((func: any) => {
                            return {
                                ...func,
                                parameters: safeJsonParse(func?.parameters, {error: "Invalid JSON"}),
                            }
                        })
                    }
                })
            }
        } catch (e) {
            console.error(e);
            return value;
        }
    }

    const getCode = () => {
        const value = formRef.current?.getFieldsFormatValue?.() as ChatCompletionRequest;
        const transformedValue = transformChatCompletionsFormValue(value);
        return JSON.stringify(transformedValue, null, 2)
    };

    const [isUserMessageTypeObj, setIsUserMessageTypeObj] = useState<boolean[]>([]);

    const [getText, setGetText] = useState<boolean>(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const [res_text, setResText] = useState<string>("");
    const responseTextRef = useRef("");

    const onNewText = (newText: string) => {
        responseTextRef.current += newText;
        setResText(responseTextRef.current);
    };

    return (
        <>
            <Col flex="420px" style={COL_SCROLL_STYLE}>
                <ProForm<ChatCompletionRequest>
                    {...PRO_FORM_PROPS}
                    form={chatCompletionsForm}
                    formRef={formRef}
                    onFinish={async (values) => {
                        values = transformChatCompletionsFormValue(values);
                        setResponseBody(null);
                        responseTextRef.current = "";
                        setResText(responseTextRef.current);
                        setStartTimestamp(new Date().getTime());
                        setEndTimestamp(0);
                        setSubmitting(true);
                        try {
                            const controller = new AbortController();
                            setAbortController(controller);
                            const needGetText = isStream && getText
                            const res = await chatCompletionApi.request(values, controller.signal, undefined, needGetText, onNewText);

                            try {
                                // 此时 res 是一个 Response 对象
                                if (!needGetText) {
                                    const resClone = (res as Response).clone()
                                    if (values.stream) {
                                        const reader = resClone.body?.getReader();
                                        if (reader) {
                                            while (true) {
                                                const {done, value} = await reader.read();
                                                if (done) break;
                                                const decoder = new TextDecoder();
                                                const text = decoder.decode(value);
                                                onNewText(text);
                                            }
                                        }
                                    } else {
                                        const resJson = await (res as Response).json();
                                        setResponseBody(resJson);
                                    }
                                }
                            } catch (e) {
                                console.error(e);
                                const error = await (res as Response).json() || e
                                setResponseBody(error);
                            }
                        } catch (e) {
                            console.error(e);
                        } finally {
                            setEndTimestamp(new Date().getTime());
                            setSubmitting(false);
                        }
                    }}
                    submitter={{
                        render: (submitterProps) => {
                            return <RenderSubmitter
                                abortController={abortController}
                                submitting={submitting}
                                submitterProps={submitterProps}
                                getValues={getCode}
                            />
                        }
                    }}
                >
                    <ProFormText
                        name={"model"}
                        label={"Model"}
                        rules={[{required: true}]}
                        fieldProps={{
                            autoComplete: "models_name",
                        }}
                    />

                    <ProFormList
                        name={"messages"}
                        label={"Messages"}
                        required
                        itemRender={({listDom, action}, {index}) => (
                            <ProCard
                                bordered
                                style={{marginBlockEnd: 8}}
                                title={`Message ${index + 1}`}
                                extra={action}
                                bodyStyle={{paddingBlockEnd: 0}}
                            >
                                {listDom}
                            </ProCard>
                        )}
                    >
                        {(_f, index) => {
                            const handleUserMessageTypeChange = (checked: boolean) => {
                                const newIsUserMessageTypeObj = [...isUserMessageTypeObj];
                                newIsUserMessageTypeObj[index] = checked;
                                setIsUserMessageTypeObj(newIsUserMessageTypeObj);
                            };
                            return (
                                <>
                                    <ProFormSelect
                                        name={"role"}
                                        label={"Role"}
                                        options={["system", "user", "assistant", "tool"]}
                                        rules={[{required: true}]}
                                    />
                                    <ProFormDependency name={['role']}>
                                        {({role}) => {
                                            switch (role) {
                                                case "system":
                                                    return (
                                                        <>
                                                            <ProFormTextArea
                                                                name={"content"}
                                                                label={"Content"}
                                                                rules={[{required: true}]}
                                                                fieldProps={{autoSize: {minRows: 2, maxRows: 8}}}
                                                            />
                                                            <ProFormText
                                                                name={"name"}
                                                                label={"Name"}
                                                                rules={[{required: false}]}
                                                            />
                                                        </>
                                                    );
                                                case "user":
                                                    return (
                                                        <>
                                                            <ProFormSwitch
                                                                label={"模式"}
                                                                checkedChildren={"对象"}
                                                                unCheckedChildren={"字符串"}
                                                                fieldProps={{
                                                                    value: isUserMessageTypeObj[index] || false,
                                                                    onChange: (checked) => {
                                                                        handleUserMessageTypeChange(checked);
                                                                        // Reset content when switching between object and string, as the content type is different
                                                                        chatCompletionsForm.setFieldValue(["messages", index, "content"], undefined);
                                                                    }
                                                                }}
                                                            />
                                                            {isUserMessageTypeObj[index] ? (
                                                                    <ProFormList
                                                                        name={"content"}
                                                                        label={"Content"}
                                                                        itemRender={({listDom, action}, {index}) => (
                                                                            <ProCard
                                                                                bordered
                                                                                style={{marginBlockEnd: 8}}
                                                                                title={`Content ${index + 1}`}
                                                                                extra={action}
                                                                                bodyStyle={{paddingBlockEnd: 0}}
                                                                            >
                                                                                {listDom}
                                                                            </ProCard>
                                                                        )}
                                                                    >
                                                                        <ProFormSelect
                                                                            name={"type"}
                                                                            label={"Type"}
                                                                            options={["text", "image_url"]}
                                                                            rules={[{required: true}]}
                                                                        />
                                                                        <ProFormDependency name={['type']}>
                                                                            {({type}) => {
                                                                                switch (type) {
                                                                                    case "text":
                                                                                        return <ProFormTextArea
                                                                                            name={"text"}
                                                                                            label={"Text"}
                                                                                            rules={[{required: true}]}
                                                                                            tooltip={"The text content."}
                                                                                            fieldProps={{
                                                                                                autoSize: {
                                                                                                    minRows: 2,
                                                                                                    maxRows: 8
                                                                                                }
                                                                                            }}
                                                                                        />;
                                                                                    case "image_url":
                                                                                        return (
                                                                                            <>
                                                                                                <ProFormTextArea
                                                                                                    name={["image_url", "url"]}
                                                                                                    label={"URL"}
                                                                                                    rules={[{required: true}]}
                                                                                                    tooltip={"Either a URL of the image or the base64 encoded image data."}
                                                                                                    fieldProps={{
                                                                                                        autoSize: {
                                                                                                            minRows: 2,
                                                                                                            maxRows: 8
                                                                                                        }
                                                                                                    }}
                                                                                                />
                                                                                                <ProFormTextArea
                                                                                                    name={["image_url", "detail"]}
                                                                                                    label={"Detail"}
                                                                                                    rules={[{required: false}]}
                                                                                                    tooltip={"Specifies the detail level of the image. Learn more in the Vision guide.Defaults to auto"}
                                                                                                    fieldProps={{
                                                                                                        autoSize: {
                                                                                                            minRows: 2,
                                                                                                            maxRows: 8
                                                                                                        }
                                                                                                    }}
                                                                                                />
                                                                                            </>
                                                                                        )
                                                                                }
                                                                            }}
                                                                        </ProFormDependency>
                                                                    </ProFormList>
                                                                )
                                                                : <ProFormTextArea
                                                                    name={"content"}
                                                                    label={"Content"}
                                                                    rules={[{required: true}]}
                                                                    fieldProps={{autoSize: {minRows: 2, maxRows: 8}}}
                                                                />}
                                                            <ProFormText
                                                                name={"name"}
                                                                label={"Name"}
                                                                rules={[{required: false}]}
                                                            />
                                                        </>
                                                    );
                                                case "assistant":
                                                    return (
                                                        <>
                                                            <ProFormTextArea
                                                                name={"content"}
                                                                label={"Content"}
                                                                rules={[{required: false}]}
                                                                fieldProps={{autoSize: {minRows: 2, maxRows: 8}}}
                                                            />
                                                            <ProFormText
                                                                name={"name"}
                                                                label={"Name"}
                                                                rules={[{required: false}]}
                                                            />
                                                            <ProFormList
                                                                name={"tool_calls"}
                                                                label={"Tool Calls"}
                                                                itemRender={({listDom, action}, {index}) => (
                                                                    <ProCard
                                                                        bordered
                                                                        style={{marginBlockEnd: 8}}
                                                                        title={`Tool Calls ${index + 1}`}
                                                                        extra={action}
                                                                        bodyStyle={{paddingBlockEnd: 0}}
                                                                    >
                                                                        {listDom}
                                                                    </ProCard>
                                                                )}
                                                            >
                                                                <ProFormText
                                                                    name={"id"}
                                                                    label={"ID"}
                                                                    rules={[{required: true}]}
                                                                    tooltip={"The ID of the tool call."}
                                                                />
                                                                <ProFormSelect
                                                                    name={"type"}
                                                                    label={"Type"}
                                                                    options={["function"]}
                                                                    rules={[{required: true}]}
                                                                    tooltip={"The type of the tool. Currently, only function is supported."}
                                                                />
                                                                <ProFormList
                                                                    name={"function"}
                                                                    label={"Function"}
                                                                    tooltip={"The function that the model called."}
                                                                    itemRender={({listDom, action}, {index}) => (
                                                                        <ProCard
                                                                            bordered
                                                                            style={{marginBlockEnd: 8}}
                                                                            title={`Function ${index + 1}`}
                                                                            extra={action}
                                                                            bodyStyle={{paddingBlockEnd: 0}}
                                                                        >
                                                                            {listDom}
                                                                        </ProCard>
                                                                    )}
                                                                >
                                                                    <ProFormText
                                                                        name={"name"}
                                                                        label={"Name"}
                                                                        rules={[{required: true}]}
                                                                        tooltip={"The name of the function to call."}
                                                                    />
                                                                    <ProFormTextArea
                                                                        name={"arguments"}
                                                                        label={"arguments"}
                                                                        rules={[{required: true}, jsonMapValidationRule]}
                                                                        tooltip={"The arguments to call the function with, as generated by the model in JSON format. Note that the model does not always generate valid JSON, and may hallucinate parameters not defined by your function schema. Validate the arguments in your code before calling your function."}
                                                                    />
                                                                </ProFormList>
                                                            </ProFormList>
                                                        </>
                                                    );
                                                case "tool":
                                                    return (
                                                        <>
                                                            <ProFormTextArea
                                                                name={"content"}
                                                                label={"Content"}
                                                                rules={[{required: true}]}
                                                                tooltip={"The contents of the tool message."}
                                                                fieldProps={{autoSize: {minRows: 2, maxRows: 8}}}
                                                            />
                                                            <ProFormText
                                                                name={"tool_call_id"}
                                                                label={"Tool Call ID"}
                                                                rules={[{required: true}]}
                                                                tooltip={"Tool call that this message is responding to."}
                                                            />
                                                        </>
                                                    );
                                            }
                                        }}
                                    </ProFormDependency>
                                </>
                            )
                        }}
                    </ProFormList>

                    <ProFormDigit
                        name={"frequency_penalty"}
                        label={"Frequency Penalty"}
                        min={-2.0}
                        max={2.0}
                    />

                    <ProFormTextArea
                        name={"logit_bias"}
                        label={"Logit Bias"}
                        rules={[jsonMapValidationRule]}
                        allowClear={true}
                        fieldProps={{autoSize: {minRows: 3, maxRows: 8}}}
                    />

                    <ProFormCheckbox
                        name={"logprobs"}
                        label={"Logprobs"}
                        // dependencies={["top_logprobs"]}
                        // initialValue={undefined}
                    />

                    {LogprobsEnabled && <ProFormDigit
                        name={"top_logprobs"}
                        label={"Top Logprobs"}
                        min={0}
                        max={20}
                    />}

                    <ProFormDigit
                        name={"max_tokens"}
                        label={"Max Tokens"}
                        tooltip={"The maximum number of tokens that can be generated in the chat completion. The total length of input tokens and generated tokens is limited by the model's context length."}
                    />

                    <ProFormDigit
                        name={"n"}
                        label={"N"}
                        tooltip={"How many chat completion choices to generate for each input message. Note that you will be charged based on the number of generated tokens across all of the choices. Keep n as 1 to minimize costs."}
                    />

                    <ProFormDigit
                        name={"presence_penalty"}
                        label={"Presence Penalty"}
                        min={-2.0}
                        max={2.0}
                        tooltip={"Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics."}
                    />

                    <ProFormList
                        name={"response_format"}
                        label={"Response Format"}
                        itemRender={({listDom, action}) => (
                            <ProCard
                                bordered
                                style={{marginBlockEnd: 8}}
                                title={`Response Format`}
                                extra={action}
                                bodyStyle={{paddingBlockEnd: 0}}
                            >
                                {listDom}
                            </ProCard>
                        )}
                        max={1}
                        transform={(value) => {
                            // 需要把数组转换成对象
                            return {
                                response_format: value[0]
                            };
                        }}
                    >
                        <ProFormSelect
                            name={["type"]}
                            label={"Type"}
                            options={[
                                {value: "text", label: "Text"},
                                {value: "json_object", label: "JSON Object"},
                            ]}
                            rules={[{required: true}]}
                            width={"sm"}
                        />
                    </ProFormList>


                    <ProFormDigit
                        name={"seed"}
                        label={"Seed"}
                        tooltip={"This feature is in Beta. If specified, our system will make a best effort to sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed, and you should refer to the system_fingerprint response parameter to monitor changes in the backend."}
                    />

                    <ProFormText
                        // TODO: string | string[] | null;
                        name={"stop"}
                        label={"Stop"}
                        tooltip={"Up to 4 sequences where the API will stop generating further tokens."}
                    />

                    <ProFormCheckbox
                        name={"stream"}
                        label={"Stream"}
                        // initialValue={undefined}
                    />

                    {isStream && <ProFormList
                        name={"stream_options"}
                        label={"Stream Options"}
                        max={1}
                        transform={(value) => {
                            // 需要把数组转换成对象
                            return {
                                stream_options: value[0]
                            };
                        }}
                        itemRender={({listDom, action}) => (
                            <ProCard
                                bordered
                                style={{marginBlockEnd: 8}}
                                title={`Stream Options`}
                                extra={action}
                                bodyStyle={{paddingBlockEnd: 0}}
                            >
                                {listDom}
                            </ProCard>
                        )}
                    >
                        <ProFormCheckbox
                            name={["include_usage"]}
                            label={"Include Usage"}
                        />
                    </ProFormList>}

                    <ProFormDigit
                        name={"temperature"}
                        label={"Temperature"}
                        min={0}
                        max={2}
                        tooltip={"What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic."}
                        extra={"We generally recommend altering this or top_p but not both."}
                    />

                    <ProFormDigit
                        name={"top_p"}
                        label={"Top P"}
                        min={0}
                        max={1}
                        tooltip={"An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered."}
                        extra={"We generally recommend altering this or temperature but not both."}
                    />

                    <ProFormList
                        name={"tools"}
                        label={"Tools"}
                        max={128}
                        itemRender={({listDom, action}, {index}) => (
                            <ProCard
                                bordered
                                style={{marginBlockEnd: 8}}
                                title={`Tools ${index + 1}`}
                                extra={action}
                                bodyStyle={{paddingBlockEnd: 0}}
                            >
                                {listDom}
                            </ProCard>
                        )}
                    >
                        <ProFormSelect
                            name={["type"]}
                            label={"Type"}
                            options={["function"]}
                            width={"sm"}
                            rules={[{required: true}]}
                        />
                        <ProFormList
                            name={["function"]}
                            label={"Function"}
                            itemRender={({listDom, action}, {index}) => (
                                <ProCard
                                    bordered
                                    style={{marginBlockEnd: 8}}
                                    title={`Function ${index + 1}`}
                                    extra={action}
                                    bodyStyle={{paddingBlockEnd: 0}}
                                >
                                    {listDom}
                                </ProCard>
                            )}
                        >
                            <ProFormText
                                name={["name"]}
                                label={"Name"}
                                rules={[{required: true}]}
                            />
                            <ProFormTextArea
                                name={["description"]}
                                label={"Description"}
                                rules={[{required: false}]}
                            />
                            <ProFormTextArea
                                name={["parameters"]}
                                label={"Parameters"}
                                rules={[{required: false}, {...jsonSchemaValidationRule, warningOnly: true}]}
                                fieldProps={{
                                    autoSize: {minRows: 2, maxRows: 8},
                                }}
                            />
                        </ProFormList>
                    </ProFormList>
                </ProForm>
            </Col>
            <Col flex={"none"}>
                <Divider type={"vertical"} style={{height: "100%"}}/>
            </Col>
            <Col flex="auto" style={COL_SCROLL_STYLE}>
                {isStream && <ProFormRadio.Group
                    label={"Display options"}
                    options={[
                        {
                            label: "Response body",
                            value: true
                        },
                        {
                            label: "Response text",
                            value: false
                        }
                    ]}
                    fieldProps={{
                        value: getText,
                        onChange: (e) => setGetText(e.target.value)
                    }}
                />}

                <h1>Response</h1>
                {renderRequestTimeDuration(startTimestamp, endTimestamp, isStream)}
                {responseBody && renderCode(JSON.stringify(responseBody, null, 2))}
                {res_text && renderCode(res_text)}

                <FloatButton.Group shape="square" style={{right: 24}}>
                    <FloatButton
                        icon={<PictureOutlined/>}
                        onClick={() => setShowImg2B64Modal(true)}
                    />
                </FloatButton.Group>
            </Col>

            <Upload2B64
                open={showImg2B64Modal}
                onClose={() => setShowImg2B64Modal(false)}
            />
        </>
    )
}
