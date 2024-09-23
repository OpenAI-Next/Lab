import React, { lazy, useState } from "react";
import {
  Provider,
  PROVIDER_NAME,
  ProviderRealBaseUrlMap,
  useAppConfig,
} from "../store";

import { SCROLL_STYLE, SITE_TITLE } from "@/constant";
import { Button, Col, message, Row, Space } from "antd";
import {
  ProCard,
  ProCardProps,
  ProForm,
  ProFormList,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import {
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { ShellApiToken } from "@/app/client/shell-api";

const ShellApiApiKey = lazy(() => import("@/app/components/ShellApiApiKey"));

const SettingProCardProps: ProCardProps = {
  size: "small",
  bordered: true,
  headerBordered: true,
};

export function Settings() {
  const config = useAppConfig();
  const updateConfig = config.update;

  const [showShellApiApiKeyModal, setShowShellApiApiKeyModal] = useState(false);
  const [shellApiBaseUrl, setShellApiBaseUrl] = useState("");

  const onExport = () => {
    const data = JSON.stringify(localStorage, null, 2);
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const time = new Date().getTime();
    a.href = url;
    a.download = `export-data-${SITE_TITLE}-${time}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = () => {
    if (
      !window.confirm(
        "Importing data will overwrite current data. Are you sure you want to continue?",
      )
    )
      return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as any).files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const data = JSON.parse(reader.result as string);
          localStorage.clear();
          Object.keys(data).forEach((key) => {
            localStorage.setItem(key, data[key]);
          });
          location.reload();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const onClear = () => {
    onExport();
    localStorage.clear();
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    location.reload();
  };

  return (
    <>
      <Col span={24} style={{ ...SCROLL_STYLE, padding: 32 }}>
        <ProForm layout="vertical" submitter={false}>
          <Col span={12} offset={6}>
            <Row gutter={[16, 16]}>
              <ProCard {...SettingProCardProps} title="Basic Settings">
                <ProFormList
                  name={"apiKeys"}
                  label="API Keys"
                  initialValue={config.apiKeys}
                  itemRender={({ listDom, action }, { index }) => (
                    <ProCard
                      bordered
                      style={{ marginBlockEnd: 8 }}
                      title={`API Key ${index + 1}`}
                      extra={action}
                      bodyStyle={{ paddingBlockEnd: 0 }}
                    >
                      {listDom}
                    </ProCard>
                  )}
                  actionGuard={{
                    // 由于这里是直接更新 config，所以在新增/删除的时候需要手动更新config.apiKeys
                    beforeAddRow: () => {
                      updateConfig((config) => {
                        config.apiKeys.push({
                          provider: undefined as any,
                          apiKey: "",
                        });
                      });
                      return true;
                    },
                    beforeRemoveRow: (index: any) => {
                      if (typeof index === "number") {
                        updateConfig((config) => {
                          config.apiKeys.splice(index, 1);
                        });
                        return true;
                      } else {
                        console.error("index is not a number");
                        return false;
                      }
                    },
                  }}
                >
                  {(_f, index) => {
                    return (
                      <>
                        <ProFormSelect
                          options={[
                            {
                              label: PROVIDER_NAME[Provider.NextAPI],
                              value: Provider.NextAPI,
                            },
                            {
                              label: PROVIDER_NAME[Provider.ProxyAPI],
                              value: Provider.ProxyAPI,
                            },
                          ]}
                          placeholder="API Provider"
                          fieldProps={{
                            value: config?.apiKeys[index]?.provider,
                            onChange: (v) =>
                              updateConfig((config) => {
                                config.apiKeys[index].provider = v as Provider;
                              }),
                          }}
                        />
                        <ProFormText
                          placeholder="Your API Key"
                          fieldProps={{
                            value: config?.apiKeys[index]?.apiKey,
                            onChange: (e) =>
                              updateConfig((config) => {
                                config.apiKeys[index].apiKey = e.target.value;
                              }),
                          }}
                          extra={
                            !config?.apiKeys[index]?.apiKey && (
                              <a
                                style={{ marginLeft: 2 }}
                                onClick={() => {
                                  setShellApiBaseUrl(
                                    ProviderRealBaseUrlMap[
                                      config?.apiKeys[index]?.provider
                                    ],
                                  );
                                  setShowShellApiApiKeyModal(true);
                                }}
                              >
                                Load from{" "}
                                {
                                  PROVIDER_NAME[
                                    config?.apiKeys[index]?.provider
                                  ]
                                }
                              </a>
                            )
                          }
                        />
                      </>
                    );
                  }}
                </ProFormList>
                <ProFormSelect
                  label="Upload Server Provider"
                  options={[
                    {
                      label: PROVIDER_NAME[Provider.NextAPI],
                      value: Provider.NextAPI,
                    },
                    {
                      label: PROVIDER_NAME[Provider.ProxyAPI],
                      value: Provider.ProxyAPI,
                    },
                  ]}
                  fieldProps={{
                    value: config.uploadServerProvider,
                    onChange: (v) =>
                      updateConfig(
                        (config) => (config.uploadServerProvider = v),
                      ),
                  }}
                  allowClear={false}
                />
              </ProCard>

              <ProCard {...SettingProCardProps} title="Operations">
                <Space size={[16, 16]} wrap={true}>
                  <Button icon={<DownloadOutlined />} onClick={onExport}>
                    Export
                  </Button>
                  <Button icon={<UploadOutlined />} onClick={onImport}>
                    Import
                  </Button>
                  <Button icon={<DeleteOutlined />} onClick={onClear} danger>
                    Clear
                  </Button>
                </Space>
              </ProCard>
            </Row>
          </Col>
        </ProForm>
      </Col>
      <ShellApiApiKey
        open={showShellApiApiKeyModal}
        onClose={() => setShowShellApiApiKeyModal(false)}
        baseUrl={shellApiBaseUrl}
      />
    </>
  );
}
