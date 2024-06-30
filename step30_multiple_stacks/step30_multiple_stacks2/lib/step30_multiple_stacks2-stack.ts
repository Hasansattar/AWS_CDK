import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from "aws-cdk-lib/aws-ec2";

////////////////////////////////////// First Stack - Development ////////////////////////////////////////

export class ExampleStackDevelopment extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ec2.Instance(this, "DevInstance", {
      instanceType: new ec2.InstanceType("t2.micro"),
      machineImage: new ec2.AmazonLinuxImage(),
      vpc: ec2.Vpc.fromLookup(this, "DefaultVpc", { isDefault: true }),
    });
  }
}

////////////////////////////////////// Second Stack - Production ////////////////////////////////////////

export class ExampleStackProduction extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ec2.Instance(this, "ProdInstance", {
      instanceType: new ec2.InstanceType("c5.2xlarge"),
      machineImage: new ec2.AmazonLinuxImage(),
      vpc: ec2.Vpc.fromLookup(this, "DefaultVpc", { isDefault: true }),
    });
  }
}
