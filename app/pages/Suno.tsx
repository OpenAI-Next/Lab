// PATH: app/components/suno.tsx
import {
    ProDescriptions,
    ProForm,
    ProFormDigit,
    ProFormInstance,
    ProFormRadio,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
    ProFormTextArea,
} from "@ant-design/pro-components";
import {Button, Col, Divider, Empty, Image, Modal, Segmented, Select, Space, Spin} from "antd";
import {COL_SCROLL_STYLE, PRO_FORM_PROPS} from "@/constant";
import {
    SunoAPI,
    SunoClip,
    SunoCreateRequest,
    SunoCreateResponse,
    SunoQueryRequest,
    SunoQueryResponse
} from "@/app/client/sunoProxy";
import React, {useEffect, useRef, useState} from "react";
import {FileTextOutlined, TagsOutlined, UnorderedListOutlined} from "@ant-design/icons";
import {CloseAllSound, handelResponseError, safeJsonStringify} from "@/app/utils";
import {CodeModal, renderCode, RenderSubmitter} from "@/app/render";
import {api2Provider, useAppConfig} from "@/app/store";

/**
 Welcome to Custom Mode
 Start with Lyrics: Write down your thoughts, or click “Make Random Lyrics” for spontaneous creativity. Prefer no words? Opt for “Instrumental” and let the tunes express themselves.
 Choose a Style: Type your “Style of Music” to set the vibe, mood, tempo and voice. Not sure? “Use Random Style” might surprise you with the perfect genre.
 Extend Your Song: Want to go longer? Click "Extend" on the song's row (or under the "..." on mobile), enter additional lyrics to extend the song based on your previous verses, select the desired time to extend your song from, and press Continue. Once the extended songs have finished creating, click "..." and "Get Full Song" to get the entire completed song.
 Unleash Your Creativity: Dive into the world of music-making and let your imagination run wild. Happy composing! 🎉
 */

/**
 * 快速填充Suno歌曲风格模态框
 */
