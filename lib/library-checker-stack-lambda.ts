import * as path from "path";
import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdapython from "@aws-cdk/aws-lambda-python";
import { Duration } from "@aws-cdk/core";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";

export class LibraryCheckerStackLambda extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    ////////////////////////////
    // Python lambda
    ////////////////////////////

    // chrome(headless)を載せたlayer
    const layerForChrome = new lambdapython.PythonLayerVersion(
      this,
      "python-lambda-layer-for-chrome",
      {
        layerVersionName: "python-lambda-layer-for-chrome",
        entry: path.resolve(__dirname, "../lambda/layer/chrome"),
        compatibleRuntimes: [lambda.Runtime.PYTHON_3_7],
      }
    );

    // アプリケーションが依存するライブラリを載せたlayer
    const layerForApp = new lambdapython.PythonLayerVersion(
      this,
      "python-lambda-layer-for-app",
      {
        layerVersionName: "python-lambda-layer-for-app",
        entry: path.resolve(__dirname, "../lambda/layer/app"),
        compatibleRuntimes: [lambda.Runtime.PYTHON_3_7],
      }
    );

    // [レンタル本] 貸し出し本のチェック
    const libraryCheckerCheckRentalFunction = new lambdapython.PythonFunction(
      this,
      "fn-library-checker-check-rental",
      {
        functionName: "library-checker-check-rental",
        runtime: lambda.Runtime.PYTHON_3_7,
        entry: path.resolve(__dirname, "../lambda/src/library_checker"),
        index: "index.py",
        handler: "handler_check_rental",
        layers: [layerForApp, layerForChrome],
        timeout: Duration.seconds(300),
        memorySize: 512,
        environment: {
          CHROME_BINARY_LOCATION: "/opt/python/headless-chromium",
          CHROME_DRIVER_LOCATION: "/opt/python/chromedriver",
          HOME: "/opt/python/",
          ///////////////////////////////////////////////////////////////////////////
          // 注意: 下記の環境変数についてはAWSコンソールにて正式な値をセットすること
          ///////////////////////////////////////////////////////////////////////////
          // for post LINE
          LINE_POST_URL: "dummy",
        },
      }
    );

    // [レンタル本] 貸し出し本で期限切れ近い本のチェック
    const libraryCheckerCheckExpireFunction = new lambdapython.PythonFunction(
      this,
      "fn-library-checker-check-expire",
      {
        functionName: "library-checker-check-expire",
        runtime: lambda.Runtime.PYTHON_3_7,
        entry: path.resolve(__dirname, "../lambda/src/library_checker"),
        index: "index.py",
        handler: "handler_check_expire",
        layers: [layerForApp, layerForChrome],
        timeout: Duration.seconds(300),
        memorySize: 512,
        environment: {
          CHROME_BINARY_LOCATION: "/opt/python/headless-chromium",
          CHROME_DRIVER_LOCATION: "/opt/python/chromedriver",
          HOME: "/opt/python/",
          ///////////////////////////////////////////////////////////////////////////
          // 注意: 下記の環境変数についてはAWSコンソールにて正式な値をセットすること
          ///////////////////////////////////////////////////////////////////////////
          // for post LINE
          LINE_POST_URL: "dummy",
        },
      }
    );

    // [予約本] 予約本のチェック
    const libraryCheckerCheckReserveFunction = new lambdapython.PythonFunction(
      this,
      "fn-library-checker-check-reserve",
      {
        functionName: "library-checker-check-reserve",
        runtime: lambda.Runtime.PYTHON_3_7,
        entry: path.resolve(__dirname, "../lambda/src/library_checker"),
        index: "index.py",
        handler: "handler_check_reserve",
        layers: [layerForApp, layerForChrome],
        timeout: Duration.seconds(300),
        memorySize: 512,
        environment: {
          CHROME_BINARY_LOCATION: "/opt/python/headless-chromium",
          CHROME_DRIVER_LOCATION: "/opt/python/chromedriver",
          HOME: "/opt/python/",
          ///////////////////////////////////////////////////////////////////////////
          // 注意: 下記の環境変数についてはAWSコンソールにて正式な値をセットすること
          ///////////////////////////////////////////////////////////////////////////
          // for post LINE
          LINE_POST_URL: "dummy",
        },
      }
    );

    // [予約本] 予約本で準備完了した本のチェック
    const libraryCheckerCheckPrepareFunction = new lambdapython.PythonFunction(
      this,
      "fn-library-checker-check-prepare",
      {
        functionName: "library-checker-check-prepare",
        runtime: lambda.Runtime.PYTHON_3_7,
        entry: path.resolve(__dirname, "../lambda/src/library_checker"),
        index: "index.py",
        handler: "handler_check_prepare",
        layers: [layerForApp, layerForChrome],
        timeout: Duration.seconds(300),
        memorySize: 512,
        environment: {
          CHROME_BINARY_LOCATION: "/opt/python/headless-chromium",
          CHROME_DRIVER_LOCATION: "/opt/python/chromedriver",
          HOME: "/opt/python/",
          ///////////////////////////////////////////////////////////////////////////
          // 注意: 下記の環境変数についてはAWSコンソールにて正式な値をセットすること
          ///////////////////////////////////////////////////////////////////////////
          // for post LINE
          LINE_POST_URL: "dummy",
        },
      }
    );

    cdk.Tags.of(libraryCheckerCheckRentalFunction).add("runtime", "python");
    cdk.Tags.of(libraryCheckerCheckExpireFunction).add("runtime", "python");
    cdk.Tags.of(libraryCheckerCheckReserveFunction).add("runtime", "python");
    cdk.Tags.of(libraryCheckerCheckPrepareFunction).add("runtime", "python");

    ////////////////////////////
    // EventBridge
    ////////////////////////////

    // EventBridge のルール
    new events.Rule(this, "rule-library-checker", {
      // JST で毎日 AM7:00 に定期実行
      // see https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions
      schedule: events.Schedule.cron({ minute: "0", hour: "22", day: "*" }),
      targets: [
        new targets.LambdaFunction(libraryCheckerCheckExpireFunction, {
          retryAttempts: 3,
        }),
        new targets.LambdaFunction(libraryCheckerCheckPrepareFunction, {
          retryAttempts: 3,
        }),
      ],
    });
  }
}
