import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns_sub from "aws-cdk-lib/aws-sns-subscriptions";

// Importing our custom construct
import { NotifyingBucket } from "../constructs/notifyBucket";

export class Step29ConstructsAsCloudComponentsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

     // Here we use our custom created construct to send a notification to SQS
    // whenever we upload a file to the folder test in our s3 bucket
    const testBucket = new NotifyingBucket(this, "notifyingTestBucket", {
      prefix: "test/",
    });

    // A simple que to send our sns notifications to.
    const queue = new sqs.Queue(this, "NewTestQueue");

    testBucket.topic.addSubscription(new sns_sub.SqsSubscription(queue));
  }
}
