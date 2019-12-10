import laconia from "@laconia/core";
import { APIGatewayProxyHandler, S3Handler } from "aws-lambda";
import { AppDependencies } from "./app/domain/AppDependencies";
import { closeAccount } from "./app/domain/closeAccount";
import { apiGatewayAdapter } from "./app/sources/apiGatewayAdapter";
import { StubAmazingEnergyClient } from "./app/accountClients/StubAmazingEnergyClient";
import { s3Adaptor } from "./app/sources/s3Adaptor";
import { StubInstrumentation } from "./app/instrumentation/StubInstrumentation";
import { S3 } from "aws-sdk";

const productionDependencies = (): AppDependencies => ({
  instrumentation: new StubInstrumentation(),
  accountManager: new StubAmazingEnergyClient(),
  logger: console,
  s3Client: new S3()
});

export const closeAccountOverApiGateway = apiGatewayAdapter(closeAccount);
export const closeAccountOverS3 = s3Adaptor(closeAccount);

// Entry-point for handling HTTP events
export const http: APIGatewayProxyHandler = laconia(closeAccountOverApiGateway)
  .register(productionDependencies);

// Entry-point for handle S3 events
export const s3: S3Handler = laconia(closeAccountOverS3)
  .register(productionDependencies);
