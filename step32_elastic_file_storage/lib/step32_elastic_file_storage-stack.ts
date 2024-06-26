import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as efs from "aws-cdk-lib/aws-efs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";

export class Step32ElasticFileStorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const myVpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
    });

    const fileSystem = new efs.FileSystem(this, "lambdaEfsFileSystem", {
      vpc: myVpc
    });

    const accessPoint = fileSystem.addAccessPoint("AccessPoint", {
      createAcl:{
        ownerGid: "1001",
        ownerUid: "1001",
        permissions: "750",
      },
      path:"/export/lambda",
      posixUser:{
        gid: "1001",
        uid: "1001",
      },
    });

    const efsLambda = new lambda.Function(this, "efsLambdaFunction", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "msg.handler",
      vpc: myVpc,
      filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint,"/mnt/msg"),
    });

    const api = new apigw.HttpApi(this, "Endpoint", {
      defaultIntegration: new integrations.LambdaProxyIntegration({
        handler: efsLambda,
      }),
    });

    new cdk.CfnOutput(this, "HTTP API Url", {
      value: api.url ?? "Something went wrong with the deploy",
    });
  }
}
