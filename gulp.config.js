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
        allless: './src/css/*.less',
        alljs: './src/js/**/*.js',
        templates: './src/templates/*.hbs'
    };

    return config;
};
