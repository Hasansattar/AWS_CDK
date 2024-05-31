import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class Example00CreateAutoSecretStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    const secret = new secretsmanager.Secret(this, 'Secret');  // SecretsManager generate a new secret value automatically

    const lambdaFn = new lambda.Function(this, `ExampleLambdaAssetFn`, {
      code: lambda.Code.fromInline('exports.handler = function(event, ctx, cb) { console.log("SECRET_KEY", process.env.EXAMPLE_SECRET_KEY); return cb(null, "hi"); }'),
      runtime: lambda.Runtime.NODEJS_16_X,
      // role: role,
      environment: {
        EXAMPLE_SECRET_KEY: `${
          secretsmanager.Secret.fromSecretAttributes(this, "ExampleSecretKey", {
            secretCompleteArn:secret.secretArn,
          }).secretValue
        }`
      },
      handler: "index.handler",
    })
  }
}