const QuickFillStyleModal = (props: { open: boolean, onClose: () => void, onFill: (style: string) => void }) => {
    const [selectedValue, setSelectedValue] = useState<{ s: string, l: string }>({s: "", l: ""});

    const s: { cn: string, en: string }[] = [
        {cn: "声学的", en: "acoustic"},
        {cn: "激进的", en: "aggressive"},
        {cn: "赞美诗般的", en: "anthemic"},
        {cn: "大气的", en: "atmospheric"},
        {cn: "有弹性的", en: "bouncy"},
        {cn: "轻松的", en: "chill"},
        {cn: "黑暗的", en: "dark"},
        {cn: "梦幻的", en: "dreamy"},
        {cn: "电子的", en: "electronic"},
        {cn: "情感的", en: "emotional"},
        {cn: "史诗般的", en: "epic"},
        {cn: "实验性的", en: "experimental"},
        {cn: "未来主义的", en: "futuristic"},
        {cn: "有节奏感的", en: "groovy"},
        {cn: "真挚的", en: "heartfelt"},
        {cn: "有感染力的", en: "infectious"},
        {cn: "旋律优美的", en: "melodic"},
        {cn: "温和的", en: "mellow"},
        {cn: "有力量的", en: "powerful"},
        {cn: "迷幻的", en: "psychedelic"},
        {cn: "浪漫的", en: "romantic"},
        {cn: "流畅的", en: "smooth"},
        {cn: "切分音的", en: "syncopated"},
        {cn: "令人振奋的", en: "uplifting"},
    ];
    const l: { cn: string, en: string }[] = [
        {cn: "非洲节奏", en: "afrobeat"},
        {cn: "动漫", en: "anime"},
        {cn: "民谣", en: "ballad"},
        {cn: "卧室流行", en: "bedroom pop"},
        {cn: "蓝草音乐", en: "bluegrass"},
        {cn: "布鲁斯", en: "blues"},
        {cn: "古典", en: "classical"},
        {cn: "乡村", en: "country"},
        {cn: "舞曲", en: "dance"},
        {cn: "舞曲流行", en: "dance pop"},
        {cn: "三角洲布鲁斯", en: "delta blues"},
        {cn: "电子流行", en: "electronic pop"},
        {cn: "迪斯科", en: "disco"},
        {cn: "梦幻流行", en: "dream pop"},
        {cn: "鼓和贝斯", en: "drum and bass"},
        {cn: "电子舞曲", en: "edm"},
        {cn: "情绪硬核", en: "emo"},
        {cn: "民谣", en: "folk"},
        {cn: "放克", en: "funk"},
        {cn: "未来贝斯", en: "future bass"},
        {cn: "福音", en: "gospel"},
        {cn: "垃圾音乐", en: "grunge"},
        {cn: "英国街头音乐", en: "grime"},
        {cn: "嘻哈", en: "hip hop"},
        {cn: "浩室", en: "house"},
        {cn: "独立", en: "indie"},
        {cn: "日本流行", en: "j-pop"},
        {cn: "爵士", en: "jazz"},
        {cn: "韩国流行", en: "k-pop"},
        {cn: "儿童音乐", en: "kids music"},
        {cn: "金属", en: "metal"},
        {cn: "新杰克摇摆", en: "new jack swing"},
        {cn: "新浪潮", en: "new wave"},
        {cn: "歌剧", en: "opera"},
        {cn: "流行", en: "pop"},
        {cn: "朋克", en: "punk"},
        {cn: "拉格", en: "raga"},
        {cn: "说唱", en: "rap"},
        {cn: "雷鬼", en: "reggae"},
        {cn: "摇滚", en: "rock"},
        {cn: "伦巴", en: "rumba"},
        {cn: "萨尔萨", en: "salsa"},
        {cn: "桑巴", en: "samba"},
        {cn: "塞尔塔内霍", en: "sertanejo"},
        {cn: "灵魂", en: "soul"},
        {cn: "合成器流行", en: "synth pop"},
        {cn: "摇摆", en: "swing"},
        {cn: "合成器浪潮", en: "synthesizer wave"},
        {cn: "泰克诺", en: "techno"},
        {cn: "陷阱", en: "trap"},
        {cn: "英国车库", en: "uk garage"}
    ];

    function generateRandomPrompt(): { s: string, l: string } {
        const randomS: { cn: string, en: string } = s[Math.floor(Math.random() * s.length)];
        const randomL: { cn: string, en: string } = l[Math.floor(Math.random() * l.length)];

        return {s: randomS.en, l: randomL.en};
    }

    return (
        <Modal
            title={"Quick Fill Style"}
            open={props.open}
            onCancel={props.onClose}
            centered
            footer={null}
            width={480}
        >
            <Space direction={"vertical"}>
                <Space.Compact>
                    <Select
                        value={selectedValue.s}
                        style={{width: 220}}
                        onChange={(value) => setSelectedValue({...selectedValue, s: value})}
                        options={s.map((item) => ({label: `${item.en}（${item.cn}）`, value: item.en}))}
                        placeholder={"Select a style"}
                    />

                    <Select
                        value={selectedValue.l}
                        style={{width: 220}}
                        onChange={(value) => setSelectedValue({...selectedValue, l: value})}
                        options={l.map((item) => ({label: `${item.en}（${item.cn}）`, value: item.en}))}
                        placeholder={"Select a style"}
                    />
                </Space.Compact>

                <Button
                    block
                    onClick={() => setSelectedValue(generateRandomPrompt())}
                    type={"dashed"}
                >
                    Random
                </Button>

                <Button
                    block
                    onClick={() => props.onFill(`${selectedValue.s} ${selectedValue.l}`)}
                    type={"primary"}
                    disabled={selectedValue.s === "" || selectedValue.l === ""}
                >
                    Fill
                </Button>
            </Space>
        </Modal>
    )
}

/**
 * Suno创作表单
 */
