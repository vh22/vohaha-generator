'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var util = require('util');
var path = require('path');
var mkdirp = require('mkdirp');
var semver = require('semver');
var _ = require('underscore.string');
var self;

module.exports = yeoman.generators.Base.extend({
    prompting: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the luminous ' + chalk.red('Vohaha') + ' generator!'
        ));

        var prompts = [
            {
                type: 'input',
                name: 'projectName',
                message: 'What\'s the name of the project?',
                default: 'newProject',
                filter: function (value) {
                    return _.camelize(_.slugify(_.humanize(value)));
                }
            }
            //{
            //    type: 'checkbox',
            //    name: 'additionalTools',
            //    message: 'Will you use ... ?',
            //    choices: [
            //        {name: 'Bootstrap', value: 'bootstrap-sass', checked: false}
            //    ]
            //}
        ];

        this.prompt(prompts, function (props) {
            this.props = props;
            // To access props later use this.props.someOption;
            this.projectName = _.slugify(_.camelize(props.projectName, true));
            //this.useBootstrap = props.additionalTools.Bootstrap;

            done();
        }.bind(this));
    },

    writing: {
        app: function () {
            mkdirp('src');
            mkdirp('src/assets');
            mkdirp('src/assets/css');
            mkdirp('src/assets/fonts');
            mkdirp('src/assets/images');
            mkdirp('src/assets/images/icons');
            mkdirp('src/assets/js');
            mkdirp('src/master');
            mkdirp('src/master/sass');
            mkdirp('src/master/sass/base');
            mkdirp('src/master/sass/layout');
            mkdirp('src/master/sass/patterns');
            mkdirp('src/master/sass/sections');
            mkdirp('src/master/sass/vendor');
            mkdirp('src/vendor');


            // html template
            this.template('html/_index.html', 'src/index.html');
            this.template('html/_main.html', 'src/main.html');

            // styles template

            // base
            this.template('master/base/_base-router.scss', 'src/master/sass/base/_base-router.scss');
            this.template('master/base/_base-colors.scss', 'src/master/sass/base/_base-colors.scss');
            this.template('master/base/_base-mixins.scss', 'src/master/sass/base/_base-mixins.scss');
            this.template('master/base/_base-fonts.scss', 'src/master/sass/base/_base-fonts.scss');
            this.template('master/base/_base-main.scss', 'src/master/sass/base/_base-main.scss');

            // layout
            this.template('master/layout/_layout-router.scss', 'src/master/sass/layout/_layout-router.scss');

            // patterns
            this.template('master/patterns/_patterns-router.scss', 'src/master/sass/patterns/_patterns-router.scss');

            // sections
            this.template('master/sections/_sections-router.scss', 'src/master/sass/sections/_sections-router.scss');

            // final style file, vendor styles and shame
            this.template('master/vendor/_vendor-router.scss', 'src/master/sass/vendor/_vendor-router.scss');
            this.template('master/_styles.scss', 'src/master/sass/styles.scss');
            this.template('master/_shame.scss', 'src/master/sass/_shame.scss');

            // compass config
            this.template('master/_config.rb', 'src/master/config.rb');

            // vendor dep.
            this.template('vendor/_modernizr.js', 'src/vendor/modernizr.js');

        },

        projectfiles: function () {

            this.template('project-files/_gulpfile.js', 'gulpfile.js');
            this.template('project-files/_package.json', 'package.json');
            this.template('project-files/_bower.json', 'bower.json');
            this.template('project-files/_bowerrc', '.bowerrc');
            this.template('project-files/_gitignore', '.gitignore');

        }
    },

    install: function () {
        this.installDependencies();
    }
});
