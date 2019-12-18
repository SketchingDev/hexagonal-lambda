import { S3Event } from "aws-lambda";
import { s3Adaptor } from "../../app/sources/s3Adaptor";
import { S3 } from "aws-sdk";
import { Logger } from "../../app/domain/Logger";

describe("S3 Adaptor", () => {

  const mockLogger: Logger = {
    log: () => undefined,
    error: () => undefined,
  };

  test("Account ID from event passed to next function", async () => {
    const testId = "test-id";
    const objectKey = "test-object-key";
    const bucketName = "test-bucket-name";

    const mockS3Client = createMockS3Client(JSON.stringify({ id: testId }));
    const dependencies = {
      s3: mockS3Client as any as S3,
      logger: mockLogger,
    };

    const s3DeleteEvent: S3Event = createS3Event(bucketName, objectKey);

    const closeAccount = jest.fn();

    const handler = s3Adaptor(closeAccount, dependencies);
    await handler(s3DeleteEvent as any, {} as any, undefined as any);

    expect(mockS3Client.getObject).toHaveBeenCalledWith({ Bucket: bucketName, Key: objectKey });
    expect(closeAccount).toBeCalledWith(testId);
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

  const createMockS3Client = (objectBody: string): jest.Mocked<Pick<S3, 'getObject'>> => ({
    getObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ Body: objectBody }) }),
  });
});
