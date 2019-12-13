// (C) 2019 GoodData Corporation
import * as React from "react";
import { IBucketOfFun, IFilters, IVisProps } from "../../../../interfaces/Visualization";
import * as BucketNames from "../../../../../base/constants/bucketNames";
import { PluggableBaseChart } from "../PluggableBaseChart";
import * as testMocks from "../../../../mocks/testMocks";
import * as referencePointMocks from "../../../../mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../mocks/uiConfigMocks";
import BaseChartConfigurationPanel from "../../../configurationPanels/BaseChartConfigurationPanel";
import { VisualizationEnvironment } from "../../../../../base/constants/visualizationTypes";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IInsight, insightSetProperties } from "@gooddata/sdk-model";
import noop = require("lodash/noop");
import { IBaseChartProps } from "../../../../../charts/_base/BaseChart";
import { DefaultLocale, ILocale } from "../../../../../base/localization/Locale";

jest.mock("react-dom", () => {
    const renderObject = {
        render: () => {
            return;
        }, // spy on render
    };
    return {
        render: renderObject.render,
        unmountComponentAtNode: () => {
            return;
        },
        renderObject,
    };
});

describe("PluggableBaseChart", () => {
    const dashboardEnvironment: VisualizationEnvironment = "dashboards";
    const noneEnvironment: VisualizationEnvironment = "none";
    const dummyLocale: ILocale = "en-US";
    const backend = dummyBackend();
    const executionFactory = backend.workspace("PROJECTID").execution();

    const callbacks: any = {
        afterRender: noop,
        pushData: noop,
        onError: null,
        onLoadingChanged: null,
    };

    const defaultProps = {
        projectId: "PROJECTID",
        element: "body",
        configPanelElement: "invalid",
        backend: dummyBackend(),
        visualizationProperties: {},
        callbacks,
    };

    function createComponent(props = defaultProps) {
        return new PluggableBaseChart(props);
    }

    function dummyConfigurationRenderer(insight: IInsight) {
        const properties = {};

        return (
            <BaseChartConfigurationPanel
                locale={DefaultLocale}
                properties={properties}
                insight={insight}
                pushData={noop}
                type="column"
            />
        );
    }

    afterAll(() => {
        document.clear();
    });

    it("should create visualization", () => {
        const visualization = createComponent();
        expect(visualization).toBeTruthy();
    });

    it("should not render chart when insight has no data to render", () => {
        const renderObject = require("react-dom");
        const spyOnRender = jest.spyOn(renderObject, "render");

        const props = { ...defaultProps };

        const visualization = createComponent(props);
        const options: IVisProps = {
            dimensions: { height: null },
            locale: dummyLocale,
            custom: {
                stickyHeaderOffset: 3,
            },
        };

        visualization.update(options, testMocks.emptyInsight, executionFactory);

        expect(spyOnRender).toHaveBeenCalledTimes(0);
    });

    it("should render chart with height and right legend position when environment is dashboards", () => {
        const renderObject = require("react-dom");
        const spyOnRender = jest.spyOn(renderObject, "render");

        const props = { ...defaultProps, environment: dashboardEnvironment };
        const expectedHeight = 5;

        const visualization = createComponent(props);
        const options: IVisProps = {
            dimensions: { height: expectedHeight },
            locale: dummyLocale,
            custom: {
                stickyHeaderOffset: 3,
            },
        };

        visualization.update(options, testMocks.dummyInsight, executionFactory);

        const renderCallsCount = spyOnRender.mock.calls.length;
        expect(spyOnRender.mock.calls[renderCallsCount - 1][0]).toBeDefined();

        const renderProps: IBaseChartProps = (spyOnRender.mock.calls[renderCallsCount - 1][0] as any)
            .props as IBaseChartProps;
        expect(renderProps.config.legend.position).toEqual("right");
        expect(renderProps.height).toEqual(5);
    });

    it("should render chart with legend on right when it is auto positioned and environment is dashboards", () => {
        const renderObject = require("react-dom");
        const spyOnRender = jest.spyOn(renderObject, "render");

        const props = { ...defaultProps, environment: dashboardEnvironment };
        const expectedHeight = 5;

        const visualization = createComponent(props);
        const options: IVisProps = {
            dimensions: { height: expectedHeight },
            locale: dummyLocale,
            custom: {
                stickyHeaderOffset: 3,
            },
        };

        const visualizationProperties = {
            controls: {
                legend: {
                    position: "auto",
                },
            },
        };
        const testInsight = insightSetProperties(testMocks.dummyInsight, visualizationProperties);

        visualization.update(options, testInsight, executionFactory);

        const renderCallsCount = spyOnRender.mock.calls.length;
        expect(spyOnRender.mock.calls[renderCallsCount - 1][0]).toBeDefined();

        const renderProps: IBaseChartProps = (spyOnRender.mock.calls[renderCallsCount - 1][0] as any)
            .props as IBaseChartProps;
        expect(renderProps.config.legend.position).toEqual("right");
    });

    it("should render chart with legend on right when it is auto positioned and visualization is stacked", () => {
        const renderObject = require("react-dom");
        const spyOnRender = jest.spyOn(renderObject, "render");

        const props = { ...defaultProps };
        const expectedHeight = 5;

        const visualization = createComponent(props);
        const options: IVisProps = {
            dimensions: { height: expectedHeight },
            locale: dummyLocale,
            custom: {
                stickyHeaderOffset: 3,
            },
        };

        const visualizationProperties = {
            controls: {
                legend: {
                    position: "auto",
                },
            },
        };

        const testInsight = insightSetProperties(testMocks.insightWithStacking, visualizationProperties);

        visualization.update(options, testInsight, executionFactory);

        const renderCallsCount = spyOnRender.mock.calls.length;
        expect(spyOnRender.mock.calls[renderCallsCount - 1][0]).toBeDefined();

        const renderProps: IBaseChartProps = (spyOnRender.mock.calls[renderCallsCount - 1][0] as any)
            .props as IBaseChartProps;
        expect(renderProps.config.legend.position).toEqual("right");
    });

    it("should render configuration panel with correct properties", () => {
        const renderObject = require("react-dom");
        const spyOnRender = jest.spyOn(renderObject, "render");

        const expectedHeight = 5;

        const props = { ...defaultProps, configPanelElement: "body" };
        const visualization = createComponent(props);
        const options: IVisProps = {
            dimensions: { height: expectedHeight },
            locale: dummyLocale,
            custom: {
                stickyHeaderOffset: 3,
            },
        };

        visualization.update(options, testMocks.dummyInsight, executionFactory);
        const expectedConfigPanelElement = dummyConfigurationRenderer(testMocks.dummyInsight);

        // arguments of last called render method
        const renderCallsCount = spyOnRender.mock.calls.length;
        const renderArguments: any = spyOnRender.mock.calls[renderCallsCount - 1][0];

        // compare without intl and pushData
        expect({
            ...renderArguments.props,
            pushData: noop,
        }).toEqual(expectedConfigPanelElement.props);
    });

    it("should render chart with undefined height", async () => {
        const renderObject = require("react-dom");
        const spyOnRender = jest.spyOn(renderObject, "render");

        const props = { ...defaultProps, environment: noneEnvironment };

        const visualization = createComponent(props);
        const options: IVisProps = {
            dimensions: { height: 50 },
            locale: dummyLocale,
            custom: {
                stickyHeaderOffset: 3,
            },
        };

        const visualizationProperties = { controls: { legend: {} } };
        const testInsight = insightSetProperties(testMocks.dummyInsight, visualizationProperties);

        visualization.update(options, testInsight, executionFactory);

        const renderCallsCount = spyOnRender.mock.calls.length;
        expect(spyOnRender.mock.calls[renderCallsCount - 1][0]).toBeDefined();

        const renderProps: IBaseChartProps = (spyOnRender.mock.calls[renderCallsCount - 1][0] as any)
            .props as IBaseChartProps;
        expect(renderProps.height).toBeUndefined();
    });

    it(
        "should return reference point with base recommendations enabled " +
            "if visualization removed invalid derived measure",
        async () => {
            const baseChart = createComponent();

            const expectedBuckets: IBucketOfFun[] = referencePointMocks.oneMetricReferencePoint.buckets;
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: [],
            };

            const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
                referencePointMocks.oneMeasureWithInvalidOverTimeComparisonRefPoint,
            );

            expect(extendedReferencePoint).toEqual({
                uiConfig: uiConfigMocks.oneMetricNoCategoriesBaseUiConfig,
                filters: expectedFilters,
                properties: {},
                buckets: expectedBuckets,
            });
        },
    );

    it("should return ref. point with multiple metrics and one category and filter for this category", async () => {
        const baseChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[1].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "stack",
                items: [],
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.filters.items.slice(0, 1),
        };

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            uiConfig: uiConfigMocks.multipleMetricsAndCategoriesBaseUiConfig,
            filters: expectedFilters,
            properties: {},
            buckets: expectedBuckets,
        });
    });

    it("should return reference point with one metric and date and attribute", async () => {
        const baseChart = createComponent();
        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.dateAsFirstCategoryReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.dateAsFirstCategoryReferencePoint.buckets[1].items.slice(0, 1),
            },
            {
                localIdentifier: "stack",
                items: referencePointMocks.dateAsFirstCategoryReferencePoint.buckets[1].items.slice(1, 2),
            },
        ];
        const expectedFilters: IFilters = referencePointMocks.dateAsFirstCategoryReferencePoint.filters;
        const expectedUiConfig = uiConfigMocks.dateAsFirstCategoryBaseUiConfig;

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.dateAsFirstCategoryReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            properties: {},
            uiConfig: expectedUiConfig,
        });
    });

    it("should return reference point with one metric and only one category and stack", async () => {
        const baseChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.simpleStackedReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.simpleStackedReferencePoint.buckets[1].items,
            },
            {
                localIdentifier: "stack",
                items: referencePointMocks.simpleStackedReferencePoint.buckets[2].items,
            },
        ];

        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.simpleStackedReferencePoint.filters.items,
        };

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.simpleStackedReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            properties: {},
            uiConfig: uiConfigMocks.simpleStackedBaseUiConfig,
        });
    });

    it(
        'should remove derived measure and place first attribute to "trend" and second attribute to "stack"' +
            "when single measure with comparison is applied and date is first attribute",
        async () => {
            const baseChart = createComponent();

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [
                        referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint.buckets[0].items[0],
                    ],
                },
                {
                    localIdentifier: "view",
                    items: [
                        referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint.buckets[1].items[0],
                    ],
                },
                {
                    localIdentifier: "stack",
                    items: [
                        referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint.buckets[1].items[1],
                    ],
                },
            ];

            const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
                referencePointMocks.samePeriodPreviousYearAndAttributesRefPoint,
            );

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        },
    );

    it(
        'should remove derived measure and place first attribute to "trend" and second attribute to "stack"' +
            "when single measure with comparison is applied and date not first or second attribute",
        async () => {
            const baseChart = createComponent();
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.measureWithDateAfterOtherAttributes.buckets[0].items[0]],
                },
                {
                    localIdentifier: "view",
                    items: [referencePointMocks.measureWithDateAfterOtherAttributes.buckets[1].items[0]],
                },
                {
                    localIdentifier: "stack",
                    items: [referencePointMocks.measureWithDateAfterOtherAttributes.buckets[1].items[1]],
                },
            ];

            const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
                referencePointMocks.measureWithDateAfterOtherAttributes,
            );

            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        },
    );

    it("should return reference point with multiple metrics from multiple metrics buckets", async () => {
        const baseChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    0,
                    3,
                ),
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[1].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "stack",
                items: [],
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.filters.items.slice(0, 1),
        };

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricBucketsAndCategoryReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            uiConfig: uiConfigMocks.multipleMetricsAndCategoriesBaseUiConfig,
            filters: expectedFilters,
            properties: {},
            buckets: expectedBuckets,
        });
    });

    it("should return reference point with one metric, one category, second category as stack, valid filters", async () => {
        const baseChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.oneMetricAndManyCategoriesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.oneMetricAndManyCategoriesReferencePoint.buckets[1].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "stack",
                items: referencePointMocks.oneMetricAndManyCategoriesReferencePoint.buckets[1].items.slice(
                    1,
                    2,
                ),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.oneMetricAndManyCategoriesReferencePoint.filters.items.slice(0, 2),
        };

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.oneMetricAndManyCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            properties: {},
            uiConfig: uiConfigMocks.oneMetricAndManyCategoriesBaseUiConfig,
        });
    });

    it("should return reference point without Date in stacks", async () => {
        const baseChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.dateAsSecondCategoryReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.dateAsSecondCategoryReferencePoint.buckets[1].items.slice(0, 1),
            },
            {
                localIdentifier: "stack",
                items: referencePointMocks.dateAsSecondCategoryReferencePoint.buckets[1].items.slice(1, 2),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.dateAsSecondCategoryReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            properties: {},
            uiConfig: uiConfigMocks.dateAsSecondCategoryBaseUiConfig,
        });
    });

    it("should handle wrong order of buckets in reference point", async () => {
        const baseChart = createComponent();
        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.wrongBucketsOrderReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.wrongBucketsOrderReferencePoint.buckets[2].items,
            },
            {
                localIdentifier: "stack",
                items: referencePointMocks.wrongBucketsOrderReferencePoint.buckets[1].items,
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.wrongBucketsOrderReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            properties: {},
            uiConfig: uiConfigMocks.oneMetricAndManyCategoriesBaseUiConfig,
        });
    });

    it("should use second non-date attribute when switching to chart with [attribute, date, attribute]", async () => {
        const baseChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleAttributesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: referencePointMocks.multipleAttributesReferencePoint.buckets[1].items.slice(0, 1),
            },
            {
                localIdentifier: "stack",
                items: referencePointMocks.multipleAttributesReferencePoint.buckets[1].items.slice(1, 2),
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.multipleAttributesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            properties: {},
            uiConfig: uiConfigMocks.multipleAttributesBaseUiConfig,
        });
    });

    it("should cut out measures tail when getting nM 0Vb 1Sb", async () => {
        const baseChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsOneStackByReferencePoint.buckets[0].items.slice(
                    0,
                    1,
                ),
            },
            {
                localIdentifier: "view",
                items: [],
            },
            {
                localIdentifier: "stack",
                items: referencePointMocks.multipleMetricsOneStackByReferencePoint.buckets[2].items,
            },
        ];

        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };
        const expectedUiConfig = {
            ...uiConfigMocks.oneMetricAndManyCategoriesBaseUiConfig,
            ...uiConfigMocks.defaultColumnRecommendations,
        };

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsOneStackByReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            properties: {},
            uiConfig: expectedUiConfig,
        });
    });

    it("should remove invalid sorts from reference point", async () => {
        const baseChart = createComponent();

        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.oneMetricAndManyCategoriesReferencePointWithInvalidSort,
        );
        expect(extendedReferencePoint.properties).toEqual({});
    });

    it("should not return derived measures when stack-by is there", async () => {
        const baseChart = createComponent();
        const extendedReferencePoint = await baseChart.getExtendedReferencePoint(
            referencePointMocks.measureWithDerivedAsFirstWithStackRefPoint,
        );

        const measures = extendedReferencePoint.buckets[0].items;

        expect(measures).toEqual(referencePointMocks.masterMeasureItems.slice(0, 1));
    });

    describe("Over Time Comparison", () => {
        it("should place new derived bucket items to right place in referencePoint buckets", async () => {
            const baseChart = createComponent();

            const referencePointWithDerivedItems = await baseChart.addNewDerivedBucketItems(
                referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
                [referencePointMocks.derivedMeasureItems[0], referencePointMocks.derivedMeasureItems[1]],
            );

            expect(referencePointWithDerivedItems).toEqual({
                ...referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
                ...{
                    buckets: [
                        {
                            localIdentifier: BucketNames.MEASURES,
                            items: [
                                referencePointMocks.derivedMeasureItems[0],
                                referencePointMocks.masterMeasureItems[0],
                                referencePointMocks.derivedMeasureItems[1],
                                referencePointMocks.masterMeasureItems[1],
                                referencePointMocks.masterMeasureItems[2],
                                referencePointMocks.masterMeasureItems[3],
                            ],
                        },
                        referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[1],
                        referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[2],
                    ],
                },
            });
        });

        it("should return reference point containing uiConfig with no supported comparison types", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint.uiConfig.supportedOverTimeComparisonTypes).toEqual([]);
        });
    });
});
