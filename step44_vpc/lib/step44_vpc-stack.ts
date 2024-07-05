import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda'; 
import  * as apigw from 'aws-cdk-lib/aws-apigateway';

export class Step44VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Ingress',
          subnetType: ec2.SubnetType.ISOLATED,
        }
      ]
    });


    // add this code after the VPC code
    // You initialized a Lambda construct and in order to place it inside the VPC, you passed your 
    // vpc variable to the constructor of Lambda.Function. 
    const handler = new lambda.Function(this, "Lambda", { 
      runtime: lambda.Runtime.NODEJS_16_X,
      code: new lambda.AssetCode("lambda"),
      handler: "index.hello_world",
      vpc: vpc,
      vpcSubnets:
        {
          subnetType: ec2.SubnetType.ISOLATED                                                                                                               
        }
    });

    const apigateway = new apigw.LambdaRestApi(this, "api", {
      handler: handler
    });


  }
}
