import React, { useState } from "react";
import { Affix, Badge, Button, Col, Descriptions, message, Modal, Row, Select, Space } from "antd";
import { CopyFilled, LoadingOutlined } from "@ant-design/icons";
import { copyText } from "@/app/utils";
import { ProForm, SubmitterProps } from "@ant-design/pro-components";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useNavigate } from "react-router-dom";
import { Path } from "@/constant";

export const CodeModal = (prop: { open: boolean; code: string; onClose: () => void }) => {
  return (
    <Modal open={prop.open} onCancel={prop.onClose} footer={null} closeIcon={false} centered width={800}>
      <>
        {renderCode(prop.code)}
        <Button
          icon={<CopyFilled />}
          block
          onClick={async () =>
            (await copyText(prop.code)) ? message.success("Copied") : message.error("Failed to copy")
          }
        >
          复制代码
        </Button>
      </>
    </Modal>
  );
};

export const renderCode = (code: string, maxHeight = "70vh", wrap: boolean = false) => {
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
  );
};

export const timestamp2String = (timestamp: number, type = "time") => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  // const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  if (type === "time") return `${hours}:${minutes}:${seconds}`;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const renderRequestTimeDuration = (start: number, end: number, stream = false) => {
  // not started
  if (start === 0) return null;

  return (
    <Descriptions column={3} bordered={true} size={"small"}>
      <Descriptions.Item label="Start">{timestamp2String(start)}</Descriptions.Item>
      <Descriptions.Item label="Finish">
        {end > 0 ? timestamp2String(end) : <Badge status="processing" text="Processing" />}
      </Descriptions.Item>
      {stream ? (
        <Descriptions.Item label="Duration">{(end > 0 ? end : new Date().getTime()) - start} ms</Descriptions.Item>
      ) : (
        <Descriptions.Item label="Duration">
          {end > 0 ? end - start + " ms" : <Badge status="processing" text="Processing" />}
        </Descriptions.Item>
      )}
    </Descriptions>
  );
};

export const RenderSubmitter = (props: {
  submitting: boolean;
  abortController: AbortController | null;
  submitterProps: SubmitterProps & { submit: () => void; reset: () => void };
  getValues: (() => string) | false;
  noApiKeys?: boolean;
}) => {
  const navigate = useNavigate();

  const navigateToSettings = () => {
    navigate(Path.Settings);
  };

  const [showCodeModal, setShowCodeModal] = React.useState(false);

  return (
    <>
      <ProForm.Item>
        <Affix offsetBottom={12}>
          <Space direction={"vertical"} style={{ width: "100%" }} size={[8, 8]}>
            <Button
              block
              icon={props.submitting ? <LoadingOutlined /> : undefined}
              type={props.submitting ? "default" : "primary"}
              danger={props.submitting || props.noApiKeys}
              onClick={() =>
                props.noApiKeys
                  ? navigateToSettings()
                  : props.submitting
                    ? props.abortController?.abort()
                    : props.submitterProps.submit()
              }
            >
              {props.noApiKeys ? "Set API Keys" : props.submitting ? "Cancel" : "Send"}
            </Button>
            <Row gutter={8}>
              {props.getValues !== false && (
                <Col span={12}>
                  <Button block onClick={() => setShowCodeModal(true)}>
                    Show Data
                  </Button>
                </Col>
              )}
              <Col span={props.getValues !== false ? 12 : 24}>
                <Button block danger onClick={() => props.submitterProps.reset()}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Space>
        </Affix>
      </ProForm.Item>
      {props.getValues !== false && (
        <CodeModal open={showCodeModal} code={props.getValues()} onClose={() => setShowCodeModal(false)} />
      )}
    </>
  );
};

/**
 * 快速填充Suno歌曲风格模态框
 */
