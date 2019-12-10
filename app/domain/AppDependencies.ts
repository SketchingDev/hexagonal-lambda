import { AccountManagerClient } from "../accountClients/AccountManagerClient";
import { Instrumentation } from "../instrumentation/Instrumentation";
import { S3 } from "aws-sdk";

export interface Logger {
  error: (message?: any, ...optionalParams: any[]) => void;
  log: (message?: any, ...optionalParams: any[]) => void;
}

export interface AppDependencies {
  instrumentation: Instrumentation;
  accountManager: AccountManagerClient;
  logger: Logger;
  s3Client: S3
}
