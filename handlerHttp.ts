import { closeAccount } from "./app/domain/closeAccount";
import { apiGatewayAdapter } from "./app/sources/apiGatewayAdapter";
import { StubAmazingEnergyClient } from "./app/accountClients/StubAmazingEnergyClient";
import { StubInstrumentation } from "./app/instrumentation/StubInstrumentation";

const closeAccountDeps = {
  instrumentation: new StubInstrumentation(),
  accountManager: new StubAmazingEnergyClient(),
};

export const handler = apiGatewayAdapter(closeAccount(closeAccountDeps));
