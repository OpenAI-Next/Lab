import { useEffect, useState } from "react";
import { App, Button, Card, Col, Divider, Input, InputNumber, Row, Segmented, Select, Space, Statistic } from "antd";
import { getEncoding } from "js-tiktoken";
import { copyText } from "@/app/utils";
import { CENTER_STYLE } from "@/constant";
import { ProForm, ProFormDigit, ProFormRadio, ProFormSwitch } from "@ant-design/pro-components";
import { DollarTwoTone } from "@ant-design/icons";

// import {debounce} from "lodash";

export function ToolsPage() {
  const mode_options = [
    { label: "Tokenizer", value: "tokenizer" },
    { label: "Price Calculation", value: "price_calculation" },
    { label: "Ratio Calculation", value: "ratio_calculation" },
  ];

  const [mode, setMode] = useState<(typeof mode_options)[number]["value"]>(mode_options[0].value);

  const renderContent = () => {
    switch (mode) {
      case "tokenizer":
        return <TokenizerComponent />;
      case "price_calculation":
        return <PriceCalculationComponent />;
      case "ratio_calculation":
        return <RatioCalculationComponent />;
    }
  };

  return (
    <div style={CENTER_STYLE}>
      <Row gutter={[16, 16]} style={{ padding: 32, width: "100%" }}>
        <Col span={16} offset={4}>
          <Segmented
            value={mode}
            onChange={(value) => setMode(value)}
            options={mode_options}
            block
            style={{ marginBottom: 16 }}
          />
        </Col>
        <Col span={16} offset={4}>
          <Card
            style={{
              width: "100%",
              height: "75vh",
              minHeight: "75vh",
              maxHeight: "75vh",
            }}
          >
            <div style={{ padding: 8, height: "70vh", alignContent: "center" }}>{renderContent()}</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

const TokenizerComponent = () => {
  const { message } = App.useApp();
  const [input, setInput] = useState("Welcome to OpenAI Next Lab.");
  const [encodingType, setEncodingType] = useState("cl100k_base");
  const [tokenLength, setTokenLength] = useState(0);
  const ENCODING_TYPES = ["gpt2", "r50k_base", "p50k_base", "p50k_edit", "cl100k_base", "o200k_base"];

  const calculateTokenLength = () => {
    try {
      const enc = getEncoding(encodingType as any);
      const newTokens = enc.encode(input);
      setTokenLength(newTokens.length);
    } catch (e) {
      message.error("Failed to calculate token length." + e).then();
      setTokenLength(0);
    }
  };

  const copyTokenLength = async () => {
    if (tokenLength === 0) return;
    const ok = await copyText(tokenLength.toString());
    if (ok) {
      message.success({
        content: "copied !",
        key: "copyTokenLength",
        duration: 1,
      });
    } else {
      message.error({
        content: "failed to copy !",
        key: "copyTokenLength",
        duration: 1,
      });
    }
  };

  //eslint-disable-next-line
  useEffect(() => calculateTokenLength(), [encodingType, input]);

  return (
    <Space direction={"vertical"} style={{ width: "100%" }}>
      <Space>
        <Select
          variant="filled"
          value={encodingType}
          onChange={(value) => setEncodingType(value)}
          options={ENCODING_TYPES.map((value) => ({
            label: value,
            value: value,
          }))}
          style={{ width: 140 }}
          allowClear={false}
        />
        <InputNumber
          value={tokenLength}
          contentEditable={false}
          readOnly={true}
          variant="filled"
          onClick={copyTokenLength}
          style={{ width: 150, textAlign: "center" }}
          suffix={"Tokens"}
        />
      </Space>
      <Input.TextArea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ minHeight: "55vh", maxHeight: "60vh" }}
      />
      <Button block={true} type={"primary"} onClick={copyTokenLength}>
        Copy Token Length
      </Button>
    </Space>
  );
};

