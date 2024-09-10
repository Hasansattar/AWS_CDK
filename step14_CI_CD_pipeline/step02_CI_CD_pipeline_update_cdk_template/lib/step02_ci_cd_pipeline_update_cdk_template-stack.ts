import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as CodePipeline from 'aws-cdk-lib/aws-codepipeline';
import * as CodePipelineAction from 'aws-cdk-lib/aws-codepipeline-actions';
import * as CodeBuild from 'aws-cdk-lib/aws-codebuild';


export class Step02CiCdPipelineUpdateCdkTemplateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackName = "Step04AppsyncLambdaDynamodbStack";
// Artifact from source stage
    const sourceOutput = new CodePipeline.Artifact();
     // Artifact from build stage
    const CDKOutput = new CodePipeline.Artifact();

    //Code build action, Here you will define a complete build
    const cdkBuild = new CodeBuild.PipelineProject(this, 'CdkBuild', {
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            "runtime-versions": {
              "nodejs": 16
            },
            commands: [
              'npm install'
            ],
          },
          build: {
            commands: [
              'npm run build',
              'npm run cdk synth -- -o dist',
              'ls -la dist'  // List contents of dist directory for debugging
            ],
          },
        },
        artifacts: {
          'base-directory': './dist',           ///outputting our generated JSON CloudFormation files to the dist directory
          files: [
            `${stackName}.template.json`,  // Use stackName variable
          ],
        },
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_5_0,
      },
    });

    const pipeline = new CodePipeline.Pipeline(this, 'CDKPipeline', {
      crossAccountKeys: false,  //Pipeline construct creates an AWS Key Management Service (AWS KMS) which cost $1/month. this will save your $1.
      restartExecutionOnUpdate: true,  //Indicates whether to rerun the AWS CodePipeline pipeline after you update it
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: 'Checkout',
          owner: 'Hasansattar',
          repo: "Step04AppsyncLambdaDynamodbStack",
          // oauthToken: cdk.SecretValue.unsafePlainText('GITHUB_TOKEN_AWS_SOURCE'),
          oauthToken: cdk.SecretValue.unsafePlainText("sddsdww_wewewD6zwbdfdfXAGIOdqZhdfdJ3hsdsdsdsds"),
          output: sourceOutput,
          branch: "main",
        }),
      ],
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: 'cdkBuild',
          project: cdkBuild,
          input: sourceOutput,
          outputs: [CDKOutput],
        }),
      ],
    });

    pipeline.addStage({
      stageName: 'DeployCDK',
      actions: [
        new CodePipelineAction.CloudFormationCreateUpdateStackAction({
          actionName: "AdministerPipeline",
          templatePath: CDKOutput.atPath(`${stackName}.template.json`),
          stackName: stackName,
          adminPermissions: true
        }),
      ],
    });
  }
}
