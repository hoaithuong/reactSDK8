// (C) 2020 GoodData Corporation

import { Account, Won } from "../../../../__mocks__/model";
import { newMeasureValueFilter, newNegativeAttributeFilter } from "../factory";
import { filterFingerprint } from "../fingerprint";

describe("filterFingerprint", () => {
    it("should return nothing for noop measure value filter", () => {
        const EmptyMvf = newMeasureValueFilter(Won, "EQUAL_TO", 0);
        delete EmptyMvf.measureValueFilter.condition;

        expect(filterFingerprint(EmptyMvf)).toBeUndefined();
    });

    it("should return nothing for noop negative attribute filter", () => {
        expect(filterFingerprint(newNegativeAttributeFilter(Account.Name, []))).toBeUndefined();
    });
});
