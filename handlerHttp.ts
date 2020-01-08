import { CloseAccount, closeAccount } from "./app/domain/closeAccount";
import { apiGatewayAdapter } from "./app/sources/apiGatewayAdapter";
import { StubAmazingEnergyClient } from "./app/accountClients/StubAmazingEnergyClient";
import { StubInstrumentation } from "./app/instrumentation/StubInstrumentation";

// Instantiate core functionality with its dependencies
const accountCloser: CloseAccount = closeAccount({
  instrumentation: new StubInstrumentation(), // Implements Instrumentation interface (port)
  accountManager: new StubAmazingEnergyClient(), // Implements AccountManager interface (port)
});

// Initialise the handler with the apiGatewayAdaptor which depends on the CloseAccount port
export const handler = apiGatewayAdapter(accountCloser);
