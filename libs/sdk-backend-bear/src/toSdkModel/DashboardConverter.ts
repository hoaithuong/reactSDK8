// (C) 2019-2020 GoodData Corporation

import {
    GdcMetadata,
    GdcDashboard,
    GdcFilterContext,
    GdcVisualizationWidget,
    GdcKpi,
    GdcDashboardLayout,
    GdcVisualizationObject,
    GdcExtendedDateFilters,
    GdcVisualizationClass,
} from "@gooddata/gd-bear-model";
import { uriRef, UriRef } from "@gooddata/sdk-model";
import {
    IListedDashboard,
    IDashboard,
    IWidget,
    IFilterContext,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    Layout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IDateFilterConfig,
    IDashboardAddedPresets,
    ITempFilterContext,
    isWidget,
    isDashboardDateFilter,
    IDashboardFilterReference,
    IDashboardDateFilterReference,
    IDashboardAttributeFilterReference,
    IFluidLayout,
} from "@gooddata/sdk-backend-spi";

type DashboardDependency = IWidget | IFilterContext | ITempFilterContext;

export type BearDashboardDependency =
    | GdcVisualizationWidget.IWrappedVisualizationWidget
    | GdcKpi.IWrappedKPI
    | GdcFilterContext.IWrappedFilterContext
    | GdcFilterContext.IWrappedTempFilterContext
    | GdcVisualizationObject.IVisualization;

export const convertListedDashboard = (dashboardLink: GdcMetadata.IObjectLink): IListedDashboard => ({
    ref: uriRef(dashboardLink.link),
    identifier: dashboardLink.identifier!,
    uri: dashboardLink.link,
    title: dashboardLink.title!,
    description: dashboardLink.summary!,
    updated: dashboardLink.updated!,
    created: dashboardLink.created!,
});

const convertLayoutColumn = (
    column: GdcDashboardLayout.IFluidLayoutColumn,
    widgetDependencies: IWidget[],
): IFluidLayoutColumn => {
    const { content } = column;
    if (GdcDashboardLayout.isLayoutWidget(content)) {
        const widget = widgetDependencies.find(dep => {
            const { qualifier } = content.widget;
            if (GdcVisualizationObject.isObjUriQualifier(qualifier)) {
                return qualifier.uri === dep.uri;
            }
            return qualifier.identifier === dep.identifier;
        }) as IWidget;

        return {
            ...column,
            content: {
                widget,
            },
        };
    }
    return {
        ...column,
        content: content && convertLayout(content, widgetDependencies),
    };
};

const convertLayoutRow = (
    row: GdcDashboardLayout.IFluidLayoutRow,
    widgetDependencies: IWidget[],
): IFluidLayoutRow => {
    return {
        ...row,
        columns: row.columns.map(column => convertLayoutColumn(column, widgetDependencies)),
    };
};

const convertLayout = (layout: GdcDashboardLayout.Layout, widgetDependencies: IWidget[]): Layout => {
    const {
        fluidLayout: { rows },
        fluidLayout,
    } = layout;
    const convertedLayout: Layout = {
        fluidLayout: {
            ...fluidLayout,
            rows: rows.map(row => convertLayoutRow(row, widgetDependencies)),
        },
    };
    return convertedLayout;
};

const convertDateFilterConfigAddedPresets = (
    addPresets: GdcExtendedDateFilters.IDashboardAddedPresets,
): IDashboardAddedPresets => {
    const { absolutePresets = [], relativePresets = [] } = addPresets;
    const convertedPresets: IDashboardAddedPresets = {
        absolutePresets: absolutePresets.map(preset => ({ ...preset, type: "absolutePreset" })),
        relativePresets: relativePresets.map(preset => ({ ...preset, type: "relativePreset" })),
    };
    return convertedPresets;
};

const convertDateFilterConfig = (
    dateFilterConfig: GdcExtendedDateFilters.IDashboardDateFilterConfig,
): IDateFilterConfig => {
    const { filterName, mode, addPresets, hideGranularities, hideOptions } = dateFilterConfig;

    return {
        filterName,
        mode,
        addPresets: addPresets && convertDateFilterConfigAddedPresets(addPresets),
        hideGranularities,
        hideOptions,
    };
};

function isNotTemporaryAllTimeDateFilter(filter: FilterContextItem): boolean {
    if (isDashboardDateFilter(filter)) {
        const isNotTemporaryAllTimeDateFilter =
            filter.dateFilter.from !== undefined || filter.dateFilter.to !== undefined;
        return isNotTemporaryAllTimeDateFilter;
    }

    return true;
}

