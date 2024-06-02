import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as CodePipeline from 'aws-cdk-lib/aws-codepipeline'
import * as CodePipelineAction from 'aws-cdk-lib/aws-codepipeline-actions'
import * as CodeBuild from 'aws-cdk-lib/aws-codebuild'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

export class CdkBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

      // The code that defines your stack goes here
    
    //Deploy Gatsby on s3 bucket
    const myBucket = new s3.Bucket(this, "GATSBYbuckets", {
      versioned: true,       
      websiteIndexDocument: "index.html"
    });

    const dist = new cloudfront.Distribution(this, 'myDistribution', {
      defaultBehavior: { origin: new origins.S3Origin(myBucket) }
    });

    new s3Deployment.BucketDeployment(this, "deployStaticWebsite", {
      sources: [s3Deployment.Source.asset("../frontend/my-hello-world-starter/public")],
      destinationBucket: myBucket,
      distribution: dist
    });
    
    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: dist.domainName
    });

    // Artifact from source stage
    const sourceOutput = new CodePipeline.Artifact();

    // Artifact from build stage
    const S3Output = new CodePipeline.Artifact();

    //Code build action, Here you will define a complete build
    const s3Build = new CodeBuild.PipelineProject(this, 's3Build', {
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            "runtime-versions": {
              "nodejs": 16
            },
            commands: [
              'cd frontend',
              'cd my-hello-world-starter',
              'npm i -g gatsby',
              'npm install',
            ],
          },
          build: {
            commands: [
              'gatsby build',
            ],
          },
        },
        artifacts: {
          'base-directory': './frontend/my-hello-world-starter/public',   ///outputting our generated Gatsby Build files to the public directory
          "files": [
            '**/*'
          ]
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_5_0,   ///BuildImage version 3 because we are using nodejs environment 12
      },
    });

    const policy = new PolicyStatement();
    policy.addActions('s3:*');
    policy.addResources('*');

    s3Build.addToRolePolicy(policy);

    ///Define a pipeline
    const pipeline = new CodePipeline.Pipeline(this, 'GatsbyPipeline', {
      crossAccountKeys: false,  //Pipeline construct creates an AWS Key Management Service (AWS KMS) which cost $1/month. this will save your $1.
      restartExecutionOnUpdate: true,  //Indicates whether to rerun the AWS CodePipeline pipeline after you update it.
    });

    ///Adding stages to pipeline

    //First Stage Source
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: 'Checkout',
          owner: 'Hasansattar',
          repo: "demo-gatsby-pipeline",
          oauthToken: cdk.SecretValue.unsafePlainText('GITHUB-TOKEN'), ///create token on github and save it on aws secret manager
          output: sourceOutput,                                       ///Output will save in the sourceOutput Artifact
          branch: "main",                                           ///Branch of your repo
        }),
      ],
    })

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: 's3Build',
          project: s3Build,
          input: sourceOutput,
          outputs: [S3Output],
        }),
      ],
    })

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new CodePipelineAction.S3DeployAction({
          actionName: 's3Build',
          input: S3Output,
          bucket: myBucket,
        }),
      ],
    })
  }
}
