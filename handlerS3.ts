import { CloseAccount, closeAccount } from "./app/domain/closeAccount";
import { StubAmazingEnergyClient } from "./app/instrastructure/driven/accountManager/StubAmazingEnergyClient";
import { s3Adaptor } from "./app/instrastructure/driving/s3Adaptor";
import { StubInstrumentation } from "./app/instrastructure/driven/instrumentation/StubInstrumentation";
import { S3 } from "aws-sdk";

// Instantiate core functionality with its dependencies
const accountCloser: CloseAccount = closeAccount({
  instrumentation: new StubInstrumentation(), // Implements Instrumentation interface (port)
  accountManager: new StubAmazingEnergyClient(), // Implements AccountManager interface (port)
});

// Initialise the handler with the s3Adaptor which depends on the CloseAccount port
export const handler = s3Adaptor(accountCloser, new S3());
