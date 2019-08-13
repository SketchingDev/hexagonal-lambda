import laconia from "@laconia/core";
import { APIGatewayProxyHandler, S3Handler } from "aws-lambda";
import { AppDependencies } from "./app/domain/AppDependencies";
import { closeAccount } from "./app/domain/closeAccount";
import { apiGatewayAdapter } from "./app/sources/apiGatewayAdapter";
import { StubAmazingEnergyClient } from "./app/client/StubAmazingEnergyClient";
import { s3Adaptor } from "./app/sources/s3Adaptor";

const productionDependencies = (): AppDependencies => ({
  accountManager: new StubAmazingEnergyClient(),
});

export const closeAccountOverApiGateway = apiGatewayAdapter(closeAccount);
export const closeAccountOverS3 = s3Adaptor(closeAccount);

export const http: APIGatewayProxyHandler = laconia(closeAccountOverApiGateway)
  .register(productionDependencies);

export const s3: S3Handler = laconia(closeAccountOverS3)
  .register(productionDependencies);
