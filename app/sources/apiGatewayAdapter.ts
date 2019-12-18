import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { CloseAccount } from "../domain/closeAccount";
import { Logger } from "../domain/Logger";

const response = (body: string, statusCode = 200): APIGatewayProxyResult => (
  {
    body,
    statusCode,
    headers: { "Content-Type": "text/plain" },
  });

const tryExtractId = (event: APIGatewayProxyEvent) => (event.pathParameters) ? event.pathParameters.id : undefined;

export const apiGatewayAdapter = (next: CloseAccount, { logger }: { logger: Logger }): APIGatewayProxyHandler => async (event) => {
  const id = tryExtractId(event);
  if (!id) {
    return response("Account not defined", 500);
  }

  try {
    await next(id);
    return response("Successfully closed account");
  } catch (err) {
    logger.error(err);
    return response("Unknown error", 500);
  }
};

