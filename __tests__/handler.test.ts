import { APIGatewayProxyEvent, S3Event } from "aws-lambda";
import { AccountManager } from "../app/accountClients/AccountManager";
import { Instrumentation } from "../app/instrumentation/Instrumentation";
import { S3 } from "aws-sdk";
import { apiGatewayAdapter } from "../app/sources/apiGatewayAdapter";
import { closeAccount } from "../app/domain/closeAccount";
import { s3Adaptor } from "../app/sources/s3Adaptor";

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

  let accountWithNoMeters: AccountManager;

  beforeEach(() => {
    accountWithNoMeters = {
      closeAccount: jest.fn().mockResolvedValue(undefined),
      getActiveMeters: jest.fn().mockResolvedValue([]),
      removeMeter: jest.fn().mockResolvedValue(undefined),
    };
  });

  test("Account ID from HTTP passed account closer", async () => {
    const deps = {
      accountManager: accountWithNoMeters,
      logger,
      instrumentation,
    };

    const handler = apiGatewayAdapter(closeAccount(deps), deps);

    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
      pathParameters: { id: "test-id-1" },
    };

    const result = await handler(deleteEvent as any, {} as any, undefined as any);
    expect(result).toMatchObject({
      "body": "Successfully closed account",
      "headers": { "Content-Type": "text/plain" },
      "statusCode": 200,
    });

    expect(accountWithNoMeters.closeAccount).toBeCalledWith("test-id-1");
  });

  test("Account ID from S3 passed account closer", async () => {
    const deps = {
      accountManager: accountWithNoMeters,
      s3: createMockS3Client(JSON.stringify({ id: "test-id-2" })) as any,
      logger,
      instrumentation,
    };

    const handler = s3Adaptor(closeAccount(deps), deps);

    const s3PutEvent = createS3Event("test-bucket-name", "test-object-key");

    await handler(s3PutEvent as any, {} as any, undefined as any);
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