export const QuickFillStyleModal = (props: { open: boolean; onClose: () => void; onFill: (style: string) => void }) => {
  const [selectedValue, setSelectedValue] = useState<{ s: string; l: string }>({
    s: "",
    l: "",
  });

  const s: { cn: string; en: string }[] = [
    { cn: "声学的", en: "acoustic" },
    { cn: "激进的", en: "aggressive" },
    { cn: "赞美诗般的", en: "anthemic" },
    { cn: "大气的", en: "atmospheric" },
    { cn: "有弹性的", en: "bouncy" },
    { cn: "轻松的", en: "chill" },
    { cn: "黑暗的", en: "dark" },
    { cn: "梦幻的", en: "dreamy" },
    { cn: "电子的", en: "electronic" },
    { cn: "情感的", en: "emotional" },
    { cn: "史诗般的", en: "epic" },
    { cn: "实验性的", en: "experimental" },
    { cn: "未来主义的", en: "futuristic" },
    { cn: "有节奏感的", en: "groovy" },
    { cn: "真挚的", en: "heartfelt" },
    { cn: "有感染力的", en: "infectious" },
    { cn: "旋律优美的", en: "melodic" },
    { cn: "温和的", en: "mellow" },
    { cn: "有力量的", en: "powerful" },
    { cn: "迷幻的", en: "psychedelic" },
    { cn: "浪漫的", en: "romantic" },
    { cn: "流畅的", en: "smooth" },
    { cn: "切分音的", en: "syncopated" },
    { cn: "令人振奋的", en: "uplifting" },
  ];
  const l: { cn: string; en: string }[] = [
    { cn: "非洲节奏", en: "afrobeat" },
    { cn: "动漫", en: "anime" },
    { cn: "民谣", en: "ballad" },
    { cn: "卧室流行", en: "bedroom pop" },
    { cn: "蓝草音乐", en: "bluegrass" },
    { cn: "布鲁斯", en: "blues" },
    { cn: "古典", en: "classical" },
    { cn: "乡村", en: "country" },
    { cn: "舞曲", en: "dance" },
    { cn: "舞曲流行", en: "dance pop" },
    { cn: "三角洲布鲁斯", en: "delta blues" },
    { cn: "电子流行", en: "electronic pop" },
    { cn: "迪斯科", en: "disco" },
    { cn: "梦幻流行", en: "dream pop" },
    { cn: "鼓和贝斯", en: "drum and bass" },
    { cn: "电子舞曲", en: "edm" },
    { cn: "情绪硬核", en: "emo" },
    { cn: "民谣", en: "folk" },
    { cn: "放克", en: "funk" },
    { cn: "未来贝斯", en: "future bass" },
    { cn: "福音", en: "gospel" },
    { cn: "垃圾音乐", en: "grunge" },
    { cn: "英国街头音乐", en: "grime" },
    { cn: "嘻哈", en: "hip hop" },
    { cn: "浩室", en: "house" },
    { cn: "独立", en: "indie" },
    { cn: "日本流行", en: "j-pop" },
    { cn: "爵士", en: "jazz" },
    { cn: "韩国流行", en: "k-pop" },
    { cn: "儿童音乐", en: "kids music" },
    { cn: "金属", en: "metal" },
    { cn: "新杰克摇摆", en: "new jack swing" },
    { cn: "新浪潮", en: "new wave" },
    { cn: "歌剧", en: "opera" },
    { cn: "流行", en: "pop" },
    { cn: "朋克", en: "punk" },
    { cn: "拉格", en: "raga" },
    { cn: "说唱", en: "rap" },
    { cn: "雷鬼", en: "reggae" },
    { cn: "摇滚", en: "rock" },
    { cn: "伦巴", en: "rumba" },
    { cn: "萨尔萨", en: "salsa" },
    { cn: "桑巴", en: "samba" },
    { cn: "塞尔塔内霍", en: "sertanejo" },
    { cn: "灵魂", en: "soul" },
    { cn: "合成器流行", en: "synth pop" },
    { cn: "摇摆", en: "swing" },
    { cn: "合成器浪潮", en: "synthesizer wave" },
    { cn: "泰克诺", en: "techno" },
    { cn: "陷阱", en: "trap" },
    { cn: "英国车库", en: "uk garage" },
  ];

  function generateRandomPrompt(): { s: string; l: string } {
    const randomS: { cn: string; en: string } = s[Math.floor(Math.random() * s.length)];
    const randomL: { cn: string; en: string } = l[Math.floor(Math.random() * l.length)];

    return { s: randomS.en, l: randomL.en };
  }

  return (
    <Modal title={"Quick Fill Style"} open={props.open} onCancel={props.onClose} centered footer={null} width={520}>
      <Space direction={"vertical"}>
        <Space.Compact>
          <Select
            size={"large"}
            value={selectedValue.s}
            style={{ width: 240 }}
            onChange={(value) => setSelectedValue({ ...selectedValue, s: value })}
            options={s.map((item) => ({
              label: `${item.en}（${item.cn}）`,
              value: item.en,
            }))}
            placeholder={"Select a style"}
          />

          <Select
            size={"large"}
            value={selectedValue.l}
            style={{ width: 240 }}
            onChange={(value) => setSelectedValue({ ...selectedValue, l: value })}
            options={l.map((item) => ({
              label: `${item.en}（${item.cn}）`,
              value: item.en,
            }))}
            placeholder={"Select a style"}
          />
        </Space.Compact>

        <Button block onClick={() => setSelectedValue(generateRandomPrompt())} type={"dashed"}>
          Random
        </Button>

        <Button
          block
          onClick={() => props.onFill(`${selectedValue.s} ${selectedValue.l}`)}
          type={"primary"}
          disabled={selectedValue.s === "" || selectedValue.l === ""}
        >
          Confirm
        </Button>
      </Space>
    </Modal>
  );
};
