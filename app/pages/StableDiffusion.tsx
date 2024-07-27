// app/pages/StableDiffusion.tsx
import {Col, Divider, Empty, FloatButton, Image, Segmented, Typography} from "antd";
import {COL_SCROLL_STYLE, PRO_FORM_PROPS} from "@/constant";
import {renderCode, RenderSubmitter} from "@/app/render";
import {handelResponseError, safeJsonStringify} from "@/app/utils";
import React, {useState} from "react";
import {
    ProDescriptions,
    ProForm,
    ProFormDigit,
    ProFormInstance,
    ProFormRadio,
    ProFormSelect,
    ProFormTextArea,
    ProFormUploadButton
} from "@ant-design/pro-components";
import {api2Provider, useAppConfig} from "@/app/store";
import {
    StableDiffusion3Request,
    StableDiffusionAPI,
    StableDiffusionImageCoreRequest,
    StableDiffusionImageUltraRequest
} from "@/app/client/StableDiffusion";
import {SegmentedOptions} from "antd/es/segmented";
import {CloudDownloadOutlined, CloudUploadOutlined} from "@ant-design/icons";

export interface StableDiffusionResponse {
    image: string;
    finish_reason: "SUCCESS" | string;
    seed: number;
}

interface StableDiffusionData extends StableDiffusionResponse {
    prompt: any;
    output_format: "jpeg" | "png" | "webp";
}

