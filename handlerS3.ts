import { closeAccount } from "./app/domain/closeAccount";
import { StubAmazingEnergyClient } from "./app/accountClients/StubAmazingEnergyClient";
import { s3Adaptor } from "./app/sources/s3Adaptor";
import { StubInstrumentation } from "./app/instrumentation/StubInstrumentation";
import { S3 } from "aws-sdk";

const closeAccountDeps = {
  instrumentation: new StubInstrumentation(),
  accountManager: new StubAmazingEnergyClient(),
};

export const handler = s3Adaptor(closeAccount(closeAccountDeps), new S3());
