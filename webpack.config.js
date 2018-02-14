const path = require('path');

module.exports = {
    entry: './js/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'js')
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            'underscore$': 'webpack/underscore.js'
        }
    }
};
