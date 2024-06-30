import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { DynamoEventSource, SqsDlq } from "aws-cdk-lib/aws-lambda-event-sources";
import * as path from "path";



export class Step28DynamodbStreamsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const ordersTable = new dynamodb.Table(this, "OrdersTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const deadLetterQueue = new sqs.Queue(this, "deadLetterQueue");

    const echoLambda = new lambda.Function(this, "echoLambda", {
      code: lambda.Code.fromInline(
        "exports.handler = (event,context) => {console.log(event.Records.map(item=>Object.entries(item.dynamodb.NewImage))); context.succeed(event);}"
      ),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_16_X,
    });

    echoLambda.addEventSource(
      new DynamoEventSource(ordersTable, {
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 5,
        bisectBatchOnError: true,
        onFailure: new SqsDlq(deadLetterQueue),
        retryAttempts: 10,
      })
    );
  }
}
