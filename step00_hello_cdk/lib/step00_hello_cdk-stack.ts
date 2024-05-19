import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { handler } from '../lambda/hello';



export class Step00HelloCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    

    // new s3.Bucket(this, 'MyFirstBucket', {
    //   versioned: true
    // });
    const hellofn = new lambda.Function(this, 'HelloFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda'),
    });
  
   new apigw.LambdaRestApi(this, 'lambdaAPIGatwayEndPoint',{
      handler:hellofn,
    });
  
  }

}
