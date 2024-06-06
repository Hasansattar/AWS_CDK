import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';



import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";

export class Step03AlarmsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const lambdaFn = new lambda.Function(this, 'LambdaHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'lambda.handler',
    });

    const errors = lambdaFn.metricErrors();
    const invocations = lambdaFn.metricInvocations();
    const throttle = lambdaFn.metricThrottles();




    const allProblems = new cloudwatch.MathExpression({
      expression: "errors + throttles",
      usingMetrics: {
        errors: errors,
        throttles: throttle
      }
    })


    const problemPercentage = new cloudwatch.MathExpression({
      expression: "(problems / invocations) * 100",
      usingMetrics: {
        problems: allProblems,
        invocations: invocations
      },
      period: cdk.Duration.minutes(1),
    })


    const Topic = new sns.Topic(this, 'Topic');

    Topic.addSubscription(
      new subscriptions.EmailSubscription("hasansattar650@gmail.com")
    );

    const alarm = new cloudwatch.Alarm(this, 'Alarm', {
      metric: problemPercentage,
      threshold: 10,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      evaluationPeriods: 1,
    });

    alarm.addAlarmAction(new SnsAction(Topic))

  }
}
