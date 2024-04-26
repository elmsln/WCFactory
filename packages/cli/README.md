# Web Component Factory

[![Join the chat at https://gitter.im/wcfactory/Lobby](https://badges.gitter.im/wcfactory/Lobby.svg)](https://gitter.im/wcfactory/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.com/elmsln/wcfactory.svg?branch=master)](https://travis-ci.com/elmsln/wcfactory)

A factory that churns out web components, library agnostic with a unified development, testing, and build to production pipeline. We want to eliminate the barriers to web component adoption because as of Oct 23rd, 89.18% of all traffic can handle web components with *no polyfills* See (End user support)(#endusersupport) for full details below.

[Here's a video showing what this is and how it works](https://www.youtube.com/playlist?list=PLJQupiji7J5cAv7Jfr1V8FvUTx_jJrmCl).

### Install

Make sure you have a version of node >=6.0 and above.
Verify that you have yarn enabled — if not [install yarn globally](https://yarnpkg.com/lang/en/docs/install/).
```bash
$ yarn global add @wcfactory/cli
```
## Usage (company)
A company helps you manage multiple factories and the products they produce so you'll need to create one before you do anything else. **The company MUST be created in a directory above your user directory** in some manner. example: `/home/dana/Documents/git/company` or any directory above `/home/dana`.
```bash
# create a new company, a series of factories linked by the owner
$ mkdir my-company-name && cd my-company-name && wcf start
# create a new factory after you've made the company
wcf factory
# add a new element to the factory-name that you produced in the previous step
wcf element
```
Answer the prompts for your new element and your off and running. To work on your new element called `new-name` perform the following:
```bash
$ cd {factoryName}/elements/new-name
$ yarn start
```
This will open the folder to the `elements/new-name/src` folder, start watching it for changes which will be compiled automatically (and documented), and open a mini-server (via `polymer serve`) which will allow you to edit the src directory files, compile them together and make them available for the localhost window for viewing.

## Library development
Storybook is built into the tooling to automatically be setup based on the properties and demos you create for the individual elements. You can fire it up from the factory level by running `yarn run storybook`. The default for elements is that their properties are analzed to generate knobs automatically and their demo is a mix of a live demo of the element + knobs as well as static demos from your element's `demo/index.html`.

## Publishing
The repo generated is managed by `lerna`. `lerna` allows you to manage multiple packages at once so that other people can take your individual elements you produce and use them as they please, while allowing you to develop everything in one repository.

`yarn run build` will perform the build step for the individual project. You may need to do this in order to get lerna to pick it up (we're still fleshing the workflow here out in the CLI).

`lerna run build --no-bail` will perform the build step in all elements

`lerna publish` will perform a publish to npmjs.com / yarn for each element in the factory.

## Build
The CLI supports building for different targets to produce a boilerplate as well as a build flow to get from nothing, to elements, to publishing, to built and served by a production website to all browser targets. To use build do the following:
- Have a factory with some elements in it
- Issue `yarn run build` from the factory, followed up `lerna publish` to publish versions of all elements
- Issue `wcf build`
- Answer the questions (picking a buildName), factory and output target (Drupal 7, Drupal 8, Static and CDN styles are supported)
- When finished, you'll have something in the `builds/{buildName}` directory that will work across all browsers!

## Storybook
The factories produced by this come equiped with storybook integration. To publish this out to the web in a static form, you can issue `yarn run build-storybook` which will place the build storybook in `{companyName}/storybooks/{factoryName}`.

## Vision
- 1 command to get everything up and going
- Never have to understand the complexities of tooling
- CLI should seek to empower as many people as possible
- Anyone should be able to manage, create, and share elements in an element library
- Seamless sharing to webcomponents.org, npmjs.com, and git
- Unify CLI, build step, and element packaging across all libraries
- Allow advanced developers to fork, tinker, and repurpose to their will

## Goals
- Empower anyone that knows how to create HTML,CSS and basic JS with web components
- Eliminate barriers to entry by abstracting tooling
- Create a single dependency (docker) requirement to participating effectively in the future of the web
- Support any platform matching https://custom-elements-everywhere.com/ conformance testing
- Support any custom element sub class you want to add

## Features
- Monorepo management via Lerna
- Storybook for entire element catalogue
- Unified CLI that can create anything it finds a definition for in `./wcfLibraries/`
- All `example-element` would be worked on in `example-element/src`
- Gulp based dev routines + built in serve + compile to AMD, UMD, ES5 and ES6/native, per element for complete break away flexibility
- Data binding definitions mapped across element libraries (when applicable)
- Ability to add any customElement baseClass definition you want!
- Support for [HAX schematic wiring](http://haxtheweb.org/) as a single question!

## End user support
Because of the Web component standard, babel and polyfills we support the following as part of our build routines.
- Chrome 50+
- Opera 47+
- IOS / Safari 9+
- FF 54+
- Edge 15+
- IE 11

This is confirmed to work with 98.26% of all global traffic (Aug-Sep 2018) and should work with 99.64% (difficult to confirm Android original browser) with only being 0.36% unknown. 93.83% of all traffic loads via ES Modules (async loading of assets, http2 is lightning). As of Oct 23, 2018, 89.18% of all traffic will not require any polyfills.

## Development (on wcfactory itself)

### Yarn and Lerna

We use a combination of Yarn Workspaces and Lerna to manage local developement and publishing of this monorepo. [Read more about that ingeration(https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/#managing-dependencies-of-workspaces)

### Install

Clone and install dependencies with yarn install.

```bash
git clone https://github.com/elmsln/wcfactory.git
cd wcfactory
yarn install
```

Make the local version of the cli available globally.

```bash
cd packages/cli
yarn link
```

Verify that the cli is installed globally

```bash
wcf -h
```

### Docker

We include a docker-compose file for developement purposes which has the monorepo pre-installed.  It also has
the cli globally available in the image.

To run wcfactory cli commands inside of the docker image you can run the follow command:

Examples
```bash
docker-compose run wcf <command>
docker-compose run wcf factory
docker-compose run wcf new
```

Anything created inside of the docker image will be synced locally inside of the `./tmp/docker/wcfactory` directory.

### Troubleshooting

```
yarn install v1.10.1
error ../../package.json: Name contains illegal characters
info Visit https://yarnpkg.com/en/docs/cli/install for documentation about this command.
```

There is an error in how package can be composed when using the factory command that fails to prepend a '@' in front of your NPM organization name if you don't manually add one.  This can lead to invalid package names.

To fix, modify your /package.json file where it says ```"orgNpm": "my-org",``` to be ```"orgNpm": "@my-org",```
