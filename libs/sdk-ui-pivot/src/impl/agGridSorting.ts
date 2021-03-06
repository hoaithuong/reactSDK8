// (C) 2007-2020 GoodData Corporation
import { getIdsFromUri, getParsedFields } from "./agGridUtils";
import { FIELD_TYPE_ATTRIBUTE, FIELD_TYPE_MEASURE, ID_SEPARATOR } from "./agGridConst";
import { assortDimensionDescriptors } from "./agGridHeaders";
import { ISortModelItem } from "./agGridTypes";
import { IAttributeSortItem, IMeasureSortItem, SortDirection, ISortItem } from "@gooddata/sdk-model";
import { IAttributeDescriptor, IExecutionResult } from "@gooddata/sdk-backend-spi";
import invariant = require("invariant");

/*
 * All code related to sorting the ag-grid backed Pivot Table is concentrated here
 */

export const getSortItemByColId = (
    result: IExecutionResult,
    colId: string,
    direction: SortDirection,
): IMeasureSortItem | IAttributeSortItem => {
    const { dimensions } = result;

    const fields = getParsedFields(colId);
    const [lastFieldType, lastFieldId] = fields[fields.length - 1];

    // search columns first when sorting in columns to use the proper header
    // in case the same attribute is in both rows and columns
    const searchDimensionIndex = lastFieldType === FIELD_TYPE_MEASURE ? 1 : 0;
    const { attributeDescriptors, measureDescriptors } = assortDimensionDescriptors([
        dimensions[searchDimensionIndex],
    ]);

    if (lastFieldType === FIELD_TYPE_ATTRIBUTE) {
        for (const header of attributeDescriptors) {
            if (getIdsFromUri(header.attributeHeader.uri)[0] === lastFieldId) {
                return {
                    attributeSortItem: {
                        direction,
                        attributeIdentifier: header.attributeHeader.localIdentifier,
                    },
                };
            }
        }
        invariant(false, `could not find attribute header matching ${colId}`);
    } else if (lastFieldType === FIELD_TYPE_MEASURE) {
        const headerItem = measureDescriptors[parseInt(lastFieldId, 10)];
        const attributeLocators = fields.slice(0, -1).map((field: string[]) => {
            // first item is type which should be always 'a'
            const [, fieldId, fieldValueId] = field;
            const attributeDescriptorMatch = attributeDescriptors.find(
                (attributeHeader: IAttributeDescriptor) => {
                    return getIdsFromUri(attributeHeader.attributeHeader.formOf.uri)[0] === fieldId;
                },
            );
            invariant(
                attributeDescriptorMatch,
                `Could not find matching attribute header to field ${field.join(ID_SEPARATOR)}`,
            );
            return {
                attributeLocatorItem: {
                    attributeIdentifier: attributeDescriptorMatch.attributeHeader.localIdentifier,
                    element: `${attributeDescriptorMatch.attributeHeader.formOf.uri}/elements?id=${fieldValueId}`,
                },
            };
        });
        return {
            measureSortItem: {
                direction,
                locators: [
                    ...attributeLocators,
                    {
                        measureLocatorItem: {
                            measureIdentifier: headerItem.measureHeaderItem.localIdentifier,
                        },
                    },
                ],
            },
        };
    }
    invariant(false, `could not find header matching ${colId}`);
};

export function getSortsFromModel(sortModel: ISortModelItem[], result: IExecutionResult): ISortItem[] {
    return sortModel.map((sortModelItem: ISortModelItem) => {
        const { colId, sort } = sortModelItem;
        const sortHeader = getSortItemByColId(result, colId, sort);
        invariant(sortHeader, `unable to find sort item by field ${colId}`);
        return sortHeader;
    });
}
