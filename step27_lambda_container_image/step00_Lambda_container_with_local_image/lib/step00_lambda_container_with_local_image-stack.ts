import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from "aws-cdk-lib/aws-lambda";

export class Step00LambdaContainerWithLocalImageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // creating lambda with contianer image
    const fn = new lambda.DockerImageFunction(this, "lambdaFunction", {
      //make sure the lambdaImage folder must container Dockerfile
      code: lambda.DockerImageCode.fromImageAsset("lambdaImage"),
    });
  }
}
