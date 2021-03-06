// (C) 2020 GoodData Corporation

import { getMVS } from "../../test/helper";
import { IColorMapping } from "../../../../interfaces";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { IColorStrategy } from "../base";
import { ColorFactory } from "../../colorFactory";
import { CUSTOM_COLOR_PALETTE } from "../../test/colorPalette.fixture";
import { ScatterPlotColorStrategy } from "../scatterPlot";
import { ReferenceRecordings, ReferenceLdm } from "@gooddata/reference-workspace";
import range = require("lodash/range");
import { recordedDataFacade } from "../../../../../__mocks__/recordings";

describe("ScatterPlotColorStrategy", () => {
    it("should create palette with same color from first measure for all attribute elements", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.ScatterPlot.XAndYAxisMeasuresAndAttribute,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "scatter";

        const expectedColor = "rgb(0,0,0)";
        const colorMapping: IColorMapping[] = [
            {
                predicate: HeaderPredicates.localIdentifierMatch(ReferenceLdm.Amount),
                color: {
                    type: "rgb",
                    value: {
                        r: 0,
                        g: 0,
                        b: 0,
                    },
                },
            },
        ];

        const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
            CUSTOM_COLOR_PALETTE,
            colorMapping,
            viewByAttribute,
            stackByAttribute,
            dv,
            type,
        );

        expect(colorStrategy).toBeInstanceOf(ScatterPlotColorStrategy);
        expect(colorStrategy.getColorAssignment().length).toEqual(1);
        range(6).map(itemIndex => {
            expect(colorStrategy.getColorByIndex(itemIndex)).toEqual(expectedColor);
        });
    });
});
