import { Meter } from "../domain/models/Meter";

export interface Instrumentation {
  removedMeters(meters: Meter[]): Promise<void>;
  closedAccount(id: string): Promise<void>;
}
