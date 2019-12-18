import { CloseAccountDependencies } from "./CloseAccountDependencies";

export type CloseAccount =
  (accountId: string, appDependencies: Pick<CloseAccountDependencies, "accountManager" | "instrumentation">) => Promise<void>;

// This is a port for providing the ID of an account to close
export const closeAccount: CloseAccount = async (
  accountId: string,
  {
    accountManager, // This is a port for managing customer accounts
    instrumentation, // This is a port for instrumentation
  },
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
