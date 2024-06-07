import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class Example01LambdaWithMultipleLayersStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

     // The code that defines your stack goes here

     const httpLayer = new lambda.LayerVersion(this, "HttpLayer", {
      code: lambda.Code.fromAsset('lambda-layers/http'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_16_X], // optional 
    })
    const nameGenerator = new lambda.LayerVersion(this, "NameGeneratorLayer", {
      code: lambda.Code.fromAsset('lambda-layers/nameGenerator'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_16_X], // optional 
    })

    new lambda.Function(this, "LambdaWithLayer", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'lambda.handler',
      layers: [httpLayer, nameGenerator],
    })
  }
}
