// app/components/ShellApiApiKey.tsx

import { App, Button, Modal, Result, StepProps, Steps, Table } from "antd";
import { ShellApi, ShellApiLoginRequest, ShellApiToken } from "@/app/client/shell-api";
import React, { useState } from "react";
import { SmileOutlined, SolutionOutlined, UserOutlined } from "@ant-design/icons";
import { ProForm, ProFormText } from "@ant-design/pro-components";

const ShellApiApiKey = (props: { open: boolean; onClose: () => void; baseUrl: string }) => {
  const { message } = App.useApp();
  const api = new ShellApi(props.baseUrl);
  const [step, setStep] = useState(0);

  const [status, setStatus] = useState<("error" | "wait" | "process" | "finish" | undefined)[]>([
    "process",
    "wait",
    "wait",
  ]);

  const authFailed = status[1] === "error";

  const [tokenList, setTokenList] = useState<ShellApiToken[]>([]);
  const [error, setError] = useState<Error>();

  const steps: StepProps[] = [
    { title: "Login", status: status[0], icon: <UserOutlined /> },
    { title: "Verification", status: status[1], icon: <SolutionOutlined /> },
    { title: "Done", status: status[2], icon: <SmileOutlined /> },
  ];

  return (
    <Modal
      open={props.open}
      onCancel={props.onClose}
      footer={false}
      closeIcon={false}
      width={580}
      centered={true}
      destroyOnClose={true}
      afterClose={() => {
        setStep(0);
        setStatus(["process", "wait", "wait"]);
        setError(undefined);
      }}
    >
      <Steps items={steps} style={{ marginBottom: 32 }} />
      {step === 0 && (
        <ProForm<ShellApiLoginRequest>
          layout="vertical"
          wrapperCol={{ span: 12, offset: 6 }}
          submitter={{
            render: (props) => {
              return (
                <ProForm.Item>
                  <Button block type="primary" onClick={props.submit}>
                    Login
                  </Button>
                </ProForm.Item>
              );
            },
          }}
          onFinish={async (values) => {
            // 进入第二步
            setStep(1);
            setStatus(["finish", "process", "wait"]);
            try {
              const data = await api.getTokens(values);
              setTokenList(data);
              setStep(2);
              setStatus(["finish", "finish", "finish"]);
            } catch (e) {
              setStatus(["finish", "error", "wait"]);
              if (e instanceof Error) {
                setError(e);
              } else {
                setError(new Error("Unknown Error"));
              }
            }
          }}
        >
          <ProFormText name="username" placeholder="Username" />
          <ProFormText.Password name="password" placeholder="Password" />
        </ProForm>
      )}
      {step === 1 && (
        <Result
          status={authFailed ? "error" : undefined}
          title={authFailed ? "Verification Failed" : "Verification"}
          subTitle={authFailed ? error?.message : undefined}
          extra={
            authFailed
              ? [
                  <Button
                    key={"retry"}
                    block
                    onClick={() => {
                      setStep(0);
                      setStatus((prevState) => {
                        prevState[0] = "process";
                        prevState[1] = "wait";
                        return prevState;
                      });
                    }}
                  >
                    Retry
                  </Button>,
                ]
              : []
          }
          style={{ padding: -20 }}
        />
      )}
      {step === 2 && (
        <Table
          dataSource={tokenList}
          pagination={false}
          size={"small"}
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              width: "30%",
              ellipsis: true,
            },
            {
              title: "API Key",
              key: "key",
              render: (_dom, record) => {
                return "sk-" + record.key.slice(0, 5) + "******" + record.key.slice(-3);
              },
              width: "35%",
            },
            {
              title: "Balance",
              key: "balance",
              render: (_dom, record) => {
                return record.unlimited_quota ? "Unlimited" : `$ ${(record.remain_quota / 500000).toFixed(2)}`;
              },
              width: "20%",
            },
            {
              title: "Actions",
              key: "actions",
              width: "20%",
              align: "center",
              render: (_dom, record) => {
                return (
                  <Button
                    block
                    type="link"
                    onClick={async () => {
                      await window.navigator.clipboard.writeText("sk-" + record.key);
                      message.success("API Key copied to clipboard");
                      props.onClose();
                    }}
                  >
                    Copy
                  </Button>
                );
              },
            },
          ]}
        />
      )}
    </Modal>
  );
};

export default ShellApiApiKey;
