var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');  
var minifyCss = require("gulp-clean-css");
var rename = require("gulp-rename");
gulp.task('cssmin', function () {
    gulp.src(['global/*.css','components/**/*.css'])
        .pipe(concat('main.css'))
        .pipe(gulp.dest('../webapp2/static/build'))
        .pipe(gulp.dest('../operation-web/static/build'))
        .pipe(gulp.dest('../v1.0.0/mwork-web/src/main/webapp/build'))
        .pipe(minifyCss())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest('build'))
        .pipe(gulp.dest('../webapp2/static/build'))
        .pipe(gulp.dest('../operation-web/static/build'))
        .pipe(gulp.dest('../v1.0.0/mwork-web/src/main/webapp/build'))
});
gulp.task('imagesMove', function () {
    gulp.src(['components/jquery-ztree-core/images/**','components/datepicker/images/**','global/images/*.*'])
        .pipe(gulp.dest('build/images'))
        .pipe(gulp.dest('../webapp2/static/build/images'))
        .pipe(gulp.dest('../operation-web/static/build/images'))
        .pipe(gulp.dest('../v1.0.0/mwork-web/src/main/webapp/build/images'))       
});
gulp.task('fontsMove', function () {
    gulp.src(['components/**/fonts/*.woff','global/fonts/*.woff'])
        .pipe(gulp.dest('build/fonts'))
        .pipe(gulp.dest('../webapp2/static/build/fonts'))
        .pipe(gulp.dest('../operation-web/static/build/fonts'))
        .pipe(gulp.dest('../v1.0.0/mwork-web/src/main/webapp/build/fonts'))
});
gulp.task('libmin', function () {
    gulp.src(['lib/jquery-1.11.3.min.js','lib/vue.min.js'])
        .pipe(concat('lib.js'))
        .pipe(gulp.dest('build'))
        .pipe(gulp.dest('../webapp2/static/build'))
        .pipe(gulp.dest('../operation-web/static/build'))  
        .pipe(gulp.dest('../v1.0.0/mwork-web/src/main/webapp/build'))  
        .pipe(uglify())
        .pipe(rename('lib.min.js'))
        .pipe(gulp.dest('build'))
        .pipe(gulp.dest('../webapp2/static/build'))
        .pipe(gulp.dest('../operation-web/static/build'))   
        .pipe(gulp.dest('../v1.0.0/mwork-web/src/main/webapp/build'))     
});
gulp.task('jq', function () {
    gulp.src(['lib/jquery-1.11.3.min.js','lib/bootstrap.min.js'])
        .pipe(gulp.dest('build'))
        .pipe(gulp.dest('../webapp2/static/build'))
        .pipe(gulp.dest('../operation-web/static/build'))  
        .pipe(gulp.dest('../v1.0.0/mwork-web/src/main/webapp/build'))      
});
gulp.task('widgetmin', function () {
    gulp.src(['components/**/*.js','widget/*.js'])
        .pipe(concat('widget.js'))
        .pipe(gulp.dest('build'))        
        .pipe(gulp.dest('../webapp2/static/build'))
        .pipe(gulp.dest('../operation-web/static/build'))
        .pipe(gulp.dest('../v1.0.0/mwork-web/src/main/webapp/build'))
        .pipe(uglify())
        .pipe(rename('widget.min.js'))
        .pipe(gulp.dest('build'))
        .pipe(gulp.dest('../webapp2/static/build'))
        .pipe(gulp.dest('../operation-web/static/build'))
        .pipe(gulp.dest('../v1.0.0/mwork-web/src/main/webapp/build'))
});

gulp.task('default',['cssmin','libmin','widgetmin','imagesMove','fontsMove','jq']);
gulp.watch(['widget/*.js','global/*.css'], ['widgetmin','cssmin']);
