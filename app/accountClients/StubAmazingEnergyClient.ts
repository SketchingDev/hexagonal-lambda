import { AccountManager } from "./AccountManager";
import { FuelType, Meter, Unit } from "../domain/models/Meter";

export class StubAmazingEnergyClient implements AccountManager {
  private static readonly ELECTRICITY_METER: Readonly<Meter> = {
    id: "elec-id",
    fuelType: FuelType.Electricity,
    lastKnownReading: {
      value: 123,
      unit: Unit.watts,
    },
  };

  private static readonly GAS_METER: Readonly<Meter> = {
    id: "gas-id",
    fuelType: FuelType.Gas,
    lastKnownReading: {
      value: 456,
      unit: Unit.m3,
    },
  };

  public async closeAccount(): Promise<void> {
    return Promise.resolve();
  }

  public async getActiveMeters(): Promise<Array<Meter>> {
    return Promise.resolve([StubAmazingEnergyClient.ELECTRICITY_METER, StubAmazingEnergyClient.GAS_METER]);
  }

  public removeMeter(): Promise<void> {
    return Promise.resolve();
  }
}
