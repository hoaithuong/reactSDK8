// (C) 2007-2019 GoodData Corporation
import { Heatmap, IHeatmapProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette } from "../../_infra/colors";
import { AmountMeasurePredicate } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { HeatmapWithMeasureRowsAndColumns } from "./base";
import { replaceMappingPredicates } from "../_infra/insightConverters";
import { ReferenceLdm } from "@gooddata/reference-workspace";

const colorsAndPalette = scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", HeatmapWithMeasureRowsAndColumns, coloringCustomizer);

const colorAssignment = scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to measures",
        {
            ...HeatmapWithMeasureRowsAndColumns,
            config: {
                colorPalette: CustomColorPalette,
                colorMapping: [
                    {
                        predicate: AmountMeasurePredicate,
                        color: BlackColor,
                    },
                ],
            },
        },
        m => m.withInsightConverter(replaceMappingPredicates(ReferenceLdm.Amount)),
    );

export default [colorsAndPalette, colorAssignment];
