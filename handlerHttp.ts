import laconia from "@laconia/core";
import { APIGatewayProxyHandler } from "aws-lambda";
import { CloseAccountDependencies } from "./app/domain/CloseAccountDependencies";
import { closeAccount } from "./app/domain/closeAccount";
import { apiGatewayAdapter } from "./app/sources/apiGatewayAdapter";
import { StubAmazingEnergyClient } from "./app/accountClients/StubAmazingEnergyClient";
import { StubInstrumentation } from "./app/instrumentation/StubInstrumentation";

export const closeAccountOverApiGateway = apiGatewayAdapter(closeAccount);

export const handler: APIGatewayProxyHandler = laconia(closeAccountOverApiGateway)
  .register((): CloseAccountDependencies => ({
    instrumentation: new StubInstrumentation(),
    accountManager: new StubAmazingEnergyClient(),
    logger: console,
  }));
