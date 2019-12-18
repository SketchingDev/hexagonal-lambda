import { AccountManagerClient } from "../accountClients/AccountManagerClient";
import { Instrumentation } from "../instrumentation/Instrumentation";

export interface Logger {
  error: (message?: any, ...optionalParams: any[]) => void;
  log: (message?: any, ...optionalParams: any[]) => void;
}

export interface CloseAccountDependencies {
  instrumentation: Instrumentation;
  accountManager: AccountManagerClient;
  logger: Logger;
}
