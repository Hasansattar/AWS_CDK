import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as CodePipeline from "aws-cdk-lib/aws-codepipeline";
import * as CodePipelineAction from "aws-cdk-lib/aws-codepipeline-actions";
import * as CodeBuild from "aws-cdk-lib/aws-codebuild";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class Step1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // S3 bucket to host the built React.js files
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Optional: Ensures bucket is deleted when stack is destroyed
      autoDeleteObjects: true, // Automatically deletes objects when the bucket is deleted
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // This may need to be adjusted or removed
    });

    // CloudFront distribution
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "ReactAppDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: websiteBucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );

    // Artifact from source stage
    const sourceOutput = new CodePipeline.Artifact();

    // Artifact from build stage
    const buildOutput = new CodePipeline.Artifact();

    // CodeBuild project for React.js build
    const s3Build = new CodeBuild.PipelineProject(this, "BuildReactApp", {
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: 16,
            },
            commands: [
              //'cd frontend',
              //'cd my-hello-world-starter',
              "npm install",
            ],
          },
          build: {
            commands: ["npm run build"],
          },
        },
        artifacts: {
          // 'base-directory': './frontend/my-hello-world-starter/public',   ///outputting our generated Gatsby Build files to the public directory
          files: "**/*",
          "base-directory": "build", // Output folder of React build
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_5_0, ///BuildImage version 3 because we are using nodejs environment 12
      },
    });

    ///Define a pipeline
    const pipeline = new CodePipeline.Pipeline(this, "ReactJsPipeline", {
      pipelineName: "ReactJsPipeline",
      crossAccountKeys: false, //Pipeline construct creates an AWS Key Management Service (AWS KMS) which cost $1/month. this will save your $1.
      restartExecutionOnUpdate: true, //Indicates whether to rerun the AWS CodePipeline pipeline after you update it.
    });

    ///Adding stages to pipeline

    //First Stage Source
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: "GitHub_Source",
          owner: "Hasansattar",
          repo: "demo-reactjs-pipeline",
          oauthToken: cdk.SecretValue.unsafePlainText("github_token"), ///create token on github and save it on aws secret manager
          output: sourceOutput, ///Output will save in the sourceOutput Artifact
          branch: "main", ///Branch of your repo
        }),
      ],
    });

    // Add build stage to the pipelines
    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "BuildReactApp",
          project: s3Build,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });

    // Add deploy stage to the pipeline
    pipeline.addStage({
      stageName: "Deploy",
      actions: [
        new CodePipelineAction.S3DeployAction({
          actionName: "s3Deploy",
          input: buildOutput,
          bucket: websiteBucket,
        }),
      ],
    });

    // Every time new data will be show on cloudfront with the help of lambda function
    // CloudFront Invalidation Lambda
    const invalidateLambda = new lambda.Function(
      this,
      "CloudFrontInvalidateFunction",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "invalidate.handler",
        code: lambda.Code.fromAsset("lambda"), // Folder containing lambda code
        environment: {
          DISTRIBUTION_ID: distribution.distributionId,
        },
      }
    );

    // Add Lambda invoke action to the pipeline
    pipeline.addStage({
      stageName: "InvalidateCache",
      actions: [
        new CodePipelineAction.LambdaInvokeAction({
          actionName: "InvalidateCacheLambda",
          lambda: invalidateLambda,
        }),
      ],
    });

    // Outputs for easier access
    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: distribution.distributionDomainName,
    });
  }
}
