import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { getConfig, ensureString } from "../lib/get-config";
import { MyPipelineStack } from "../lib/my-pipeline-stack";

describe("MypipelineStack", () => {
  test("Check private bucket and KMS key", () => {
    const app = new cdk.App();

    const pipelineStack = new MyPipelineStack(app, "MyPipelineStack", {
      env: {
        account: "123456789012",
        region: "us-east-2",
      },
    });

    const template = Template.fromStack(pipelineStack);

    template.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });

    template.resourceCountIs("AWS::KMS::Key", 1);
  });
});

describe("Config Checks", () => {
  test("Config", () => {
    let file = {
      Name: "value",
    };
    // Check ensureString function
    expect(ensureString(file, "Name")).toEqual("value");
    expect(() => ensureString(file, "fakeVariable")).toThrow(
      "fakeVariable does not exist or is empty"
    );
  });

  test("Get config", () => {
    expect(() => {
      getConfig();
    }).toBeDefined();
  });
});
