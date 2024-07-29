// app/pages/BibiGpt.tsx

import {Col, Divider, Segmented} from "antd";
import {COL_SCROLL_STYLE} from "@/constant";
import {ProForm, ProFormRadio} from "@ant-design/pro-components";
import {renderCode} from "@/app/render";
import {safeJsonStringify} from "@/app/utils";
import React from "react";

const BibiGptPage = () => {



    return(
        <>
            <Col flex="340px" style={COL_SCROLL_STYLE}>

            </Col>
            <Col flex={"none"}>
                <Divider type={"vertical"} style={{height: "100%"}}/>
            </Col>
            <Col flex="auto" style={COL_SCROLL_STYLE}>
                <h1>Task Data</h1>

            </Col>
        </>
    )
}

export default BibiGptPage;
