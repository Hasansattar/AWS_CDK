# Welcome to your CDK TypeScript project

Here’s a sample AWS CDK code to manage two branches (development and production) in a Git-based repository and deploy them using AWS Amplify. This setup will automatically deploy the site to different environments (staging or production) based on the branch and will use a custom domain.

**Steps:**
- Create an Amplify App.
- Configure the Dev and Production Branches.
- Set up a custom domain for the Amplify App.
- Automatically deploy each branch to the corresponding environment..

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
