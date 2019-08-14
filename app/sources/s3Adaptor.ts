import { S3Event } from "aws-lambda";

const { s3 } = require("@laconia/event");

interface CloseAccountEvent {
  id: string;
}

export const s3Adaptor = (next: any) => async (event: S3Event, dependencies: { [key: string]: any; }) => {
  const {logger} = dependencies;

  logger.log(event);

  const s3Event = s3(event, dependencies.s3);

  const closeAccountEvent: CloseAccountEvent = await s3Event.getJson();

  const hasId = "id" in closeAccountEvent;
  if (!hasId) {
    const message = "id property missing from S3 object";

    logger.error(message, {s3Event});
    throw new Error(message);
  }

  await next(closeAccountEvent.id, dependencies);
};