const SunoCreateForm = (props: {
    form: ProFormInstance<SunoCreateRequest>,
    api: SunoAPI,
    updateResponse: (data: TaskData) => void,
    updateError: (error: any) => void,
}) => {
    const [createMode, setCreateMode] = useState<"Description" | "Lyrics">("Description");
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const [submitting, setSubmitting] = useState(false);

    const isMakeInstrumental = ProForm.useWatch("make_instrumental", props.form)

    const inputContinueClipId = ProForm.useWatch("continue_clip_id", props.form)
    const isExtend = inputContinueClipId !== undefined && inputContinueClipId !== "";

    const [showQuickFillModal, setShowQuickFillModal] = useState(false);

    // 继续创作需要使用自定义模式（即 Lyrics 模式）
    useEffect(() => {
        isExtend && setCreateMode("Lyrics")
    }, [isExtend])

    return (
        <>
            <ProForm<SunoCreateRequest>
                {...PRO_FORM_PROPS}
                form={props.form}
                onFinish={async (values) => {
                    if (!values.prompt) values.prompt = " ";
                    if (!values.tags) values.tags = " ";
                    if (values.continue_clip_id === "") {
                        delete values.continue_clip_id;
                    }
                    props.updateResponse({clips: [], serverId: ""});
                    props.updateError(null);
                    const controller = new AbortController();
                    setAbortController(controller);
                    setSubmitting(true);
                    try {
                        const res = await props.api.create(values, controller.signal);
                        if (res.ok) {
                            const resJson = await res.json() as SunoCreateResponse
                            props.updateResponse({clips: resJson.clips, serverId: resJson.server_id});
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
                initialValues={{mv: "chirp-v3-5"}}
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
                <ProFormRadio.Group
                    label={"Mode"}
                    options={[
                        {
                            label: "Description",
                            value: "Description",
                            disabled: isExtend,
                        },
                        {
                            label: "Lyrics",
                            value: "Lyrics",

                        }
                    ]}
                    fieldProps={{
                        value: createMode,
                        onChange: (e) => setCreateMode(e.target.value),
                    }}
                />

                <Divider/>

                {(!isMakeInstrumental && createMode === "Lyrics") && <ProFormTextArea
                    name={"prompt"}
                    label={"Lyrics"}
                    placeholder={isExtend ? "Enter additional lyrics to extend the song based on your previous verses..." : "Enter your own lyrics..."}
                    rules={[{required: !isExtend}]}
                    fieldProps={{autoSize: {minRows: 3, maxRows: 12}}}
                />}

                {createMode === "Description" && <ProFormTextArea
                    name={"gpt_description_prompt"}
                    label={"Description Prompt"}
                    rules={[{required: true}]}
                    fieldProps={{autoSize: {minRows: 3, maxRows: 12}}}
                />}

                <ProFormSwitch
                    name={"make_instrumental"}
                    label={"Instrumental"}
                    rules={[{required: false}]}
                    tooltip={"Create a song without lyrics."}
                />

                {createMode === "Lyrics" && <>
                    <ProFormText
                        name={"tags"}
                        label={"Style of Music"}
                        rules={[
                            {required: true},
                            {pattern: /^\S+( \S+)*$/, message: "风格必须是空格分隔的单词"},
                            {pattern: /^[^\u4e00-\u9fa5]+$/, message: "风格应是英文单词"},
                        ]}
                        tooltip={"Describe the style of music you want (e.g., 'acoustic pop'). Suno's models do not recognize artists' names, but do understand genres and vibes."}
                    />
                    <ProForm.Item>
                        <Button
                            onClick={() => setShowQuickFillModal(true)}
                            type={"dashed"}
                            icon={<TagsOutlined/>}
                            block
                        >
                            Style Presets Helper
                        </Button>
                    </ProForm.Item>
                </>}

                {createMode === "Lyrics" && <ProFormText
                    name={"title"}
                    label={"Title"}
                    rules={[{required: true}]}
                    tooltip={"Give your song a title for sharing, discovery and organization."}
                />}

                <ProFormSelect
                    name={"mv"}
                    label={"Model Version"}
                    tooltip={"model_version, only chirp-v3-0 is supported"}
                    options={["chirp-v3-5", "chirp-v3-0", "chirp-v2-xxl-alpha"]}
                    rules={[{required: true}]}
                    allowClear={false}
                />

                <Divider/>

                <ProForm.Group
                    title={"继续创作"}
                    tooltip={"如果需要对已有的片段进行继续创作，可以在这里填写相关信息"}
                >
                    <ProFormText
                        name={"continue_clip_id"}
                        label={"Clip ID"}
                        width={"md"}
                    />
                    <ProFormDigit
                        name={"continue_at"}
                        label={"继续时刻"}
                        min={0}
                        fieldProps={{precision: 0, suffix: "秒", controls: false}}
                        width={"md"}
                        rules={[{required: isExtend, message: "您填写了继续片段ID，必须填写继续时刻"}]}
                    />
                </ProForm.Group>
            </ProForm>
            <QuickFillStyleModal
                open={showQuickFillModal}
                onClose={() => setShowQuickFillModal(false)}
                onFill={(style) => {
                    props.form.setFieldsValue({tags: style})
                    setShowQuickFillModal(false)
                }}
            />
        </>
    );
}

const SunoQueryForm = (props: {
    form: ProFormInstance<SunoQueryRequest>,
    api: SunoAPI,
    updateResponse: (data: TaskData) => void,
    updateError: (error: any) => void,
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
                props.updateResponse({clips: [], serverId: ""});
                props.updateError(null);
                const controller = new AbortController();
                setAbortController(controller);
                setSubmitting(true);
                try {
                    const res = await props.api.query(values, controller.signal)
                    if (res.ok) {
                        const resJson = await res.json() as SunoQueryResponse
                        props.updateResponse({clips: resJson, serverId: values.server_id});
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
                    return <RenderSubmitter
                        abortController={abortController}
                        submitting={submitting}
                        submitterProps={submitterProps}
                        getValues={() => JSON.stringify(formRef.current?.getFieldFormatValue?.(), null, 2) || ""}
                    />
                }
            }}
        >
            <ProFormText
                name={"server_id"}
                label={"Server ID"}
                tooltip={"ID returned when submitting a task."}
                rules={[{required: true}]}
            />

            <ProFormTextArea
                name={"ids"}
                label={"Clip ID"}
                tooltip={"ID of the clip to query."}
                placeholder={"Enter clip IDs, one per line."}
                fieldProps={{autoSize: {minRows: 2, maxRows: 12}}}
                transform={(value) => value.split("\n").map((v: string) => v.trim()).join(",")}
                rules={[
                    {
                        required: true
                    },
                    {
                        type: "string",
                        pattern: /^(?:(?!.*\n\n)[\na-z0-9-])+$/,
                        message: "The content may not meet the requirements.",
                        warningOnly: true
                    }
                ]}
            />
        </ProForm>
    )
}

const SunoTaskInfo = (props: {
    clips: SunoClip[] | undefined,
    serverId: string | undefined,
    onContinue: (clip: SunoClip) => void
    api: SunoAPI,
    onUpdate: (clip: SunoClip[]) => void,
    onError: (error: any) => void
}) => {

    const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({0: false, 1: false});
    const [showCodeModal, setShowCodeModal] = useState(false);

    if (!props.clips || props.clips.length === 0) return <Empty/>;

    const handleRefresh = async (index: number) => {
        setLoadingStates(prevStates => ({...prevStates, [index]: true}));
        try {
            if (props.clips) {
                const res = await props.api.query({
                    server_id: props.serverId as string,
                    ids: props.clips[index].id
                });
                if (res.ok) {
                    const resJson = await res.json() as SunoQueryResponse;
                    props.onUpdate(resJson);
                } else {
                    await handelResponseError(res, props.onError);
                }
            }
        } finally {
            setLoadingStates(prevStates => ({...prevStates, [index]: false}));
        }
    };

    return (
        <>
            {props.clips.map((clip: SunoClip, index: number) => (
                <Spin
                    spinning={loadingStates[index] || false}
                    key={index}
                    tip={"Refreshing..."}
                >
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
                                title: "Server ID",
                                key: "server_id",
                                render: () => props.serverId,
                            },
                            {
                                title: "Status",
                                dataIndex: "status",
                                valueEnum: {
                                    "complete": {text: "Complete", status: "Success"},
                                    "streaming": {text: "Streaming", status: "Processing"},
                                    "queued": {text: "Queued", status: "Warning"},
                                    "submitted": {text: "Submitted", status: "Processing"},
                                    "failed": {text: "Failed", status: "Error"},
                                }
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
                                title: "Image & Video",
                                key: "image_and_video_preview",
                                render: () => {
                                    return (
                                        <Image
                                            alt={clip.title}
                                            src={clip.image_large_url}
                                            preview={(clip.video_url && !clip.is_video_pending) ? {
                                                imageRender: () => <video controls src={clip.video_url}
                                                                          style={{maxHeight: "90vh"}}/>,
                                                toolbarRender: () => null,
                                                onVisibleChange: (visible: boolean) => !visible && CloseAllSound(),
                                            } : false}
                                            width={120}
                                        />
                                    )
                                }
                            },
                            {
                                title: "Audio Preview",
                                key: "audio_preview",
                                render: () => clip.audio_url !== "" && <audio
                                    controls
                                    src={clip.audio_url}
                                    style={{padding: 8}}
                                />
                            },
                            {
                                title: "Created At",
                                dataIndex: "created_at"
                            },
                            {
                                title: "Title",
                                dataIndex: "title"
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
                                title: '操作',
                                valueType: 'option',
                                render: () => [
                                    ...(props.api.finished(clip)) ? [
                                        <a
                                            key="continue"
                                            onClick={() => props.onContinue(clip)}
                                        >
                                            Continue
                                        </a>] : [],
                                    <a
                                        key="query"
                                        onClick={() => handleRefresh(index)}
                                    >
                                        Refresh
                                    </a>,
                                    <a
                                        key="code"
                                        onClick={() => setShowCodeModal(true)}
                                    >
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
                code={safeJsonStringify(props.clips, props.clips.toString())}
            />
        </>
    )

}

interface TaskData {
    clips: SunoClip[];
    serverId: string;
}

export function SunoPage() {
    const appConfig = useAppConfig();
    const sunoApi = new SunoAPI(appConfig.getFirstApiKey(api2Provider.Suno));
    const [createForm] = ProForm.useForm();
    const [queryForm] = ProForm.useForm();

    const [taskData, setTaskData] = useState<TaskData>({clips: [], serverId: ""});
    const [errorData, setErrorData] = useState<any>(null)

    const type_options = [
        {label: "Create", value: "create", icon: <UnorderedListOutlined/>},
        {label: "Query", value: "query", icon: <FileTextOutlined/>},
    ]

    const [formType, setFormType] = useState<"create" | "query">("create");

    const SunoForms = {
        "create": <SunoCreateForm
            form={createForm}
            api={sunoApi}
            updateResponse={(data: TaskData) => setTaskData(data)}
            updateError={(error: any) => setErrorData(error)}
        />,
        "query": <SunoQueryForm
            form={queryForm}
            api={sunoApi}
            updateResponse={(data: TaskData) => setTaskData(data)}
            updateError={(error: any) => setErrorData(error)}
        />,
    }

    return (
        <>
            <Col flex="340px" style={COL_SCROLL_STYLE}>
                <Segmented
                    style={{marginBottom: 20}}
                    options={type_options}
                    block
                    onChange={(value) => setFormType(value as typeof formType)}
                />
                {SunoForms[formType as keyof typeof SunoForms]}
            </Col>
            <Col flex={"none"}>
                <Divider type={"vertical"} style={{height: "100%"}}/>
            </Col>
            <Col flex="auto" style={COL_SCROLL_STYLE}>
                <h1>Clips Info</h1>
                <SunoTaskInfo
                    clips={taskData.clips}
                    serverId={taskData.serverId}
                    onContinue={(clip: SunoClip) => {
                        setFormType("create")
                        createForm.resetFields()
                        createForm.setFieldsValue({
                            continue_clip_id: clip.id,
                            continue_at: clip.metadata.duration,
                            title: clip.title,
                            tags: clip.metadata.tags,
                        })
                    }}
                    api={sunoApi}
                    onUpdate={(singleClip: SunoClip[]) => {
                        setTaskData({
                            ...taskData,
                            clips: taskData.clips.map((clip) => {
                                const updatedClip = singleClip.find((c) => c.id === clip.id);
                                return updatedClip ? updatedClip : clip;
                            }),
                        });
                    }}
                    onError={(error: any) => setErrorData(error)}
                />

                {errorData && <>
                    <h1>Error</h1>
                    {renderCode(safeJsonStringify(errorData, errorData.toString()))}
                </>}
            </Col>
        </>
    )
}
