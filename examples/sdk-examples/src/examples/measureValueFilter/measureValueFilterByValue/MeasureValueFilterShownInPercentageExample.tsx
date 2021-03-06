// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newMeasureValueFilter, IMeasureValueFilter } from "@gooddata/sdk-model";
import { LdmExt } from "../../../ldm";
import { IMeasureValueFilterState } from "./MeasureValueFilterExample";

const measures = [LdmExt.FranchisedSales, LdmExt.FranchisedSalesWithRatio];

const attributes = [LdmExt.LocationName];

const greaterThanFilter = newMeasureValueFilter(LdmExt.FranchisedSalesWithRatio, "GREATER_THAN", 7000000);

export class MeasureValueFilterExample extends Component<{}, IMeasureValueFilterState> {
    constructor(props: any) {
        super(props);
        this.state = {
            filters: [],
        };
    }

    public renderPresetButton(label: string, appliedFilters: IMeasureValueFilter[], isActive: boolean) {
        return (
            <button
                className={`gd-button gd-button-secondary ${isActive ? "is-active" : ""} s-filter-button`}
                onClick={() =>
                    this.setState({
                        filters: appliedFilters,
                    })
                }
            >
                {label}
            </button>
        );
    }

    public render() {
        const { filters } = this.state;
        return (
            <div>
                <div>
                    {this.renderPresetButton("All franchise sales", [], filters.length === 0)}
                    {this.renderPresetButton(
                        "Franchise sales greater than 7,000,000 (shown in %)",
                        [greaterThanFilter],
                        filters.length > 0,
                    )}
                </div>
                <hr className="separator" />
                <div style={{ height: 300 }} className="s-pivot-table">
                    <PivotTable measures={measures} rows={attributes} filters={filters} />
                </div>
            </div>
        );
    }
}

export default MeasureValueFilterExample;
