import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class Example01UserpoolWithLambdaTriggerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here


    const authEmailFn = new lambda.Function(this, 'authEmailFn', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true, // Allow users to sign up
      autoVerify: { email: true }, // Verify email addresses by sending a verification code
      signInAliases: { email: true }, // Set email as an alias means now you will use email address to authenticate not with username
      userVerification: {
        emailSubject: 'Verify your email for our awesome app!',
        emailBody: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
      },                                ///customize email and sms
      lambdaTriggers: {
        preSignUp: authEmailFn      ///Trigger before the signup process to userpool
      }
    });
  }
}
