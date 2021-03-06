## API Report File for "@gooddata/sdk-backend-spi"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { CatalogItem } from '@gooddata/sdk-model';
import { CatalogItemType } from '@gooddata/sdk-model';
import { DimensionGenerator } from '@gooddata/sdk-model';
import { IAttributeDisplayFormMetadataObject } from '@gooddata/sdk-model';
import { IAttributeElement } from '@gooddata/sdk-model';
import { IAttributeMetadataObject } from '@gooddata/sdk-model';
import { IAttributeOrMeasure } from '@gooddata/sdk-model';
import { IBucket } from '@gooddata/sdk-model';
import { ICatalogAttribute } from '@gooddata/sdk-model';
import { ICatalogDateDataset } from '@gooddata/sdk-model';
import { ICatalogFact } from '@gooddata/sdk-model';
import { ICatalogGroup } from '@gooddata/sdk-model';
import { ICatalogMeasure } from '@gooddata/sdk-model';
import { IColorPalette } from '@gooddata/sdk-model';
import { IDataset } from '@gooddata/sdk-model';
import { IDimension } from '@gooddata/sdk-model';
import { IExecutionDefinition } from '@gooddata/sdk-model';
import { IFilter } from '@gooddata/sdk-model';
import { IInsight } from '@gooddata/sdk-model';
import { IInsightDefinition } from '@gooddata/sdk-model';
import { IMeasureExpressionToken } from '@gooddata/sdk-model';
import { IMetadataObject } from '@gooddata/sdk-model';
import { ISortItem } from '@gooddata/sdk-model';
import { IVisualizationClass } from '@gooddata/sdk-model';
import { IWorkspace } from '@gooddata/sdk-model';
import { IWorkspacePermissions } from '@gooddata/sdk-model';
import { ObjectType } from '@gooddata/sdk-model';
import { ObjRef } from '@gooddata/sdk-model';
import { SortDirection } from '@gooddata/sdk-model';
import { WorkspacePermission } from '@gooddata/sdk-model';

// @public
export type AbsoluteDateFilterOption = IAbsoluteDateFilterForm | IAbsoluteDateFilterPreset;

// @public
export type AbsoluteFormType = "absoluteForm";

// @public
export type AbsolutePresetType = "absolutePreset";

// @alpha
export type AbsoluteType = "absolute";

// @public
export type AllTimeType = "allTime";

// @public
export type AnalyticalBackendConfig = {
    readonly hostname?: string;
};

// @public
export abstract class AnalyticalBackendError extends Error {
    protected constructor(message: string, abeType: string, cause?: Error | undefined);
    // (undocumented)
    readonly abeType: string;
    // (undocumented)
    readonly cause?: Error | undefined;
}

// @public
export const AnalyticalBackendErrorTypes: {
    NO_DATA: string;
    DATA_TOO_LARGE: string;
    PROTECTED_DATA: string;
    UNEXPECTED_HTTP: string;
    UNEXPECTED: string;
    NOT_SUPPORTED: string;
    NOT_IMPLEMENTED: string;
    NOT_AUTHENTICATED: string;
};

// @public
export type AnalyticalBackendFactory = (config?: AnalyticalBackendConfig, implConfig?: any) => IAnalyticalBackend;

// @public
export function attributeDescriptorLocalId(descriptor: IAttributeDescriptor): string;

// @public
export function attributeDescriptorName(descriptor: IAttributeDescriptor): string;

// @public
export type AuthenticatedPrincipal = {
    userId: string;
    userMeta?: any;
};

// @public
export type AuthenticationContext = {
    client: any;
};

// @public
export type BackendCapabilities = {
    supportsObjectUris?: boolean;
    canCalculateTotals?: boolean;
    canSortData?: boolean;
    supportsElementUris?: boolean;
    maxDimensions?: number;
    canExportCsv?: boolean;
    canExportXlsx?: boolean;
    canTransformExistingResult?: boolean;
    canExecuteByReference?: boolean;
    supportsCsvUploader?: boolean;
    [key: string]: undefined | boolean | number | string;
};

