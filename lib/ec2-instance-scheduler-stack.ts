import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import {
  aws_iam as iam,
  aws_events as events,
  aws_events_targets as targets,
} from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export class Ec2InstanceSchedulerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
    const lambdaRole = new iam.Role(this, "Ec2SchedulerLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
      ],
    });

    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "ec2:DescribeInstances",
          "ec2:StartInstances",
          "ec2:StopInstances"
        ],
        resources: ["*"]
      })
    );
      */

    const schedulerFunction = new NodejsFunction(this, "Ec2SchedulerLambda", {
      entry: path.join(__dirname, "lambda/instanceScheduler.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      // role: lambdaRole,
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
        resources: ["*"] // 必要に応じてリソースを限定することを推奨
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
