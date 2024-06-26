import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";

////////////////////////////////////// First Stack - Front-end ////////////////////////////////////////

export class FrontEnd extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket');

    const distribution = new cloudfront.Distribution(this, 'myDist', {
      defaultRootObject: "index.html",
      defaultBehavior: { origin: new origins.S3Origin(websiteBucket,), },
    });

    // Prints out the web endpoint to the terminal
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: `https://${distribution.domainName}`
    })

    const websiteDeployment = new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./frontend')],
      destinationBucket: websiteBucket,
      distribution: distribution
    });


  }
}

////////////////////////////////////// Second Stack - Back-end ////////////////////////////////////////

export class BackEnd extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const backendLambda = new lambda.Function(this, "SimpleLambda", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("backend"),
      handler: "lambda.handler",
    });

    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: backendLambda,
    });


  }
}