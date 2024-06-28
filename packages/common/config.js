/**
 * Recursively finds all package.json files relative to a wcfactory Factory
 * and returns a settings object.
 *
 * @todo think about where we want these configs, how we want overrides to work
 */
const { existsSync, readFileSync } = require('fs')
const path = require('path')
const _ = require('lodash')
const glob = require('glob')
const os = require('os')
const cwd = process.cwd()
const { execFileSync, spawn } = require('child_process')
const lernaPath = require.resolve('lerna/cli')

/**
 * Get a singular config object for this project.
 */
const config = () => {
  const configs = getConfigs()
  const configObject = convertConfigs(configs)
  return configObject
}

/**
 * Get factories Directory
 */
const factoryDir = () => {
  const userConfig = getUserConfig()
  return path.join(userConfig.companyDir, 'factories')
}

/**
 * Get a list of factory options
 */
const factoryOptions = () => {
  let folders = glob.sync(`${factoryDir()}/*`);
  return folders
    // verify if each one has a package.json
    .filter(i => existsSync(path.join(i, 'package.json')))
    // format the item
    .map(i => {
      let name = i.split("/").pop();
      const obj = Object.assign({ name: name, value: i })
      return obj
    })
}

/**
 * Get location of the build directory
 */
const buildsDir = () => {
  const userConfig = getUserConfig()
  return path.join(userConfig.companyDir, 'builds')
}

/**
 * Get a list of build options
 */
const buildOptions = () => {
  let buildOptions = [];
  // array into nestings we need to simplify yo work
  _.forEach(buildData(), (val, key) => {
    if (typeof val !== typeof undefined) {
      buildOptions.push({
        name: val.name,
        value: key
      });
    }
  });
  return buildOptions
}

/**
 * Get build data
 */
const buildData = () => {
  // generated dynamically
  return {
    static: {
      name: "Static boilerplate",
      key: "Static"
    },
    drupal8: {
      name: "Drupal 8 (Twig)",
      key: "Drupal-8"
    },
    drupal7: {
      name: "Drupal 7",
      key: "Drupal-7"
    },
    backdropcms: {
      name: "Backdrop CMS",
      key: "BackdropCMS"
    },
    gravcms: {
      name: "Grav CMS",
      key: "GravCMS"
    }
  };
}

/**
 * Retreive array of config objects found
 */
const getConfigs = () => {
  const packageConfigs = collectPackageConfigs()
  const userConfigs = collectUserConfigs()
  return [...packageConfigs, ...userConfigs]
}

/**
 * Recursivley build an array of package configs
 */
const collectPackageConfigs = () => {
  const cwd = process.cwd();

  let configs = []

  let _cwd = cwd
  while (path.basename(_cwd) !== '') {
    // look for package
    const p = path.join(_cwd, 'package.json')
    if (existsSync(p)) {
      // push the content of the file into an array
      const packageJSONContents = JSON.parse(readFileSync(p, 'utf8'))
      const wcfactorySettings = _.get(packageJSONContents, 'wcfactory')
      if (wcfactorySettings) {
        configs.push(wcfactorySettings)
      }
      configs.version = _.get(packageJSONContents, 'version');
    }
    // move up a directory
    _cwd = path.join(_cwd, '../')
  }

  return configs
}

/**
 * Recursivley build an array of package configs
 */
const collectUserConfigs = () => {
  const cwd = process.cwd();

  let configs = []

  let _cwd = cwd
  while (path.basename(_cwd) !== '') {
    // look for package
    const c = path.join(_cwd, '.wcfconfig')
    const p = path.join(c, 'user')
    if (existsSync(p)) {
      // push the content of the file into an array
      const wcfactorySettings = JSON.parse(readFileSync(p, 'utf8'))
      configs.push(wcfactorySettings)
    }
    // move up a directory
    _cwd = path.join(_cwd, '../')
  }

  return configs
}

