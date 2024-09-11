# AWS CDK Stack Documentation

## Overview

This AWS CDK stack sets up a CI/CD pipeline for deploying a React.js application using AWS services. It includes an S3 bucket for hosting the static files, a CloudFront distribution for content delivery, and a CodePipeline pipeline for continuous integration and deployment.

## Components

### S3 Bucket

The stack creates an S3 bucket to host the built React.js files.

```typescript
const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
  websiteIndexDocument: 'index.html',
  websiteErrorDocument: 'index.html',
  publicReadAccess: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
});
```
- Bucket Name: WebsiteBucket
- Website Index Document: index.html
- Website Error Document: index.html
- Public Read Access: Enabled
- Removal Policy: Destroy (bucket is deleted when the stack is destroyed)
- Auto Delete Objects: Enabled
- Block Public Access: Block ACLs (may need adjustment)



### CloudFront Distribution
A CloudFront distribution is set up to serve content from the S3 bucket.

```typescript
const distribution = new cloudfront.CloudFrontWebDistribution(this, 'ReactAppDistribution', {
  originConfigs: [
    {
      s3OriginSource: {
        s3BucketSource: websiteBucket,
      },
      behaviors: [{ isDefaultBehavior: true }],
    },
  ],
});

```

- **Distribution Name:** ReactAppDistribution
- **Origin:** S3 bucket
- **Default Behavior:** True




### CodePipeline
Defines a CI/CD pipeline to automate the build and deployment of the React.js application.

```typescript
const pipeline = new CodePipeline.Pipeline(this, 'ReactJsPipeline', {
  pipelineName: 'ReactJsPipeline',
  crossAccountKeys: false,
  restartExecutionOnUpdate: true,
});

```


- **Pipeline Name:** ReactJsPipeline
- **Cross Account Keys:** Disabled (saves cost)
- **Restart Execution On Update:** Enabled




### CodeBuild Project
A CodeBuild project is created to build the React.js application.

```typescript
const s3Build = new CodeBuild.PipelineProject(this, 'BuildReactApp', {
  buildSpec: CodeBuild.BuildSpec.fromObject({
    version: '0.2',
    phases: {
      install: {
        "runtime-versions": {
          "nodejs": 16
        },
        commands: [
          'npm install',
        ],
      },
      build: {
        commands: [
          'npm run build',
        ],
      },
    },
    artifacts: {
      'files': '**/*',
      'base-directory': 'build',
    },
  }),
  environment: {
    buildImage: CodeBuild.LinuxBuildImage.STANDARD_5_0,
  },
});

```


- Project Name: BuildReactApp
- Node.js Version: 16
- Build Commands:
npm install
npm run build
- Output Directory: build



### Pipeline Stages
**Source Stage**
Retrieves source code from a GitHub repository.


```typescript
pipeline.addStage({
  stageName: 'Source',
  actions: [
    new CodePipelineAction.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'Hasansattar',
      repo: "demo-reactjs-pipeline",
      oauthToken: cdk.SecretValue.unsafePlainText('your-github-token'),
      output: sourceOutput,
      branch: "main",
    }),
  ],
})

```

- **GitHub Repository:** demo-reactjs-pipeline
- **Branch:** main
- **OAuth Token:** Replace with a secure token stored - in AWS Secrets Manager



**Build Stage**
Builds the React.js application using the CodeBuild project.

```typescript
pipeline.addStage({
  stageName: 'Build',
  actions: [
    new CodePipelineAction.CodeBuildAction({
      actionName: 'BuildReactApp',
      project: s3Build,
      input: sourceOutput,
      outputs: [buildOutput],
    }),
  ],
})

```


- **Action Name:** BuildReactApp
- **Build Project:** s3Build



**Deploy Stage**
Deploys the built application to the S3 bucket.

```typescript
pipeline.addStage({
  stageName: 'Deploy',
  actions: [
    new CodePipelineAction.S3DeployAction({
      actionName: 's3Deploy',
      input: buildOutput,
      bucket: websiteBucket,
    }),
  ],
});

```


- **Deploy Action Name:** s3Deploy
- **Bucket:** websiteBucket


**Outputs**
Provides the CloudFront distribution domain name.


```typescript
new cdk.CfnOutput(this, 'CloudFrontURL', {
  value: distribution.distributionDomainName,
});

```





## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
