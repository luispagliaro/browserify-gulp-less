module.exports = function() {
    var config = {
        temp: './src/.tmp/',
        js: [
            './src/js/'
        ],
        index: './src/index.html',
        less: [
            './src/css/style.less'
        ],
        allless: './src/css/*.less'
    };

    return config;
};