// @public
export class DataTooLargeError extends AnalyticalBackendError {
    constructor(message: string, cause?: Error);
}

// @public
export type DataValue = null | string | number;

// @public
export type DateFilterConfigMode = "readonly" | "hidden" | "active";

// @public
export type DateFilterGranularity = "GDC.time.date" | "GDC.time.week_us" | "GDC.time.month" | "GDC.time.quarter" | "GDC.time.year";

// @public
export type DateFilterOption = IAllTimeDateFilter | AbsoluteDateFilterOption | RelativeDateFilterOption;

// @public
export type DateFilterRelativeOptionGroup = {
    [key in DateFilterGranularity]?: IRelativeDateFilterPresetOfGranularity<key>[];
};

// @alpha
export type DateFilterType = RelativeType | AbsoluteType;

// @public
export type DateString = string;

// @public
export type ErrorConverter = (e: any) => AnalyticalBackendError;

// @alpha
export type FilterContextItem = IDashboardAttributeFilter | IDashboardDateFilter;

// @public
export type GUID = string;

// @public
export interface IAbsoluteDateFilterForm extends IDateFilterOption {
    // (undocumented)
    from?: DateString;
    // (undocumented)
    to?: DateString;
    // (undocumented)
    type: AbsoluteFormType;
}

// @public
export interface IAbsoluteDateFilterPreset extends IDateFilterOption {
    // (undocumented)
    from: DateString;
    // (undocumented)
    to: DateString;
    // (undocumented)
    type: AbsolutePresetType;
}

// @public
export interface IAllTimeDateFilter extends IDateFilterOption {
    // (undocumented)
    type: AllTimeType;
}

// @public
export interface IAnalyticalBackend {
    authenticate(force?: boolean): Promise<AuthenticatedPrincipal>;
    readonly capabilities: BackendCapabilities;
    readonly config: AnalyticalBackendConfig;
    currentUser(): IUserService;
    deauthenticate(): Promise<void>;
    isAuthenticated(): Promise<AuthenticatedPrincipal | null>;
    onHostname(hostname: string): IAnalyticalBackend;
    withAuthentication(provider: IAuthenticationProvider): IAnalyticalBackend;
    withTelemetry(componentName: string, props: object): IAnalyticalBackend;
    workspace(id: string): IAnalyticalWorkspace;
    workspaces(): IWorkspaceQueryFactory;
}

// @public
export interface IAnalyticalWorkspace {
    catalog(): IWorkspaceCatalogFactory;
    // Warning: (ae-incompatible-release-tags) The symbol "dashboards" is marked as @public, but its signature references "IWorkspaceDashboards" which is marked as @alpha
    dashboards(): IWorkspaceDashboards;
    dataSets(): IWorkspaceDatasetsService;
    elements(): IElementQueryFactory;
    execution(): IExecutionFactory;
    insights(): IWorkspaceInsights;
    metadata(): IWorkspaceMetadata;
    permissions(): IWorkspacePermissionsFactory;
    settings(): IWorkspaceSettingsService;
    styling(): IWorkspaceStylingService;
    // (undocumented)
    readonly workspace: string;
}

// @public
export interface IAttributeDescriptor {
    // (undocumented)
    attributeHeader: {
        uri: string;
        identifier: string;
        localIdentifier: string;
        name: string;
        totalItems?: ITotalDescriptor[];
        formOf: {
            uri: string;
            identifier: string;
            name: string;
        };
    };
}

// @public
export interface IAuthenticationProvider {
    authenticate(context: AuthenticationContext): Promise<AuthenticatedPrincipal>;
    deauthenticate(context: AuthenticationContext): Promise<void>;
    getCurrentPrincipal(context: AuthenticationContext): Promise<AuthenticatedPrincipal | null>;
}