// Remove the temporary "All Time" date filter from filter context when exporting the dashboard
export const sanitizeExportFilterContext = (
    exportFilterContext: IFilterContext | ITempFilterContext,
): IFilterContext | ITempFilterContext => {
    return {
        ...exportFilterContext,
        filters: exportFilterContext.filters.filter(isNotTemporaryAllTimeDateFilter),
    };
};

export const convertDashboard = (
    dashboard: GdcDashboard.IWrappedAnalyticalDashboard,
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
    exportFilterContextUri?: string,
): IDashboard => {
    const {
        meta: { summary, created, updated, identifier, uri, title },
        content: { layout, filterContext, dateFilterConfig, widgets: widgetsUris },
    } = dashboard.analyticalDashboard;

    const sdkDependencies = dependencies
        // Filter out visualization objects - we only need them to create implicit layout
        .filter(d => !GdcVisualizationObject.isVisualization(d))
        .map(convertDashboardDependency);
    const unsortedWidgets = sdkDependencies.filter(isWidget);
    const widgetByUri = unsortedWidgets.reduce((acc: { [uri: string]: IWidget }, el) => {
        return {
            ...acc,
            [el.uri]: el,
        };
    }, {});

    // To preserve the logic of createImplicitDashboardLayout, we must preserve the order of the widgets
    const widgets = widgetsUris.map(widgetUri => widgetByUri[widgetUri]);

    const filterContextOrExportFilterContext = sdkDependencies.find(dep => dep.uri === filterContext) as
        | IFilterContext
        | ITempFilterContext;

    const convertedDashboard: IDashboard = {
        title,
        description: summary,

        identifier,
        uri,
        ref: uriRef(uri),

        created: created!,
        updated: updated!,

        scheduledMails: [], // TODO: https://jira.intgdc.com/browse/RAIL-2220

        dateFilterConfig: dateFilterConfig && convertDateFilterConfig(dateFilterConfig),

        filterContext: exportFilterContextUri
            ? sanitizeExportFilterContext(filterContextOrExportFilterContext)
            : filterContextOrExportFilterContext,
        layout: layout
            ? convertLayout(layout, widgets)
            : createImplicitDashboardLayout(widgets, dependencies, visualizationClasses),
    };

    return convertedDashboard;
};

const convertFilterReference = (
    filterReference:
        | GdcExtendedDateFilters.IDateFilterReference
        | GdcExtendedDateFilters.IAttributeFilterReference,
): IDashboardFilterReference => {
    if (GdcExtendedDateFilters.isDateFilterReference(filterReference)) {
        const convertedDateFilterReference: IDashboardDateFilterReference = {
            type: "dateFilterReference",
            dataSet: uriRef(filterReference.dateFilterReference.dataSet),
        };
        return convertedDateFilterReference;
    }

    const convertedAttributeFilterReference: IDashboardAttributeFilterReference = {
        type: "attributeFilterReference",
        displayForm: uriRef(filterReference.attributeFilterReference.displayForm),
    };

    return convertedAttributeFilterReference;
};

const convertVisualizationWidget = (widget: GdcVisualizationWidget.IWrappedVisualizationWidget): IWidget => {
    const {
        visualizationWidget: {
            content: { visualization, ignoreDashboardFilters, dateDataSet },
            meta: { identifier, uri, title, summary },
        },
    } = widget;

    const convertedWidget: IWidget = {
        type: "insight",
        ref: uriRef(uri),
        identifier,
        uri,
        title,
        description: summary,
        insight: uriRef(visualization),
        dateDataSet: dateDataSet ? uriRef(dateDataSet) : undefined,
        ignoreDashboardFilters: ignoreDashboardFilters
            ? ignoreDashboardFilters.map(convertFilterReference)
            : [],
        drills: [], // (drill to dashboard, or insight) TODO: https://jira.intgdc.com/browse/RAIL-2199
        alerts: [], // not yet supported for insight widgets
    };

    return convertedWidget;
};

const convertKpi = (widget: GdcKpi.IWrappedKPI): IWidget => {
    const {
        kpi: {
            content: { dateDataSet, ignoreDashboardFilters },
            meta: { identifier, uri, title, summary },
        },
    } = widget;

    const convertedWidget: IWidget = {
        type: "kpi",
        ref: uriRef(uri),
        identifier,
        uri,
        title,
        description: summary,
        dateDataSet: dateDataSet ? uriRef(dateDataSet) : undefined,
        ignoreDashboardFilters: ignoreDashboardFilters
            ? ignoreDashboardFilters.map(convertFilterReference)
            : [],
        drills: [], // (drills to old dashboards) - TODO: https://jira.intgdc.com/browse/RAIL-2199
        alerts: [], // TODO: https://jira.intgdc.com/browse/RAIL-2218
    };

    return convertedWidget;
};

