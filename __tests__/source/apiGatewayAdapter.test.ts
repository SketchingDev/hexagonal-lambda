import { APIGatewayProxyEvent } from "aws-lambda";
import { apiGatewayAdapter } from "../../app/sources/apiGatewayAdapter";

describe("API Gateway Adaptor", () => {

  const logger = {
      log: () => undefined,
      error: () => undefined,
  };

  test("Next function invoked with Account ID from proxy event", async () => {
    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
      pathParameters: { id: "test-account-id" },
    };

    const nextFunction = jest.fn();

    const handler = apiGatewayAdapter(nextFunction, { logger });
    await handler(deleteEvent as any, {} as any, undefined as any);

    expect(nextFunction).toBeCalledWith("test-account-id");
  });

  test("Success message return if next function succeeds", async () => {
    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
      pathParameters: { id: "test-account-id" },
    };

    const nextFunction = jest.fn().mockResolvedValue(undefined);

    const handler = apiGatewayAdapter(nextFunction, { logger });
    const response = await handler(deleteEvent as any, {} as any, undefined as any);

    expect(response).toMatchObject({
      body: "Successfully closed account",
      headers: { "Content-Type": "text/plain" },
      statusCode: 200,
    });
  });

  test("Error returned if next function fails", async () => {
    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
      pathParameters: { id: "test-account-id" },
    };

    const nextFunction = jest.fn().mockRejectedValue(undefined);

    const handler = apiGatewayAdapter(nextFunction, { logger });
    const response = await handler(deleteEvent as any, {} as any, undefined as any);

    expect(response).toMatchObject({
      body: "Unknown error",
      headers: { "Content-Type": "text/plain" },
      statusCode: 500,
    });
  });
  test("Error returned if account not defined", async () => {
    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
    };

    const nextFunction = jest.fn().mockRejectedValue(undefined);

    const handler = apiGatewayAdapter(nextFunction, { logger });
    const response = await handler(deleteEvent as any, {} as any, undefined as any);

    expect(response).toMatchObject({
      body: "Account not defined",
      headers: { "Content-Type": "text/plain" },
      statusCode: 500,
    });
  });
});
