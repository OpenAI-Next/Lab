import webpack from "webpack";

const mode = process.env.BUILD_MODE ?? "standalone";
console.log("[Next] build mode", mode);

const disableChunk = !!process.env.DISABLE_CHUNK || mode === "export";
console.log("[Next] build with chunk: ", !disableChunk);

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config) {
        config.module.rules.push(
            {test: /\.svg$/, use: ["@svgr/webpack"]}
        );

        if (disableChunk) {
            config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}));
        }

        config.resolve.fallback = {
            child_process: false,
        };

        config.experiments = {
            // asyncWebAssembly: true,
            layers: true,
        };

        return config;
    },
    transpilePackages: ['@lobehub/icons'],
    output: mode,
    reactStrictMode: false,
    images: {
        unoptimized: mode === "export",
    },
    experimental: {
        forceSwcTransforms: true,
    },
};

const CorsHeaders = [
    {key: "Access-Control-Allow-Credentials", value: "true"},
    {key: "Access-Control-Allow-Origin", value: "*"},
    {key: "Access-Control-Allow-Methods", value: "*",},
    {key: "Access-Control-Allow-Headers", value: "*",},
    {key: "Access-Control-Max-Age", value: "86400",},
];

nextConfig.headers = async () => {
    return [
        {
            source: "/api/:path*",
            headers: CorsHeaders,
        },
    ];
};

export default nextConfig;
