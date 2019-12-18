import { closeAccount } from "./app/domain/closeAccount";
import { StubAmazingEnergyClient } from "./app/accountClients/StubAmazingEnergyClient";
import { s3Adaptor } from "./app/sources/s3Adaptor";
import { StubInstrumentation } from "./app/instrumentation/StubInstrumentation";
import { S3 } from "aws-sdk";

const closeAccountDeps = {
  instrumentation: new StubInstrumentation(),
  accountManager: new StubAmazingEnergyClient(),
};

const s3AdaptorDeps = {
  logger: console,
  s3: new S3()
};

export const handler = s3Adaptor(closeAccount(closeAccountDeps), s3AdaptorDeps);
