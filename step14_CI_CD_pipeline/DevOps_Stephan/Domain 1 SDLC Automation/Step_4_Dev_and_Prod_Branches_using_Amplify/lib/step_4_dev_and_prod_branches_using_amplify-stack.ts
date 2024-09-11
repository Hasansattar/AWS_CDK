import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53_targets from 'aws-cdk-lib/aws-route53-targets';

export class Step4DevAndProdBranchesUsingAmplifyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   // Replace these with your domain and GitHub repository details
   const domainName = 'your-custom-domain.com';  // Replace with your domain name
   const repoOwner = 'your-github-username';     // Replace with your GitHub username
   const repoName = 'your-repo-name';            // Replace with your repository name
   const githubToken = cdk.SecretValue.secretsManager('github-token'); // GitHub token stored in AWS Secrets Manager

   // Create a Route 53 Hosted Zone for the domain
   const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
     domainName: domainName,
   });

   // Create the Amplify App
   const amplifyApp = new amplify.App(this, 'AmplifyApp', {
     appName: 'MyAmplifyApp',
     sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
       owner: repoOwner,
       repository: repoName,
       oauthToken: githubToken,
     }),
     customRules: [
       {
         source: '/<*>',
         target: '/index.html',
         status: amplify.RedirectStatus.NOT_FOUND_REWRITE,
       },
     ],
   });

   // Connect the "dev" branch to Amplify for the Staging environment
   const devBranch = amplifyApp.addBranch('dev', {
     branchName: 'dev',
     stage: 'DEVELOPMENT', // Set as development stage
     autoBuild: true, // Automatically build on new commits
   });

   // Connect the "production" branch to Amplify for the Production environment
   const prodBranch = amplifyApp.addBranch('production', {
     branchName: 'production',
     stage: 'PRODUCTION', // Set as production stage
     autoBuild: true, // Automatically build on new commits
   });

   // Add a custom domain to the Amplify app
   const amplifyDomain = amplifyApp.addDomain(domainName, {
     enableAutoSubdomain: true, // Automatically create subdomains for branches
     autoSubdomainCreationPatterns: ['*'], // Creates subdomains for each branch (e.g., dev.your-custom-domain.com)
   });

   // Map the branches to their respective subdomains
   amplifyDomain.mapSubDomain(devBranch, 'dev'); // Maps dev branch to dev.your-custom-domain.com
   amplifyDomain.mapSubDomain(prodBranch, 'www'); // Maps production branch to www.your-custom-domain.com

   // Optionally, map the production branch to the root domain
   amplifyDomain.mapRoot(prodBranch);

   // Create Route 53 DNS records for the custom domain
   new route53.ARecord(this, 'AmplifyRootRecord', {
     zone: hostedZone,
     target: route53.RecordTarget.fromAlias(new route53_targets.AmplifyDomainTarget(amplifyDomain)),
   });

   // DNS record for the www subdomain (optional)
   new route53.ARecord(this, 'AmplifyWwwRecord', {
     zone: hostedZone,
     recordName: 'www',
     target: route53.RecordTarget.fromAlias(new route53_targets.AmplifyDomainTarget(amplifyDomain)),
   });
  }
}
