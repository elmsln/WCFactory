const { config, libraries } = require('@wcfactory/common/config')
const Generator = require("yeoman-generator");
const _ = require("lodash");
const path = require("path");
const mkdirp = require("mkdirp");
const chalk = require("chalk");
const process = require("process");
const {fixDotfiles} = require('../../utils/fix-dotfiles');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts)
    this.answers = opts
  }

  writing() {
    const dir = path.join(path.dirname(__filename), "../", "../");
    const operationJson = require(`${dir}/package.json`);
    // move to the company to write relative to here
    const packageJson = require(`${this.answers.factory}/package.json`);
    const lernaJson = require(`${this.answers.factory}/lerna.json`);
    // ensure answer is in kebabcase and lowercase
    this.answers.name = _.kebabCase(this.answers.name).toLowerCase();
    let name = this.answers.name.split("-")[1];
    this.capitalizeFirstLetter = (string) => {
      return string[0].toUpperCase() + string.slice(1);
    };
    this.props = {
      factory: this.answers.factory,
      year: new Date().getFullYear(),
      orgNpm: packageJson.wcfactory.orgNpm,
      monorepo: packageJson.wcfactory.monorepo,
      orgGit: packageJson.wcfactory.orgGit,
      gitRepo: packageJson.wcfactory.gitRepo,
      author: config.author,
      copyrightOwner: config.copyrightOwner,
      license: config.license,
      name: this.answers.name,
      humanName: this.capitalizeFirstLetter(this.answers.name.replace('-', ' ')),
      description: this.answers.description,
      elementName: this.answers.name,
      addProps: this.answers.addProps,
      propsListRaw: this.answers.propsList,
      includesString: '',
      connectedString: '',
      constructorString: '',
      additionalFunctionsString: '',
      propsList: {},
      propsListString: '',
      useHAX: this.answers.useHAX,
      haxList: {},
      haxListString: '',
      propsBindingFactory: '',
      customElementClass: libraries[this.answers.customElementTemplate].wcfactory.customElementClass,
      activeWCFLibrary: libraries[this.answers.customElementTemplate],
      elementClassName: _.chain(this.answers.name)
        .camelCase()
        .upperFirst()
        .value(),
      readmeName: _.upperFirst(name),
      storyGroup: _.upperFirst(name),
      lowerCaseName: name,
      camelCaseName: _.camelCase(this.answers.name),
      useSass: (this.answers.useSass == "" ? false : this.answers.useSass),
      useCLI: this.answers.useCLI,
      sassLibraryPkg: false,
      sassLibraryPath: false,
      libraryScripts: '',
      libraryDevDependencies: '',
      libraryDependencies: '',
      generatorWCFactoryVersion: operationJson.version,
      version: lernaJson.version
    };
    _.forEach(this.props.propsListRaw, (prop) => {
      if (prop.observer) {
        prop.observer = '_' + prop.name + 'Changed';
      }
      this.props.propsList[prop.name] = prop;
    });
    this.props.propsListString = JSON.stringify(this.props.propsList, null, '  ')
    this.props.propsListString = this.props.propsListString.replace('"Number"', 'Number');
    this.props.propsListString = this.props.propsListString.replace('"Boolean"', 'Boolean');
    this.props.propsListString = this.props.propsListString.replace('"Array"', 'Array');
    this.props.propsListString = this.props.propsListString.replace('"String"', 'String');
    this.props.propsListString = this.props.propsListString.replace('"Object"', 'Object');
    this.props.propsListString = this.props.propsListString.replace('"Date"', 'Date');
    // work on HAX integration if requested
    if (this.props.useHAX) {
      // set baseline for HAX schema
      this.props.haxList = {
        'canScale': true,
        'canPosition': true,
        'canEditSource': false,
        'gizmo': {
          'title': this.props.humanName,
          'description': this.props.description,
          'icon': 'icons:android',
          'color': 'green',
          'groups': [this.props.readmeName],
          'handles': [
            {
              'type': 'todo:read-the-docs-for-usage',
            }
          ],
          'meta': {
            'author': this.props.author,
            'owner': this.props.copyrightOwner,
          }
        },
        'settings': {
          'configure': [],
          'advanced': []
        }
      };
      // wire HAX properties into the configure block by default
      _.forEach(this.props.propsListRaw, (prop) => {
        let method = 'textfield';
        let icon = 'icons:android';
        // attempt to map data type to hax inputMethod
        switch (prop.type) {
          case 'Boolean':
          case 'Array':
            method = prop.type.toLowerCase();
            break;
          case 'Object':
            method = 'array';
            break;
          case 'Date':
            method = 'datepicker';
            icon = 'icons:date-range';
            break;
        }
        let config = {
          property: prop.name,
          title: prop.humanName,
          description: '',
          inputMethod: method,
          required: false,
          icon: icon,
        };
        // guess a bit for decent starting points on some common ones we see all the time
        if (prop.name === 'source' || prop.name === 'src' || prop.name === 'url') {
          config.validationType = 'url';
          config.required = true;
          config.icon = 'icons:link';
        }
        else if (prop.name === 'alt') {
          config.inputMethod = 'alt';
          config.required = true;
          config.icon = 'icons:accessibility';
        }
        else if (prop.name === 'color' || prop.name === 'primaryColor' || prop.name === 'accentColor') {
          if (config.type === 'textfield') {
            config.inputMethod = 'colorpicker';
            config.icon = 'editor:format-color-fill';
          }
        }
        this.props.haxList.settings.configure.push(config);
      });
    }
    else {
      this.props.useHAX = false;
    }
    // convert to string so we can write to the {name}-hax.json file
    this.props.haxListString = JSON.stringify(this.props.haxList, null, '  ')
    // step through the active package.json file and grab the pieces we most directly need
    this.props.templateReturnFunctionPart = this.props.activeWCFLibrary.wcfactory.templateReturnFunctionPart;
    // work on scripts
    for (var scriptName in this.props.activeWCFLibrary.scripts) {
      let scriptContents = this.props.activeWCFLibrary.scripts[scriptName].replace(new RegExp('"', 'g'), '\\\"');
      this.props.libraryScripts += `"${scriptName}":"${scriptContents}",`;
    }
    // trim that last , if needed
    if (this.props.libraryScripts !== '') {
      this.props.libraryScripts = this.props.libraryScripts.slice(0, -1);
    }
    // work on devDependencies
    _.forEach(this.props.activeWCFLibrary.devDependencies, (version, dependency) => {
      this.props.libraryDevDependencies += `"${dependency}":"${version}",`;
    });
    // trim that last , if needed
    if (this.props.libraryDevDependencies !== '') {
      this.props.libraryDevDependencies = this.props.libraryDevDependencies.slice(0, -1);
    }
    // work on dependencies
    _.forEach(this.props.activeWCFLibrary.dependencies, (version, dependency) => {
      this.props.libraryDependencies += `"${dependency}":"${version}",`;
    });
    // trim that last , if needed
    if (this.props.libraryDependencies !== '') {
      this.props.libraryDependencies = this.props.libraryDependencies.slice(0, -1);
    }
    if (this.props.activeWCFLibrary.wcfactory.propertyBinding) {
      _.forEach(this.props.propsListRaw, (prop) => {
        this.props.propsBindingFactory += '<div>' + this.props.activeWCFLibrary.wcfactory.propertyBinding.prefix + prop.name + this.props.activeWCFLibrary.wcfactory.propertyBinding.suffix + '</div>' + "\n";
      });
    }
    _.forEach(this.props.propsListRaw, (prop) => {
      // convert to object so we can build functions
      if (prop.observer) {
        this.props.additionalFunctionsString += `  // Observer ${prop.name} for changes
              _${prop.name}Changed (newValue, oldValue) {
                if (typeof newValue !== typeof undefined) {
                  console.log(newValue);
                }
              }` + "\n\n";
      }
    });
    if (this.answers.useSass && this.answers.sassLibrary) {
      if (this.answers.sassLibrary.pkg) {
        this.props.sassLibraryPkg = this.answers.sassLibrary.pkg;
      }

      if (this.answers.sassLibrary.path) {
        this.props.sassLibraryPath = this.answers.sassLibrary.path;
      }
      if (this.props.libraryDependencies === '') {
        this.props.libraryDependencies = `"${this.answers.sassLibrary.pkg}":"*"`;
      }
      else {
        this.props.libraryDependencies += `,"${this.answers.sassLibrary.pkg}":"*"`;
      }
    }
    // create element directory
    mkdirp.sync(`${this.props.factory}/elements/${this.props.elementName}`);
    // transition into that directory
    this.destinationRoot(`${this.props.factory}/elements/`);
    this.fs.copyTpl(
      this.templatePath("package.json"),
      this.destinationPath(`${this.props.elementName}/package.json`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("index.html"),
      this.destinationPath(`${this.props.elementName}/index.html`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath(`licenses/${this.props.license}.md`),
      this.destinationPath(`${this.props.elementName}/LICENSE.md`),
      this.props
    );
    if (this.answers.useCLI) {
      this.fs.copyTpl(
        this.templatePath(`src/properties.json`),
        this.destinationPath(
          `${this.props.elementName}/src/${
            this.props.elementName
          }-properties.json`
        ),
        this.props
      );
      this.fs.copyTpl(
        this.templatePath(`src/hax.json`),
        this.destinationPath(
          `${this.props.elementName}/src/${this.props.elementName}-hax.json`
        ),
        this.props
      );
    }

    this.fs.copyTpl(
      this.templatePath("README.md"),
      this.destinationPath(`${this.props.elementName}/README.md`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("gulpfile.cjs"),
      this.destinationPath(`${this.props.elementName}/gulpfile.cjs`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("rollup.config.mjs"),
      this.destinationPath(`${this.props.elementName}/rollup.config.mjs`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("lib/.gitkeep"),
      this.destinationPath(`${this.props.elementName}/lib/.gitkeep`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("demo/index.html"),
      this.destinationPath(`${this.props.elementName}/demo/index.html`),
      this.props
    );
    
    this.fs.copyTpl(
      this.templatePath("test/element.test.js"),
      this.destinationPath(
        `${this.props.elementName}/test/${this.props.elementName}.test.js`
      ),
      this.props
    )

    this.fs.copyTpl(
      this.templatePath("element.stories.js"),
      this.destinationPath(
        `${this.props.elementName}/${this.props.elementName}.stories.js`
      ),
      this.props
    );

    this.fs.copy(
      this.templatePath(".*"),
      this.destinationPath(`${this.props.elementName}`)
    );

    this.fs.copy(
      this.templatePath("_.*"),
      this.destinationPath(`${this.props.elementName}`)
    );

    this.fs.copy(
      this.templatePath("polymer.json"),
      this.destinationPath(`${this.props.elementName}/polymer.json`)
    );
    if (this.answers.useCLI) {
      if (this.props.useSass) {
        this.fs.copyTpl(
          this.templatePath("src/element.scss"),
          this.destinationPath(
            `${this.props.elementName}/src/${this.props.elementName}.scss`
          ),
          this.props
        );
      } else {
        this.fs.copy(
          this.templatePath("src/element.css"),
          this.destinationPath(
            `${this.props.elementName}/src/${this.props.elementName}.css`
          )
        );
      }
    }
    else {
      this.props.useSass = false;
    }
    if (this.answers.useCLI) {
      this.fs.copyTpl(
        this.templatePath("src/element.html"),
        this.destinationPath(
          `${this.props.elementName}/src/${this.props.elementName}.html`
        ),
        this.props
      );
    }
    // if we use the CLI, we dump in this template file
    // otherwise we have to stitch them all together
    if (this.answers.useCLI) {
      this.fs.copyTpl(
        this.sourceRoot(
          `../../../templates/libraries/${this.props.activeWCFLibrary.main}`
        ),
        this.destinationPath(
          `${this.props.elementName}/src/${this.props.elementName}.js`
        ),
        this.props
      );
    }
    else {
      this.fs.copyTpl(
        this.sourceRoot(
          `../../../templates/noCLI/${this.props.activeWCFLibrary.main}`
        ),
        this.destinationPath(
          `${this.props.elementName}/src/${this.props.elementName}.js`
        ),
        this.props
      );
    }

    fixDotfiles(this);
  }

  install() {
    process.chdir(`${this.props.factory}`);
    this.installDependencies({
      npm: false,
      bower: false,
      yarn: true
    });
  }

  end() {
    process.chdir(`${this.props.factory}/elements/${this.props.elementName}`);
    this.spawnCommandSync("yarn", ["run", "build"]);
    let banner =
      chalk.green("\n    A fresh made ") +
      chalk.yellow("Web Component Factory ") +
      chalk.green("element brought to you by:\n        ") +
      chalk.blue("The Pennsylvania ") +
      chalk.white("State University's ") +
      chalk.magenta("E") +
      chalk.cyan("L") +
      chalk.red("M") +
      chalk.yellow("S") +
      chalk.white(": ") +
      chalk.green("Learning Network\n")
    banner +=
      chalk.green("\n\nTo publish your element when done goto:\n    ") +
      chalk.yellow(
        `https://www.webcomponents.org/publish`
      ) +
      chalk.green("\n\nTo work on your new element type:\n    ") +
      chalk.yellow(
        `cd ${this.props.factory}/elements/${this.props.elementName} && yarn start\n\n`
      );
    this.log(banner);
  }
};