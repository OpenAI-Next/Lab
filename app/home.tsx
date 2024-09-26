"use client";

import { App as AntdApp, ConfigProvider, Row, theme } from "antd";
import React, { ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CENTER_STYLE, Path } from "@/constant";
// https://theresanaiforthat.com/s/clockwork+machinery/ -- try to find logo here
import SystemLogo from "@/app/icons/logo/logo.svg";
import SunoIcon from "@/app/icons/suno.svg";
import FluxIcon from "@/app/icons/flux.svg";
import ViduIcon from "@/app/icons/vidu.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";
import MidjourneyIcon from "@/app/icons/midjourney.svg";
import StableDiffusionIcon from "@/app/icons/stable-diffusion.svg";
import DalleIcon from "@/app/icons/dalle.svg";
import PikaIcon from "@/app/icons/pika.svg";
import LumaIcon from "@/app/icons/luma.svg";
import BiBiGPTIcon from "@/app/icons/bibi-gpt.svg";
import KelingIcon from "./providers/keling-ai/assets/logo_basic_mono.svg";
import { HashRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Theme, useAppConfig } from "@/app/store";
import { ProConfigProvider, ProLayout, type ProTokenType } from "@ant-design/pro-components";
import Icon, {
  AudioFilled,
  CalculatorFilled,
  DatabaseFilled,
  FolderOpenFilled,
  GithubFilled,
  HomeFilled,
  MessageFilled,
  MoneyCollectFilled,
  MoonFilled,
  PictureFilled,
  ProductFilled,
  SettingFilled,
  SoundFilled,
  SunFilled,
} from "@ant-design/icons";
import enUS from "antd/locale/en_US";

/**
 * Loading 组件
 * @param {ReactNode | boolean} props.logo - logo
 * @return {ReactNode} - 返回 Loading 组件
 * @constructor
 * @example <Loading /> - 不显示任何内容
 * @example <Loading logo={true}/> - 显示系统 logo
 * @example <Loading logo={<MidjourneyIcon/>}/> - 显示 MidjourneyIcon
 */
export function Loading(props: { logo?: ReactNode | boolean }): ReactNode {
  const { logo } = props;
  if (logo === false) {
    return null;
  }
  if (logo === undefined) {
    return (
      <div style={CENTER_STYLE}>
        <LoadingIcon />
      </div>
    );
  }
  return <div style={CENTER_STYLE}>{logo ?? <SystemLogo />}</div>;
}

const Settings = dynamic(async () => (await import("./pages/Settings")).Settings, {
  loading: () => <Loading />,
});

const MidjourneyPage = dynamic(async () => (await import("./pages/Midjourney")).MidjourneyPage, {
  loading: () => <Loading logo={<MidjourneyIcon />} />,
});

const StableDiffusionPage = dynamic(async () => (await import("./pages/StableDiffusion")).StableDiffusionPage, {
  loading: () => <Loading logo={<StableDiffusionIcon />} />,
});

const SunoPage = dynamic(async () => (await import("./pages/Suno")).SunoPage, {
  loading: () => <Loading logo={<SunoIcon />} />,
});

const ViduPage = dynamic(async () => (await import("./pages/Vidu")).ViduPage, {
  loading: () => <Loading logo={<ViduIcon />} />,
});

const PricingPage = dynamic(async () => (await import("./pages/Pricing")).PricingPage, {
  loading: () => <Loading />,
});

const TTSPage = dynamic(async () => (await import("./pages/TTS")).TTSPage, {
  loading: () => <Loading />,
});

const WhisperPage = dynamic(async () => (await import("./pages/Whisper")).WhisperPage, {
  loading: () => <Loading />,
});

const ToolsPage = dynamic(async () => (await import("./pages/Tools")).ToolsPage, {
  loading: () => <Loading />,
});

const ChatCompletionsPage = dynamic(async () => (await import("./pages/ChatCompletions")).ChatCompletionsPage, {
  loading: () => <Loading />,
});