// @alpha
export interface IDashboard extends IDashboardDefinition {
    readonly identifier: string;
    readonly ref: ObjRef;
    readonly uri: string;
}

// @public
export interface IDashboardAddedPresets {
    // (undocumented)
    absolutePresets?: IAbsoluteDateFilterPreset[];
    // (undocumented)
    relativePresets?: IRelativeDateFilterPreset[];
}

// @alpha
export interface IDashboardAttachment {
    dashboard: ObjRef;
    filterContext?: ObjRef;
    format: "pdf";
}

// @alpha
export interface IDashboardAttributeFilter {
    // (undocumented)
    attributeFilter: {
        displayForm: ObjRef;
        negativeSelection: boolean;
        attributeElements: ObjRef[];
    };
}

// @alpha
export interface IDashboardAttributeFilterReference {
    displayForm: ObjRef;
    type: "attributeFilterReference";
}

// @alpha
export interface IDashboardDateFilter {
    // (undocumented)
    dateFilter: {
        type: DateFilterType;
        granularity: DateFilterGranularity;
        from?: DateString | number;
        to?: DateString | number;
        dataSet?: ObjRef;
        attribute?: ObjRef;
    };
}

// @alpha
export interface IDashboardDateFilterReference {
    dataSet: ObjRef;
    type: "dateFilterReference";
}

// @alpha
export interface IDashboardDefinition {
    readonly created: string;
    readonly dateFilterConfig?: IDateFilterConfig;
    readonly description: string;
    readonly filterContext: IFilterContext | ITempFilterContext | undefined;
    readonly layout?: Layout;
    readonly scheduledMails: IScheduledMail[];
    readonly title: string;
    readonly updated: string;
}

// @alpha
export type IDashboardFilterReference = IDashboardDateFilterReference | IDashboardAttributeFilterReference;

// @public
export interface IDataView {
    readonly count: number[];
    readonly data: DataValue[][] | DataValue[];
    readonly definition: IExecutionDefinition;
    equals(other: IDataView): boolean;
    fingerprint(): string;
    readonly headerItems: IResultHeader[][][];
    readonly offset: number[];
    readonly result: IExecutionResult;
    readonly totalCount: number[];
    readonly totals?: DataValue[][][];
}

// @alpha
export interface IDateFilterConfig {
    addPresets?: IDashboardAddedPresets;
    filterName: string;
    hideGranularities?: DateFilterGranularity[];
    hideOptions?: GUID[];
    mode: DateFilterConfigMode;
}

// @public
export interface IDateFilterOption {
    // (undocumented)
    localIdentifier: GUID;
    // (undocumented)
    name: string;
    // (undocumented)
    type: OptionType;
    // (undocumented)
    visible: boolean;
}

// @public
export interface IDateFilterOptionsByType {
    // (undocumented)
    absoluteForm?: IAbsoluteDateFilterForm;
    // (undocumented)
    absolutePreset?: IAbsoluteDateFilterPreset[];
    // (undocumented)
    allTime?: IAllTimeDateFilter;
    // (undocumented)
    relativeForm?: IRelativeDateFilterForm;
    // (undocumented)
    relativePreset?: DateFilterRelativeOptionGroup;
}

// @public
export interface IDimensionDescriptor {
    // (undocumented)
    headers: IDimensionItemDescriptor[];
}

// @public
export type IDimensionItemDescriptor = IMeasureGroupDescriptor | IAttributeDescriptor;

// @public
export interface IElementQuery {
    query(): Promise<IElementQueryResult>;
    withLimit(limit: number): IElementQuery;
    withOffset(offset: number): IElementQuery;
    withOptions(options: IElementQueryOptions): IElementQuery;
}

// @public
export interface IElementQueryFactory {
    forDisplayForm(ref: ObjRef): IElementQuery;
}

// @public
export interface IElementQueryOptions {
    complement?: boolean;
    filter?: string;
    includeTotalCountWithoutFilters?: boolean;
    order?: SortDirection;
    prompt?: string;
    restrictiveDefinition?: string;
    restrictiveDefinitionContent?: object;
    uris?: string[];
}

