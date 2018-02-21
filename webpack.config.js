// noinspection JSAnnotator
const path = require('path');
// noinspection JSAnnotator
const webpack = require('webpack');
// noinspection JSAnnotator

module.exports = {
    entry: './js/index.js',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './',
        hot: true
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        })
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'js'),
        publicPath: '/js/'
    },
    module: {
        rules: [
            { // TODO: Use a better approach for this
                test: /\.html$/,
                use: [{ loader: 'file-loader', options: { emitFile: false }}]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.vue$/,
                use: ['vue-loader']
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    }
};
