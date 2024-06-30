# AWS CDK Example: Conditional Stacks for Production and Development

This project demonstrates how to create two separate stacks in AWS CDK using TypeScript, one for production and one for development. Depending on the environment, the stacks will deploy different instance types.

## Prerequisites

- AWS CDK installed globally (`npm install -g aws-cdk`)
- Node.js installed

## Project Setup

### 1. Initialize a New CDK Project

First, initialize a new CDK project by running:

```bash
cdk init app --language typescript
```

### 2. Define Your Stacks
Create two stack files, one for development and one for production, and a main app file to deploy the appropriate stack based on an environment variable.

**Development Stack**

Create a file named **lib/development-stack.ts** and add the following content:

```ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class DevelopmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ec2.Instance(this, 'DevInstance', {
      instanceType: new ec2.InstanceType('t2.micro'),
      machineImage: new ec2.AmazonLinuxImage(),
      vpc: ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true }),
    });
  }
}
```

**Production Stack**
Create a file named **lib/production-stack.ts** and add the following content:


```ts

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class ProductionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ec2.Instance(this, 'ProdInstance', {
      instanceType: new ec2.InstanceType('c5.2xlarge'),
      machineImage: new ec2.AmazonLinuxImage(),
      vpc: ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true }),
    });
  }
}

```

### 3. Main App File


Create or modify the file **bin/app.ts** and add the following content


```ts
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DevelopmentStack } from '../lib/development-stack';
import { ProductionStack } from '../lib/production-stack';

const app = new cdk.App();
const env = app.node.tryGetContext('env');

if (env === 'production') {
  new ProductionStack(app, 'ProductionStack');
} else {
  new DevelopmentStack(app, 'DevelopmentStack');
}

```

### 4. Deploy the Stacks
To deploy the development stack, run:

```bash
cdk deploy -c env=development
```
To deploy the production stack, run:

```bash
cdk deploy -c env=production
```

This setup uses context parameters to determine which stack to deploy. When running the **cdk deploy** command, the context parameter **env** is checked, and the appropriate stack is deployed accordingly. The **tryGetContext** method fetches the context variable, which allows you to conditionally create resources based on the environment.













