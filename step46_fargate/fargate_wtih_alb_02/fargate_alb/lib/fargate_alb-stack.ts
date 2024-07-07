import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';

export class FargateAlbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const vpc = new ec2.Vpc(this, 'MyVPC', { maxAzs: 2 });

    
    const cluster = new ecs.Cluster(this, 'MyCluster', { vpc });

    // Create a load-balanced Fargate service and make it public
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      'MyFargateService',
      {
        cluster,
        desiredCount: 1, //default
        cpu: 256, // default
        memoryLimitMiB: 512, // default
        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
          enableLogging: true, // default
          containerPort: 80, // default
        },
        publicLoadBalancer: true, // default
      }
    );
  }
}