/**
 * Convert a raw array of config file contents into a single config object
 * @param configs array of config file contents
 */
const convertConfigs = (configs) => {
  const _configs = configs.reverse()
  // reverse array
  if (_configs.length > 0) {
    return _configs.reduce((acc, cur) => Object.assign(acc, cur))
  }
  return _configs
}

const libraries = () => {
  const libs = []
  const libsLocations = getLibraryLocations()
  _.forEach(libsLocations, (lib, key) => {
    const packageLocation = path.join(lib, 'package.json')
    let json = JSON.parse(readFileSync(packageLocation, "utf8"));
    libs[json.name] = json;
  })
  return libs
}

/**
 * User config
 */
const getUserConfig = () => {
  try {
    return JSON.parse(readFileSync(path.join(os.homedir(), '.wcfconfig/user'), 'utf8'));
  } catch (err) {
    console.warn(path.join(os.homedir(), '.wcfconfig/') + ' is missing! Run wcf start from your desired directory to get started!');
  }
}

const userConfig = () => {
  return getUserConfig()
}

/**
 * Libraries Dir
 */
const librariesDir = () => {
  const userConfig = getUserConfig()
  return path.join(userConfig.companyDir, 'templates', 'libraries');
}

/**
 * Listing of library templates
 */
const librariesOptions = () => {
  // package files of each element
  let options = []
  let libraries = getLibraryLocations()
  _.forEach(libraries, (lib, key) => {
    const packageLocation = path.join(lib, 'package.json')
    let json = JSON.parse(readFileSync(packageLocation, "utf8"));
    options.push({
      name: `${json.name} -- ${json.description}. ${Object.keys(json.dependencies).length} dependencies`,
      value: json.name
    })
  });
  return options
}


/**
 * Returns the a list of libraries found
 */
const getLibraryLocations = () => {
  // package files of each element
  let files = glob.sync(`${librariesDir()}/*`);
  return files
}

/**
 * Get a list of all elements in a factory
 * @return array containing names and locations and versions
 */
const getElements = (factory) => {
  try {
    // get factory path
    const factoryPath = path.join(factoryDir(), factory)
    // look through the listing of workspaces and return a flattened
    // array of elements
    return JSON.parse(execFileSync(lernaPath, ["list", "--json", "--all", "--long"], { cwd: factoryPath }))
  } catch (error) {
    throw error
  }
}

/**
 * Return a list of scripts defined in an element
 */
const getElementByLocation = (elementLocation) => {
  try {
    const elementList = JSON.parse(execFileSync(lernaPath, ["list", "--json", "--all", "--long"], { cwd: elementLocation }))
    return elementList.find(i => i.location === elementLocation)
  } catch (error) {
    throw error
  }
}

/**
 * Return a list of scripts defined in an element
 */
const getElementScripts = (elementLocation) => {
  const packageLocation = path.join(elementLocation, 'package.json')
  try {
    const packageObj = JSON.parse(readFileSync(packageLocation, 'utf8'))
    return Object.keys(packageObj.scripts)
  } catch (error) {
  }
  return []
}

/**
 * Execute a script via npm run
 * @param {string} script 
 * @param {string} location 
 * @return process
 */
const runScript = (script, location) => {
  // run the operation for that element
  return spawn('npm', ['run', script], {
    cwd: location,
    stdio: 'inherit',
    shell: true
  })
}

module.exports.config = config()
module.exports.userConfig = userConfig()
module.exports.factoryDir = factoryDir()
module.exports.factoryOptions = factoryOptions
module.exports.buildsDir = buildsDir()
module.exports.buildOptions = buildOptions()
module.exports.buildData = buildData()
module.exports.libraries = libraries()
module.exports.librariesOptions = librariesOptions()
module.exports.librariesDir = librariesDir()
module.exports.getElements = getElements
module.exports.getElementByLocation = getElementByLocation
module.exports.getElementScripts = getElementScripts
module.exports.runScript = runScript