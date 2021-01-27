const path = require('path')

const src = path.resolve(__dirname, 'src')
const dist = path.resolve(__dirname, 'dist')
const js = path.resolve(__dirname, 'public/js')

const VueLoaderPlugin = require('vue-loader/lib/plugin')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: src + '/index.ts',
    output: {
        path: js,
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: '/node_modules/',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
            },
            {
                test: /\.css$/,
                loader: 'vue-style-loader!css-loader',
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader',
            },
            {
                test: /\.s(c|a)ss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                            sassOptions: {
                                fiber: require('fibers'),
                                indentedSyntax: true,
                            },
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        contentBase: dist,
        port: 3001,
        historyApiFallback: {
            disableDotRule: true,
        },
        host: '0.0.0.0',
        disableHostCheck: true,
    },
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            APIConfig: path.join(__dirname, `/src/config/development.ts`),
        },
        plugins: [new TsconfigPathsPlugin({})],
    },
    plugins: [new VueLoaderPlugin(), new VuetifyLoaderPlugin()],
}
