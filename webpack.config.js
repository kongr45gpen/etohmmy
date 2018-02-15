// noinspection JSAnnotator
const path = require('path');
// noinspection JSAnnotator
const webpack = require('webpack');

module.exports = {
    entry: './js/index.js',
    devServer: {
        contentBase: './',
        hot: true
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'js'),
        publicPath: '/js/'
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: ['file-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            'underscore$': 'webpack/underscore.js'
        }
    }
};
