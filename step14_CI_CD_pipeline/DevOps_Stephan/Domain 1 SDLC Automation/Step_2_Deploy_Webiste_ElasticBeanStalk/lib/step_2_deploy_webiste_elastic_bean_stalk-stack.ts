import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as elasticbeanstalk from 'aws-cdk-lib/aws-elasticbeanstalk';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Assets from 'aws-cdk-lib/aws-s3-assets';
import * as CodePipeline from 'aws-cdk-lib/aws-codepipeline';
import * as CodePipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as CodeBuild from 'aws-cdk-lib/aws-codebuild';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class Step2DeployWebisteElasticBeanStalkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Step 1: S3 bucket to store application version bundles
    const appBucket = new s3.Bucket(this, 'AppBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Step 2: Define an Elastic Beanstalk Application
    const elasticBeanstalkApp = new elasticbeanstalk.CfnApplication(this, 'ElasticBeanstalkApp', {
      applicationName: 'MyReactApp',
    });

    // Step 3: Create an IAM Role for the Beanstalk instance to access S3, EC2, and other services
    const ebInstanceRole = new iam.Role(this, 'EBInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    ebInstanceRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSElasticBeanstalkWebTier'));
    ebInstanceRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSElasticBeanstalkMulticontainerDocker'));
    ebInstanceRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));

    const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [ebInstanceRole.roleName],
    });

    // Step 4: Define a VPC for Beanstalk to run in
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2,
    });

    // Step 5: Elastic Beanstalk Environment Configuration
    const optionSettingProperties: elasticbeanstalk.CfnEnvironment.OptionSettingProperty[] = [
      {
        namespace: 'aws:autoscaling:launchconfiguration',
        optionName: 'IamInstanceProfile',
        value: instanceProfile.ref,
      },
      {
        namespace: 'aws:elasticbeanstalk:environment',
        optionName: 'EnvironmentType',
        value: 'SingleInstance',
      },
      {
        namespace: 'aws:autoscaling:asg',
        optionName: 'MinSize',
        value: '1',
      },
      {
        namespace: 'aws:autoscaling:asg',
        optionName: 'MaxSize',
        value: '1',
      },
    ];

    // Step 6: Elastic Beanstalk Environment
    const elasticBeanstalkEnv = new elasticbeanstalk.CfnEnvironment(this, 'ElasticBeanstalkEnv', {
      environmentName: 'MyReactAppEnv',
      applicationName: elasticBeanstalkApp.applicationName as string,
      solutionStackName: '64bit Amazon Linux 2 v3.3.10 running Node.js 14', // or use the appropriate platform for your app
      optionSettings: optionSettingProperties,
    });

    // Step 7: Artifact from source stage
    const sourceOutput = new CodePipeline.Artifact();

    // Step 8: CodeBuild project for building the React app
    const buildProject = new CodeBuild.PipelineProject(this, 'BuildReactApp', {
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['npm install'],
          },
          build: {
            commands: ['npm run build'],
          },
        },
        artifacts: {
          files: '**/*',
          'base-directory': 'build', // Path to React build output
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_5_0,
      },
    });

    // Step 9: Define the pipeline
    const pipeline = new CodePipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'MyElasticBeanstalkAppPipeline',
    });

    // Step 10: Add source stage to the pipeline (GitHub example)
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineActions.GitHubSourceAction({
          actionName: 'GitHub_Source',
          owner: 'your-github-username',  // Replace with your GitHub username
          repo: 'your-repo-name',  // Replace with your repository name
          branch: 'main',
          oauthToken: cdk.SecretValue.secretsManager('my-github-token'), // Store GitHub token in Secrets Manager
          output: sourceOutput,
        }),
      ],
    });

    // Step 11: Add build stage to the pipeline
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new CodePipelineActions.CodeBuildAction({
          actionName: 'Build',
          project: buildProject,
          input: sourceOutput,
          outputs: [new CodePipeline.Artifact()], // You can output to S3 for deployment
        }),
      ],
    });

    // Step 12: Add deployment to Elastic Beanstalk (using S3)
    const deployAction = new CodePipelineActions.S3DeployAction({
      actionName: 'S3Deploy',
      bucket: appBucket,
      input: sourceOutput,
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [deployAction],
    });
  }
}
