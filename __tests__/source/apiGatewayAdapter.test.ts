import { APIGatewayProxyEvent } from "aws-lambda";
import { apiGatewayAdapter } from "../../app/sources/apiGatewayAdapter";

describe("API Gateway Adaptor", () => {
  const mockLogger = {
    error: () => {}
  };

  const mockDependencies = { logger: mockLogger };

  test("Next function invoked with Account ID from proxy event", async () => {
    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
      pathParameters: { id: "test-account-id" },
    };

    const nextFunction = jest.fn();

    const adaptor = apiGatewayAdapter(nextFunction);
    await adaptor(deleteEvent as any, mockDependencies);

    expect(nextFunction).toBeCalledWith("test-account-id", mockDependencies);
  });

  test("Result of next function returned as request body", async () => {
    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
      pathParameters: { id: "test-account-id" },
    };

    const nextFunctionResponse = "Test response";
    const nextFunction = jest.fn().mockResolvedValue(nextFunctionResponse);

    const adaptor = apiGatewayAdapter(nextFunction);
    const response = await adaptor(deleteEvent as any, mockDependencies);

    expect(response).toMatchObject({
      body: nextFunctionResponse,
      headers: { "Content-Type": "text/plain" },
      isBase64Encoded: false,
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

    const adaptor = apiGatewayAdapter(nextFunction);
    const response = await adaptor(deleteEvent as any, mockDependencies);

    expect(response).toMatchObject({
      body: "Unknown error",
      headers: { "Content-Type": "text/plain" },
      isBase64Encoded: false,
      statusCode: 500,
    });
  });
  test("Error returned if account not defined", async () => {
    const deleteEvent: Partial<APIGatewayProxyEvent> = {
      path: `/account`,
      httpMethod: "DELETE",
    };

    const nextFunction = jest.fn().mockRejectedValue(undefined);

    const adaptor = apiGatewayAdapter(nextFunction);
    const response = await adaptor(deleteEvent as any, mockDependencies);

    expect(response).toMatchObject({
      body: "Account not defined",
      headers: { "Content-Type": "text/plain" },
      isBase64Encoded: false,
      statusCode: 500,
    });
  });
});
