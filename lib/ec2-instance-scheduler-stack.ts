import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import {
  aws_iam as iam,
  aws_logs as logs,
  aws_events as events,
  aws_events_targets as targets,
} from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export class Ec2InstanceSchedulerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const logGroup = new logs.LogGroup(this, "Ec2SchedulerLogGroup", {
      logGroupName: '/aws/lambda/Ec2SchedulerLambda',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_MONTH,
    });

    const schedulerFunction = new NodejsFunction(this, "Ec2SchedulerLambda", {
      functionName: 'Ec2SchedulerLambda',
      entry: path.join(__dirname, "lambda/instanceScheduler.ts"),
      handler: "handler",
      logGroup: logGroup, // デフォルトのロググループはCDK削除後に残るため別定義
      runtime: Runtime.NODEJS_22_X,
      bundling: {
        target: 'node22',
      },
    });
    schedulerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "ec2:DescribeInstances",
          "ec2:StartInstances",
          "ec2:StopInstances"
        ],
        resources: ["*"],
      })
    );

// JST 08:00 → UTC 23:00
    new events.Rule(this, "StartRule", {
      schedule: events.Schedule.cron({ minute: "0", hour: "23" }),
      targets: [
        new targets.LambdaFunction(schedulerFunction, {
          event: events.RuleTargetInput.fromObject({ action: "start" }),
        }),
      ],
    });

// JST 18:00 → UTC 09:00
    new events.Rule(this, "StopRule", {
      schedule: events.Schedule.cron({ minute: "0", hour: "9" }),
      targets: [
        new targets.LambdaFunction(schedulerFunction, {
          event: events.RuleTargetInput.fromObject({ action: "stop" }),
        }),
      ],
    });

  }
}
