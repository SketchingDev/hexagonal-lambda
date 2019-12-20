import { S3Event } from "aws-lambda";
import { s3Adaptor } from "../../app/sources/s3Adaptor";
import { S3 } from "aws-sdk";

describe("S3 Adaptor", () => {
  test("Account ID from event passed to next function", async () => {
    const testId = "test-id";
    const s3Object = { key: "test-object-key", bucket: "test-bucket-name" };

    const mockS3Client = createMockS3Client(JSON.stringify({ id: testId }));
    const closeAccount = jest.fn();

    const handler = s3Adaptor(closeAccount, (mockS3Client as any) as S3);

    const s3DeleteEvent: S3Event = createS3Event(s3Object);
    await handler(s3DeleteEvent as any, {} as any, undefined as any);

    expect(mockS3Client.getObject).toHaveBeenCalledWith({ Bucket: s3Object.bucket, Key: s3Object.key });
    expect(closeAccount).toBeCalledWith(testId);
  });

  const createS3Event = ({ key, bucket }: { key: string; bucket: string }): S3Event => ({
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
          bucket: { arn: "", name: bucket, ownerIdentity: { principalId: "" } },
          configurationId: "",
          object: { eTag: "", key, sequencer: "", size: 0, versionId: "" },
          s3SchemaVersion: "",
        },
        userIdentity: { principalId: "" },
      },
    ],
  });

  const createMockS3Client = (objectBody: string): jest.Mocked<Pick<S3, "getObject">> => ({
    getObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ Body: objectBody }) }),
  });
});
