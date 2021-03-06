// (C) 2019-2020 GoodData Corporation
import flow from "lodash/flow";
import map from "lodash/fp/map";
import uniq from "lodash/fp/uniq";
import replace from "lodash/fp/replace";
import invariant from "ts-invariant";
import { IWorkspaceMetadata } from "@gooddata/sdk-backend-spi";
import { GdcMetadata, GdcMetadataObject } from "@gooddata/gd-bear-model";
import {
    IAttributeDisplayFormMetadataObject,
    IMeasureExpressionToken,
    IMetadataObject,
    newAttributeDisplayFormMetadataObject,
    ObjRef,
    uriRef,
    IAttributeMetadataObject,
    newAttributeMetadataObject,
} from "@gooddata/sdk-model";
import { getTokenValuesOfType, tokenizeExpression } from "./measureExpressionTokens";
import { objRefToUri } from "../../../fromObjRef/api";
import { BearAuthenticatedCallGuard } from "../../../types";
import {
    convertMetadataObject,
    convertMetadataObjectXrefEntry,
    SupportedMetadataObject,
    SupportedWrappedMetadataObject,
} from "../../../toSdkModel/MetaConverter";
import { getObjectIdFromUri } from "../../../utils/api";

export class BearWorkspaceMetadata implements IWorkspaceMetadata {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public getAttributeDisplayForm = async (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        const displayFormUri = await objRefToUri(ref, this.workspace, this.authCall);
        const wrappedDisplayForm: GdcMetadata.IWrappedAttributeDisplayForm = await this.authCall(sdk =>
            sdk.md.getObjectDetails(displayFormUri),
        );
        const displayFormDetails = wrappedDisplayForm.attributeDisplayForm;

        const attrRef = uriRef(displayFormDetails.content.formOf);

        return newAttributeDisplayFormMetadataObject(ref, df =>
            df
                .attribute(attrRef)
                .title(displayFormDetails.meta.title)
                .description(displayFormDetails.meta.summary)
                .id(displayFormDetails.meta.identifier)
                .uri(displayFormDetails.meta.uri),
        );
    };

    public getAttribute = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        const attributeUri = await objRefToUri(ref, this.workspace, this.authCall);
        const wrappedAttribute: GdcMetadata.IWrappedAttribute = await this.authCall(sdk =>
            sdk.md.getObjectDetails(attributeUri),
        );
        const { title, uri, isProduction, identifier, summary } = wrappedAttribute.attribute.meta;

        return newAttributeMetadataObject(ref, a =>
            a
                .title(title)
                .uri(uri)
                .production(Boolean(isProduction))
                .id(identifier)
                .description(summary),
        );
    };

    public async getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const metricMetadata = await this.authCall(sdk =>
            sdk.xhr.getParsed<GdcMetadataObject.WrappedObject>(uri),
        );

        if (!GdcMetadata.isWrappedMetric(metricMetadata)) {
            throw new Error(
                "To get measure expression tokens, provide the correct measure identifier. Did you provide a measure identifier?",
            );
        }

        const expressionTokens = tokenizeExpression(metricMetadata.metric.content.expression);
        const expressionIdentifiers = getTokenValuesOfType("identifier", expressionTokens);
        const expressionUris = getTokenValuesOfType("uri", expressionTokens);
        const expressionElementUris = getTokenValuesOfType("element_uri", expressionTokens);
        const expressionIdentifierUrisPairs = await this.authCall(sdk =>
            sdk.md.getUrisFromIdentifiers(this.workspace, expressionIdentifiers),
        );
        const expressionIdentifierUris = expressionIdentifierUrisPairs.map(pair => pair.uri);
        const allExpressionElementAttributeUris = flow(
            map(replace(/\/elements\?id=.*/, "")),
            uniq,
        )(expressionElementUris);
        const allExpressionUris = uniq([
            ...expressionUris,
            ...expressionIdentifierUris,
            ...allExpressionElementAttributeUris,
        ]);
        const allExpressionWrappedObjects = await this.authCall(sdk =>
            sdk.md.getObjects<SupportedWrappedMetadataObject>(this.workspace, allExpressionUris),
        );
        const allExpressionObjects = allExpressionWrappedObjects.map(
            GdcMetadataObject.unwrapMetadataObject,
        ) as SupportedMetadataObject[];
        const allExpressionElements = await Promise.all(
            expressionElementUris.map(elementUri =>
                this.authCall(sdk => sdk.md.getAttributeElementDefaultDisplayFormValue(elementUri)),
            ),
        );

        const objectByUri = allExpressionObjects.reduce(
            (acc: { [key: string]: GdcMetadataObject.IObject }, el) => {
                return {
                    ...acc,
                    [el.meta.uri]: el,
                };
            },
            {},
        );

        const objectByIdentifier = allExpressionObjects.reduce(
            (acc: { [key: string]: GdcMetadataObject.IObject }, el) => {
                return {
                    ...acc,
                    [el.meta.identifier]: el,
                };
            },
            {},
        );

        const elementByUri = allExpressionElements.reduce(
            (acc: { [key: string]: GdcMetadata.IAttributeElement }, el) => {
                if (!el) {
                    return acc;
                }
                return {
                    ...acc,
                    [el.uri]: el,
                };
            },
            {},
        );

        const expressionTokensWithDetails = expressionTokens.map(
            (token): IMeasureExpressionToken => {
                if (token.type === "element_uri") {
                    return {
                        type: "attributeElement",
                        value: token.value,
                        element: elementByUri[token.value],
                    };
                } else if (token.type === "uri") {
                    return {
                        type: "metadataObject",
                        value: token.value,
                        meta: convertMetadataObject(objectByUri[token.value]),
                    };
                } else if (token.type === "identifier") {
                    return {
                        type: "metadataObject",
                        value: token.value,
                        meta: convertMetadataObject(objectByIdentifier[token.value]),
                    };
                }

                return {
                    type: "text",
                    value: token.value,
                };
            },
        );

        return expressionTokensWithDetails;
    }

    public async getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const objectId = getObjectIdFromUri(uri);

        return this.authCall(async sdk => {
            const usedBy = await sdk.xhr.getParsed<{ entries: GdcMetadata.IObjectXrefEntry[] }>(
                `/gdc/md/${this.workspace}/usedby2/${objectId}?types=dataSet`,
            );

            invariant(usedBy.entries.length > 0, "Fact must have a dataset associated to it.");

            return convertMetadataObjectXrefEntry("dataSet", usedBy.entries[0]);
        });
    }
}
