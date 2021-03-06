// (C) 2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";
import { IWidgetAlert } from "./alert";
import { IDashboardFilterReference } from "./filterContext";

/**
 * Widget drill definition
 * @alpha
 */
export type DrillDefinition = IDrillToInsight | IDrillToDashboard;

/**
 * Drill origin type
 * @alpha
 */
export type DrillOriginType = "drillFromMeasure";

/**
 * Drill origin
 * @alpha
 */
export type DrillOrigin = IDrillFromMeasure;

/**
 * Drill transition
 * @alpha
 */
export type DrillTransition = "pop-up" | "in-place";

/**
 * Drill type
 * @alpha
 */
export type DrillType = "drillToInsight" | "drillToDashboard" | "drillToLegacyDashboard";

/**
 * Drill origin base type
 * @alpha
 */
export interface IDrillOrigin {
    /**
     * Drill origin type
     */
    type: DrillOriginType;
}

/**
 * Drill from measure
 * @alpha
 */
export interface IDrillFromMeasure extends IDrillOrigin {
    /**
     * Drill origin type
     */
    type: "drillFromMeasure";

    /**
     * Measure object ref
     */
    measure: ObjRef;
}

/**
 * Drill base type
 * @alpha
 */
export interface IDrill {
    /**
     * Drill type
     */
    type: DrillType;

    /**
     * Drill transition
     */
    transition: DrillTransition;

    /**
     * Drill origin
     */
    origin: DrillOrigin;

    /**
     * Drill target object ref
     */
    target: ObjRef;
}

/**
 * Drill to PP dashboard
 * @alpha
 */
export interface IDrillToLegacyDashboard extends IDrill {
    /**
     * Drill type
     */
    type: "drillToLegacyDashboard";

    /**
     * Drill transition
     */
    transition: "pop-up";
}

/**
 * Drill to dashboard
 * @alpha
 */
export interface IDrillToDashboard extends IDrill {
    /**
     * Drill type
     */
    type: "drillToDashboard";

    /**
     * Drill transition
     */
    transition: "in-place";
}

/**
 * Drill to insight
 * @alpha
 */
export interface IDrillToInsight extends IDrill {
    /**
     * Drill type
     */
    type: "drillToInsight";

    /**
     * Drill transition
     */
    transition: "pop-up";
}

/**
 * Temporary type to distinguish between kpi and insight
 * @alpha
 */
export type WidgetType = "kpi" | "insight";

/**
 * Widgets are insights or kpis with additional settings - drilling and alerting
 * @alpha
 */
export interface IWidgetDefinition {
    /**
     * Widget title
     */
    readonly title: string;

    /**
     * Widget description
     */
    readonly description: string;

    /**
     * Ignore particular dashboard filters in the current widget
     */
    readonly ignoreDashboardFilters: IDashboardFilterReference[];

    /**
     * Date data set widget is connected to
     */
    readonly dateDataSet?: ObjRef;

    /**
     * Widget type - kpi or insight
     */
    readonly type: WidgetType;

    /**
     * Widget insight object reference (when widget is not kpi)
     */
    readonly insight?: ObjRef;

    /**
     * Widget drills
     */
    readonly drills: DrillDefinition[];

    /**
     * Widget alerts (currently, only kpi supports alerting)
     */
    readonly alerts: IWidgetAlert[];
}

/**
 * See {@link IWidgetDefinition}]
 * @alpha
 */
export interface IWidget extends IWidgetDefinition {
    /**
     * Visualization widget or kpi object ref
     */
    readonly ref: ObjRef;

    /**
     * Visualization widget or kpi uri
     */
    readonly uri: string;

    /**
     * Visualization widget or kpi identifier
     */
    readonly identifier: string;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidget}.
 * @alpha
 */
export function isWidget(obj: any): obj is IWidget {
    return !isEmpty(obj) && ((obj as IWidget).type === "kpi" || (obj as IWidget).type === "insight");
}
