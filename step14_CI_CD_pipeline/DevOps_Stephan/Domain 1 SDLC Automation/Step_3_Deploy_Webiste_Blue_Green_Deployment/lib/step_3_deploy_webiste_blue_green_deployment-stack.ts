import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as elasticbeanstalk from 'aws-cdk-lib/aws-elasticbeanstalk';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as cloudformation from 'aws-cdk-lib/aws-cloudformation';

export class Step3DeployWebisteBlueGreenDeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     // S3 bucket to store application versions
     const appBucket = new s3.Bucket(this, 'AppBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Elastic Beanstalk Application
    const ebApp = new elasticbeanstalk.CfnApplication(this, 'ElasticBeanstalkApp', {
      applicationName: 'BlueGreenApp',
    });

    // IAM Role for Elastic Beanstalk
    const ebRole = new iam.Role(this, 'EBRole', {
      assumedBy: new iam.ServicePrincipal('elasticbeanstalk.amazonaws.com'),
    });

    ebRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSElasticBeanstalkFullAccess'));

    // Instance Profile
    const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [ebRole.roleName],
    });

    // Option settings for Blue environment
    const optionSettings: elasticbeanstalk.CfnEnvironment.OptionSettingProperty[] = [
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
    ];

    // Elastic Beanstalk "Blue" environment (Production)
    const blueEnv = new elasticbeanstalk.CfnEnvironment(this, 'BlueEnvironment', {
      applicationName: ebApp.applicationName as string,
      environmentName: 'BlueEnvironment',
      solutionStackName: '64bit Amazon Linux 2 v3.3.10 running Node.js 14',
      optionSettings,
    });

    // Elastic Beanstalk "Green" environment (Test/Stage)
    const greenEnv = new elasticbeanstalk.CfnEnvironment(this, 'GreenEnvironment', {
      applicationName: ebApp.applicationName as string,
      environmentName: 'GreenEnvironment',
      solutionStackName: '64bit Amazon Linux 2 v3.3.10 running Node.js 14',
      optionSettings,
    });

    // Source output for CodePipeline
    const sourceOutput = new codepipeline.Artifact();

    // Build project for application (e.g., React app)
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
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
          'base-directory': 'build',
          files: '**/*',
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
    });

    // CodePipeline
    const pipeline = new codepipeline.Pipeline(this, 'BlueGreenPipeline', {
      pipelineName: 'BlueGreenDeploymentPipeline',
    });

    // Source stage (GitHub in this case)
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.GitHubSourceAction({
          actionName: 'GitHub_Source',
          owner: 'your-github-username',  // Replace with your GitHub username
          repo: 'your-repo-name',  // Replace with your repository name
          branch: 'main',
          oauthToken: cdk.SecretValue.secretsManager('github-token'),  // Store GitHub token in Secrets Manager
          output: sourceOutput,
        }),
      ],
    });

    // Build stage
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Build',
          project: buildProject,
          input: sourceOutput,
          outputs: [new codepipeline.Artifact()],  // Output artifacts
        }),
      ],
    });

    // Deploy to "Green" environment
    const deployToGreenAction = new codepipeline_actions.ElasticBeanstalkDeployAction({
      actionName: 'DeployToGreen',
      applicationName: ebApp.applicationName as string,
      environmentName: greenEnv.environmentName as string,
      input: sourceOutput, // This is your source code artifact
    });

    pipeline.addStage({
      stageName: 'DeployToGreen',
      actions: [deployToGreenAction],
    });

    // Manual approval stage before swapping traffic
    pipeline.addStage({
      stageName: 'Approval',
      actions: [
        new codepipeline_actions.ManualApprovalAction({
          actionName: 'ManualApprovalBeforeSwitch',
        }),
      ],
    });

    // Swap "Blue" and "Green" environments by updating route53 or ALB traffic
    const swapAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: 'SwapBlueGreen',
      stackName: 'BlueGreenSwapStack',
      templatePath: sourceOutput.atPath('swap-template.json'),  // Template for swapping traffic
      adminPermissions: true,
    });

    pipeline.addStage({
      stageName: 'Swap',
      actions: [swapAction],
    });

    // Rollback option: If the deployment fails, automatically rollback
    pipeline.addStage({
      stageName: 'Rollback',
      actions: [
        new codepipeline_actions.CloudFormationCreateUpdateStackAction({
          actionName: 'RollbackBlueGreen',
          stackName: 'RollbackStack',
          templatePath: sourceOutput.atPath('rollback-template.json'),  // Template for rollback
          adminPermissions: true,
        }),
      ],
    });
  }
}