// @public
export interface IElementQueryResult extends IPagedResource<IAttributeElement> {
}

// @public
export interface IExecutionFactory {
    forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution;
    forDefinition(def: IExecutionDefinition): IPreparedExecution;
    forInsight(insight: IInsightDefinition, filters?: IFilter[]): IPreparedExecution;
    forInsightByRef(uri: string, filters?: IFilter[]): Promise<IPreparedExecution>;
    forItems(items: IAttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution;
}

// @public
export interface IExecutionResult {
    readonly definition: IExecutionDefinition;
    readonly dimensions: IDimensionDescriptor[];
    equals(other: IExecutionResult): boolean;
    export(options: IExportConfig): Promise<IExportResult>;
    fingerprint(): string;
    readAll(): Promise<IDataView>;
    readWindow(offset: number[], size: number[]): Promise<IDataView>;
    transform(): IPreparedExecution;
}

// @public
export interface IExportConfig {
    format?: "xlsx" | "csv" | "raw";
    mergeHeaders?: boolean;
    showFilters?: boolean;
    title?: string;
}

// @public
export interface IExportResult {
    // (undocumented)
    uri: string;
}

// @public
export interface IExtendedDateFilterErrors {
    // (undocumented)
    absoluteForm?: {
        from?: string;
        to?: string;
    };
    // (undocumented)
    relativeForm?: {
        from?: string;
        to?: string;
    };
}

// @alpha
export interface IFilterContext extends IFilterContextDefinition {
    // (undocumented)
    readonly identifier: string;
    // (undocumented)
    readonly ref: ObjRef;
    // (undocumented)
    readonly uri: string;
}

// @alpha
export interface IFilterContextDefinition {
    readonly description: string;
    readonly filters: FilterContextItem[];
    readonly title: string;
}

// @alpha
export interface IFluidLayout {
    // (undocumented)
    fluidLayout: {
        rows: IFluidLayoutRow[];
        size?: IFluidLayoutSize;
        style?: string;
    };
}

// @alpha
export interface IFluidLayoutColSize {
    lg?: IFluidLayoutSize;
    md?: IFluidLayoutSize;
    sm?: IFluidLayoutSize;
    xl: IFluidLayoutSize;
    xs?: IFluidLayoutSize;
}

// @alpha
export interface IFluidLayoutColumn {
    content?: LayoutContent;
    size: IFluidLayoutColSize;
    style?: string;
}

// @alpha
export interface IFluidLayoutRow {
    columns: IFluidLayoutColumn[];
    header?: SectionHeader;
    style?: string;
}

// @alpha
export interface IFluidLayoutSize {
    heightAsRatio?: number;
    width: number;
}

// @public
export interface IInsightQueryOptions {
    author?: string;
    limit?: number;
    offset?: number;
    orderBy?: InsightOrdering;
    title?: string;
}

// @public
export interface IInsightQueryResult extends IPagedResource<IInsight> {
}

// @alpha
export interface ILayoutWidget {
    widget: IWidget;
}

// @alpha
export interface IListedDashboard {
    readonly created: string;
    readonly description: string;
    readonly identifier: string;
    readonly ref: ObjRef;
    readonly title: string;
    readonly updated: string;
    readonly uri: string;
}

// @public
export interface IMeasureDescriptor {
    // (undocumented)
    measureHeaderItem: {
        uri?: string;
        identifier?: string;
        localIdentifier: string;
        name: string;
        format: string;
    };
}

// @public
export interface IMeasureGroupDescriptor {
    // (undocumented)
    measureGroupHeader: {
        items: IMeasureDescriptor[];
        totalItems?: ITotalDescriptor[];
    };
}

// @public
export type InsightOrdering = "id" | "title" | "updated";

// @public
export interface IPagedResource<TItem> {
    // (undocumented)
    readonly items: TItem[];
    // (undocumented)
    readonly limit: number;
    next(): Promise<IPagedResource<TItem>>;
    // (undocumented)
    readonly offset: number;
    // (undocumented)
    readonly totalCount: number;
}

// @public
export interface IPreparedExecution {
    readonly definition: IExecutionDefinition;
    equals(other: IPreparedExecution): boolean;
    execute(): Promise<IExecutionResult>;
    fingerprint(): string;
    withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution;
    withSorting(...items: ISortItem[]): IPreparedExecution;
}

// @public
export interface IRelativeDateFilterForm extends IDateFilterOption {
    // (undocumented)
    availableGranularities: DateFilterGranularity[];
    // (undocumented)
    from?: RelativeGranularityOffset;
    // (undocumented)
    granularity?: DateFilterGranularity;
    // (undocumented)
    to?: RelativeGranularityOffset;
    // (undocumented)
    type: RelativeFormType;
}

// @public
export interface IRelativeDateFilterPreset extends IDateFilterOption {
    // (undocumented)
    from: RelativeGranularityOffset;
    // (undocumented)
    granularity: DateFilterGranularity;
    // (undocumented)
    to: RelativeGranularityOffset;
    // (undocumented)
    type: RelativePresetType;
}

// @public
export interface IRelativeDateFilterPresetOfGranularity<Key extends DateFilterGranularity> extends IRelativeDateFilterPreset {
    // (undocumented)
    granularity: Key;
}

// @public
export interface IResultAttributeHeader {
    // (undocumented)
    attributeHeaderItem: {
        uri: string;
        name: string;
    };
}

// @public
export type IResultHeader = IResultAttributeHeader | IResultMeasureHeader | IResultTotalHeader;

// @public
export interface IResultMeasureHeader {
    // (undocumented)
    measureHeaderItem: {
        name: string;
        order: number;
    };
}

// @public
export interface IResultTotalHeader {
    // (undocumented)
    totalHeaderItem: {
        name: string;
        type: string;
    };
}

// @public
export const isAbsoluteDateFilterForm: (option: DateFilterOption) => option is IAbsoluteDateFilterForm;

// @public
export const isAbsoluteDateFilterOption: (option: DateFilterOption) => option is AbsoluteDateFilterOption;

// @public
export const isAbsoluteDateFilterPreset: (option: DateFilterOption) => option is IAbsoluteDateFilterPreset;

// @public
export const isAllTimeDateFilter: (option: DateFilterOption) => option is IAllTimeDateFilter;

// @public
export function isAnalyticalBackendError(obj: any): obj is AnalyticalBackendError;

// @public
export function isAttributeDescriptor(obj: any): obj is IAttributeDescriptor;

// @alpha
export type IScheduledMail = IScheduledMailDefinition & {
    ref: ObjRef;
};

// @alpha
export interface IScheduledMailDefinition {
    attachments: ScheduledMailAttachment;
    bcc?: string[];
    body: string;
    lastSuccessfull?: string;
    ref: ObjRef;
    subject: string;
    to: string[];
    unsubscribed?: string[];
    when: {
        startDate: string;
        endDate?: string;
        recurrency: string;
        timeZone: string;
    };
}

// @alpha
export function isDashboardAttributeFilter(obj: any): obj is IDashboardAttributeFilter;

// @alpha
export function isDashboardAttributeFilterReference(obj: any): obj is IDashboardAttributeFilterReference;

// @alpha
export function isDashboardDateFilter(obj: any): obj is IDashboardDateFilter;

// @alpha
export function isDashboardDateFilterReference(obj: any): obj is IDashboardDateFilterReference;

// @public
export function isDataTooLargeError(obj: any): obj is DataTooLargeError;

// @alpha
export interface ISectionDescription {
    description: string;
}

// @alpha
export interface ISectionHeader {
    description?: string;
    title: string;
}

// @public
export interface ISettings {
    // (undocumented)
    [key: string]: number | boolean | string;
}

// @alpha
export function isFilterContext(obj: any): obj is IFilterContext;

// @alpha
export function isFluidLayout(obj: any): obj is IFluidLayout;

// @alpha
export function isLayoutWidget(obj: any): obj is ILayoutWidget;

// @public
export function isMeasureDescriptor(obj: any): obj is IMeasureDescriptor;

// @public
export function isMeasureGroupDescriptor(obj: any): obj is IMeasureGroupDescriptor;

// @public
export function isNoDataError(obj: any): obj is NoDataError;

// @public
export function isNotAuthenticated(obj: any): obj is NotAuthenticated;

// @public
export function isNotImplemented(obj: any): obj is NotImplemented;

// @public
export function isNotSupported(obj: any): obj is NotSupported;

// @public
export function isProtectedDataError(obj: any): obj is ProtectedDataError;

// @public
export const isRelativeDateFilterForm: (option: DateFilterOption) => option is IRelativeDateFilterForm;

// @public
export const isRelativeDateFilterOption: (option: DateFilterOption) => option is RelativeDateFilterOption;

// @public
export const isRelativeDateFilterPreset: (option: DateFilterOption) => option is IRelativeDateFilterPreset;

// @public
export function isResultAttributeHeader(obj: any): obj is IResultAttributeHeader;

// @public
export function isResultMeasureHeader(obj: any): obj is IResultMeasureHeader;

// @public
export function isResultTotalHeader(obj: any): obj is IResultTotalHeader;

// @alpha
export function isTempFilterContext(obj: any): obj is ITempFilterContext;

// @public
export function isTotalDescriptor(obj: any): obj is ITotalDescriptor;

// @public
export function isUnexpectedError(obj: any): obj is UnexpectedError;

// @public
export function isUnexpectedResponseError(obj: any): obj is UnexpectedResponseError;

// @alpha
export function isWidget(obj: any): obj is IWidget;

// @alpha
export interface ITempFilterContext extends ITempFilterContextDefinition {
    // (undocumented)
    readonly ref: ObjRef;
    // (undocumented)
    readonly uri: string;
}

// @alpha
export interface ITempFilterContextDefinition {
    readonly created: string;
    readonly filters: FilterContextItem[];
}

// @public
export interface ITotalDescriptor {
    // (undocumented)
    totalHeaderItem: {
        name: string;
    };
}

// @public
export interface IUserService {
    settings(): IUserSettingsService;
}

// @public
export interface IUserSettings extends ISettings {
    userId: string;
}

// @public
export interface IUserSettingsService {
    query(): Promise<IUserSettings>;
}

// @public
export interface IUserWorkspaceSettings extends IUserSettings, IWorkspaceSettings {
}

// @alpha
export interface IWidget extends IWidgetDefinition {
    readonly identifier: string;
    readonly ref: ObjRef;
    readonly uri: string;
}

// @alpha
export type IWidgetAlert = IWidgetAlertDefinition & {
    readonly ref: ObjRef;
};

// @alpha
export interface IWidgetAlertDefinition {
    readonly dashboard: ObjRef;
    readonly filterContext?: IFilterContext;
    readonly insight: ObjRef;
    readonly isTriggered: boolean;
    readonly threshold: number;
    readonly whenTriggered: "underThreshold" | "aboveThreshold";
}

// @alpha
export interface IWidgetDefinition {
    readonly alerts: IWidgetAlert[];
    readonly dateDataSet?: ObjRef;
    readonly description: string;
    // Warning: (ae-forgotten-export) The symbol "DrillDefinition" needs to be exported by the entry point index.d.ts
    readonly drills: DrillDefinition[];
    readonly ignoreDashboardFilters: IDashboardFilterReference[];
    readonly insight?: ObjRef;
    readonly title: string;
    readonly type: WidgetType;
}

// @public
export interface IWorkspaceCatalog extends IWorkspaceCatalogMethods {
    availableItems(): IWorkspaceCatalogAvailableItemsFactory;
}

// @public
export interface IWorkspaceCatalogAvailableItemsFactory extends IWorkspaceCatalogFactoryMethods<IWorkspaceCatalogAvailableItemsFactory, IWorkspaceCatalogWithAvailableItemsFactoryOptions> {
    forInsight(insight: IInsightDefinition): IWorkspaceCatalogAvailableItemsFactory;
    forItems(items: IAttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory;
    load(): Promise<IWorkspaceCatalogWithAvailableItems>;
}

// @public
export interface IWorkspaceCatalogFactory extends IWorkspaceCatalogFactoryMethods<IWorkspaceCatalogFactory, IWorkspaceCatalogFactoryOptions> {
    load(): Promise<IWorkspaceCatalog>;
    readonly options: IWorkspaceCatalogFactoryOptions;
    readonly workspace: string;
}

// @public
export interface IWorkspaceCatalogFactoryMethods<TFactory, TOptions> {
    excludeTags(tags: ObjRef[]): TFactory;
    forDataset(dataset: ObjRef): TFactory;
    forTypes(types: CatalogItemType[]): TFactory;
    includeTags(tags: ObjRef[]): TFactory;
    withOptions(options: TOptions): TFactory;
}

// @public
export interface IWorkspaceCatalogFactoryOptions {
    dataset?: ObjRef;
    excludeTags: ObjRef[];
    includeTags: ObjRef[];
    production?: boolean;
    types: CatalogItemType[];
}

// @public
export interface IWorkspaceCatalogMethods {
    getAttributes(): ICatalogAttribute[];
    getDateDatasets(): ICatalogDateDataset[];
    getFacts(): ICatalogFact[];
    getGroups(): ICatalogGroup[];
    getItems(): CatalogItem[];
    getMeasures(): ICatalogMeasure[];
}

// @public
export interface IWorkspaceCatalogWithAvailableItems extends IWorkspaceCatalogMethods {
    getAvailableAttributes(): ICatalogAttribute[];
    getAvailableDateDatasets(): ICatalogDateDataset[];
    getAvailableFacts(): ICatalogFact[];
    getAvailableItems(): CatalogItem[];
    getAvailableMeasures(): ICatalogMeasure[];
}

// @public
export interface IWorkspaceCatalogWithAvailableItemsFactoryOptions extends IWorkspaceCatalogFactoryOptions {
    insight?: IInsightDefinition;
    items?: IAttributeOrMeasure[];
}

// @alpha
export interface IWorkspaceDashboards {
    createDashboard(dashboard: IDashboardDefinition): Promise<IDashboard>;
    deleteDashboard(ref: ObjRef): Promise<void>;
    getDashboard(ref: ObjRef, filterContextRef?: ObjRef): Promise<IDashboard>;
    getDashboards(): Promise<IListedDashboard[]>;
    updateDashboard(dashboard: IDashboard, updatedDashboard: IDashboard): Promise<IDashboard>;
    // (undocumented)
    readonly workspace: string;
}

// @public
export interface IWorkspaceDatasetsService {
    getDatasets(): Promise<IDataset[]>;
}

// @public
export interface IWorkspaceInsights {
    createInsight(insight: IInsightDefinition): Promise<IInsight>;
    deleteInsight(ref: ObjRef): Promise<void>;
    getInsight(ref: ObjRef): Promise<IInsight>;
    getInsights(options?: IInsightQueryOptions): Promise<IInsightQueryResult>;
    getReferencedObjects(insight: IInsight, types?: Array<Exclude<ObjectType, "insight" | "tag">>): Promise<IMetadataObject[]>;
    getVisualizationClass(ref: ObjRef): Promise<IVisualizationClass>;
    getVisualizationClasses(): Promise<IVisualizationClass[]>;
    updateInsight(insight: IInsight): Promise<IInsight>;
}

// @public
export interface IWorkspaceMetadata {
    getAttribute(ref: ObjRef): Promise<IAttributeMetadataObject>;
    getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject>;
    getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject>;
    getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]>;
}

// @public
export interface IWorkspacePermissionsFactory {
    forCurrentUser(): Promise<IWorkspaceUserPermissions>;
}

// @public
export interface IWorkspaceQuery {
    query(): Promise<IWorkspaceQueryResult>;
    withLimit(limit: number): IWorkspaceQuery;
    withOffset(offset: number): IWorkspaceQuery;
    withSearch(search: string): IWorkspaceQuery;
}

// @public
export interface IWorkspaceQueryFactory {
    forCurrentUser(): IWorkspaceQuery;
    forUser(userId: string): IWorkspaceQuery;
}

// @public
export interface IWorkspaceQueryResult extends IPagedResource<IWorkspace> {
    // (undocumented)
    search: string | undefined;
}

// @public
export interface IWorkspaceSettings extends ISettings {
    workspace: string;
}

// @public
export interface IWorkspaceSettingsService {
    query(): Promise<IWorkspaceSettings>;
    queryForCurrentUser(): Promise<IUserWorkspaceSettings>;
}

// @public
export interface IWorkspaceStylingService {
    colorPalette(): Promise<IColorPalette>;
}

// @public
export interface IWorkspaceUserPermissions {
    allPermissions(): IWorkspacePermissions;
    hasPermission(permission: WorkspacePermission): boolean;
}

// @alpha
export type Layout = IFluidLayout;

// @alpha
export type LayoutContent = Widget | Layout;

// @alpha
export const layoutWidgets: (layout: IFluidLayout, collectedWidgets?: IWidget[]) => IWidget[];

// @public
export class NoDataError extends AnalyticalBackendError {
    constructor(message: string, dataView?: IDataView, cause?: Error);
    readonly dataView?: IDataView;
}

// @public
export class NotAuthenticated extends AnalyticalBackendError {
    constructor(message: string, cause?: Error);
}

// @public
export class NotImplemented extends AnalyticalBackendError {
    constructor(message: string);
}

// @public
export class NotSupported extends AnalyticalBackendError {
    constructor(message: string);
}

// @public
export type OptionType = AllTimeType | AbsoluteFormType | RelativeFormType | AbsolutePresetType | RelativePresetType;

// @public
export function prepareExecution(backend: IAnalyticalBackend, definition: IExecutionDefinition): IPreparedExecution;

// @public
export class ProtectedDataError extends AnalyticalBackendError {
    constructor(message: string, cause?: Error);
}

// @public
export type RelativeDateFilterOption = IRelativeDateFilterForm | IRelativeDateFilterPreset;

// @public
export type RelativeFormType = "relativeForm";

// @public
export type RelativeGranularityOffset = number;

// @public
export type RelativePresetType = "relativePreset";

// @alpha
export type RelativeType = "relative";

// @public
export function resultHeaderName(header: IResultHeader): string;

// @alpha
export type ScheduledMailAttachment = IDashboardAttachment;

// @alpha
export type SectionHeader = ISectionHeader | ISectionDescription;

// @public
export enum SettingCatalog {
    disableKpiDashboardHeadlineUnderline = "disableKpiDashboardHeadlineUnderline",
    enableAxisNameConfiguration = "enableAxisNameConfiguration"
}

// @public
export class UnexpectedError extends AnalyticalBackendError {
    constructor(message: string, cause?: Error);
}

// @public
export class UnexpectedResponseError extends AnalyticalBackendError {
    constructor(message: string, httpStatus: number, responseBody: any, cause?: Error);
    // (undocumented)
    readonly httpStatus: number;
    // (undocumented)
    readonly responseBody: number;
}

// @alpha
export type Widget = ILayoutWidget;

// @alpha
export type WidgetType = "kpi" | "insight";


// (No @packageDocumentation comment for this package)

```
