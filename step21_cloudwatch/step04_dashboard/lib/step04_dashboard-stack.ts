import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';

export class Step04DashboardStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const lambdaFn = new lambda.Function(this, 'LambdaHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'lambda.handler',
    });

    const errors = lambdaFn.metricErrors({
      statistic: 'avg',
      period: cdk.Duration.minutes(1),
    });
    
    const duration = lambdaFn.metricDuration();
    

    const dash = new cloudwatch.Dashboard(this, "dash");

    const widget = new cloudwatch.GraphWidget({

      title: "Executions vs error rate",
    
      left: [errors],
      right: [duration],

      view: cloudwatch.GraphWidgetView.BAR,
      liveData: true
    })

    const textWidget = new cloudwatch.TextWidget({
      markdown: '# Key Performance Indicators'
    });

    dash.addWidgets(textWidget);
    dash.addWidgets(widget);
  
  }
}
