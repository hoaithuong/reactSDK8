// (C) 2020 GoodData Corporation

import {
    DEFAULT_BULLET_GRAY_COLOR,
    getColorByGuid,
    getColorFromMapping,
    getLighterColorFromRGB,
    getRgbStringFromRGB,
} from "../../utils/color";
import {
    getOccupiedMeasureBucketsLocalIdentifiers,
    isComparativeSeries,
    isPrimarySeries,
    isTargetSeries,
} from "../chartOptions/bulletChartOptions";
import { IColorPalette, Identifier, isColorFromPalette, isRgbColor, IColor } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces";
import { IMeasureDescriptor, IMeasureGroupDescriptor } from "@gooddata/sdk-backend-spi";
import { findMeasureGroupInDimensions } from "../../utils/executionResultHelper";
import { IColorAssignment, DataViewFacade } from "@gooddata/sdk-ui";
import { ColorStrategy, ICreateColorAssignmentReturnValue, isValidMappedColor } from "./base";

class BulletChartColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        _viewByAttribute: any,
        _stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const occupiedMeasureBucketsLocalIdentifiers = getOccupiedMeasureBucketsLocalIdentifiers(dv);
        const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());

        const defaultColorsAssignment = this.getDefaultColorAssignment(
            colorPalette,
            measureGroup,
            occupiedMeasureBucketsLocalIdentifiers,
        );

        const colorAssignment = measureGroup.items.map(headerItem => {
            const color: IColor = this.mapMeasureColor(
                headerItem,
                colorPalette,
                colorMapping,
                dv,
                defaultColorsAssignment,
            );

            return {
                headerItem,
                color,
            };
        });

        return {
            fullColorAssignment: colorAssignment,
        };
    }

    protected createPalette(colorPalette: IColorPalette, colorAssignments: IColorAssignment[]): string[] {
        return colorAssignments
            .map((colorAssignment, index) => {
                if (isRgbColor(colorAssignment.color)) {
                    return colorAssignment.color.value;
                } else if (isColorFromPalette(colorAssignment.color)) {
                    return getColorByGuid(colorPalette, colorAssignment.color.value as string, index);
                }
            })
            .filter(color => typeof color !== "undefined")
            .map(color => getRgbStringFromRGB(color));
    }

    protected mapMeasureColor(
        headerItem: IMeasureDescriptor,
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        dv: DataViewFacade,
        defaultColorsAssignment: IColorAssignment[],
    ): IColor {
        const mappedColor = getColorFromMapping(headerItem, colorMapping, dv);
        if (isValidMappedColor(mappedColor, colorPalette)) {
            return mappedColor;
        }

        const defaultColorAssignment = defaultColorsAssignment.find(
            (colorAssignment: IColorAssignment) =>
                (colorAssignment.headerItem as IMeasureDescriptor).measureHeaderItem.localIdentifier ===
                headerItem.measureHeaderItem.localIdentifier,
        );

        return defaultColorAssignment.color;
    }

    private getDefaultColorAssignment(
        colorPalette: IColorPalette,
        measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
        occupiedMeasureBucketsLocalIdentifiers: Identifier[],
    ): IColorAssignment[] {
        return measureGroup.items.map(
            (headerItem: IMeasureDescriptor, index: number): IColorAssignment => {
                const color: IColor =
                    (isPrimarySeries(index, occupiedMeasureBucketsLocalIdentifiers) && {
                        type: "guid",
                        value: colorPalette[0].guid,
                    }) ||
                    (isTargetSeries(index, occupiedMeasureBucketsLocalIdentifiers) && {
                        type: "rgb",
                        value: getLighterColorFromRGB(colorPalette[0].fill, -0.3),
                    }) ||
                    (isComparativeSeries(index, occupiedMeasureBucketsLocalIdentifiers) && {
                        type: "rgb",
                        value: DEFAULT_BULLET_GRAY_COLOR,
                    });

                return {
                    headerItem,
                    color,
                };
            },
        );
    }
}

export default BulletChartColorStrategy;
