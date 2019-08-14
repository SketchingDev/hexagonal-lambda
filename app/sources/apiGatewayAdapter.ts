import { APIGatewayProxyEvent } from "aws-lambda";

const { res } = require("@laconia/event").apigateway;

const tryExtractId = (event: APIGatewayProxyEvent) => (event.pathParameters) ? event.pathParameters.id : undefined;

export const apiGatewayAdapter = (next: any) => async (event: APIGatewayProxyEvent, dependencies: { [key: string]: any; }) => {
  const { logger } = dependencies;

  const id = tryExtractId(event);
  if (!id) {
    return res("Account not defined", 500);
  }

  try {
    const output = await next(id, dependencies);
    return res(output);
  } catch (err) {
    logger.error(err);
    return res("Unknown error", 500);
  }
};

