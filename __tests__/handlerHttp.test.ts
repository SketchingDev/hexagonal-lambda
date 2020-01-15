import { APIGatewayProxyEvent } from "aws-lambda";
import { AccountManager } from "../app/instrastructure/driven/accountManager/AccountManager";
import { Instrumentation } from "../app/instrastructure/driven/instrumentation/Instrumentation";
import { apiGatewayAdapter } from "../app/instrastructure/driving/apiGatewayAdapter";
import { closeAccount } from "../app/domain/closeAccount";

describe("Close Accounts via API Gateway", () => {
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
    const handler = apiGatewayAdapter(closeAccount({
      accountManager: accountWithNoMeters,
      instrumentation,
    }));

    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
      pathParameters: { id: "test-id-1" },
    };
    const result = await handler(deleteEvent as any, {} as any, undefined as any);

    expect(result).toMatchObject({
      body: "Successfully closed account",
      headers: { "Content-Type": "text/plain" },
      statusCode: 200,
    });
    expect(accountWithNoMeters.closeAccount).toBeCalledWith("test-id-1");
  });
});