const PriceCalculationComponent = () => {
  const [priceCalculationForm] = ProForm.useForm();

  const [finalPrice, setFinalPrice] = useState(0.0);

  const priceMode = ProForm.useWatch("price_mode", priceCalculationForm) as "per_k_tokens" | "per_m_tokens" | "ratio";
  const isSamePrice = ProForm.useWatch("same_price", priceCalculationForm) as boolean;
  const isRatio = priceMode === "ratio";

  const price_mode_options = [
    { label: "1K Tokens", value: "per_k_tokens" },
    { label: "1M Tokens", value: "per_m_tokens" },
    { label: "Ratio", value: "ratio" },
  ];

  return (
    <ProForm
      form={priceCalculationForm}
      layout={"horizontal"}
      labelCol={{ span: 9 }}
      wrapperCol={{ span: 10 }}
      submitter={false}
      initialValues={{
        price_mode: "per_m_tokens",
        same_price: false,
        input_price: 0,
        output_price: 0,
        prompt_tokens: 0,
        completion_tokens: 0,
      }}
      onValuesChange={(_, values) => {
        let { price_mode, same_price, input_price, output_price, prompt_tokens, completion_tokens } = values;
        let multiplier = 0;
        switch (price_mode) {
          case "per_k_tokens":
            multiplier = 1000;
            break;
          case "per_m_tokens":
            multiplier = 1000000;
            break;
          // 模型倍率实则是 0.5M tokens 为单位
          case "ratio":
            multiplier = 500000;
            break;
        }
        if (same_price) {
          setFinalPrice((input_price * (prompt_tokens + completion_tokens)) / multiplier);
        } else {
          if (price_mode === "ratio") {
            // 补全价格 = 输入价格 * 补全倍率
            output_price = input_price * output_price;
          }
          setFinalPrice((input_price * prompt_tokens + output_price * completion_tokens) / multiplier);
        }
      }}
    >
      <ProFormRadio.Group
        name={"price_mode"}
        label={"Price Mode"}
        options={price_mode_options}
        rules={[{ required: true }]}
      />
      <ProFormSwitch name={"same_price"} label={"Same Price"} rules={[{ required: true }]} />
      <ProFormDigit
        name={"input_price"}
        label={isSamePrice ? (isRatio ? "Model Ratio" : "Price") : isRatio ? "Model Ratio" : "Input Price"}
        min={0}
        rules={[{ required: true }]}
        fieldProps={{
          prefix: !isRatio ? "$" : "",
          suffix: !isRatio ? "/ " + price_mode_options.find((option) => option.value === priceMode)?.label : "",
          controls: false,
        }}
      />
      <ProFormDigit
        name={"output_price"}
        label={isRatio ? "Completion Ratio" : "Output Price"}
        hidden={isSamePrice}
        min={0}
        rules={[{ required: true }]}
        fieldProps={{
          prefix: !isRatio ? "$" : "",
          suffix: !isRatio ? "/ " + price_mode_options.find((option) => option.value === priceMode)?.label : "",
          controls: false,
        }}
      />
      <Divider />
      <ProFormDigit
        name={"prompt_tokens"}
        label={"Prompt Tokens"}
        min={0}
        rules={[{ required: true }]}
        placeholder={""}
        fieldProps={{
          suffix: "Tokens",
          controls: false,
        }}
      />
      <ProFormDigit
        name={"completion_tokens"}
        label={"Completion Tokens"}
        min={0}
        rules={[{ required: true }]}
        fieldProps={{
          suffix: "Tokens",
          controls: false,
        }}
      />
      <Divider />
      <Statistic
        title="Price"
        value={finalPrice}
        precision={6}
        prefix={<DollarTwoTone twoToneColor={"#52c41a"} />}
        style={{ textAlign: "center" }}
        valueStyle={{ fontSize: 30 }}
      />
    </ProForm>
  );
};

const RatioCalculationComponent = () => {
  const [ratioCalculationForm] = ProForm.useForm();
  const priceMode = ProForm.useWatch("price_mode", ratioCalculationForm) as "per_k_tokens" | "per_m_tokens";
  const price_mode_options = [
    { label: "1K Tokens", value: "per_k_tokens" },
    { label: "1M Tokens", value: "per_m_tokens" },
  ];

  const [finalRatios, setFinalRatios] = useState({
    model_ratio: 0.0,
    completion_ratio: 0.0,
  });

  return (
    <ProForm
      form={ratioCalculationForm}
      layout={"horizontal"}
      labelCol={{ span: 9 }}
      wrapperCol={{ span: 10 }}
      submitter={false}
      initialValues={{
        price_mode: "per_m_tokens",
        same_price: false,
        input_price: 0,
        output_price: 0,
      }}
      onValuesChange={(_, values) => {
        let { price_mode, same_price, input_price, output_price } = values;
        switch (price_mode) {
          case "per_k_tokens":
            setFinalRatios({
              model_ratio: input_price / (2 * 1000),
              completion_ratio: same_price ? 1 : output_price / input_price,
            });
            break;
          case "per_m_tokens":
            setFinalRatios({
              model_ratio: input_price / 2,
              completion_ratio: same_price ? 1 : output_price / input_price,
            });
            break;
        }
      }}
    >
      <ProFormRadio.Group
        name={"price_mode"}
        label={"Price Mode"}
        options={price_mode_options}
        rules={[{ required: true }]}
      />
      <ProFormSwitch name={"same_price"} label={"Same Price"} rules={[{ required: true }]} />
      <ProFormDigit
        name={"input_price"}
        label={"Input Price"}
        min={0}
        rules={[{ required: true }]}
        fieldProps={{
          prefix: "$",
          suffix: "/ " + price_mode_options.find((option) => option.value === priceMode)?.label,
          controls: false,
        }}
      />
      <ProFormDigit
        name={"output_price"}
        label={"Output Price"}
        min={0}
        rules={[{ required: true }]}
        fieldProps={{
          prefix: "$",
          suffix: "/ " + price_mode_options.find((option) => option.value === priceMode)?.label,
          controls: false,
        }}
      />

      <Divider />
      <Space size={100} style={{ width: "100%", justifyContent: "center", marginBottom: 16 }}>
        <Statistic
          title="Model Ratio"
          value={finalRatios.model_ratio.toFixed(6).replace(/\.?0+$/, "")}
          style={{ textAlign: "center" }}
          valueStyle={{ fontSize: 30 }}
        />
        <Statistic
          title="Completion Ratio"
          value={finalRatios.completion_ratio.toFixed(6).replace(/\.?0+$/, "")}
          style={{ textAlign: "center" }}
          valueStyle={{ fontSize: 30 }}
        />
      </Space>
    </ProForm>
  );
};
