import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class Step22AwsTimestreamAndVisualizationWithGrafanaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

     // The code that defines your stack goes here
     const TimeStreamDB = new timestream.CfnDatabase(this, 'TimeStreamDB', {
      databaseName: 'HasanTimeStreamDB',
    });

    const DBTable = new timestream.CfnTable(this, 'TSTable', {
      tableName: 'HasanTSTable',
      databaseName: TimeStreamDB.databaseName!,
    });

    const TSlambda = new lambda.Function(this, 'TSLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'main.handler',
    });

    TSlambda.addEnvironment('TS_DATABASE_NAME', DBTable.databaseName);
    TSlambda.addEnvironment('TS_TABLE_NAME', DBTable.tableName!);

    const postStepsIntegration = new apigateway.LambdaIntegration(TSlambda);

    const api = new apigateway.RestApi(this, 'TSApi', {
      restApiName: 'TSApi',
      description: 'Testing TSDB',
    });

    api.root.addMethod('POST', postStepsIntegration);

    const policy = new iam.PolicyStatement();
    policy.addActions(
      'timestream:DescribeEndpoints',
      'timestream:WriteRecords'
    );
    policy.addResources('*');

    TSlambda.addToRolePolicy(policy)
  }
}
