import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as stepFunctions from "aws-cdk-lib/aws-stepfunctions";
import * as stepFunctionTasks from "aws-cdk-lib/aws-stepfunctions-tasks";

export class Step02ChoicePart1Stack extends cdk.Stack {
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

    // giving access to the lambda function to do operations on the dynamodb table

    DynamoTable.grantFullAccess(addData);
    addData.addEnvironment("DynamoTable", DynamoTable.tableName);

    // creating steps for the step function

    const lambdafn = new stepFunctionTasks.LambdaInvoke(
      this,
      "Invoke addData lambda",
      {
        lambdaFunction: addData,
      }
    );

    // Reaching a Succeed state terminates the state machine execution with a succesful status.

    const success = new stepFunctions.Succeed(this, "We did it!");

    // Reaching a Fail state terminates the state machine execution with a failure status.

    const jobFailed = new stepFunctions.Fail(this, "Job Failed", {
      cause: "Lambda Job Failed",
      error: "could not add data to the dynamoDb",
    });

    // Here we are putting a condition to choose our next state. If the last state (lambdafn) returns {operationSuccessful: true}
    // then we end our state machine with a success state otherwise with a fail state

    const choice = new stepFunctions.Choice(this, "operation successful?");
    choice.when(
      stepFunctions.Condition.booleanEquals(
        "$.Payload.operationSuccessful",
        true
      ),
      success
    );
    choice.when(
      stepFunctions.Condition.booleanEquals(
        "$.Payload.operationSuccessful",
        false
      ),
      jobFailed
    );

    // creating chain to define the sequence of execution

    const chain = stepFunctions.Chain.start(lambdafn).next(choice);

    // create a state machine

    new stepFunctions.StateMachine(this, "choiceStateMachine", {
      definition: chain,
    });
  }
}