const StableDiffusionForm = (props: {
    form: ProFormInstance;
    api: StableDiffusionAPI;
    updateResponse: (data: any) => void;
    updateError: (e: any) => void;
}) => {
    const type_options: SegmentedOptions = [
        {label: "Image Ultra", value: "imageUltra"},
        {label: "Image Core", value: "imageCore"},
        {label: "Diffusion 3", value: "sd3"}
    ];
    const [sdType, setSdType] = useState<"imageUltra" | "imageCore" | "sd3">("imageUltra");
    const [submitting, setSubmitting] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const selectedMode = (ProForm.useWatch("mode", props.form) || "text-to-image") as "image-to-image" | "text-to-image";
    const selectedModel = ProForm.useWatch("model", props.form) as "sd3-medium" | "sd3-large" | "sd3-large-turbo";

    return (
        <>
            <Segmented
                style={{marginBottom: 20}}
                options={type_options}
                value={sdType}
                block
                onChange={(value) => {
                    setSdType(value as typeof sdType)
                    props.form.resetFields()
                }}
            />

            <ProForm<StableDiffusionImageUltraRequest | StableDiffusionImageCoreRequest | StableDiffusion3Request>
                {...PRO_FORM_PROPS}
                form={props.form}
                onFinish={async (values) => {
                    props.updateError(null);
                    const controller = new AbortController();
                    setAbortController(controller);
                    setSubmitting(true);
                    try {
                        const res = await props.api.submit(sdType, values, controller.signal);
                        if (res.ok) {
                            const resJson = await res.json() as StableDiffusionResponse;
                            props.updateResponse({
                                ...resJson,
                                prompt: values.prompt,
                                output_format: values.output_format ?? "png",
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
                        return <RenderSubmitter
                            abortController={abortController}
                            submitting={submitting}
                            submitterProps={submitterProps}
                            getValues={() => JSON.stringify(props.form.getFieldsValue(), null, 2) || ""}
                        />
                    }
                }}
            >


                {sdType === "sd3" && <>
                    <ProFormSelect
                        name="model"
                        label="Model"
                        options={["sd3-medium", "sd3-large", "sd3-large-turbo"]}
                        tooltip={
                            <>
                                <Typography.Paragraph style={{color: "white"}}>
                                    SD3 Medium - the 2 billion parameter model
                                </Typography.Paragraph>
                                <Typography.Paragraph style={{color: "white"}}>
                                    SD3 Large - the 8 billion parameter model
                                </Typography.Paragraph>
                                <Typography.Paragraph style={{color: "white"}}>
                                    SD3 Large Turbo - the 8 billion parameter model with a faster inference time
                                </Typography.Paragraph>
                            </>
                        }
                        rules={[{required: true, message: "Please select model"}]}
                    />

                    <ProFormRadio.Group
                        name="mode"
                        label="Mode"
                        options={["text-to-image", "image-to-image",]}
                        tooltip="Controls whether this is a text-to-image or image-to-image generation. Defaults to text-to-image."
                        radioType="button"
                    />

                    {/*Important: This parameter is only valid for image-to-image requests.*/}
                    {selectedMode === "image-to-image" && <ProFormUploadButton
                        name="image"
                        label="Image"
                        tooltip="The image to use as the starting point for the generation. Supported formats: JPEG, PNG, WEBP. Supported dimensions: Every side must be at least 64 pixels"
                        accept={".jpeg,.png,.webp"}
                        rules={[{required: true, message: "Please upload image"}]}
                    />}

                    {/*Important: This parameter is only valid for image-to-image requests.*/}
                    {selectedMode === "image-to-image" && <ProFormDigit
                        name="strength"
                        label="Strength"
                        fieldProps={{step: 0.1}}
                        tooltip="Sometimes referred to as denoising, this parameter controls how much influence the image parameter has on the generated image. A value of 0 would yield an image that is identical to the input. A value of 1 would be as if you passed in no image at all."
                        rules={[
                            {required: true, message: "Please enter strength"},
                            {
                                type: "number",
                                min: 0.0,
                                max: 1.0,
                                message: "Strength must be between 0.0 and 1.0"
                            }
                        ]}
                    />}
                </>}

                <ProFormTextArea
                    name="prompt"
                    label="Prompt"
                    tooltip={"What you wish to see in the output image. A strong, descriptive prompt that clearly defines elements, colors, and subjects will lead to better results."}
                    rules={[
                        {required: true, message: "Please enter prompt"},
                        {max: 10000, message: "Prompt must be less than 10000 characters"}
                    ]}
                />

                {/*Important: This parameter (negative_prompt) does not work with sd3-large-turbo.*/}
                {selectedModel !== "sd3-large-turbo" && <ProFormTextArea
                    name="negative_prompt"
                    label="Negative Prompt"
                    tooltip="A blurb of text describing what you do not wish to see in the output image. This is an advanced feature."
                    rules={[
                        {max: 10000, message: "Prompt must be less than 10000 characters"}
                    ]}
                />}

                {/*Important: This parameter is only valid for text-to-image requests.*/}
                {selectedMode! === "text-to-image" && <ProFormSelect
                    name="aspect_ratio"
                    label="Aspect Ratio"
                    placeholder="Width : Height"
                    options={["1:1", "16:9", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"]}
                    tooltip="Controls the aspect ratio of the generated image. Defaults to 1:1."
                    width="sm"
                />}

                <ProFormRadio.Group
                    name="output_format"
                    label="Output Format"
                    tooltip="Dictates the content-type of the generated image."
                    options={sdType === "sd3" ? ["jpeg", "png"] : ["jpeg", "png", "webp"]}
                />

                <ProFormDigit
                    name="seed"
                    label="Seed"
                    tooltip="A specific value that is used to guide the 'randomness' of the generation. (Omit this parameter or pass 0 to use a random seed.)"
                    min={0}
                    max={4294967294}
                />

                {sdType === "imageCore" && <ProFormSelect
                    name="style_preset"
                    label="Style Preset"
                    options={["analog-film", "anime", "cinematic", "comic-book", "digital-art", "enhance", "fantasy-art", "isometric", "line-art", "low-poly", "modeling-compound", "neon-punk", "origami", "photographic", "pixel-art", "3d-model", "tile-texture"]}
                    tooltip="Guides the image model towards a particular style."
                />}

            </ProForm>
        </>
    )
}

const StableDiffusionDataRenderer = (props: {
    data: StableDiffusionData[],
    api: StableDiffusionAPI,
    onDelData: (index: number) => void
}) => {
    if (!props.data || props.data.length === 0) return <Empty/>

    return (
        <>
            {props.data.map((task, index) => (
                <ProDescriptions
                    title={`Data ${index + 1}`}
                    dataSource={task}
                    column={1}
                    bordered
                    style={{
                        marginBottom: 20,
                    }}
                    size={"small"}
                    columns={[
                        {
                            title: "Finish Reason",
                            dataIndex: ["finish_reason"],
                            valueEnum: {
                                "SUCCESS": {text: "SUCCESS", status: "Success"},
                                "FAILURE": {text: "FAILURE", status: "Error"},
                            }
                        },
                        {
                            title: "seed",
                            dataIndex: ["seed"],
                            copyable: true,
                        },
                        {
                            title: "Image File",
                            key: "image_download",
                            render: (_dom, record) => {
                                return <a
                                    onClick={() => {
                                        const url = "data:image/" + record.output_format + ";base64," + record.image;
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${record.prompt}.` + record.output_format;
                                        a.click();
                                    }}
                                >
                                    Click to download
                                </a>
                            }
                        },
                        {
                            title: "Image Preview",
                            key: "image",
                            render: (_dom, record) => {
                                if (record?.image) {
                                    return <Image
                                        src={"data:image/" + record.output_format + ";base64," + record.image}
                                        alt={record.image}
                                        style={{maxWidth: 240}}
                                    />;
                                }
                                return null;
                            }
                        },
                        {
                            title: "Prompt",
                            dataIndex: ["prompt"],
                            copyable: true,
                        },
                        {
                            title: '操作',
                            valueType: 'option',
                            render: () => [
                                <a key="delete" onClick={() => props.onDelData(index)}>Delete</a>
                            ],
                        },
                    ]}
                />
            ))}
        </>
    )
}

export const StableDiffusionPage = () => {
    const appConfig = useAppConfig();
    const stableDiffusionApi = new StableDiffusionAPI(appConfig.getFirstApiKey(api2Provider.StableDiffusion));
    const [sdForm] = ProForm.useForm()

    const [data, setData] = useState<StableDiffusionData[]>([]);
    const [errorData, setErrorData] = useState<any>(null);

    const onNewData = (res: StableDiffusionData) => {
        setData([...data, res]);
    }

    const onDelData = (index: number) => {
        const newData = [...data];
        newData.splice(index, 1);
        setData(newData);
    }

    return (
        <>
            <Col flex="340px" style={COL_SCROLL_STYLE}>
                <StableDiffusionForm
                    form={sdForm}
                    api={stableDiffusionApi}
                    updateResponse={onNewData}
                    updateError={(e) => setErrorData(e)}
                />
            </Col>
            <Col flex={"none"}>
                <Divider type={"vertical"} style={{height: "100%"}}/>
            </Col>
            <Col flex="auto" style={COL_SCROLL_STYLE}>
                <h1>Response</h1>
                <StableDiffusionDataRenderer
                    data={data}
                    api={stableDiffusionApi}
                    onDelData={onDelData}
                />
                {errorData && <>
                    <h1>Error</h1>
                    {renderCode(safeJsonStringify(errorData, errorData.toString()))}
                </>}
            </Col>
            <FloatButton.Group shape="square" style={{right: 24}}>

                <FloatButton
                    icon={<CloudUploadOutlined/>}
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const content = e.target?.result as string;
                                    try {
                                        const data = JSON.parse(content) as StableDiffusionData[];
                                        let ok = true;
                                        const requiredProperties = [
                                            'id', 'status', 'progress', 'prompt', 'promptEn',
                                            'action', 'description', 'failReason', 'imageUrl',
                                            'submitTime', 'startTime', 'finishTime', 'buttons'
                                        ];
                                        for (const item of data) {
                                            if (!requiredProperties.every(prop => item.hasOwnProperty(prop))) {
                                                ok = false;
                                                break;
                                            }
                                        }
                                        if (ok) {
                                            setData(data);
                                        } else {
                                            alert("Invalid data format");
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }
                                reader.readAsText(file);
                            }
                        }
                        input.click();
                    }}
                />
                <FloatButton
                    icon={<CloudDownloadOutlined/>}
                    onClick={() => {
                        // download taskData
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                        const downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute("href", dataStr);
                        downloadAnchorNode.setAttribute("download", "taskData.json");
                        document.body.appendChild(downloadAnchorNode);
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                    }}
                />

            </FloatButton.Group>
        </>
    )
}
