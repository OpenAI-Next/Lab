import React, { lazy, useState } from "react";
import { DEFAULT_BASE_URL, useAppConfig } from "../store";

import { SCROLL_STYLE, SITE_TITLE } from "@/constant";
import { Button, Col, Input, Row, Space } from "antd";
import { ProCard, ProCardProps, ProForm } from "@ant-design/pro-components";
import {
  DeleteOutlined,
  DownloadOutlined,
  GlobalOutlined,
  KeyOutlined,
  RedoOutlined,
  UploadOutlined,
} from "@ant-design/icons";

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
    if (!window.confirm("This will export all data to a JSON file. Are you sure you want to continue?")) return;
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
    if (!window.confirm("Importing data will overwrite current data. Are you sure you want to continue?")) return;
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
    if (!window.confirm("This will clear all data. Are you sure you want to continue?")) return;
    localStorage.clear();
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    location.reload();
  };

  /**
   * Validate base URL,
   * - must start with http
   * - must not end with /
   * @returns "warning" | "error" | undefined
   * - warning: valid but not recommended
   * - error: invalid
   * - undefined: valid
   * @param baseUrl
   */
  const validateBaseUrl = (baseUrl: string): "warning" | "error" | undefined => {
    if (!baseUrl) return "error";
    if (baseUrl === DEFAULT_BASE_URL) {
      return undefined;
    } else {
      const valid = [baseUrl.startsWith("http"), !baseUrl.endsWith("/")].every(Boolean);
      return valid ? "warning" : "error";
    }
  };

  /**
   * Validate API Key,
   * - must start with sk-
   * - must be 51 characters long
   * - must contain only alphanumeric characters and hyphens
   * @returns "warning" | "error" | undefined
   * @param apiKey
   */
  const validateApiKey = (apiKey: string): "warning" | "error" | undefined => {
    if (!apiKey) return undefined;
    if (apiKey.startsWith("sk-")) {
      return apiKey.length === 51 && apiKey.match(/^[a-zA-Z0-9-]+$/) ? undefined : "error";
    } else if (apiKey.length === 51 - "sk-".length) {
      return apiKey.match(/^[a-zA-Z0-9-]+$/) ? "warning" : "error";
    }
    return "error";
  };

  return (
    <>
      <Col span={24} style={{ ...SCROLL_STYLE, padding: 32 }}>
        <ProForm layout="vertical" submitter={false}>
          <Col
            xs={{ span: 24, offset: 0 }}
            sm={{ span: 22, offset: 1 }}
            md={{ span: 20, offset: 2 }}
            lg={{ span: 16, offset: 4 }}
            xl={{ span: 12, offset: 6 }}
            xxl={{ span: 10, offset: 7 }}
          >
            <Row gutter={[16, 16]}>
              <ProCard {...SettingProCardProps} title="API Configuration">
                <Space direction={"vertical"} size={[12, 12]} style={{ width: "100%" }}>
                  <Input
                    value={config.base_url}
                    onChange={(e) => updateConfig((config) => (config.base_url = e.target.value))}
                    placeholder="Base URL"
                    prefix={<GlobalOutlined style={{ marginRight: 6 }} />}
                    autoComplete="new-password"
                    status={validateBaseUrl(config.base_url)}
                    suffix={
                      config.base_url === DEFAULT_BASE_URL ? null : <RedoOutlined onClick={config.resetBaseUrl} />
                    }
                  />

                  <Input
                    value={config.apiKey}
                    onChange={(e) => updateConfig((config) => (config.apiKey = e.target.value))}
                    placeholder="API Key"
                    prefix={<KeyOutlined style={{ marginRight: 6 }} />}
                    autoComplete="new-password"
                    status={validateApiKey(config.apiKey)}
                  />
                </Space>
              </ProCard>

              <ProCard {...SettingProCardProps} title="Operations">
                <Space size={[12, 12]} wrap={true}>
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
