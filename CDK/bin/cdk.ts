#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { EcsFargateStack } from "../lib/fargate";

const app = new cdk.App();

new EcsFargateStack(app, "ecs-fargate-stack");
