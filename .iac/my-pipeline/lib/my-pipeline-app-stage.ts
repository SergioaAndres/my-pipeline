import { Stage, StageProps, Tags, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { BuildConfig } from "../lib/build-config";
import { getConfig } from "../lib/get-config";
import { MyLambdaStack } from "./my-pipeline-lambda-stack";

let config: BuildConfig = getConfig();
export class MyPipelineAppStage extends Stage {
  public readonly apiEndpointOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const lambdaStack = new MyLambdaStack(this, "LambdaStack");
    this.apiEndpointOutput = lambdaStack.apiEndpointOutput;
    // Add a tag to all constructs in the stack
    Tags.of(lambdaStack).add("projectName", config.projectName);
  }
}
