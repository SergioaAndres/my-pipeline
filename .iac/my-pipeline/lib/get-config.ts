import * as fs from "fs";
import * as path from "path";
import { BuildConfig } from "../lib/build-config";
const yaml = require("js-yaml"); // eslint-disable-line @typescript-eslint/no-require-imports

export function ensureString(
  object: { [name: string]: any },
  propName: string
): any {
  if (!object[propName] || object[propName] == undefined)
    throw new Error(propName + " does not exist or is empty");

  return object[propName];
}

export function getConfig() {
  const configPath = "./config/config.yml";
  if (!fs.existsSync(path.resolve(configPath))) {
    throw new Error(
      `Cannot find ${configPath} file. Please review the config folder`
    );
  }
  let unparsedEnv = yaml.load(
    fs.readFileSync(path.resolve(configPath), "utf8")
  );

  let buildConfig: BuildConfig = {
    projectName: ensureString(unparsedEnv, "projectName"),
    pipelineName: ensureString(unparsedEnv, "pipelineName"),
    repoString: ensureString(unparsedEnv, "repoString"),
    branch: ensureString(unparsedEnv, "branch"),
    connectionArn: ensureString(unparsedEnv, "connectionArn"),
    sonarTokenPath: ensureString(unparsedEnv, "sonarTokenPath"),
    sonarHostUrlPath: ensureString(unparsedEnv, "sonarHostUrlPath"),
    snykTokenPath: ensureString(unparsedEnv, "snykTokenPath"),
    pipelineAccountId: ensureString(unparsedEnv, "pipelineAccountId"),
    pipelineRegion: ensureString(unparsedEnv, "pipelineRegion"),
    devAccountId: ensureString(unparsedEnv, "devAccountId"),
    devRegion: ensureString(unparsedEnv, "devRegion"),
    testAccountId: ensureString(unparsedEnv, "testAccountId"),
    testRegion: ensureString(unparsedEnv, "testRegion"),
    stgAccountId: ensureString(unparsedEnv, "stgAccountId"),
    stgRegion: ensureString(unparsedEnv, "stgRegion"),
    prodAccountId: ensureString(unparsedEnv, "prodAccountId"),
    prodRegion: ensureString(unparsedEnv, "prodRegion"),
    allowOrigins: ensureString(unparsedEnv, "allowOrigins"),
  };

  return buildConfig;
}
