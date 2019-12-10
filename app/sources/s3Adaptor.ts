import { S3Event } from "aws-lambda";
import { AppDependencies } from "../domain/AppDependencies";
import { CloseAccount } from "../domain/closeAccount";

const { s3 } = require("@laconia/event");

interface ObjectContent {
  id: string;
}

export const s3Adaptor = (next: CloseAccount) => async (event: S3Event, dependencies: AppDependencies) => {
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




