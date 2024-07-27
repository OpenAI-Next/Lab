// app/pages/Welcome.tsx
import {Typography} from "antd";
import {Path, SCROLL_STYLE, SITE_TITLE} from "@/constant";
import {Link, useNavigate} from "react-router-dom";

const {Title, Paragraph, Text: Text} = Typography;
const Welcome = () => {

    const navigate = useNavigate();

    return (
        <div style={{padding: "0 24px", ...SCROLL_STYLE}}>
            <Typography>
                <Title level={1}>Welcome to {SITE_TITLE}</Title>

                <Title level={2}>Introduction</Title>
                <Paragraph>
                    {SITE_TITLE} is an open-source project based on React and Ant Design, aiming to provide a simple
                    interface for calling and testing the API interfaces provided by OpenAI-Next.
                </Paragraph>

                <Title level={2}>Getting Started</Title>
                <Paragraph>
                    <Text strong>Visit <Link to={Path.Settings}>Settings</Link> page to configure your API keys.</Text>
                </Paragraph>
                <Paragraph>
                    <Text>Available Providers:</Text>
                    <ul>
                        <li>
                            <Link to={"https://api.openai-next.com"} target="_blank">NextAPI</Link>
                        </li>
                        <li>
                            <Link to={"https://mj.openai-next.com"} target="_blank">ProxyAPI</Link>
                        </li>
                    </ul>
                </Paragraph>

                <Title level={2}>Supported APIs</Title>
                <Paragraph>
                    <ul>
                        <li>
                            <Link to={Path.Chat}>Chat</Link>
                        </li>
                        <li>
                            <Link to={Path.Embeddings}>Embeddings</Link>
                        </li>
                        <li>
                            <Link to={Path.Dalle}>DALL·E</Link>
                        </li>
                        <li>
                            <Link to={Path.TTS}>TTS</Link>
                        </li>
                        <li>
                            <Link to={Path.ASR}>ASR</Link>
                        </li>
                        <li>
                            <Link to={Path.Midjourney}>Midjourney</Link>
                        </li>
                        <li>
                            <Link to={Path.StableDiffusion}>Stable Diffusion</Link>
                        </li>
                        <li>
                            <Link to={Path.Suno}>Suno</Link>
                        </li>
                        <li>
                            <Link to={Path.Pika}>Pika</Link>
                        </li>
                        <li>
                            <Link to={Path.Luma}>Luma</Link>
                        </li>
                        <li>
                            <Link to={Path.Doc2X}>Doc2X</Link>
                        </li>
                    </ul>
                </Paragraph>
            </Typography>
        </div>
    );
}

export default Welcome;
