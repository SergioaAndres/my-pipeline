import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Function, Runtime, Code, Tracing } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { BuildConfig } from "../lib/build-config";
import { getConfig } from "../lib/get-config";

let config: BuildConfig = getConfig();
export class MyLambdaStack extends Stack {
  public readonly apiEndpointOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const myLambda = new Function(this, "LambdaFunction", {
      runtime: Runtime.PYTHON_3_9,
      handler: "src/app/main.lambda_handler",
      tracing: Tracing.ACTIVE,
      code: Code.fromDockerBuild("../../", {
        buildArgs: {
          SNYK_TOKEN: process.env.SNYK_TOKEN!,
          SONAR_TOKEN: process.env.SONAR_TOKEN!,
          SONAR_HOST_URL: process.env.SONAR_HOST_URL!,
        },
      }),
    });
    const myApi = new LambdaRestApi(this, "ApiGateway", {
      handler: myLambda,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: config.allowOrigins,
        allowMethods: ["GET", "OPTIONS"],
      },
    });
    myApi.root.addMethod("GET");
    this.apiEndpointOutput = new CfnOutput(this, "apiEndpoint", {
      value: myApi.url,
      description: "Endpoint for root REST API",
    });
  }
}
