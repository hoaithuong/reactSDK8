// (C) 2007-2020 GoodData Corporation
import { ISeparators } from "@gooddata/numberjs";
import { IAnalyticalBackend, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IAttributeOrMeasure, IAttribute, IFilter, ITotal, ISortItem, TotalType } from "@gooddata/sdk-model";
import { IVisualizationCallbacks, IVisualizationProps } from "@gooddata/sdk-ui";
import { WrappedComponentProps } from "react-intl";

/**
 * @public
 */
export interface IMenu {
    /**
     * If true, grand totals can be added to the table using table menu.
     */
    aggregations?: boolean;

    /**
     * If true, subtotals can be added to the table using table menu.
     */
    aggregationsSubMenu?: boolean;
}

/**
 * @public
 */
export interface IPivotTableConfig {
    /**
     * Optionally customize number segment separators (thousands, decimals)
     */
    separators?: ISeparators;

    /**
     * Optionally customize whether the column-level burger menu should be visible and if so,
     * what aggregations should be allowed.
     */
    menu?: IMenu;

    /**
     * Optionally customize maximum height of the table.
     */
    maxHeight?: number;
}

export interface IMenuAggregationClickConfig {
    type: TotalType;
    measureIdentifiers: string[];
    attributeIdentifier: string;
    include: boolean;
}

export interface IAttributeCell {
    uri: string;
    name: string;
}

export interface IAttributeCellForDrilling {
    id: string;
    name: string;
}

export type MeasureCell = number | string | null;
export type TableCell = IAttributeCell | MeasureCell;
export type TableCellForDrilling = IAttributeCellForDrilling | MeasureCell;
export type TableRowForDrilling = TableCellForDrilling[];

export interface ITableCellStyle {
    backgroundColor?: string;
    color?: string;
    fontWeight?: React.CSSProperties["fontWeight"];
}

export interface ITableCellStyleAndFormattedValue {
    style: ITableCellStyle;
    formattedValue: string;
}

export function isAttributeCell(cell: TableCell): cell is IAttributeCell {
    return cell && (cell as IAttributeCell).uri !== undefined;
}

/**
 * @public
 */
export interface IPivotTableProps extends IPivotTableBaseProps, IPivotTableBucketProps {
    /**
     * Optionally specify an instance of analytical backend instance to work with.
     *
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Optionally specify workspace to work with.
     *
     * Note: if you do not have a WorkspaceProvider above in the component tree, then you MUST specify the workspace.
     */
    workspace?: string;
}

/**
 * @public
 */
export interface IPivotTableBucketProps {
    /**
     * Optionally specify measures to create table columns from.
     */
    measures?: IAttributeOrMeasure[];

    /**
     * Optionally specify one or more attributes to create table columns from. There will be a column for each
     * combination of the specified attribute's values.
     *
     * Note: you can specify column attributes in conjunction with one or more measures. In that case the table
     * will contain column for each combination of attribute values & measures.
     */
    columns?: IAttribute[];

    /**
     * Optionally specify attributes, whose value's will be used as rows in the table.
     */
    rows?: IAttribute[];

    /**
     * Optionally specify what totals should be calculated and included in the table.
     *
     * Note: table can only render column subtotal and/or grand-totals. It is not possible to calculate row totals.
     * Also note: the table will only include subtotals when in grouping mode and the grouping is effective = table
     * is sorted by the first row attribute.
     */
    totals?: ITotal[];

    /**
     * Optionally specify filters to apply on the data to chart.
     */
    filters?: IFilter[];

    /**
     * Optionally specify how to sort the data to chart.
     */
    sortBy?: ISortItem[];
}

/**
 * @internal
 */
export interface ICorePivotTableProps extends IPivotTableBaseProps, WrappedComponentProps {
    execution: IPreparedExecution;
}

/**
 * TODO: SDK8 - add docs
 *
 * @public
 */
export interface IPivotTableBaseProps extends IVisualizationProps, IVisualizationCallbacks {
    pageSize?: number;
    config?: IPivotTableConfig;
    groupRows?: boolean;
    exportTitle?: string;
}
