import {Row} from "antd";
import {SCROLL_STYLE} from "@/constant";
import {modelHub} from "ai-model-hub";

// const RenderContent = (prop: {
//     title: ReactNode;
//     data: ProviderModelListType;
// }) => {
//     const getPrice = (price: number) => {
//         // 将数字转换为字符串
//         const priceString = price.toString();
//         // 找到小数点的位置
//         const decimalIndex = priceString.indexOf('.');
//
//         // 如果没有小数点，或者小数点后不足两位，则补足两位小数
//         if (decimalIndex === -1 || priceString.length - decimalIndex <= 2) {
//             return price.toFixed(2);
//         } else {
//             // 如果有两位以上的小数，则保留原始的小数位数
//             return priceString;
//         }
//     }
//     const renderTokenPrice = (record: ModelListType, type: "prompt" | "complete") => {
//         const value = record.price[type];
//         const {Text} = Typography;
//
//         if (value === null) {
//             return <Text type={"secondary"}>-</Text>;
//         } else {
//             return (
//                 <>
//                     <Text>${getPrice(value)}</Text>
//                     <Text type={"secondary"}> / {record.price.unit || "1M tokens"}</Text>
//                 </>
//             );
//         }
//     }
//     const renderTimesPrice = (record: ModelListType) => {
//         const value = record.price.times;
//         const {Text} = Typography;
//         if (value === null) {
//             return <Text type={"secondary"}>-</Text>;
//         }
//         if (typeof value === "number") {
//             return (
//                 <>
//                     <Text>${getPrice(value)}</Text>
//                     <Text type={"secondary"}> / {record.price.unit || "次"}</Text>
//                 </>
//             )
//         }
//         if (typeof value === "object") {
//             if (value.columns) return (
//                 <table style={{width: "100%", borderCollapse: "collapse"}}>
//                     <thead style={{textAlign: "center", background: "#f2f2f2", fontSize: 13}}>
//                     <tr style={{textAlign: "center"}}>
//                         {value.columns.map((col: any, index: number) => (
//                             <th key={`header-${index}`}
//                                 style={{border: "1px solid #ddd", padding: "4px"}}
//                             >
//                                 {col.title}
//                             </th>
//                         ))}
//                     </tr>
//                     </thead>
//                     <tbody style={{textAlign: "center", fontSize: 12}}>
//                     {value.dataSource.map((row: any, rowIndex: number) => (
//                         <tr key={`row-${rowIndex}`}>
//                             {value.columns.map((col: any, colIndex: number) => (
//                                 <td key={`cell-${rowIndex}-${colIndex}`}
//                                     style={{border: "1px solid #ddd", padding: "4px"}}>
//                                     {col.name === "price" ?
//                                         <Typography.Text style={{fontSize: 12}}>${getPrice(row[col.name])}
//                                             <Typography.Text style={{fontSize: 12}} type={"secondary"}>
//                                                 / {record.price.unit || "次"}
//                                             </Typography.Text>
//                                         </Typography.Text> : row[col.name]}
//                                 </td>
//                             ))}
//                         </tr>
//                     ))}
//                     </tbody>
//                 </table>
//             );
//         }
//     }
//
//
//     return (
//         <ProCard
//             title={prop.title}
//             bordered
//             headerBordered
//         >
//             <Table
//                 pagination={false}
//                 size={"small"}
//                 columns={[
//                     {
//                         title: "模型名称",
//                         dataIndex: "model",
//                         render: (value) => <Typography.Text strong copyable>{value}</Typography.Text>,
//                         width: "20%",
//                     },
//                     {
//                         title: "类型",
//                         dataIndex: "category",
//                         width: "10%",
//                     },
//                     {
//                         title: "提示价格",
//                         dataIndex: ["price", "prompt"],
//                         render: (_, record) => renderTokenPrice(record, "prompt"),
//                         width: "15%",
//                     },
//                     {
//                         title: "补全价格",
//                         dataIndex: ["price", "complete"],
//                         render: (_, record) => renderTokenPrice(record, "complete"),
//                         width: "15%",
//                     },
//                     {
//                         title: "按次价格",
//                         dataIndex: ["price", "times"],
//                         render: (_, record) => renderTimesPrice(record),
//                         width: "20%",
//                     },
//                     {
//                         title: "备注",
//                         dataIndex: "mark",
//                         width: "15%",
//                     },
//                     {
//                         title: "更多",
//                         key: "more",
//                         width: "5%",
//                         align: "center",
//                         render: () => <Typography.Link>详情</Typography.Link>
//                     }
//                 ]}
//                 scroll={{x: 900}}
//             />
//         </ProCard>
//     );
// }

export function PricingPage() {
    return (
        <div style={{...SCROLL_STYLE}}>
            <Row
                gutter={[16, 16]}
                style={{...SCROLL_STYLE, height: "100%", padding: 32, borderRadius: 16}}
            >
                {modelHub.getAll().map((provider) => {
                    return (
                        <>
                            {provider.models_list}
                        </>
                    );
                })}
            </Row>
        </div>
    );
}