const DallePage = dynamic(async () => (await import("./pages/Dalle")).default, {
  loading: () => <Loading logo={<DalleIcon />} />,
});

const FluxPage = dynamic(async () => (await import("./pages/Flux")).FluxPage, {
  loading: () => <Loading logo={<FluxIcon />} />,
});

const PikaPage = dynamic(async () => (await import("./pages/Pika")).default, {
  loading: () => <Loading logo={<PikaIcon />} />,
});

const LumaPage = dynamic(async () => (await import("./pages/Luma")).default, {
  loading: () => <Loading logo={<LumaIcon />} />,
});

const BiBiGPTPage = dynamic(async () => (await import("./pages/BibiGpt")).default, {
  loading: () => <Loading logo={<BiBiGPTIcon />} />,
});

const GPTsPage = dynamic(async () => (await import("./pages/GPTs")).default, {
  loading: () => <Loading />,
});

const Welcome = dynamic(async () => (await import("./pages/Welcome")).default, {
  loading: () => <Loading />,
});

const EmbeddingsPage = dynamic(async () => (await import("./pages/Embeddings")).default, {
  loading: () => <Loading />,
});

const Doc2XPage = dynamic(async () => (await import("./pages/Doc2X")).default, {
  loading: () => <Loading />,
});

const KelingPage = dynamic(async () => (await import("./pages/Keling")).default, {
  loading: () => <Loading logo={<KelingIcon />} />,
});

const printCopyRight = () => console.log("@Kadxy 2024.");

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);
  useEffect(() => setHasHydrated(true), []);
  return hasHydrated;
};

