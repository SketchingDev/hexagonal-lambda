import { AccountManagerClient } from "../client/AccountManagerClient";
import { Instrumentation } from "../instrumentation/Instrumentation";

export interface AppDependencies {
  instrumentation: Instrumentation;
  accountManager: AccountManagerClient;
  logger: {
    error: (message?: any, ...optionalParams: any[]) => void;
    log: (message?: any, ...optionalParams: any[]) => void
  }
}
