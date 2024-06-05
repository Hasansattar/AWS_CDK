import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as stepFunctions from "aws-cdk-lib/aws-stepfunctions";
import * as stepFunctionTasks from "aws-cdk-lib/aws-stepfunctions-tasks";

export class Step00SimpleStepFunctionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // created a dynamodb Table

    const DynamoTable = new ddb.Table(this, "DynamoTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    // this function adds data to the dynamoDB table

    const addData = new lambda.Function(this, "addData", {
      runtime: lambda.Runtime.NODEJS_16_X, // execution environment
      code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "addData.handler",
    });

    // this function logs the status of the operation

    const echoStatus = new lambda.Function(this, "echoStatus", {
      runtime: lambda.Runtime.NODEJS_16_X, // execution environment
      code: lambda.Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "echoStatus.handler",
    });

    // giving access to the lambda function to do operations on the dynamodb table

    DynamoTable.grantFullAccess(addData);
    addData.addEnvironment("DynamoTable", DynamoTable.tableName);

    // creating steps for the step function

    const firstStep = new stepFunctionTasks.LambdaInvoke(
      this,
      "Invoke addData lambda",
      {
        lambdaFunction: addData,
      }
    );

    const secondStep = new stepFunctionTasks.LambdaInvoke(
      this,
      "Invoke echoStatus lambda",
      {
        lambdaFunction: echoStatus,
        inputPath: "$.Payload",
      }
    );

    // creating chain to define the sequence of execution

    const chain = stepFunctions.Chain.start(firstStep).next(secondStep);

    // create a state machine

    new stepFunctions.StateMachine(this, "simpleStateMachine", {
      definition: chain,
    });
  }
}
