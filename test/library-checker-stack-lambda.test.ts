import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as CdkWorkshop from "../lib/library-checker-stack-lambda";

test("Lambda Function Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkWorkshop.LibraryCheckerStackLambda(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Function"));
});
