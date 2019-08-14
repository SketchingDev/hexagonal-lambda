import { AccountManagerClient } from "../client/AccountManagerClient";

export interface AppDependencies {
  accountManager: AccountManagerClient;
  logger: {
    error: (message?: any, ...optionalParams: any[]) => void;
    log: (message?: any, ...optionalParams: any[]) => void
  }
}
