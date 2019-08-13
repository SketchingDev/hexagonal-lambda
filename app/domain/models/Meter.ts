export enum Unit {
  m3,
  watts
}

export enum FuelType {
  Gas,
  Electricity
}

export interface Reading {
  readonly value: number;
  readonly unit: Unit;
}

export interface Meter {
  readonly id: string;
  readonly lastKnownReading: Reading;
  readonly fuelType: FuelType;
}
