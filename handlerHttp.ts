import { CloseAccount, closeAccount } from "./app/domain/closeAccount";
import { apiGatewayAdapter } from "./app/instrastructure/driving/apiGatewayAdapter";
import { StubAmazingEnergyClient } from "./app/instrastructure/driven/accountManager/StubAmazingEnergyClient";
import { StubInstrumentation } from "./app/instrastructure/driven/instrumentation/StubInstrumentation";

// Instantiate core functionality with its dependencies
const accountCloser: CloseAccount = closeAccount({
  instrumentation: new StubInstrumentation(), // Implements Instrumentation interface (port)
  accountManager: new StubAmazingEnergyClient(), // Implements AccountManager interface (port)
});

// Initialise the handler with the apiGatewayAdaptor which depends on the CloseAccount port
export const handler = apiGatewayAdapter(accountCloser);
