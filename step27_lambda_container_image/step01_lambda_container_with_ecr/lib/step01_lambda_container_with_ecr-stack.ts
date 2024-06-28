import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';

export class Step01LambdaContainerWithEcrStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

     //The directory ecr-lambda must include a Dockerfile
     const asset = new DockerImageAsset(this, 'EcrImage', {
      directory: ('ecr-lambda'),
    });
    
    const ecrLambda = new lambda.DockerImageFunction(this, 'LambdaFunctionECR', {
      code: lambda.DockerImageCode.fromEcr(asset.repository, {
        tag: '<Tag of the image>'
      })
    }) 
    
    asset.repository.grantPull(ecrLambda)
  }
}
