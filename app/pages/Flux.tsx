// /app/pages/Flux.tsx

import {api2Provider, useAppConfig} from "@/app/store";
import {FluxAPI} from "@/app/client/FluxProxy";
import {ProForm} from "@ant-design/pro-components";
import React, {ReactNode, useState} from "react";
import {UnorderedListOutlined} from "@ant-design/icons";
import {Col, Divider, Segmented} from "antd";
import {COL_SCROLL_STYLE} from "@/constant";
import {renderCode} from "@/app/render";
import {safeJsonStringify} from "@/app/utils";

export function FluxPage() {
    const appConfig = useAppConfig();
    const fluxApi = new FluxAPI(appConfig.getFirstApiKey(api2Provider.Flux));
    const [generationForm] = ProForm.useForm();

    const [taskData, setTaskData] = useState<any[]>([]);
    const [errorData, setErrorData] = useState<any>(null)

    const type_options = [
        {label: "Generate", value: "generate", icon: <UnorderedListOutlined/>},
    ]

    const [formType, setFormType] = useState<"generate" | "query" | "upscale">("generate");

    const updateTaskData = (data: any) => {
        const updatedTaskData = taskData.slice(); // 创建 taskData 的副本

        const index = updatedTaskData.findIndex((c: any) => c.id === data.id);

        if (index === -1) {
            // 如果 id 不存在，添加新数据
            updatedTaskData.push(data);
        } else {
            // 如果 id 已存在，更新数据
            updatedTaskData[index] = data;
        }

        setTaskData(updatedTaskData);
    }

    const RenderFluxForms: { [key in typeof formType]: ReactNode } = {
        "generate": null,
        "upscale": null,
        "query": null,
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
            </Col>

            <Col flex={"none"}>
                <Divider type={"vertical"} style={{height: "100%"}}/>
            </Col>

            <Col flex="auto" style={COL_SCROLL_STYLE}>
                <h1>Tasks Info</h1>

                {errorData && <>
                    <h1>Error</h1>
                    {renderCode(safeJsonStringify(errorData, errorData.toString()))}
                </>}
            </Col>
        </>
    )
}
