import { Stack, App, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";

export class EcsFargateStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "poka-fargate-vpc", {
      maxAzs: 2,
    });

    const cluster = new ecs.Cluster(this, "poka-fargate-cluster", {
      vpc: vpc,
    });

    const taskDefinition = new ecs.TaskDefinition(this, "poka-fargate-td", {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: "256",
      memoryMiB: "512",
    });

    const mainContainer = taskDefinition.addContainer("main-container", {
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(
          this,
          "poka-demo-1",
          "954748608822.dkr.ecr.us-east-1.amazonaws.com/poka-demo-1"
        )
      ),
      environment: {
        MONGO_USER: process.env.MONGO_INITDB_ROOT_USERNAME ?? "mongo",
        MONGO_PASSWORD: process.env.MONGO_INITDB_ROOT_PASSWORD ?? "password",
      },
      portMappings: [{ containerPort: 5000 }],
    });

    const mongoContainer = taskDefinition.addContainer("mongo-container", {
      image: ecs.ContainerImage.fromRegistry("mongo"),
      environment: {
        MONGO_INITDB_ROOT_USERNAME:
          process.env.MONGO_INITDB_ROOT_USERNAME ?? "mongo",
        MONGO_INITDB_ROOT_PASSWORD:
          process.env.MONGO_INITDB_ROOT_PASSWORD ?? "password",
      },
      portMappings: [{ containerPort: 27017 }],
    });

    /* Needs logic for creating EFS, adding EFS as volume to task definition, adding a mount point to mongoContainer */
    // mongoContainer.addMountPoints();

    new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "poka-fargate-service",
      {
        cluster: cluster,
        desiredCount: 2,
        publicLoadBalancer: true,
        taskDefinition: taskDefinition,
      }
    );
  }
}
