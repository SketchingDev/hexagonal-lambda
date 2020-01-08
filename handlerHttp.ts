import { closeAccount } from "./app/domain/closeAccount";
import { apiGatewayAdapter } from "./app/sources/apiGatewayAdapter";
import { StubAmazingEnergyClient } from "./app/accountClients/StubAmazingEnergyClient";
import { StubInstrumentation } from "./app/instrumentation/StubInstrumentation";

// Create the dependencies for the core functionality
const closeAccountDeps = {
  // Implements Instrumentation interface (port)
  instrumentation: new StubInstrumentation(),

  // Implements AccountManager interface (port)
  accountManager: new StubAmazingEnergyClient(),
};

// Initialise the handler with the apiGatewayAdaptor which depends on the CloseAccount port
export const handler = apiGatewayAdapter(
  // Creates function that implements CloseAccount (port)
  closeAccount(closeAccountDeps)
);
