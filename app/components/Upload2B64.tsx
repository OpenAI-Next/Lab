import React from "react";
import { App, Button, Modal, Upload, UploadFile } from "antd";
import { renderCode } from "@/app/render";
import { copyText } from "@/app/utils";
import { UploadOutlined } from "@ant-design/icons";

const _Upload2B64 = () => {
  const { message } = App.useApp();
  const [data, setData] = React.useState<string | null>(null);

  const handleFileChange = async (info: { file: UploadFile }) => {
    const { file } = info;
    const reader = new FileReader();
    reader.onload = () => setData(reader.result as string);
    reader.readAsDataURL(file.originFileObj as Blob);
    file.status = "done";
  };

  return (
    <>
      <Upload
        name={"img_file"}
        maxCount={1}
        listType={"picture"}
        accept={"image/*"}
        onChange={handleFileChange}
        onRemove={() => setData(null)}
      >
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
      {data && (
        <>
          {renderCode(data)}
          <Button
            block
            type={"primary"}
            onClick={async () => {
              const success = await copyText(data);
              if (success) {
                message.success("Copied");
              } else {
                message.error("Failed to copy");
              }
            }}
          >
            Copy
          </Button>
        </>
      )}
    </>
  );
};

export const Upload2B64 = (props: { open: boolean; onClose: () => void }) => {
  return (
    <Modal
      title={"Convert Image to Base64"}
      open={props.open}
      onCancel={props.onClose}
      centered
      width={600}
      footer={null}
    >
      <_Upload2B64 />
    </Modal>
  );
};

export default Upload2B64;
