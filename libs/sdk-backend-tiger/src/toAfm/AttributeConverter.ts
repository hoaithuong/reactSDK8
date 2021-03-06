// (C) 2020 GoodData Corporation

import { IAttribute } from "@gooddata/sdk-model";
import { ExecuteAFM } from "@gooddata/gd-tiger-client";

import { toDisplayFormQualifier } from "./ObjRefConverter";

export function convertAttribute(attribute: IAttribute, idx: number): ExecuteAFM.IAttribute {
    const alias = attribute.attribute.alias;
    const aliasProp = alias ? { alias } : {};
    const displayFromRef = attribute.attribute.displayForm;

    return {
        displayForm: toDisplayFormQualifier(displayFromRef),
        localIdentifier: attribute.attribute.localIdentifier || `a${idx + 1}`,
        ...aliasProp,
    };
}
