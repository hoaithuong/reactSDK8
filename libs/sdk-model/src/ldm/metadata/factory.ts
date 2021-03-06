// (C) 2019-2020 GoodData Corporation
import { IMetadataObject } from "./types";
import { Builder, IBuilder } from "../../base/builder";

/**
 * Metadata object builder interface
 *
 * @public
 */
export interface IMetadataObjectBuilder<T extends IMetadataObject = IMetadataObject> extends IBuilder<T> {
    /**
     * Set metadata object title
     *
     * @param title - metadata object title
     * @returns this
     */
    title(title: string): this;

    /**
     * Set metadata object description
     *
     * @param description - metadata object description
     * @returns this
     */
    description(description: string): this;

    /**
     * Set metadata object identifier
     *
     * @param id - metadata object identifier
     * @returns this
     */
    id(id: string): this;

    /**
     * Set metadata object uri
     *
     * @param uri - metadata object uri
     * @returns this
     */
    uri(uri: string): this;

    /**
     * Set metadata object isProduction flag
     *
     * @param description - metadata object description
     * @returns this
     */
    production(isProduction: boolean): this;
}

/**
 * Metadata object builder
 * See {@link Builder}
 *
 * @public
 */
export class MetadataObjectBuilder<T extends IMetadataObject = IMetadataObject> extends Builder<T>
    implements IMetadataObjectBuilder {
    public title(title: string): this {
        this.item.title = title;
        return this;
    }

    public description(description: string): this {
        this.item.description = description;
        return this;
    }

    public id(identifier: string): this {
        this.item.id = identifier;
        return this;
    }

    public uri(uri: string): this {
        this.item.uri = uri;
        return this;
    }

    public production(isProduction: boolean): this {
        this.item.production = isProduction;
        return this;
    }
}
