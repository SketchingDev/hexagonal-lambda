import { FuelType, Meter, Unit } from "../../app/domain/models/Meter";
import { AccountManagerClient } from "../../app/client/AccountManagerClient";
import { closeAccount } from "../../app/domain/closeAccount";

describe("Close Account", () => {
  const mockLogger = {
    error: () => {
    },
    log: () => {
    },
  };

  let elecMeter: Meter;
  let gasMeter: Meter;

  const createAccountClient = (meters: Meter[]): AccountManagerClient => ({
    getActiveMeters: jest.fn().mockResolvedValue(meters),
    removeMeter: jest.fn().mockResolvedValue(undefined),
    closeAccount: jest.fn().mockResolvedValue(undefined),
  });

  beforeEach(() => {
    elecMeter = {
      fuelType: FuelType.Electricity,
      id: "test-elec-meter-id",
      lastKnownReading: { unit: Unit.watts, value: 123 },
    };

    gasMeter = {
      fuelType: FuelType.Gas,
      id: "test-gas-meter-id",
      lastKnownReading: {
        unit: Unit.m3, value: 123,
      },
    };
  });

  test("Account with no meters closed", async () => {
    const accountWithNoMeters = createAccountClient([]);
    const testAccountId = "test-account-id-1";

    await closeAccount(testAccountId, { accountManager: accountWithNoMeters, logger: mockLogger });

    expect(accountWithNoMeters.getActiveMeters).toHaveBeenCalledWith(testAccountId);
    expect(accountWithNoMeters.removeMeter).not.toHaveBeenCalled();
    expect(accountWithNoMeters.closeAccount).toHaveBeenCalledWith(testAccountId);
  });

  test("Meter removed before account closed", async () => {
    const singleFuelAccount = createAccountClient([elecMeter]);
    const testAccountId = "test-account-id-2";

    await closeAccount(testAccountId, { accountManager: singleFuelAccount, logger: mockLogger });

    expect(singleFuelAccount.getActiveMeters).toHaveBeenCalledWith(testAccountId);
    expect(singleFuelAccount.removeMeter).toHaveBeenCalledWith(testAccountId, elecMeter);
    expect(singleFuelAccount.closeAccount).toHaveBeenCalledWith(testAccountId);
  });

  test("Meters removed before account closed", async () => {
    const dualFuelAccount = createAccountClient([elecMeter, gasMeter]);
    const testAccountId = "test-account-id-3";

    await closeAccount(testAccountId, { accountManager: dualFuelAccount, logger: mockLogger });

    expect(dualFuelAccount.getActiveMeters).toHaveBeenCalledWith(testAccountId);
    expect(dualFuelAccount.removeMeter).toHaveBeenCalledWith(testAccountId, elecMeter);
    expect(dualFuelAccount.removeMeter).toHaveBeenCalledWith(testAccountId, gasMeter);
    expect(dualFuelAccount.closeAccount).toHaveBeenCalledWith(testAccountId);
  });

  test("Error thrown if meter could not be removed", async () => {
    const accountManagerClient: AccountManagerClient = {
      getActiveMeters: jest.fn().mockResolvedValue([elecMeter]),
      removeMeter: jest.fn().mockRejectedValue(undefined),
      closeAccount: jest.fn().mockResolvedValue(undefined),
    };

    await expect(closeAccount("test-account-id", { accountManager: accountManagerClient, logger: mockLogger }))
      .rejects
      .toThrowError("Failed to remove meters for account test-account-id");
  });
});
