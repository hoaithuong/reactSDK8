// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import * as ReactDom from "react-dom";
import cloneDeep = require("lodash/cloneDeep");
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { PluggableXirr } from "../PluggableXirr";
import { IVisConstruct, IVisProps, IBucketOfFun, IFilters } from "../../../../interfaces/Visualization";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../tests/mocks/uiConfigMocks";
import * as testMocks from "../../../../tests/mocks/testMocks";
import { IDrillableItem } from "@gooddata/sdk-ui";
import { CoreXirr } from "@gooddata/sdk-ui-charts";

describe("PluggableXirr", () => {
    const defaultProps = {
        projectId: "PROJECTID",
        backend: dummyBackend(),
        element: "body",
        configPanelElement: "invalid",
        visualizationProperties: {},
        callbacks: {
            afterRender: jest.fn(),
            pushData: jest.fn(),
            onLoadingChanged: jest.fn(),
            onError: jest.fn(),
        },
        renderFun: jest.fn(),
    };

    const executionFactory = dummyBackend()
        .workspace("PROJECTID")
        .execution();

    function createComponent(customProps: Partial<IVisConstruct> = {}) {
        return new PluggableXirr({
            ...defaultProps,
            ...customProps,
        });
    }

    describe("init", () => {
        it("should not call pushData during init", () => {
            const pushData = jest.fn();

            createComponent({
                callbacks: {
                    pushData,
                },
            });

            expect(pushData).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {
        function getTestOptions(): IVisProps {
            const drillableItems: IDrillableItem[] = [];
            return {
                dimensions: {
                    width: 12,
                    height: 14,
                },
                custom: {
                    stickyHeaderOffset: 0,
                    drillableItems,
                },
                locale: "en-US",
            };
        }

        it("should not render xirr when dataSource is missing", () => {
            const fakeElement: any = "fake element";
            const reactCreateElementSpy = jest
                .spyOn(React, "createElement")
                .mockImplementation(() => fakeElement);
            const reactRenderSpy = jest.spyOn(ReactDom, "render").mockImplementation(jest.fn());

            const xirr = createComponent();
            const options: IVisProps = getTestOptions();

            xirr.update({ ...options }, testMocks.emptyInsight, executionFactory);

            expect(reactRenderSpy).toHaveBeenCalledTimes(0);

            reactCreateElementSpy.mockReset();
            reactRenderSpy.mockReset();
        });

        it("should render XIRR by react to given element passing down properties", () => {
            const fakeElement: any = "fake element";
            const reactCreateElementSpy = jest
                .spyOn(React, "createElement")
                .mockImplementation(() => fakeElement);
            const mockRenderFun = jest.fn();

            const xirr = createComponent({ ...defaultProps, renderFun: mockRenderFun });
            const options: IVisProps = getTestOptions();

            xirr.update(options, testMocks.insightWithSingleMeasure, executionFactory);

            expect(reactCreateElementSpy.mock.calls[0][0]).toBe(CoreXirr);
            expect(mockRenderFun).toHaveBeenCalledWith(
                fakeElement,
                document.querySelector(defaultProps.element),
            );

            reactCreateElementSpy.mockReset();
        });

        it("should correctly set config.disableDrillUnderline from FeatureFlag disableKpiDashboardHeadlineUnderline", () => {
            const fakeElement: any = "fake element";
            const reactCreateElementSpy = jest
                .spyOn(React, "createElement")
                .mockImplementation(() => fakeElement);
            const mockRenderFun = jest.fn();

            const xirr = createComponent({
                featureFlags: {
                    disableKpiDashboardHeadlineUnderline: true,
                },
                renderFun: mockRenderFun,
            });

            const options: IVisProps = getTestOptions();

            xirr.update(options, testMocks.insightWithSingleMeasure, executionFactory);

            expect(reactCreateElementSpy.mock.calls[0][0]).toBe(CoreXirr);

            reactCreateElementSpy.mockReset();
        });
    });

    describe("getExtendedReferencePoint", () => {
        it("should return proper extended reference point", async () => {
            const extendedReferencePoint = await createComponent().getExtendedReferencePoint(
                referencePointMocks.measuresAndDateReferencePoint,
            );

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: referencePointMocks.measuresAndDateReferencePoint.buckets[0].items.slice(0, 1),
                },
                {
                    localIdentifier: "attribute",
                    items: referencePointMocks.measuresAndDateReferencePoint.buckets[1].items.slice(0, 1),
                },
            ];

            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: [],
            };

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                properties: {},
                uiConfig: uiConfigMocks.fullySpecifiedXirrUiConfig,
            });
        });

        it("should correctly process empty reference point", async () => {
            const headline = createComponent();
            const extendedReferencePoint = await headline.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [],
                },
                {
                    localIdentifier: "attribute",
                    items: [],
                },
            ];

            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: [],
            };

            const expectedUiConfig = cloneDeep(uiConfigMocks.fullySpecifiedXirrUiConfig);
            expectedUiConfig.buckets.measures.canAddItems = true;
            expectedUiConfig.buckets.attribute.canAddItems = true;

            expect(extendedReferencePoint).toMatchObject({
                buckets: expectedBuckets,
                filters: expectedFilters,
                properties: {},
                uiConfig: expectedUiConfig,
            });
        });
    });
});
