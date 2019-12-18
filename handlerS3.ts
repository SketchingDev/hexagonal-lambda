import laconia from "@laconia/core";
import { S3Handler } from "aws-lambda";
import { closeAccount } from "./app/domain/closeAccount";
import { StubAmazingEnergyClient } from "./app/accountClients/StubAmazingEnergyClient";
import { S3AdaptorDependencies, s3Adaptor } from "./app/sources/s3Adaptor";
import { StubInstrumentation } from "./app/instrumentation/StubInstrumentation";
import { S3 } from "aws-sdk";

export const closeAccountOverS3 = s3Adaptor(closeAccount);

export const s3: S3Handler = laconia(closeAccountOverS3)
  .register((): S3AdaptorDependencies => ({
    instrumentation: new StubInstrumentation(),
    accountManager: new StubAmazingEnergyClient(),
    logger: console,
    s3Client: new S3()
  }));
