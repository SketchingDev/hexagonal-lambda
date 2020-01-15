import { S3Event } from "aws-lambda";
import { AccountManager } from "../app/instrastructure/driven/accountManager/AccountManager";
import { Instrumentation } from "../app/instrastructure/driven/instrumentation/Instrumentation";
import { S3 } from "aws-sdk";
import { closeAccount } from "../app/domain/closeAccount";
import { s3Adaptor } from "../app/instrastructure/driving/s3Adaptor";

describe("Close Accounts via S3", () => {
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

  test("Account ID from S3 passed account closer", async () => {
    const mocks3 = createMockS3Client(JSON.stringify({ id: "test-id-2" })) as any;

    const handler = s3Adaptor(closeAccount({
      accountManager: accountWithNoMeters,
      instrumentation,
    }), mocks3);

    const s3PutEvent = createS3Event("test-bucket-name", "test-object-key");
    await handler(s3PutEvent as any, {} as any, undefined as any);

    expect(accountWithNoMeters.closeAccount).toBeCalledWith("test-id-2");
  });

  const createS3Event = (bucketName: string, objectKey: string): S3Event => ({
    Records: [
      {
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
      },
    ],
  });

  const createMockS3Client = (objectBody: string): Pick<S3, "getObject"> => ({
    getObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ Body: objectBody }) }),
  });
});
