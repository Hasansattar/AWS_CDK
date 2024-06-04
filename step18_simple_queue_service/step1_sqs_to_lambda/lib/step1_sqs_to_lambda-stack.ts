import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaEvents from "aws-cdk-lib/aws-lambda-event-sources";

import * as path from "path";

export class Step1SqsToLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const sqsLambda = new lambda.Function(this, "sqsLambda", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "/../", "lambda")),
      handler: "index.handler",
      reservedConcurrentExecutions: 5, // only have 5 invocations at a time, having this <5 has a problem?
    });

    const queue = new sqs.Queue(this, "testQueue", {
      queueName: "testQueue",
      encryption: sqs.QueueEncryption.UNENCRYPTED,
      retentionPeriod: cdk.Duration.days(4),
      visibilityTimeout: cdk.Duration.seconds(30), // default,
      receiveMessageWaitTime: cdk.Duration.seconds(20), // default
    });

    sqsLambda.addEventSource(
      new lambdaEvents.SqsEventSource(queue, {
        batchSize: 10, // default
      })
    );
  }
}
