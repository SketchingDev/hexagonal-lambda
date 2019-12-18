import { Instrumentation } from "../instrumentation/Instrumentation";
import { AccountManager } from "../accountClients/AccountManager";

export type CloseAccount = (accountId: string) => Promise<void>;

export const closeAccount = (
  { accountManager, instrumentation }: { accountManager: AccountManager, instrumentation: Instrumentation },
): CloseAccount => async (
  accountId: string,
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
