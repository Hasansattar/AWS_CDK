#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import {
  ExampleStackDevelopment,
  ExampleStackProduction,
} from "../lib/step30_multiple_stacks2-stack";
const app = new cdk.App();

const environment = app.node.tryGetContext("env");

if (environment === "production") {
  new ExampleStackProduction(app, "ExampleStackB", {
    env: {
      account: "1x2x3x4x5x6",
      region: "us-east-2",
    },
  });
} else {
  new ExampleStackDevelopment(app, "ExampleStackA", {
    env: {
      account: "1x2x3x4x5x6",
      region: "us-east-1",
    },
  });
}
