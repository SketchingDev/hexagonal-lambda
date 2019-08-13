import { AppDependencies } from "./AppDependencies";

export type CloseAccount = (accountId: string, appDependencies: AppDependencies) => Promise<void>;

export const closeAccount: CloseAccount = async (accountId: string, { accountManager }: AppDependencies): Promise<void> => {
  const activeMeters = await accountManager.getActiveMeters(accountId);

  try {
    await Promise.all(activeMeters.map(m => accountManager.removeMeter(accountId, m)));
  } catch (err) {
    throw new Error(`Failed to remove meters for account ${accountId}`);
  }

  await accountManager.closeAccount(accountId);
};
