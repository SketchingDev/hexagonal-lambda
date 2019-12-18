import { Meter } from "../domain/models/Meter";

export interface AccountManager {
  closeAccount(accountId: string): Promise<void>;
  getActiveMeters(accountId: string): Promise<Array<Meter>>;
  removeMeter(accountId: string, meter: Meter): Promise<void>;
}
