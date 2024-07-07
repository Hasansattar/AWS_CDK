import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
import * as fs from "fs";
import { KeyPair } from "aws-cdk-lib/aws-ec2";
import * as apigw from "aws-cdk-lib/aws-apigateway";

export class CdkFlaskAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Create the Key Pair
    const key = new KeyPair(this, "A-Key-Pair", {
      keyPairName: "a-key-pair",
    });
    
     // Export the private key to a local file
     const privateKeyFilePath = './a-key-pair.pem'; // Replace with your desired file path
     fs.writeFileSync(privateKeyFilePath, key.keyPairName, {
       encoding: 'utf8',
     });
  
    // VPC
    const vpc = new ec2.Vpc(this, "VPC", {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "PublicSubnet",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

   
   

     // Check if an Internet Gateway exists
     // Create an Internet Gateway and attach it to the VPC
    //const internetGateway = new ec2.CfnInternetGateway(this, "InternetGateway");


    // new ec2.CfnVPCGatewayAttachment(this, "VpcGatewayAttachment", {
    //   vpcId: vpc.vpcId,
    //   internetGatewayId: internetGateway.ref,
    // });

    
     // Create a route table for the public subnet and associate it with the subnet
    //  const publicRouteTable = new ec2.CfnRouteTable(this, "PublicRouteTable", {
    //   vpcId: vpc.vpcId,
    // });

    // Create a route to the Internet Gateway in the route table
    // new ec2.CfnRoute(this, "PublicRoute", {
    //   routeTableId: publicRouteTable.ref,
    //   destinationCidrBlock: "0.0.0.0/0",
    //   gatewayId: internetGateway.ref,
    // });

    // Associate the route table with the public subnet
    // vpc.publicSubnets.forEach((subnet, index) => {
    //   new ec2.CfnSubnetRouteTableAssociation(
    //     this,
    //     `PublicSubnetRouteTableAssociation${index}`,
    //     {
    //       subnetId: subnet.subnetId,
    //       routeTableId: publicRouteTable.ref,
    //     }
    //   );
    // });


    // Security Group
    const webSecurityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      securityGroupName: "web-sg",
      description: "Allow ssh, http and https access",
      allowAllOutbound: true,
    });
    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow SSH access"
    );
    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP access"
    );
    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allow HTTPS access"
    );

    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv6(),
      ec2.Port.tcp(80),
      "Allow HTTP access"
    );
    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv6(),
      ec2.Port.tcp(443),
      "Allow HTTPS access"
    );

    // Role
    const role = new iam.Role(this, "InstanceRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2FullAccess"),
        // iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
      ],
    });

    // S3 bucket for storing model and tokenizer files
    // const bucket = new s3.Bucket(this, 'ModelBucket', {
    //   versioned: false,
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    // });

    // Deploy flaskapp folder contents to S3 bucket
    //  new s3deploy.BucketDeployment(this, 'DeployFlaskAppContents', {
    //  sources: [s3deploy.Source.asset('./flaskapp')],
    //  destinationBucket: bucket
    //  });

    // User data script
    // const userDataScript = fs.readFileSync('./lib/user-data.sh', 'utf8');

    // Pass bucket name to user data script
    //   const userDataWithBucket = userDataScript.replace('BUCKET_NAME_PLACEHOLDER', bucket.bucketName);

    // User data script
    // const aLLUserDataScripts = fs.readFileSync(path.join(__dirname, 'user-data.sh'), 'utf8');

    // EC2 Instance
    const instance = new ec2.Instance(this, "WebInstance", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage(),
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: webSecurityGroup,
      role: role,
      keyName: key.keyPairName, // replace with your key pair name
    });

    // Example: Install Apache web server
    instance.userData.addCommands(
      "sudo yum update -y",
      "sudo yum install -y httpd",
      "sudo systemctl start httpd",
      "sudo systemctl enable httpd"
    );

    

    //instance.addUserData(aLLUserDataScripts);

    // S3 bucket outputs
    // new cdk.CfnOutput(this, 'ModelBucketName', { value: bucket.bucketName });

    // Output the public IP of the instance
    new cdk.CfnOutput(this, "InstancePublicIP", {
      value: instance.instancePublicIp,
    });
    // Output the website URL
    new cdk.CfnOutput(this, "WebsiteURL", {
      value: `http://${instance.instancePublicDnsName}`,
    });

    
  }
}
