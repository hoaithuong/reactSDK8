// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps, IntlShape } from "react-intl";

export interface ITranslationsProviderOwnProps {
    children: any;
}

export interface ITranslationsComponentProps {
    numericSymbols: string[];
    emptyHeaderString: string;
    intl: IntlShape;
}

export type ITranslationsProviderProps = ITranslationsProviderOwnProps & WrappedComponentProps;

export class TranslationsProvider extends React.PureComponent<ITranslationsProviderProps> {
    public render() {
        const props: ITranslationsComponentProps = {
            numericSymbols: this.getNumericSymbols(),
            emptyHeaderString: this.getEmptyHeaderString(),
            intl: this.props.intl,
        };
        return this.props.children(props);
    }

    private getEmptyHeaderString() {
        const emptyValueTranslation = this.props.intl.formatMessage({ id: "visualization.emptyValue" });
        return `(${emptyValueTranslation})`;
    }

    private getNumericSymbols() {
        return [
            "visualization.numericValues.k",
            "visualization.numericValues.m",
            "visualization.numericValues.g",
            "visualization.numericValues.t",
            "visualization.numericValues.p",
            "visualization.numericValues.e",
        ].map((id: string) => this.props.intl.formatMessage({ id }));
    }
}

export const IntlTranslationsProvider = injectIntl<"intl", ITranslationsProviderProps>(TranslationsProvider);
