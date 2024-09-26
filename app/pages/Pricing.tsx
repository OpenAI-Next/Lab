import { Image, Row, Typography } from "antd";
import { SCROLL_STYLE } from "@/constant";
import { modelHub } from "ai-model-hub";
import { ProCard, ProTable, WaterMark } from "@ant-design/pro-components";

const { Text } = Typography;

export function PricingPage() {
  return (
    <div style={{ ...SCROLL_STYLE }}>
      <WaterMark content={"OpenAI-Next"} fontColor={"rgba(0,0,0,0.1)"}>
        <Row
          gutter={[16, 16]}
          style={{
            ...SCROLL_STYLE,
            height: "100%",
            padding: 32,
            borderRadius: 16,
          }}
        >
          <>
            {modelHub.getAll().map((provider) => {
              return (
                <ProCard
                  title={
                    provider.logo.icon ? (
                      <>
                        <Image
                          alt={provider.provider}
                          src={provider.logo.icon?.black_white || provider.logo.icon?.color || ""}
                          height={32}
                          preview={false}
                          style={{ verticalAlign: "middle" }}
                        />
                        <b
                          style={{
                            fontSize: 18,
                            marginLeft: 8,
                            verticalAlign: "middle",
                          }}
                        >
                          {provider.provider}
                        </b>
                      </>
                    ) : (
                      provider.provider
                    )
                  }
                  key={provider.provider}
                  bordered
                  headerBordered
                >
                  <ProTable
                    options={false}
                    pagination={false}
                    search={false}
                    size={"small"}
                    dataSource={provider.models_list}
                    columns={[
                      {
                        title: "模型名称",
                        dataIndex: "name",
                        width: "21%",
                        render: (_, record) => (
                          <Text strong copyable>
                            {record.name}
                          </Text>
                        ),
                      },
                      {
                        title: "发布时间",
                        dataIndex: "release_time",
                        width: "11%",
                        render: (_, record) => {
                          try {
                            const timestamp = Number(record.release_time) * 1000;
                            if (isNaN(timestamp) || timestamp < 0) {
                              return <Text type={"secondary"}>-</Text>;
                            } else {
                              const date = {
                                year: new Date(timestamp).getFullYear(),
                                month: new Date(timestamp).getMonth() + 1,
                                day: new Date(timestamp).getDate(),
                              };
                              return (
                                <Text>
                                  {date.year}-{date.month.toString().padStart(2, "0")}-
                                  {date.day.toString().padStart(2, "0")}
                                </Text>
                              );
                            }
                          } catch (e) {
                            return <Text type={"secondary"}>-</Text>;
                          }
                        },
                      },
                      {
                        title: "模型介绍",
                        dataIndex: "description",
                        width: "38%",
                        ellipsis: true,
                      },
                      {
                        title: "价格（输入）",
                        render: (_, record) => {
                          const price = record?.price?.[0]?.input;
                          const isFree = price === 0;
                          return price ? (
                            isFree ? (
                              <Text type={"success"}>免费</Text>
                            ) : (
                              <Text>${price} / 1M tokens</Text>
                            )
                          ) : (
                            <Text type={"secondary"}>暂无</Text>
                          );
                        },
                        width: "15%",
                      },
                      {
                        title: "价格（输出）",
                        render: (_, record) => {
                          const price = record?.price?.[0]?.output;
                          const isFree = price === 0;
                          return price ? (
                            isFree ? (
                              <Text type={"success"}>免费</Text>
                            ) : (
                              <Text>${price} / 1M tokens</Text>
                            )
                          ) : (
                            <Text type={"secondary"}>暂无</Text>
                          );
                        },
                        width: "15%",
                      },
                    ]}
                    scroll={{ x: 950 }}
                  />
                </ProCard>
              );
            })}
            <Text type={"secondary"} style={{ marginTop: 6 }}>
              You can view the update records of model information, submit feedback or suggestions in our{" "}
              <Typography.Link href={"https://github.com/OpenAI-Next/ai-model-hub"}>GitHub Repository</Typography.Link>.
            </Text>
          </>
        </Row>
      </WaterMark>
    </div>
  );
}
