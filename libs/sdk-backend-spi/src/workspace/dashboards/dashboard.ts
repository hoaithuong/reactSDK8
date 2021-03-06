// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { Layout } from "./layout";
import { IFilterContext, ITempFilterContext } from "./filterContext";
import {
    GUID,
    DateFilterConfigMode,
    DateFilterGranularity,
    IDashboardAddedPresets,
} from "./extendedDateFilters";
import { IScheduledMail } from "./scheduledMail";

/**
 * Extended date filter config
 * @alpha
 */
export interface IDateFilterConfig {
    /**
     * Extended date filter name
     */
    filterName: string;

    /**
     * Extended date filter config mode
     */
    mode: DateFilterConfigMode;

    /**
     * Options to hide
     */
    hideOptions?: GUID[];

    /**
     * Granularities to hide
     */
    hideGranularities?: DateFilterGranularity[];

    /**
     * Added date filter presets
     */
    addPresets?: IDashboardAddedPresets;
}

/**
 * Analytical dashboard consists of widgets
 * (widgets are kpis or insights with additional settings - drilling and alerting),
 * layout (which defines rendering and ordering of these widgets),
 * and filter context (configured attribute and date filters).
 * It's also possible to setup scheduled emails for the dashboard
 * (user will receive an email with the exported dashboard attached at the specified time interval),
 * and optionally extended date filter config.
 * @alpha
 */
export interface IDashboardDefinition {
    /**
     * Dashboard title
     */
    readonly title: string;

    /**
     * Dashboard description
     */
    readonly description: string;

    /**
     * Created date
     */
    readonly created: string;

    /**
     * Updated date
     */
    readonly updated: string;

    /**
     * The layout of the dashboard determines the dashboard widgets {@link IWidget} and where they are rendered
     */
    readonly layout?: Layout;

    /**
     * Dashboard scheduled emails
     */
    readonly scheduledMails: IScheduledMail[];

    /**
     * Dashboard filter context, or temporary filter context
     * (temporary filter context is used to override original filter context during the export)
     */
    readonly filterContext: IFilterContext | ITempFilterContext | undefined;

    /**
     * Dashboard extended date filter config
     */
    readonly dateFilterConfig?: IDateFilterConfig;
}

/**
 * Listed dashboard - to display the dashboard in the list
 * Only a subset of dashboard data is available,
 * for the full definition see {@link IDashboard}
 * @alpha
 */
export interface IListedDashboard {
    /**
     * Dashboard object ref
     */
    readonly ref: ObjRef;

    /**
     * Dashboard uri
     */
    readonly uri: string;

    /**
     * Dashboard identifier
     */
    readonly identifier: string;

    /**
     * Dashboard title
     */
    readonly title: string;

    /**
     * Dashboard description
     */
    readonly description: string;

    /**
     * Created date
     */
    readonly created: string;

    /**
     * Updated date
     */
    readonly updated: string;
}

/**
 * See {@link IDashboardDefinition}
 * @alpha
 */
export interface IDashboard extends IDashboardDefinition {
    /**
     * Dashboard object ref
     */
    readonly ref: ObjRef;

    /**
     * Dashboard uri
     */
    readonly uri: string;

    /**
     * Dashboard identifier
     */
    readonly identifier: string;
}
