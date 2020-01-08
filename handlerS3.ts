import { CloseAccount, closeAccount } from "./app/domain/closeAccount";
import { StubAmazingEnergyClient } from "./app/accountClients/StubAmazingEnergyClient";
import { s3Adaptor } from "./app/sources/s3Adaptor";
import { StubInstrumentation } from "./app/instrumentation/StubInstrumentation";
import { S3 } from "aws-sdk";

// Instantiate core functionality with its dependencies
const accountCloser: CloseAccount = closeAccount({
  instrumentation: new StubInstrumentation(), // Implements Instrumentation interface (port)
  accountManager: new StubAmazingEnergyClient(), // Implements AccountManager interface (port)
});

// Initialise the handler with the s3Adaptor which depends on the CloseAccount port
export const handler = s3Adaptor(accountCloser, new S3());
