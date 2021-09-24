module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        pug: {
            compile: {
                options: {
                    client: false,
                    pretty: true
                },
                files: [
                    {
                        cwd: "build/pug",
                        src: "**/*.pug",
                        dest: "public/html",
                        expand: true,
                        ext: ".html"
                    }
                ]
            }
        },
        copy: {
            plugins: {
                files: [{
                    cwd: 'build/codemirror',
                    src: '**/*',
                    dest: "public/codemirror",
                    expand: true
                },{
                    cwd: 'build/fonts',
                    src: '**/*',
                    dest: "public/fonts",
                    expand: true
                },{
                    cwd: 'build/js/plugins',
                    src: '**/*',
                    dest: "public/js/plugins",
                    expand: true
                },{
                    cwd: 'build/js/',
                    src: '*',
                    dest: "public/js",
                    expand: true
                },{
                    cwd: 'build/css',
                    src: '**/*',
                    dest: "public/css",
                    expand: true
                },{
                    cwd: 'build/mode',
                    src: '**/*',
                    dest: "public/mode",
                    expand: true
                }]
            }
        },

       /* concat: {
            options: { 'separator': ';' },
            build: {
                src: ['build/js/framework.js', 'build/js/!**!/!*.js'],
                dest: 'public/js/main.js'
            }
        },*/
        sass: {
            dist: {
                options: {
                    noCache: true
                },
                files: [{
                    expand: true,
                    cwd: 'build/sass',
                    src: ['*.scss'],
                    dest: 'public/css',
                    ext: '.css'
                }]
            }
        },
        watch: {
            js: {
                files: ['build/js/**/*.js'],
                tasks: ['uglify']
            },
            css: {
                files: ['build/sass/**/*.scss'],
                tasks: ['sass']
            },
            pug: {
                files: ['build/pug/**/*.pug'],
                tasks: ['pug']
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                files: [{
                    expand: true,
                    src: '*/*.js',
                    dest: 'public/',
                    cwd: 'build/'
                }]
            }
        },
        clean: ['public/js/main.js']

    });

    // Load required modules
    //grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-pug');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');


    grunt.registerTask('default', ['copy', 'pug', 'sass', 'uglify']);
};