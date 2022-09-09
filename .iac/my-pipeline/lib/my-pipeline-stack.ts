import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import {
  BuildEnvironmentVariableType,
  Cache,
  LocalCacheMode,
  BuildSpec,
} from "aws-cdk-lib/aws-codebuild";
import {
  CodePipeline,
  CodePipelineSource,
  CodeBuildStep,
  ManualApprovalStep,
} from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { BuildConfig } from "../lib/build-config";
import { getConfig } from "../lib/get-config";
import { MyPipelineAppStage } from "./my-pipeline-app-stage";

let config: BuildConfig = getConfig();
export class MyPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: config.pipelineName,
      crossAccountKeys: true,
      synth: new CodeBuildStep("Synth", {
        input: CodePipelineSource.connection(config.repoString, config.branch, {
          connectionArn: config.connectionArn,
        }),
        commands: [
          "docker run --rm -i hadolint/hadolint < Dockerfile",
          "cd .iac/my-pipeline",
          "npm ci",
          "npm run eslint",
          "npm run build",
          "npx cdk synth",
          "npm run test",
          "npm run snyk-iac -- --report --severity-threshold=medium || echo 'Warning Only' ",
        ],
        primaryOutputDirectory: ".iac/my-pipeline/cdk.out",
        buildEnvironment: {
          environmentVariables: {
            SONAR_TOKEN: {
              type: BuildEnvironmentVariableType.PARAMETER_STORE,
              value: config.sonarTokenPath,
            },
            SONAR_HOST_URL: {
              type: BuildEnvironmentVariableType.PARAMETER_STORE,
              value: config.sonarHostUrlPath,
            },
            SNYK_TOKEN: {
              type: BuildEnvironmentVariableType.PARAMETER_STORE,
              value: config.snykTokenPath,
            },
            DOCKER_BUILDKIT: {
              type: BuildEnvironmentVariableType.PLAINTEXT,
              value: 1,
            },
          },
        },
        cache: Cache.local(LocalCacheMode.DOCKER_LAYER, LocalCacheMode.CUSTOM),
        partialBuildSpec: BuildSpec.fromObject({
          cache: {
            paths: [".iac/my-pipeline/cdk.out/**/*"],
          },
        }),
      }),
      dockerEnabledForSynth: true,
    });

    const devEnv = new MyPipelineAppStage(this, "Dev", {
      env: { account: config.devAccountId, region: config.devRegion },
    });

    function zapStage(apiEndpointOutput: CfnOutput, scanConfig: string): any {
      return {
        commands: [
          'curl -Ssf "$ENDPOINT_URL?x=2&y=3"',
          `docker run -v $(pwd)/.sec:/zap/wrk/:rw -u $(id -u \${USER}):$(id -g \${USER}) -t owasp/zap2docker-weekly zap-baseline.py -g api-scan-passive.conf -c ${scanConfig} -r reports/api_passive_scan.html -t "$ENDPOINT_URL?x=2&y=3"`,
        ],
        buildEnvironment: {
          privileged: true,
        },
        cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
        primaryOutputDirectory: ".sec/reports",
        envFromCfnOutputs: {
          ENDPOINT_URL: apiEndpointOutput,
        },
      };
    }

    const devZapScan = new CodeBuildStep(
      "ZAP scan",
      zapStage(devEnv.apiEndpointOutput, "api-scan-passive.conf")
    );

    pipeline.addStage(devEnv, {
      post: [devZapScan],
    });

    const testEnv = new MyPipelineAppStage(this, "Test", {
      env: { account: config.testAccountId, region: config.testRegion },
    });

    const testZapScan = new CodeBuildStep(
      "ZAP scan",
      zapStage(testEnv.apiEndpointOutput, "api-scan-passive.conf")
    );
    pipeline.addStage(testEnv, {
      post: [testZapScan],
    });

    const stgEnv = new MyPipelineAppStage(this, "Stg", {
      env: { account: config.stgAccountId, region: config.stgRegion },
    });
    const stgZapScan = new CodeBuildStep(
      "ZAP scan",
      zapStage(stgEnv.apiEndpointOutput, "api-scan-active.conf")
    );
    pipeline.addStage(stgEnv, {
      pre: [
        new ManualApprovalStep("PromoteToStg", {
          comment: "Manual Approval to allow deployment to Stage environment",
        }),
      ],
      post: [stgZapScan],
    });
    const prodEnv = new MyPipelineAppStage(this, "Prod", {
      env: { account: config.prodAccountId, region: config.prodRegion },
    });

    pipeline.addStage(prodEnv, {
      pre: [
        new ManualApprovalStep("PromoteToProd", {
          comment: "Manual Approval to allow deployment to Stage environment",
        }),
      ],
    });
  }
}
