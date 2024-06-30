import * as cdk from "aws-cdk-lib/core";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sns from "aws-cdk-lib/aws-sns";
import * as s3notify from "aws-cdk-lib/aws-s3-notifications";
import { Construct } from 'constructs';

export interface NotifyingBucketProps {
  prefix?: string;
}

export class NotifyingBucket extends Construct {
  public readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props: NotifyingBucketProps) {
    super(scope, id);
    const bucket = new s3.Bucket(this, "bucket");
    this.topic = new sns.Topic(this, "topic");
    bucket.addObjectCreatedNotification(
      new s3notify.SnsDestination(this.topic),
      { prefix: props.prefix }
    );
  }
}
