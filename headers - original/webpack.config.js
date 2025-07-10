const webpack = require("webpack");
const { merge } = require("webpack-merge");
const baseConfig = require("@mendix/pluggable-widgets-tools/configs/webpack.config.prod");

const customConfig = {
    externals: [
        "@mendix/pluggable-widgets-tools",
        "react",
        "react-dom",
        // Ne pas externaliser ces dépendances
        // "clsx",
        // "tailwind-merge",
    ],
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production")
        })
    ],
    resolve: {
        fallback: {
            "process": false
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1
                        }
                    },
                    "postcss-loader"
                ]
            }
        ]
    },
    devServer: {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Security-Policy": "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
        }
    }
};

module.exports = merge(baseConfig, customConfig); 