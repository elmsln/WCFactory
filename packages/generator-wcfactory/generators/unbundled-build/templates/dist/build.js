window.process={env:{NODE_ENV:"production"}};var cdn="./",fname="wc-registry.json";window.__appCDN&&(cdn=window.__appCDN),window.WCGlobalRegistryFileName&&(fname=window.WCGlobalRegistryFileName),window.WCAutoloadRegistryFile=cdn+fname;try{var def=document.getElementsByTagName("script")[0];new Function("import('');");var ani=document.createElement("script");ani.src=cdn+"build/es6/node_modules/web-animations-js/web-animations-next-lite.min.js",def.parentNode.insertBefore(ani,def);var build=document.createElement("script");build.src=cdn+"build/es6/node_modules/@haxtheweb/wc-autoload/wc-autoload.js",build.type="module",def.parentNode.insertBefore(build,def)}catch(e){var legacy=document.createElement("script");legacy.src=cdn+"assets/build-legacy.js",def.parentNode.insertBefore(legacy,def)}