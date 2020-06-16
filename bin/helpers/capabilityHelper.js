const logger = require("./logger").winstonLogger,
  Constants = require("./constants");

const caps = (bsConfig, zip) => {
  return new Promise(function (resolve, reject) {
    let user = undefined;
    let password = undefined;

    if (bsConfig.auth) {
      user = bsConfig.auth.username;
      password = bsConfig.auth.access_key;
    }

    if (!user || !password) reject(Constants.validationMessages.INCORRECT_AUTH_PARAMS);

    var obj = new Object();

    // Browser list
    let osBrowserArray = [];
    if (bsConfig.browsers) {
      bsConfig.browsers.forEach((element) => {
        osBrowser = element.os + "-" + element.browser;
        element.versions.forEach((version) => {
          osBrowserArray.push(osBrowser + version);
        });
      });
    }
    obj.devices = osBrowserArray;
    if (obj.devices.length == 0) reject(Constants.validationMessages.EMPTY_BROWSER_LIST);
    logger.info(`Browser list: ${osBrowserArray.toString()}`);

    // Test suite
    if (zip.zip_url && zip.zip_url.split("://")[1].length !== 0) {
      obj.test_suite = zip.zip_url.split("://")[1];
    } else {
      reject("Test suite is empty");
    }
    logger.info(`Test suite: bs://${obj.test_suite}`);

    // Local
    obj.local = false;
    if (bsConfig.connection_settings && bsConfig.connection_settings.local === true) obj.local = true;
    logger.info(`Local is set to: ${obj.local}`);

    // Local Identifier
    obj.localIdentifier = null;
    if (obj.local === true && (bsConfig.connection_settings.localIdentifier || bsConfig.connection_settings.local_identifier))
    {
      obj.localIdentifier = bsConfig.connection_settings.localIdentifier || bsConfig.connection_settings.local_identifier;
      logger.log(`Local Identifier is set to: ${obj.localIdentifier}`);
    }

    // Project name
    obj.project = "project-name";
    // Build name
    obj.customBuildName = "build-name";
    //callback url
    obj.callbackURL = null;
    //projectNotifyURL
    obj.projectNotifyURL = null;

    if (bsConfig.run_settings) {
      obj.project = bsConfig.run_settings.project || bsConfig.run_settings.project_name;
      obj.customBuildName = bsConfig.run_settings.customBuildName || bsConfig.run_settings.build_name;
      obj.callbackURL = bsConfig.run_settings.callback_url;
      obj.projectNotifyURL = bsConfig.run_settings.project_notify_URL;
    }

    if (obj.project) logger.log(`Project name is: ${obj.project}`);

    if (obj.customBuildName) logger.log(`Build name is: ${obj.customBuildName}`);

    if (obj.callbackURL) logger.info(`callback url is : ${obj.callbackURL}`);

    if (obj.projectNotifyURL) logger.info(`Project notify URL is: ${obj.projectNotifyURL}`);

    obj.parallels = bsConfig.run_settings.parallels;
    if (obj.parallels) logger.info(`Parallels specified are: ${obj.parallels}`);

    var data = JSON.stringify(obj);
    resolve(data);
  })
}

const validate = (bsConfig, args) => {
  return new Promise(function(resolve, reject){
    if (!bsConfig) reject(Constants.validationMessages.EMPTY_BROWSERSTACK_JSON);

    if (!bsConfig.auth) reject(Constants.validationMessages.INCORRECT_AUTH_PARAMS);

    if (!bsConfig.browsers || bsConfig.browsers.length === 0) reject(Constants.validationMessages.EMPTY_BROWSER_LIST);

    if (!bsConfig.run_settings) reject(Constants.validationMessages.EMPTY_RUN_SETTINGS);

    if(!bsConfig.run_settings.cypress_proj_dir) reject(Constants.validationMessages.EMPTY_SPEC_FILES);

    if (!args.parallels) {
      if (Number.isNaN(bsConfig.run_settings.parallels) || (parseInt(bsConfig.run_settings.parallels, 10) < 0 && parseInt(bsConfig.run_settings.parallels, 10) != -1))
        reject(Constants.validationMessages.INVALID_PARALLES_CONFIGURATION)
    };

    resolve(Constants.validationMessages.VALIDATED);
  });
}

module.exports = {
  caps,
  validate
}
