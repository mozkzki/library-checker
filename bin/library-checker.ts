#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { LibraryCheckerStackLambda } from "../lib/library-checker-stack-lambda";

const app = new cdk.App();

new LibraryCheckerStackLambda(app, "LibraryCheckerStackLambda");
