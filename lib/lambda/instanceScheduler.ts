import {
  EC2Client,
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
} from "@aws-sdk/client-ec2";

const TAG_KEY = "AutoSchedule";
const TAG_VALUE = "true";

const ec2 = new EC2Client({ region: process.env.AWS_REGION });

export const handler = async (event: any) => {
  const action = event.action;
  console.log(`Lambda triggered to ${action} instances with tag ${TAG_KEY}=${TAG_VALUE}`);

  const instancesToControl: string[] = [];

  const describeResult = await ec2.send(new DescribeInstancesCommand({}));

  for (const reservation of describeResult.Reservations || []) {
    for (const instance of reservation.Instances || []) {
      const tags = instance.Tags || [];
      const hasTargetTag = tags.some(tag => tag.Key === TAG_KEY && tag.Value === TAG_VALUE);
      if (hasTargetTag && instance.InstanceId) {
        instancesToControl.push(instance.InstanceId);
      }
    }
  }

  if (instancesToControl.length === 0) {
    console.log("No matching instances found.");
    return;
  }

  if (action === "start") {
    await ec2.send(new StartInstancesCommand({ InstanceIds: instancesToControl }));
    console.log("Instances started:", instancesToControl);
  } else if (action === "stop") {
    await ec2.send(new StopInstancesCommand({ InstanceIds: instancesToControl }));
    console.log("Instances stopped:", instancesToControl);
  } else {
    console.error("Unknown action:", action);
  }
};