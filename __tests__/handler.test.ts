import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, S3Event, S3Handler } from "aws-lambda";
import laconia = require("@laconia/core");
import lambdaTester = require("lambda-tester");
import { AccountManagerClient } from "../app/client/AccountManagerClient";
import { closeAccountOverApiGateway, closeAccountOverS3 } from "../handler";
import { AppDependencies } from "../app/domain/AppDependencies";
import { Instrumentation } from "../app/instrumentation/Instrumentation";

describe("Close Accounts", () => {
  const logger = {
    log: () => {
    },
    error: () => {
    },
  };

  const instrumentation: Instrumentation = {
    closedAccount: () => Promise.resolve(),
    removedMeters: () => Promise.resolve()
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
      .register((): AppDependencies => ({
        accountManager: accountWithNoMeters,
        logger,
        instrumentation
      }));

    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
      pathParameters: { id: "test-id-1" },
    };

    return lambdaTester(handler)
      .event(deleteEvent as any)
      // @ts-ignore
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result).toMatchObject({
          body: undefined,
          statusCode: 200,
        });

        expect(accountWithNoMeters.closeAccount).toBeCalledWith("test-id-1");
      });
  });

  test("Account ID from S3 passed account closer", () => {
    const handler: S3Handler = laconia(closeAccountOverS3)
      .register(() => ({
        accountManager: accountWithNoMeters,
        s3: createMockS3Client(JSON.stringify({ id: "test-id-2" })),
        logger,
        instrumentation
      }));

    const s3PutEvent = createS3Event("test-bucket-name", "test-object-key");

    return lambdaTester(handler)
      .event(s3PutEvent)
      // @ts-ignore
      .expectResult(() => {
        expect(accountWithNoMeters.closeAccount).toBeCalledWith("test-id-2");
      });
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

  const createMockS3Client = (objectBody: string) => ({
    getObject: jest.fn().mockReturnValue({ promise: jest.fn().mockResolvedValue({ Body: objectBody }) }),
  });
});
