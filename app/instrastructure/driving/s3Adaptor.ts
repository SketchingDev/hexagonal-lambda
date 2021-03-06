import { S3Handler } from "aws-lambda";
import { CloseAccount } from "../../domain/closeAccount";
import { S3 } from "aws-sdk";

interface ObjectContent {
  id: string;
}

const readBody = async (params: { Bucket: string; Key: string }, s3: S3) => {
  const { Body } = await s3.getObject(params).promise();
  return Body ? JSON.parse(Body.toString()) : undefined;
};

export const s3Adaptor = (next: CloseAccount, s3: S3): S3Handler => async event => {
  console.log(event);

  const record = event.Records[0];
  const { key } = record.s3.object;
  const { name } = record.s3.bucket;

  const closeAccountEvent: ObjectContent = await readBody({ Bucket: name, Key: key }, s3);

  const hasId = "id" in closeAccountEvent;
  if (!hasId) {
    const message = "id property missing from S3 object";

    console.error(message, { event });
    throw new Error(message);
  }

  await next(closeAccountEvent.id);
  console.log(`Closed account ${closeAccountEvent.id}`);
};
