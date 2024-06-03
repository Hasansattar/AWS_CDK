import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class EventbridgeWithLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // lambda that will produce our custom event.
    const producerFn = new lambda.Function(this, "producerLambda", {
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
      handler: "producer.handler",
      runtime: lambda.Runtime.NODEJS_16_X,
    });

    // Grant the lambda permission to put custom events on eventbridge
    events.EventBus.grantAllPutEvents(producerFn);

    // Api gateway to be able to send custom events from frontend
    const api = new apigateway.LambdaRestApi(this, "testApi", {
      handler: producerFn,
    });

    // The lambda function which our eventbridge rule will trigger when it matches the country as PK
    const consumerFn = new lambda.Function(this, "consumerLambda", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
      handler: "consumer.handler",
    });

    // The rule that filters events to match country == "PK" and sends them to the consumer Lambda.
    const PKrule = new events.Rule(this, "orderPKLambda", {
      targets: [new targets.LambdaFunction(consumerFn)],
      description:
        "Filter events that come from country PK and invoke lambda with it.",
      eventPattern: {
        source:["customAPI"],
        
      },
    });
  }
}
