import { S3Event } from "aws-lambda";
import { s3Adaptor } from "../../app/source/s3Adaptor";

describe("S3 Adaptor", () => {

  const createS3Event = (bucketName: string, objectKey: string) =>
    ({
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
    });

  const createMockS3Client = (objectBody: string) => ({
    getObject: jest.fn().mockReturnValue({promise: jest.fn().mockResolvedValue({Body: objectBody})})
  });

  test("Account ID from event passed to next function", async () => {
    const testId = "test-id";
    const objectKey = "test-object-key";
    const bucketName = "test-bucket-name";

    const mockS3Client = createMockS3Client(JSON.stringify({id: testId}));
    const dependencies = { s3: mockS3Client};

    const s3DeleteEvent: S3Event = { Records: [createS3Event(bucketName, objectKey)] };

    const nextFunction = jest.fn();

    const adaptor = s3Adaptor(nextFunction);
    await adaptor(s3DeleteEvent as any, dependencies);

    expect(mockS3Client.getObject).toHaveBeenCalledWith({Bucket: bucketName, Key: objectKey});
    expect(nextFunction).toBeCalledWith(testId, dependencies);
  });
});
