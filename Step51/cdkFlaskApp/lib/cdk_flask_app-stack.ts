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

    // ***************Create the Key Pair*****************
    // const key = new KeyPair(this, "A-Key-Pair", {
    //   keyPairName: "demo-key-pair",
    // });
    
    //  // Export the private key to a local file
    //  const privateKeyFilePath = './demo-key-pair.pem'; // Replace with your desired file path
    //  fs.writeFileSync(privateKeyFilePath, key.keyPairName, {
    //    encoding: 'utf8',
    //  });
    
    // ***************Create the Key Pair*****************
  

  
    // ***************CUSTOM VPC***************
    // ***************CUSTOM VPC***************

    // const vpc = new ec2.Vpc(this, "VPC", {
    //   maxAzs: 2,
    //   subnetConfiguration: [
    //     {
    //       cidrMask: 24,
    //       name: "PublicSubnet",
    //       subnetType: ec2.SubnetType.PUBLIC,
    //     },
      //   {
      //     cidrMask: 24,
      //     name: 'PrivateSubnet',
      //     subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      //   },
    //    ],
    // });

     // Use the default VPC
     const defaultVpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', {
      isDefault: true,
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
      vpc:defaultVpc,
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
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        // iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
      ],
    });

   
  


    // EC2 Instance
    const instance = new ec2.Instance(this, "WebInstance", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      vpc:defaultVpc,
      machineImage: new ec2.AmazonLinuxImage({generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2}),
      securityGroup: webSecurityGroup,
       role: role,
      keyName: 'demo-key-pair', // replace with your key pair name
      
    });

   

    
    // User data script
    // const aLLUserDataScripts = fs.readFileSync(path.join(__dirname, 'user-data-pushing-to-ec2.sh'), 'utf8');
    
    // instance.addUserData(aLLUserDataScripts);


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
