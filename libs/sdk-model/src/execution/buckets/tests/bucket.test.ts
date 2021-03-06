// (C) 2019-2020 GoodData Corporation

import {
    applyRatioRule,
    IAttributeOrMeasure,
    bucketAttribute,
    bucketAttributes,
    bucketIsEmpty,
    bucketItems,
    bucketMeasure,
    bucketMeasures,
    bucketTotals,
    ComputeRatioRule,
    newBucket,
} from "../index";
import { Account, Activity, Velocity, Won } from "../../../../__mocks__/model";
import { InvariantError } from "ts-invariant";
import { ITotal, newTotal } from "../../base/totals";
import { attributeLocalId, IAttribute, idMatchAttribute } from "../../attribute";
import { idMatchMeasure, IMeasure, measureLocalId } from "../../measure";
import { modifySimpleMeasure } from "../../../index";

describe("newBucket", () => {
    const Scenarios: Array<[string, any, any[]]> = [
        ["empty bucket", "emptyBucket", [undefined]],
        ["bucket with single measure", "measureBucket", [Won]],
        ["bucket with multiple measures", "measureBucket", [Won, Velocity.Sum]],
        ["bucket with single attribute", "attributeBucket", [Account.Default]],
        ["bucket with multiple attributes", "attributeBucket", [Account.Default, Account.Name]],
        [
            "bucket with mix of attributes and measures",
            "mixedBucket",
            [Won, Account.Name, Velocity.Sum, Account.Default],
        ],
        ["bucket with totals", "totalsBucket", [Won, Account.Name, newTotal("sum", Won, Account.Name)]],
        ["bucket with totals when items not in bucket", "totalsBucket", [newTotal("sum", Won, Account.Name)]],
    ];

    it.each(Scenarios)("should create %s", (_desc, localIdArg, contentArg) => {
        expect(newBucket(localIdArg, ...contentArg)).toMatchSnapshot();
    });

    it("should throw if local identifier not specified", () => {
        expect(() => newBucket(undefined as any, Won, Account.Name)).toThrowError(InvariantError);
    });

    it("should throw if content is invalid type", () => {
        expect(() => newBucket("invalidBucket", Won, {} as any, Account.Name)).toThrowError(InvariantError);
    });
});

const Total = newTotal("sum", Won, Account.Name);
const EmptyBucket = newBucket("EmptyBucket");
const BucketWithOnlyTotals = newBucket("BucketWithOnlyTotals", newTotal("sum", Won, Account.Name));
const BucketWithSingleMeasure = newBucket("BucketWithSingleMeasure", Won);
const BucketWithManyMeasures = newBucket("BucketWithManyMeasures", Won, Velocity.Sum, Velocity.Max);
const BucketWithSingleAttr = newBucket("BucketWithSingleAttr", Account.Name);
const BucketWithManyAttrs = newBucket("BucketWithManyAttrs", Account.Name, Account.Default, Activity.Subject);
const BucketWithMeasureAndAttr = newBucket("BucketWithMeasureAndAttr", Won, Account.Name);
const BucketWithEverything = newBucket("BucketWithMeasureAndAttr", Won, Account.Name, Total);

const InvalidScenarios: Array<[string, any]> = [
    ["undefined input", undefined],
    ["null input", null],
];

describe("bucketIsEmpty", () => {
    const Scenarios: Array<[boolean, string, any]> = [
        [true, "empty bucket", EmptyBucket],
        [false, "bucket with only totals", BucketWithOnlyTotals],
        [false, "bucket with single measure", BucketWithSingleMeasure],
        [false, "bucket with single attr", BucketWithSingleAttr],
        [false, "bucket with all possible inputs", BucketWithEverything],
    ];

    it.each(Scenarios)("should return %s for %s", (expectedResult, _desc, input) => {
        expect(bucketIsEmpty(input)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => bucketIsEmpty(input)).toThrow();
    });
});

