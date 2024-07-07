import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda'; 
import  * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Values } from 'aws-cdk-lib/aws-cloudwatch';

export class Step44VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ]
    });


    // Security Group
    // const webSecurityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
    //   vpc,
    //   securityGroupName: "web-sg",
    //   description: "Allow ssh, http and https access",
    //   allowAllOutbound: true,
    // });
    // webSecurityGroup.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(22),
    //   "Allow SSH access"
    // );
    // webSecurityGroup.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(80),
    //   "Allow HTTP access"
    // );
    // webSecurityGroup.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(443),
    //   "Allow HTTPS access"
    // );

    // webSecurityGroup.addIngressRule(
    //   ec2.Peer.anyIpv6(),
    //   ec2.Port.tcp(80),
    //   "Allow HTTP access"
    // );
    // webSecurityGroup.addIngressRule(
    //   ec2.Peer.anyIpv6(),
    //   ec2.Port.tcp(443),
    //   "Allow HTTPS access"
    // );

    // add this code after the VPC code
    // You initialized a Lambda construct and in order to place it inside the VPC, you passed your 
    // vpc variable to the constructor of Lambda.Function. 
    const handler = new lambda.Function(this, "Lambda", { 
      runtime: lambda.Runtime.NODEJS_16_X,
      allowPublicSubnet: true,
      code: new lambda.AssetCode("lambda"),
      handler: "index.hello_world",
      vpc: vpc,
      vpcSubnets:
        {
          subnetType: ec2.SubnetType.PUBLIC                                                                                                               
        },
       
    });

    const apigateway = new apigw.LambdaRestApi(this, "api", {
      handler: handler
    });
        

     new cdk.CfnOutput(this,"APIGatewayURL",{
        value: apigateway.url,
    })

  }
}
