#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontEnd, BackEnd } from '../lib/step30_multiple_stacks-stack';
const app = new cdk.App();
new FrontEnd(app, 'Step30MultipleStacksFrontEndStack');
new BackEnd(app, 'Step30MultipleStacksBackEndStack');