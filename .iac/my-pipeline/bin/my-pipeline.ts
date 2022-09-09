#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { BuildConfig } from "../lib/build-config";
import { getConfig } from "../lib/get-config";
import { MyPipelineStack } from "../lib/my-pipeline-stack";

let config: BuildConfig = getConfig();

const app = new cdk.App();

const mypipeline = new MyPipelineStack(app, "MyPipelineStack", {
  env: {
    account: "502603844105",
    region: "us-east-2",
  },
});

// Add a tag to all constructs in the stack
cdk.Tags.of(mypipeline).add("projectName", config.projectName);

app.synth();