const convertFilterContextItem = (
    filterContextItem: GdcFilterContext.FilterContextItem,
): FilterContextItem => {
    if (GdcFilterContext.isAttributeFilter(filterContextItem)) {
        const {
            attributeFilter: { attributeElements, displayForm, negativeSelection },
        } = filterContextItem;

        const convertedFilterContextItem: IDashboardAttributeFilter = {
            attributeFilter: {
                attributeElements: attributeElements.map(uriRef),
                displayForm: uriRef(displayForm),
                negativeSelection,
            },
        };

        return convertedFilterContextItem;
    }
    const {
        dateFilter: { granularity, type, attribute, dataSet, from, to },
    } = filterContextItem;
    const convertedFilterContextItem: IDashboardDateFilter = {
        dateFilter: {
            granularity,
            type,
            from,
            to,
        },
    };
    if (attribute) {
        convertedFilterContextItem.dateFilter.attribute = uriRef(attribute);
    }
    if (dataSet) {
        convertedFilterContextItem.dateFilter.dataSet = uriRef(dataSet);
    }

    return convertedFilterContextItem;
};

const convertFilterContext = (filterContext: GdcFilterContext.IWrappedFilterContext): IFilterContext => {
    const {
        filterContext: {
            content: { filters },
            meta: { identifier, uri, summary, title },
        },
    } = filterContext;

    const convertedFilterContext: IFilterContext = {
        description: summary,
        identifier,
        uri,
        ref: uriRef(uri),
        title,
        filters: filters.map(convertFilterContextItem),
    };

    return convertedFilterContext;
};

const convertTempFilterContext = (
    filterContext: GdcFilterContext.IWrappedTempFilterContext,
): ITempFilterContext => {
    const {
        tempFilterContext: { created, filters, uri },
    } = filterContext;

    const convertedTempFilterContext: ITempFilterContext = {
        uri,
        ref: uriRef(uri),
        filters: filters.map(convertFilterContextItem),
        created,
    };

    return convertedTempFilterContext;
};

export const convertDashboardDependency = (dependency: BearDashboardDependency): DashboardDependency => {
    if (GdcVisualizationWidget.isWrappedVisualizationWidget(dependency)) {
        return convertVisualizationWidget(dependency);
    } else if (GdcKpi.isWrappedKpi(dependency)) {
        return convertKpi(dependency);
    } else if (GdcFilterContext.isWrappedFilterContext(dependency)) {
        return convertFilterContext(dependency);
    } else if (GdcFilterContext.isWrappedTempFilterContext(dependency)) {
        return convertTempFilterContext(dependency);
    }

    throw new Error(`No converter for the dashboard dependency!`);
};

const KPI_SIZE = 2;
const VISUALIZATION_SIZE = 12;

/**
 * Create {@link IFluidLayout} from {@link IWidget} items. As widgets do not contain any layout information,
 * implicit layout with a single row will be generated.
 *
 * @returns fluid layout created from the widgets
 */
export function createImplicitDashboardLayout(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IFluidLayout | undefined {
    if (widgets.length < 1) {
        return undefined;
    }
    const rows = createRows(widgets, dependencies, visualizationClasses);

    return {
        fluidLayout: {
            rows,
        },
    };
}

function createRows(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IFluidLayoutRow[] {
    return [{ columns: createColumns(widgets, dependencies, visualizationClasses) }];
}

function createColumns(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IFluidLayoutColumn[] {
    return widgets.map(widget => createColumn(widget, dependencies, visualizationClasses));
}

function createColumn(
    widget: IWidget,
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IFluidLayoutColumn {
    return {
        content: {
            widget,
        },
        size: { xl: { width: findImplicitWidgetWidth(widget, dependencies, visualizationClasses) } },
    };
}

function findImplicitWidgetWidth(
    widget: IWidget,
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
) {
    if (widget.type === "kpi") {
        return KPI_SIZE;
    }

    const visualizationUri = (widget.insight as UriRef).uri;
    const vis = dependencies.find(
        v => GdcVisualizationObject.isVisualization(v) && v.visualizationObject.meta.uri === visualizationUri,
    ) as GdcVisualizationObject.IVisualization;
    const visualizationClassUri = vis.visualizationObject.content.visualizationClass.uri;
    const visualizationClass = visualizationClasses.find(
        visClass => visClass.visualizationClass.meta.uri === visualizationClassUri,
    );
    return getVisualizationLegacyWidth(visualizationClass!);
}

function getVisualizationLegacyWidth(visualizationClass: GdcVisualizationClass.IVisualizationClassWrapped) {
    const visualizationType = visualizationClass.visualizationClass.content.url.split(":")[1];
    return visualizationType === "headline" ? KPI_SIZE : VISUALIZATION_SIZE;
}
