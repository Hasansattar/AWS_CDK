import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as SM from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";

export class Step36AwsRdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
 // The code that defines your stack goes here

    //  create vpc for the databace instance

    const vpc = new ec2.Vpc(this, "myrdsvpc");

    //  create database instance

    const myDBInstance = new rds.DatabaseInstance(this, "MySQL", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.SMALL
      ),
      vpc,
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_5_7_39,
      }),
      publiclyAccessible: true,
      multiAz: false,
      allocatedStorage: 100,
      storageType: rds.StorageType.STANDARD,
      cloudwatchLogsExports: ["audit", "error", "general"],
      databaseName: "mySqlDataBase",
      deletionProtection: false,
      vpcSubnets :  { subnetType: ec2.SubnetType.PUBLIC },
    });

    //  for lambda RDS and VPC access
    const role = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonRDSDataFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
    });

    const dbcreds = myDBInstance.secret?.secretArn || "dbcreds";

    //  create a function to access database
    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda/lambdazip.zip"),
      handler: "index.handler",
      timeout: cdk.Duration.minutes(1),
      vpc,
      role,
      environment: {
        INSTANCE_CREDENTIALS: `${
          SM.Secret.fromSecretAttributes(this, "dbcredentials", {
            secretCompleteArn: dbcreds,
          }).secretValue
        }`,
        HOST: myDBInstance.dbInstanceEndpointAddress,
      },
    });

    //  create lambda once dbinstance is created
    hello.node.addDependency(myDBInstance);

    //  allow lambda to connect to the database instance

    myDBInstance.grantConnect(hello);
    // To control who can access the cluster or instance, use the .connections attribute. RDS databases have a default port: 3306
    myDBInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(3306));

    new cdk.CfnOutput(this, "endpoint", {
      value: myDBInstance.dbInstanceEndpointAddress,
    });
  }
}
