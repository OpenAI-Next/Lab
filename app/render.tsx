import React from "react";
import {Affix, Badge, Button, Col, Descriptions, message, Modal, Row, Space} from "antd";
import {CopyFilled, LoadingOutlined} from "@ant-design/icons";
import {copyText} from "@/app/utils";
import {ProForm, SubmitterProps} from "@ant-design/pro-components";
import SyntaxHighlighter from 'react-syntax-highlighter';
import {a11yDark} from 'react-syntax-highlighter/dist/esm/styles/hljs';

export const CodeModal = (prop: { open: boolean, code: string, onClose: () => void }) => {
    return (
        <Modal
            open={prop.open}
            onCancel={prop.onClose}
            footer={null}
            closeIcon={false}
            centered
            width={800}
        >
            <>
                {renderCode(prop.code)}
                <Button
                    icon={<CopyFilled/>}
                    block
                    onClick={async () => await copyText(prop.code) ? message.success("Copied") : message.error("Failed to copy")}
                >
                    复制代码
                </Button>
            </>
        </Modal>
    )
}

export const renderCode = (code: string, maxHeight = "70vh", wrap:boolean = false) => {
    return (
        <SyntaxHighlighter
            language="json"
            style={a11yDark}
            customStyle={{
                maxHeight,
                borderRadius: "6px",
            }}
            wrapLines={wrap}
            wrapLongLines={wrap}
        >
            {code}
        </SyntaxHighlighter>
    )
}

export const timestamp2String = (timestamp: number, type = "time") => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    // const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    if (type === "time") return `${hours}:${minutes}:${seconds}`;
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const renderRequestTimeDuration = (start: number, end: number, stream = false) => {
    // not started
    if (start === 0) return null;

    return (
        <Descriptions column={3} bordered={true} size={"small"}>
            <Descriptions.Item label="Start">{timestamp2String(start)}</Descriptions.Item>
            <Descriptions.Item label="Finish">{end > 0 ? timestamp2String(end) :
                <Badge status="processing" text="Processing"/>}</Descriptions.Item>
            {stream ? <Descriptions.Item
                    label="Duration">{(end > 0 ? end : new Date().getTime()) - start} ms</Descriptions.Item> :
                <Descriptions.Item label="Duration">{end > 0 ? (end - start) + " ms" :
                    <Badge status="processing" text="Processing"/>}</Descriptions.Item>}
        </Descriptions>
    )
}

export const RenderSubmitter = (props: {
    submitting: boolean,
    abortController: AbortController | null,
    submitterProps: SubmitterProps & { submit: () => void; reset: () => void; }
    getValues: (() => string) | false
}) => {

    const [showCodeModal, setShowCodeModal] = React.useState(false);

    return (
        <>
            <ProForm.Item>
                <Affix offsetBottom={12}>
                    <div
                        style={{}}
                    >
                        <Space
                            direction={"vertical"}
                            style={{width: "100%",}}
                            size={[8, 8]}
                        >
                            <Button
                                block
                                icon={props.submitting ? <LoadingOutlined/> : undefined}
                                type={props.submitting ? "default" : "primary"}
                                danger={props.submitting}
                                onClick={() => props.submitting ? props.abortController?.abort() : props.submitterProps.submit()}
                            >
                                {props.submitting ? "Cancel" : "Send"}
                            </Button>
                            <Row gutter={8}>
                                {props.getValues !== false && (
                                    <Col span={12}>
                                        <Button
                                            block
                                            onClick={() => setShowCodeModal(true)}
                                        >
                                            Show Data
                                        </Button>
                                    </Col>
                                )}
                                <Col span={props.getValues !== false ? 12 : 24}>
                                    <Button
                                        block
                                        danger
                                        onClick={() => props.submitterProps.reset()}
                                    >
                                        Reset
                                    </Button>
                                </Col>
                            </Row>
                        </Space>
                    </div>
                </Affix>
            </ProForm.Item>
            {props.getValues !== false &&
                <CodeModal
                    open={showCodeModal}
                    code={props.getValues()}
                    onClose={() => setShowCodeModal(false)}
                />
            }
        </>
    )
}
