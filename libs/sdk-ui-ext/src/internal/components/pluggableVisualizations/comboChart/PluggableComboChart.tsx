// (C) 2019 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import without = require("lodash/without");
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import { isAreaChart, isLineChart } from "@gooddata/sdk-ui-charts";
import { AXIS, AXIS_NAME } from "../../../constants/axis";

import { BUCKETS, METRIC } from "../../../constants/bucket";
import {
    PROPERTY_CONTROLS,
    PROPERTY_CONTROLS_DUAL_AXIS,
    PROPERTY_CONTROLS_PRIMARY_CHART_TYPE,
    PROPERTY_CONTROLS_SECONDARY_CHART_TYPE,
} from "../../../constants/properties";
import { COMBO_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { COMBO_CHART_UICONFIG, UICONFIG_AXIS } from "../../../constants/uiConfig";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
    IVisualizationProperties,
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    applyUiConfig,
    findBucket,
    getAllAttributeItemsWithPreference,
    getAllMeasuresShowOnSecondaryAxis,
    getBucketItemsByType,
    getBucketItemsWithExcludeByType,
    getMeasureItems,
    hasBucket,
    sanitizeFilters,
    setMeasuresShowOnSecondaryAxis,
} from "../../../utils/bucketHelper";
import { getMasterMeasuresCount } from "../../../utils/bucketRules";
import {
    getReferencePointWithSupportedProperties,
    isDualAxisOrSomeSecondaryAxisMeasure,
    setSecondaryMeasures,
} from "../../../utils/propertiesHelper";
import { removeSort } from "../../../utils/sort";

import { setComboChartUiConfig } from "../../../utils/uiConfigHelpers/comboChartUiConfigHelper";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";

export class PluggableComboChart extends PluggableBaseChart {
    private primaryChartType: string = VisualizationTypes.COLUMN;

    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.COMBO;
        this.axis = AXIS.DUAL;
        this.secondaryAxis = AXIS_NAME.SECONDARY_Y;
        this.primaryChartType = get(
            props.visualizationProperties,
            PROPERTY_CONTROLS_PRIMARY_CHART_TYPE,
            VisualizationTypes.COLUMN,
        );
        this.supportedPropertiesList = this.getSupportedPropertiesList();
        this.defaultControlsProperties = {
            stackMeasures: this.isStackMeasuresByDefault(),
        };
        this.initializeProperties(props.visualizationProperties);
    }

    public getSupportedPropertiesList() {
        return COMBO_CHART_SUPPORTED_PROPERTIES[this.axis] || [];
    }

    public getUiConfig(): IUiConfig {
        return cloneDeep({
            ...COMBO_CHART_UICONFIG,
            optionalStacking: {
                supported: true,
                disabled: isLineChart(this.primaryChartType),
                stackMeasures: this.isStackMeasuresByDefault(),
            },
        });
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const properties = this.configureChartTypes(clonedReferencePoint);
        this.primaryChartType = get(properties, "controls.primaryChartType", VisualizationTypes.COLUMN);

        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            properties,
            uiConfig: this.getUiConfig(),
        };

        this.defaultControlsProperties = {
            stackMeasures: this.isStackMeasuresByDefault(),
        };

        this.configureBuckets(newReferencePoint);
        newReferencePoint = setSecondaryMeasures(newReferencePoint, this.secondaryAxis);

        this.axis = get(newReferencePoint, UICONFIG_AXIS, AXIS.PRIMARY);

        this.supportedPropertiesList = this.getSupportedPropertiesList();

        newReferencePoint = setComboChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, this.isPercentDisabled(newReferencePoint));
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = applyUiConfig(newReferencePoint);
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    public isStackMeasuresByDefault() {
        return isAreaChart(this.primaryChartType);
    }

    protected configureBuckets(extReferencePoint: IExtendedReferencePoint): void {
        const buckets: IBucketOfFun[] = get(extReferencePoint, BUCKETS, []);
        const attributes: IBucketItem[] = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.TREND,
            BucketNames.VIEW,
        ]).slice(0, 1);

        let measures: IBucketItem[] = [];
        let secondaryMeasures: IBucketItem[] = [];

        // ref. point has both my buckets -> reuse them fully
        if (hasBucket(buckets, BucketNames.MEASURES) && hasBucket(buckets, BucketNames.SECONDARY_MEASURES)) {
            measures = getBucketItemsByType(buckets, BucketNames.MEASURES, [METRIC]);
            secondaryMeasures = getBucketItemsByType(buckets, BucketNames.SECONDARY_MEASURES, [METRIC]);

            const restMeasures = getBucketItemsWithExcludeByType(
                buckets,
                [BucketNames.MEASURES, BucketNames.SECONDARY_MEASURES],
                [METRIC],
            );
            secondaryMeasures = secondaryMeasures.concat(restMeasures);
        } else {
            // transform from dual axis chart to combo chart
            const allMeasures = getMeasureItems(buckets);
            secondaryMeasures = getAllMeasuresShowOnSecondaryAxis(buckets);
            measures = without(allMeasures, ...secondaryMeasures);
        }

        const isDualAxisEnabled = isDualAxisOrSomeSecondaryAxisMeasure(extReferencePoint, secondaryMeasures);

        set(extReferencePoint, PROPERTY_CONTROLS_DUAL_AXIS, isDualAxisEnabled);

        const primaryChartType = get(
            extReferencePoint,
            PROPERTY_CONTROLS_PRIMARY_CHART_TYPE,
            VisualizationTypes.COLUMN,
        );
        const secondaryChartType = get(
            extReferencePoint,
            PROPERTY_CONTROLS_SECONDARY_CHART_TYPE,
            VisualizationTypes.LINE,
        );

        set(extReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: setMeasuresShowOnSecondaryAxis(measures, false),
                chartType: primaryChartType,
            },
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: setMeasuresShowOnSecondaryAxis(secondaryMeasures, isDualAxisEnabled),
                chartType: secondaryChartType,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: attributes,
            },
        ]);
    }

    private configureChartTypes(referencePoint: IReferencePoint): IVisualizationProperties {
        const buckets: IBucketOfFun[] = get(referencePoint, BUCKETS, []);
        const controls = get(referencePoint, PROPERTY_CONTROLS, {});
        const primaryChartType = get(
            findBucket(buckets, BucketNames.MEASURES),
            "chartType",
            controls.primaryChartType || VisualizationTypes.COLUMN,
        );
        const secondaryChartType = get(
            findBucket(buckets, BucketNames.SECONDARY_MEASURES),
            "chartType",
            controls.secondaryChartType || VisualizationTypes.LINE,
        );

        if (primaryChartType || secondaryChartType) {
            return {
                ...referencePoint.properties,
                controls: {
                    ...controls,
                    primaryChartType,
                    secondaryChartType,
                },
            };
        }

        return referencePoint.properties;
    }

    private isPercentDisabled(extReferencePoint: IExtendedReferencePoint): boolean {
        if (this.axis === AXIS.DUAL) {
            return false;
        }

        const buckets: IBucketOfFun[] = get(extReferencePoint, BUCKETS, []);
        const primaryMasterMeasures: number = getMasterMeasuresCount(buckets, BucketNames.MEASURES);
        const secondaryMasterMeasures: number = getMasterMeasuresCount(
            buckets,
            BucketNames.SECONDARY_MEASURES,
        );

        // disable percent if there is more than one measure on primary/secondary y-axis
        return primaryMasterMeasures + secondaryMasterMeasures > 1;
    }
}
