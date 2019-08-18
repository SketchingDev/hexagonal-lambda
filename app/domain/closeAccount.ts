import { AppDependencies } from "./AppDependencies";

export type CloseAccount = (accountId: string, appDependencies: AppDependencies) => Promise<void>;

export const closeAccount: CloseAccount = async (
  accountId: string,
  { accountManager, instrumentation }: AppDependencies
): Promise<void> => {
  const activeMeters = await accountManager.getActiveMeters(accountId);

  try {
    await Promise.all(activeMeters.map(m => accountManager.removeMeter(accountId, m)));
    await instrumentation.removedMeters(activeMeters);
  } catch (err) {
    throw new Error(`Failed to remove meters for account ${accountId}`);
  }

  await accountManager.closeAccount(accountId);
  await instrumentation.closedAccount(accountId);
};