describe("bucketAttribute", () => {
    const Scenarios: Array<[string, any, any, IAttribute | undefined]> = [
        ["no attribute in empty bucket", EmptyBucket, undefined, undefined],
        ["no attribute in measure-only bucket", BucketWithManyMeasures, undefined, undefined],
        ["no attribute if localId empty", BucketWithManyAttrs, "", undefined],
        ["no attribute if localId matches nothing", BucketWithManyAttrs, "noSuchLocalId", undefined],
        ["first attribute when no predicate provided", BucketWithManyAttrs, undefined, Account.Name],
        ["first attribute in mixed attr & measure bucket", BucketWithMeasureAndAttr, undefined, Account.Name],
        [
            "attribute by local id if predicate is a string",
            BucketWithManyAttrs,
            attributeLocalId(Account.Default),
            Account.Default,
        ],
        ["no attribute if no predicate match", BucketWithManyAttrs, () => false, undefined],
    ];

    it.each(Scenarios)("should find %s", (_desc, bucketArg, predicateArg, expectedResult) => {
        expect(bucketAttribute(bucketArg, predicateArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => bucketAttribute(input)).toThrow();
    });
});

describe("bucketAttributes", () => {
    const Scenarios: Array<[string, any, any, IAttribute[]]> = [
        ["no attributes in empty bucket", EmptyBucket, undefined, []],
        ["no attributes in measure-only bucket", BucketWithManyMeasures, undefined, []],
        ["no attributes in attr bucket but no predicate match", BucketWithManyAttrs, () => false, []],
        ["attributes in single attr bucket", BucketWithSingleAttr, undefined, [Account.Name]],
        [
            "attributes in many attr bucket",
            BucketWithManyAttrs,
            undefined,
            [Account.Name, Account.Default, Activity.Subject],
        ],
        [
            "single attribute matching predicate",
            BucketWithManyAttrs,
            idMatchAttribute(attributeLocalId(Account.Name)),
            [Account.Name],
        ],
        ["attributes in mixed bucket", BucketWithMeasureAndAttr, undefined, [Account.Name]],
    ];

    it.each(Scenarios)("should find %s", (_desc, bucketArg, predicateArg, expectedResult) => {
        expect(bucketAttributes(bucketArg, predicateArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => bucketAttributes(input)).toThrow();
    });
});

describe("bucketMeasure", () => {
    const Scenarios: Array<[string, any, any, IMeasure | undefined]> = [
        ["no measure in empty bucket", EmptyBucket, undefined, undefined],
        ["no measure in attr-only bucket", BucketWithManyAttrs, undefined, undefined],
        ["no measure if localId empty", BucketWithManyMeasures, "", undefined],
        ["no measure if localId matches nothing", BucketWithManyMeasures, "noSuchLocalId", undefined],
        ["first measure when no predicate provided", BucketWithManyMeasures, undefined, Won],
        ["first measure in mixed attr & measure bucket", BucketWithMeasureAndAttr, undefined, Won],
        [
            "measure by local id if predicate is a string",
            BucketWithManyMeasures,
            measureLocalId(Velocity.Sum),
            Velocity.Sum,
        ],
        ["no measure if no predicate match", BucketWithManyMeasures, () => false, undefined],
    ];

    it.each(Scenarios)("should find %s", (_desc, bucketArg, predicateArg, expectedResult) => {
        expect(bucketMeasure(bucketArg, predicateArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => bucketMeasure(input)).toThrow();
    });
});

describe("bucketMeasures", () => {
    const Scenarios: Array<[string, any, any, IMeasure[]]> = [
        ["no measures in empty bucket", EmptyBucket, undefined, []],
        ["no measures in attr-only bucket", BucketWithManyAttrs, undefined, []],
        ["no measures in measure bucket but no predicate match", BucketWithManyMeasures, () => false, []],
        ["measures in single measure bucket", BucketWithSingleMeasure, undefined, [Won]],
        [
            "measures in many measure bucket",
            BucketWithManyMeasures,
            undefined,
            [Won, Velocity.Sum, Velocity.Max],
        ],
        [
            "single measure matching predicate",
            BucketWithManyMeasures,
            idMatchMeasure(measureLocalId(Velocity.Sum)),
            [Velocity.Sum],
        ],
        ["measures in mixed bucket", BucketWithMeasureAndAttr, undefined, [Won]],
    ];

    it.each(Scenarios)("should find %s", (_desc, bucketArg, predicateArg, expectedResult) => {
        expect(bucketMeasures(bucketArg, predicateArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => bucketMeasures(input)).toThrow();
    });
});

describe("bucketItems", () => {
    const Scenarios: Array<[string, any, IAttributeOrMeasure[]]> = [
        ["no items in empty bucket", EmptyBucket, []],
        ["items in populated bucket", BucketWithMeasureAndAttr, [Won, Account.Name]],
    ];

    it.each(Scenarios)("should return %s", (_desc, bucketArg, expectedResult) => {
        expect(bucketItems(bucketArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => bucketItems(input)).toThrow();
    });
});

describe("bucketTotals", () => {
    const Scenarios: Array<[string, any, ITotal[]]> = [
        ["no totals in empty bucket", EmptyBucket, []],
        ["no totals in bucket without totals", BucketWithMeasureAndAttr, []],
        ["totals in populated bucket", BucketWithEverything, [Total]],
    ];

    it.each(Scenarios)("should return %s", (_desc, bucketArg, expectedResult) => {
        expect(bucketTotals(bucketArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => bucketTotals(input)).toThrow();
    });
});

describe("applyRatioRule", () => {
    const MeasureWithRatio1 = modifySimpleMeasure(Won, m => m.ratio());
    const MeasureWithRatio2 = modifySimpleMeasure(Velocity.Avg, m => m.ratio());

    const Scenarios: Array<[string, any, any, any]> = [
        [
            "apply SINGLE rule by default",
            [MeasureWithRatio1],
            ComputeRatioRule.SINGLE_MEASURE_ONLY,
            [MeasureWithRatio1],
        ],
        [
            "keep all ratios if rule is ALWAYS",
            [MeasureWithRatio1, MeasureWithRatio2],
            ComputeRatioRule.ANY_MEASURE,
            [MeasureWithRatio1, MeasureWithRatio2],
        ],
        [
            "reset all ratios if rule is NEVER",
            [MeasureWithRatio1, MeasureWithRatio2],
            ComputeRatioRule.NEVER,
            [Won, Velocity.Avg],
        ],
        [
            "reset all ratios if rule is SINGLE and there are two ratio measures",
            [MeasureWithRatio1, MeasureWithRatio2],
            ComputeRatioRule.SINGLE_MEASURE_ONLY,
            [Won, Velocity.Avg],
        ],
        [
            "keep ratio of single ratio measure",
            [MeasureWithRatio1],
            ComputeRatioRule.SINGLE_MEASURE_ONLY,
            [MeasureWithRatio1],
        ],
        [
            "keep ratio of single ratio measure when mixed with attributes",
            [MeasureWithRatio1, Account.Name],
            ComputeRatioRule.SINGLE_MEASURE_ONLY,
            [MeasureWithRatio1, Account.Name],
        ],
        [
            "retain attributes as-is when SINGLE rule",
            [Activity.Subject, MeasureWithRatio1, Account.Name],
            ComputeRatioRule.SINGLE_MEASURE_ONLY,
            [Activity.Subject, MeasureWithRatio1, Account.Name],
        ],
        [
            "retain attributes as-is when NEVER rule",
            [Activity.Subject, MeasureWithRatio1, Account.Name],
            ComputeRatioRule.NEVER,
            [Activity.Subject, Won, Account.Name],
        ],
    ];

    it.each(Scenarios)("should %s", (_desc, itemsArg, ruleArg, expectedResult) => {
        expect(applyRatioRule(itemsArg, ruleArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => bucketTotals(input)).toThrow();
    });
});
