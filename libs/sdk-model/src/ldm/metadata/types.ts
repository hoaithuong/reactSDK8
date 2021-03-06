// (C) 2019-2020 GoodData Corporation

import { ObjRef, ObjectType } from "../../objRef";

/**
 * @public
 */
export interface IMetadataObject {
    /**
     * Type of metadata object
     */
    type: ObjectType;

    /**
     * Metadata object reference
     */
    ref: ObjRef;

    /**
     * Metadata object identifier
     * Currently, our implementation still depends on converting id to uri (or uri to id)
     * So until we add cache, keep both id and uri exposed on metadata objects
     */
    id: string;

    /**
     * Metadata object uri
     * Currently, our implementation still depends on converting id to uri (or uri to id)
     * So until we add cache, keep both id and uri exposed on metadata objects
     */
    uri: string;

    /**
     * Title
     */
    title: string;

    /**
     * Description
     */
    description: string;

    /**
     * Is production
     */
    production: boolean;
}