const App = (props: { dark: boolean; updateConfig: any }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token: ProTokenType["layout"] = {
    pageContainer: {
      paddingInlinePageContainerContent: 0,
      paddingBlockPageContainerContent: 0,
    },
  };

  return (
    <ProLayout
      logo={"./logo.svg"}
      title={"OpenAI Next Lab"}
      layout="side"
      locale="en-US"
      siderWidth={200}
      defaultCollapsed={false}
      breadcrumbRender={false}
      breakpoint={false}
      fixedHeader={true}
      pageTitleRender={false}
      token={props.dark ? token : { ...token, bgLayout: "#fff" }}
      location={location}
      actionsRender={(antdProps: any) => {
        if (antdProps.isMobile) return [];
        // if (!antdProps.collapsed) return [];
        if (typeof window === "undefined") return [];
        return [
          <span
            key="Theme"
            onClick={() => {
              props.updateConfig((config: { theme: Theme }) => (config.theme = props.dark ? Theme.Light : Theme.Dark));
            }}
            style={{ cursor: "pointer" }}
          >
            {props.dark ? <SunFilled style={{ color: "#FF6D00" }} /> : <MoonFilled style={{ color: "#AB47BC" }} />}
          </span>,
          <span key="Github" onClick={() => window.open("https://github.com/OpenAI-Next/Lab")}>
            <GithubFilled style={{ color: props.dark ? "#757575" : "#323232" }} />
          </span>,
        ];
      }}
      route={{
        routes: [
          {
            path: Path.Home,
            name: "Home",
            icon: <HomeFilled />,
          },
          {
            path: Path.Chat,
            name: "Chat",
            icon: <MessageFilled />,
          },
          {
            path: Path.Embeddings,
            name: "Embeddings",
            icon: <DatabaseFilled />,
          },
          {
            path: Path.Dalle,
            name: "DALL·E",
            icon: <PictureFilled />,
          },
          {
            path: Path.Flux,
            name: "Flux",
            icon: <Icon component={FluxIcon} />,
          },
          {
            path: Path.TTS,
            name: "TTS",
            icon: <SoundFilled />,
          },
          {
            path: Path.ASR,
            name: "ASR",
            icon: <AudioFilled />,
          },
          {
            path: Path.Midjourney,
            name: "Midjourney",
            icon: <Icon component={MidjourneyIcon} />,
          },
          {
            path: Path.StableDiffusion,
            name: "Stable Diffusion",
            icon: <Icon component={StableDiffusionIcon} />,
          },
          {
            path: Path.Suno,
            name: "Suno",
            icon: <Icon component={SunoIcon} />,
          },
          {
            path: Path.Vidu,
            name: "Vidu",
            icon: <Icon component={ViduIcon} />,
          },
          {
            path: Path.Pika,
            name: "Pika",
            icon: <Icon component={PikaIcon} />,
          },
          {
            path: Path.Luma,
            name: "Luma",
            icon: <Icon component={LumaIcon} />,
          },
          {
            path: Path.BiBiGPT,
            name: "BiBi GPT",
            icon: <Icon component={BiBiGPTIcon} />,
          },
          {
            path: Path.GPTs,
            name: "GPTs",
            icon: <ProductFilled />,
          },
          {
            path: Path.Doc2X,
            name: "Doc2X",
            icon: <FolderOpenFilled />,
          },
          {
            path: Path.Keling,
            name: "Keling",
            icon: <Icon component={KelingIcon} />,
          },
          {
            path: Path.Pricing,
            name: "Pricing",
            icon: <MoneyCollectFilled />,
          },
          {
            path: Path.Tools,
            name: "Tools",
            icon: <CalculatorFilled />,
          },
          {
            path: Path.Settings,
            name: "Settings",
            icon: <SettingFilled />,
          },
        ],
      }}
      menuItemRender={(item: any, dom: any) => <a onClick={() => navigate(item.path ?? Path.Home)}>{dom}</a>}
    >
      <Row wrap={false} style={{ height: "100%" }}>
        <Routes location={location}>
          <Route path={Path.Home} element={<Welcome />} />
          <Route path={Path.Chat} element={<ChatCompletionsPage />} />
          <Route path={Path.Embeddings} element={<EmbeddingsPage />} />
          <Route path={Path.Dalle} element={<DallePage />} />
          <Route path={Path.Flux} element={<FluxPage />} />
          <Route path={Path.TTS} element={<TTSPage />} />
          <Route path={Path.ASR} element={<WhisperPage />} />
          <Route path={Path.Midjourney} element={<MidjourneyPage />} />
          <Route path={Path.StableDiffusion} element={<StableDiffusionPage />} />
          <Route path={Path.Suno} element={<SunoPage />} />
          <Route path={Path.Vidu} element={<ViduPage />} />
          <Route path={Path.Pika} element={<PikaPage />} />
          <Route path={Path.Luma} element={<LumaPage />} />
          <Route path={Path.Doc2X} element={<Doc2XPage />} />
          <Route path={Path.BiBiGPT} element={<BiBiGPTPage />} />
          <Route path={Path.GPTs} element={<GPTsPage />} />
          <Route path={Path.Keling} element={<KelingPage />} />
          <Route path={Path.Pricing} element={<PricingPage />} />
          <Route path={Path.Tools} element={<ToolsPage />} />
          <Route path={Path.Settings} element={<Settings />} />
        </Routes>
      </Row>
    </ProLayout>
  );
};

export function Home() {
  printCopyRight();

  const config = useAppConfig();
  const isDark = config.theme === Theme.Dark;
  const updateConfig = config.update;
  const { darkAlgorithm } = theme;

  if (!useHasHydrated()) return <Loading logo={false} />;

  return (
    <ConfigProvider theme={{ algorithm: isDark ? darkAlgorithm : undefined }} locale={enUS}>
      <ProConfigProvider dark={isDark}>
        <AntdApp>
          <Router>
            <App dark={isDark} updateConfig={updateConfig} />
          </Router>
        </AntdApp>
      </ProConfigProvider>
    </ConfigProvider>
  );
}
