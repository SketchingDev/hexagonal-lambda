import { Instrumentation } from "./Instrumentation";

export class StubInstrumentation implements Instrumentation {
  public async closedAccount(): Promise<void> {
    await Promise.resolve();
  }

  public async removedMeters(): Promise<void> {
    await Promise.resolve();
  }
}
