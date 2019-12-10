import { APIGatewayProxyEvent, APIGatewayProxyHandler, S3Event, S3Handler } from "aws-lambda";
import { AccountManagerClient } from "../app/accountClients/AccountManagerClient";
import { closeAccountOverApiGateway, closeAccountOverS3 } from "../handler";
import { AppDependencies } from "../app/domain/AppDependencies";
import { Instrumentation } from "../app/instrumentation/Instrumentation";
import { S3 } from "aws-sdk";
import laconia = require("@laconia/core");

describe("Close Accounts", () => {
  const logger = {
    log: () => {
    },
    error: () => {
    },
  };

  const instrumentation: Instrumentation = {
    closedAccount: () => Promise.resolve(),
    removedMeters: () => Promise.resolve(),
  };

  let accountWithNoMeters: AccountManagerClient;

  beforeEach(() => {
    accountWithNoMeters = {
      closeAccount: jest.fn().mockResolvedValue(undefined),
      getActiveMeters: jest.fn().mockResolvedValue([]),
      removeMeter: jest.fn().mockResolvedValue(undefined),
    };
  });

  test("Account ID from HTTP passed account closer", async () => {
    const handler: APIGatewayProxyHandler = laconia(closeAccountOverApiGateway)
      .register((): Pick<AppDependencies, "accountManager" | "logger" | "instrumentation"> => ({
        accountManager: accountWithNoMeters,
        logger,
        instrumentation,
      }));

    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
      pathParameters: { id: "test-id-1" },
    };

    const callback = jest.fn();
    await handler(deleteEvent as any, {} as any, callback);

    expect(callback).toHaveBeenCalledWith(null, {
      "body": undefined,
      "headers": { "Content-Type": "text/plain" },
      "isBase64Encoded": false,
      "statusCode": 200,
    });

    expect(accountWithNoMeters.closeAccount).toBeCalledWith("test-id-1");
  });

  test("Account ID from S3 passed account closer", async () => {
    const handler: S3Handler = laconia(closeAccountOverS3)
      .register((): AppDependencies => ({
        accountManager: accountWithNoMeters,
        s3Client: createMockS3Client(JSON.stringify({ id: "test-id-2" })) as any,
        logger,
        instrumentation,
      }));

    const s3PutEvent = createS3Event("test-bucket-name", "test-object-key");

    await handler(s3PutEvent as any, {} as any, jest.fn());
    expect(accountWithNoMeters.closeAccount).toBeCalledWith("test-id-2");
  });

  const createS3Event = (bucketName: string, objectKey: string): S3Event =>
    ({
      Records: [{
        awsRegion: "",
        eventName: "",
        eventSource: "",
        eventTime: "",
        eventVersion: "",
        requestParameters: { sourceIPAddress: "" },
        responseElements: {
          "x-amz-request-id": "",
          "x-amz-id-2": "",
        },
        s3: {
          bucket: { arn: "", name: bucketName, ownerIdentity: { principalId: "" } },
          configurationId: "",
          object: { eTag: "", key: objectKey, sequencer: "", size: 0, versionId: "" },
          s3SchemaVersion: "",
        },
        userIdentity: { principalId: "" },
      }],
    });

  const createMockS3Client = (objectBody: string): Pick<S3, "getObject"> => ({
    getObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ Body: objectBody }) }),
  });
});
