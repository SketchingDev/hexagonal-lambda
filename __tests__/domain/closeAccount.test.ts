import { FuelType, Meter, Unit } from "../../app/domain/models/Meter";
import { AccountManager } from "../../app/accountClients/AccountManager";
import { closeAccount } from "../../app/domain/closeAccount";
import { Instrumentation } from "../../app/instrumentation/Instrumentation";

describe("Close Account", () => {

  let instrumentation: Instrumentation;
  let elecMeter: Meter;
  let gasMeter: Meter;

  const createAccountClient = (meters: Meter[]): AccountManager => ({
    getActiveMeters: jest.fn().mockResolvedValue(meters),
    removeMeter: jest.fn().mockResolvedValue(undefined),
    closeAccount: jest.fn().mockResolvedValue(undefined),
  });

  beforeEach(() => {
    instrumentation = {
      closedAccount: jest.fn(),
      removedMeters: jest.fn(),
    };

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

    await closeAccount({ accountManager: accountWithNoMeters, instrumentation })(testAccountId);

    expect(accountWithNoMeters.getActiveMeters).toHaveBeenCalledWith(testAccountId);
    expect(accountWithNoMeters.removeMeter).not.toHaveBeenCalled();
    expect(accountWithNoMeters.closeAccount).toHaveBeenCalledWith(testAccountId);

    expect(instrumentation.removedMeters).toHaveBeenCalledWith([]);
    expect(instrumentation.closedAccount).toHaveBeenCalledWith(testAccountId);
  });

  test("Meter removed before account closed", async () => {
    const singleFuelAccount = createAccountClient([elecMeter]);
    const testAccountId = "test-account-id-2";

    await closeAccount({ accountManager: singleFuelAccount, instrumentation })(testAccountId);

    expect(singleFuelAccount.getActiveMeters).toHaveBeenCalledWith(testAccountId);
    expect(singleFuelAccount.removeMeter).toHaveBeenCalledWith(testAccountId, elecMeter);
    expect(singleFuelAccount.closeAccount).toHaveBeenCalledWith(testAccountId);

    expect(instrumentation.removedMeters).toHaveBeenCalledWith([elecMeter]);
    expect(instrumentation.closedAccount).toHaveBeenCalledWith(testAccountId);
  });

  test("Meters removed before account closed", async () => {
    const dualFuelAccount = createAccountClient([elecMeter, gasMeter]);
    const testAccountId = "test-account-id-3";

    await closeAccount({ accountManager: dualFuelAccount, instrumentation })(testAccountId);

    expect(dualFuelAccount.getActiveMeters).toHaveBeenCalledWith(testAccountId);
    expect(dualFuelAccount.removeMeter).toHaveBeenCalledWith(testAccountId, elecMeter);
    expect(dualFuelAccount.removeMeter).toHaveBeenCalledWith(testAccountId, gasMeter);
    expect(dualFuelAccount.closeAccount).toHaveBeenCalledWith(testAccountId);

    expect(instrumentation.removedMeters).toHaveBeenCalledWith([elecMeter, gasMeter]);
    expect(instrumentation.closedAccount).toHaveBeenCalledWith(testAccountId);
  });

  test("Error thrown if meter could not be removed", async () => {
    const accountManagerClient: AccountManager = {
      getActiveMeters: jest.fn().mockResolvedValue([elecMeter]),
      removeMeter: jest.fn().mockRejectedValue(undefined),
      closeAccount: jest.fn().mockResolvedValue(undefined),
    };

    await expect(closeAccount({ accountManager: accountManagerClient, instrumentation })("test-account-id"))
      .rejects
      .toThrowError("Failed to remove meters for account test-account-id");
  });
});
