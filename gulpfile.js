let projectFolder = require("path").basename(__dirname); //Создае переменную, куда будет передавать готовые файлы --> папка dist
let sourceFolder = "#src" ;// Папка с исходниками, которую мы создали.

let fs = require('fs');

//Переменная которые будет содержать пути
let path={
    build:{
        html: projectFolder + "/",
        css: projectFolder + "/css/",
        js: projectFolder + "/js/",
        img: projectFolder + "/img/",
        fonts: projectFolder + "/fonts/",
    },
    //Теперь делаем для папки с исходниками
    src:{
        html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
        css: sourceFolder + "/scss/style.scss", //обрабатывать конкретный файл
        js: sourceFolder + "/js/script.js",
        img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}", //будем сканировать все подпапки и только с раширение что написано
        fonts: sourceFolder + "/fonts/*.ttf", //с любым именем но с расширение ttf
    },
    //Постоянно будет проверять и на лету устанавливать.
    watch:{
        html: sourceFolder + "/**/*.html",
        css: sourceFolder + "/scss/**/*.scss", //Слушаем все с названием scss 
        js: sourceFolder + "/js/**/*.js",
        img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}", //будем сканировать все подпапки и только с раширение что написано
    },
    //Удаление, каждый раз когда мы будем запускать Gulp 
    clean: "./" + projectFolder + "/"
}

//Переменные для написание сценария

let {src,dest} = require ('gulp'),
    gulp = require ('gulp'),
    // BrowseSync - создаем переменну и создаем функцию.
    browsersync = require ("browser-sync").create(),
    //File-include
    fileinclude = require("gulp-file-include"),
    //Del 
    del = require("del");
    //Gulp-sass
    scss = require("gulp-sass");
    //Autoprefix
    autoprefixer = require("gulp-autoprefixer"),
    //медиа запросы
    gcmq = require("gulp-group-css-media-queries"),
    //cleanCSS
    cleanCSS = require("gulp-clean-css"),
    //Rename
    rename = require("gulp-rename"),
    //Uglify
    uglify = require('gulp-uglify-es').default,
    //Imagemin
    imagemin = require('gulp-imagemin'),
    //WebP
    webp = require("gulp-webp"),
    //WebP Html
    webphtml = require("gulp-webp-html"),
    //WebP css
    webpcss = require("gulp-webpcss"),
    //SVG sprite
    svgSprite = require("gulp-svg-sprite"),
    //Gulp-ttwoff
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    //Fonter
    fonter = require('gulp-fonter');

    function browserSync(params) {
        browsersync.init({
            //Настройки для BrowserSync
            server: {
                baseDir: "./" + projectFolder + "/"
            },
            prot: 3000,
            notify: false
        })
    }
    //Функция с HTML файлом
    function html() {
        return src(path.src.html)
        //Собирать все файлы вместе
            .pipe(fileinclude())
            .pipe(webphtml())
        //Создание папки для заказчика
            .pipe(dest(path.build.html))
            //Обновление страницы
            .pipe(browsersync.stream())
    }

    //SCSS
    function css() {
        return src(path.src.css)
        //Обработка CSS
            .pipe(
                scss({
                    outputStyle: "expanded"
                })
            )
        //Media
            .pipe(
                gcmq()
            )
        //Аутопрефикс
            .pipe(
                autoprefixer({
                    overrideBrowserslist: ["last 5 versions"],
                    cascade: true
                })
            )
            .pipe(webpcss())
            .pipe(dest(path.build.css))
             //CleanCSS
             .pipe(cleanCSS())
             //Rename
                 .pipe(
                     rename({
                         extname: ".min.css"
                     })
                 )
            //Создание папки для заказчика
            .pipe(dest(path.build.css))
            //Обновление страницы
            .pipe(browsersync.stream())
    }
    //JS
    function js() {
        return src(path.src.js)
        //Собирать все файлы вместе
            .pipe(fileinclude())
        //Создание папки для заказчика
            .pipe(dest(path.build.js))
            //uglify
            .pipe(
                uglify()
            )
            //Переиминуем JS
            .pipe(
                rename({
                    extname: ".min.js"
                })
            )
            .pipe(dest(path.build.js))
            //Обновление страницы
            .pipe(browsersync.stream())
    }
    //Функция с Image файлом
    function images() {
        return src(path.src.img)
        //Конвертация в webp
            .pipe(
                webp({
                    //качество изображений
                    quality: 70
                })
                )
            .pipe(dest(path.build.img))
            .pipe(src(path.src.img))
            .pipe(
                imagemin({
                    progressive: true,
                    svgoPlugins: [{removeViewBox: false}],
                    interlaced: true,
                    optimizationLevel: 3
                })
            )
        //Создание папки для заказчика
            .pipe(dest(path.build.img))
            //Обновление страницы
            .pipe(browsersync.stream())
    }

    //Функция для шрифтов
    function fonts (){
        src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
         return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts))
    }

    //Fonte
    gulp.task('otfvttf', function (){
        return src([sourceFolder + '/fonts/*.otf'])
            .pipe(fonter({
                formats: ['ttf']
            }))
            .pipe(dest(sourceFolder + '/fonts/'));
    })

    //SVG SPRITE
    gulp.task('svgSprite', function (){
        return gulp.src([sourceFolder + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../icons/icons.svg",
                    example: true
                }
            },
        }
        ))
        .pipe(dest(path.build.img))
    })

        function fontsStyle(params) {

            let file_content = fs.readFileSync(sourceFolder + '/scss/fonts.scss');
            if (file_content == '') {
            fs.writeFile(sourceFolder + '/scss/fonts.scss', '', cb);
            return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
            let c_fontname;
            for (var i = 0; i < items.length; i++) {
            let fontname = items[i].split('.');
            fontname = fontname[0];
            if (c_fontname != fontname) {
            fs.appendFile(sourceFolder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
            }
            c_fontname = fontname;
            }
            }
            })
            }
            }
    

    function cb() {
        
    }

    //Отслеживать файлы другие
    function watchFiles(params) {
        gulp.watch([path.watch.html], html);
        gulp.watch([path.watch.css], css);
        gulp.watch([path.watch.js], js);
        gulp.watch([path.watch.img], images);
    }

    //Функция сама будет удалять
    function clean(params) {
        return del(path.clean);
    }

//Функции которые будут выполняться
let build = gulp.series(clean, gulp.parallel(images ,js ,css, html, fonts), fontsStyle);
let watch = gulp.parallel(build,watchFiles,browserSync);

//Подружить Gulp и переменные
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.css = css;
exports.html = html;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = watch;