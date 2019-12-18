import { S3Event } from "aws-lambda";
import { CloseAccountDependencies } from "../domain/CloseAccountDependencies";
import { CloseAccount } from "../domain/closeAccount";
import { S3 } from "aws-sdk";

const { s3 } = require("@laconia/event");

export interface S3AdaptorDependencies extends CloseAccountDependencies {
  s3Client: S3
}

interface ObjectContent {
  id: string;
}

export const s3Adaptor = (next: CloseAccount) => async (event: S3Event, dependencies: S3AdaptorDependencies) => {
  const { logger, s3Client } = dependencies;
  logger.log(event);

  const s3Event = s3(event, s3Client);
  const closeAccountEvent: ObjectContent = await s3Event.getJson();

  const hasId = "id" in closeAccountEvent;
  if (!hasId) {
    const message = "id property missing from S3 object";

    logger.error(message, {s3Event});
    throw new Error(message);
  }

  await next(closeAccountEvent.id, dependencies);
};




