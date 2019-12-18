import { closeAccount } from "./app/domain/closeAccount";
import { apiGatewayAdapter } from "./app/sources/apiGatewayAdapter";
import { StubAmazingEnergyClient } from "./app/accountClients/StubAmazingEnergyClient";
import { StubInstrumentation } from "./app/instrumentation/StubInstrumentation";

const prodDependencies = {
  instrumentation: new StubInstrumentation(),
  accountManager: new StubAmazingEnergyClient(),
  logger: console,
};

export const handler = apiGatewayAdapter(closeAccount(prodDependencies), prodDependencies);
