#!/usr/bin/env node

"use strict";

/*
 * NOTE: The contents of this file should work on as many version of Node.js
 * as possible. This means it *can not* use any >ES5 syntax and features.
 * Other files, which may use >=ES2015 syntax, should only be loaded
 * asynchronously after this version check has been performed.
 */

var pkg = require("../package.json");

// Exit early if the user's node version is too low.
require("please-upgrade-node")(pkg);

// Alert user if a newer version of cli is availible
require("update-notifier")({ pkg: pkg }).notify();

var program = require("commander");
var yeoman = require("yeoman-environment");
var env = yeoman.createEnv();

/**
 * Register our yeoman generators
 */
env.register(
  require.resolve("@wcfactory/generator-wcfactory/generators/app"),
  "wcfactory:app"
);
env.register(
  require.resolve("@wcfactory/generator-wcfactory/generators/init"),
  "wcfactory:init"
);
env.register(
  require.resolve("@wcfactory/generator-wcfactory/generators/start"),
  "wcfactory:start"
);
env.register(
  require.resolve("@wcfactory/generator-wcfactory/generators/build"),
  "wcfactory:build"
);

/*
 * We are going to use commander to set up a nice user focused cli for accessing our
 * yeoman generator.
 */
program.version(pkg.version).description(pkg.description);

program
  .command("new")
  .description("Create a new element.")
  .action(function(name) {
    env.run("wcfactory:app");
  });

program
  .command("start")
  .description(
    "Create a meta-repo that makes it easier to orchestrate all your factories"
  )
  .action(function(name) {
    env.run("wcfactory:start");
  });

program
  .command("build")
  .description("Build a new product")
  .action(function(name) {
    env.run("wcfactory:build");
  });

program
  .command("init")
  .description(
    "Create mono repo for your element library. This is a factory in our mental model."
  )
  .action(function(name) {
    env.run("wcfactory:init");
  });

// instantiate commander
program.parse(process.argv);
