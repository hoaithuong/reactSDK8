// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExecuteExample } from "./ExecuteExample";
import { ExecuteAttributeValuesExample } from "./ExecuteAttributeValuesExample";
import { ExampleWithSource } from "../../components/ExampleWithSource";

import ExecuteExampleSRC from "!raw-loader!./ExecuteExample";
import ExecuteAttributeValuesExampleSRC from "!raw-loader!./ExecuteAttributeValuesExample";

import ExecuteExampleSRCJS from "!raw-loader!../../../examplesJS/execution/ExecuteExample";
import ExecuteAttributeValuesExampleSRCJS from "!raw-loader!../../../examplesJS/execution/ExecuteAttributeValuesExample";

export const Execute: React.FC = () => (
    <div>
        <h1>Execute</h1>

        <p>
            The Execute component allows you to execute input data and send it to the function that you have
            chosen to use and have implemented. You can use the Execute component, for example, to create a
            report using an arbitrary chart library.
        </p>
        <p>Pass a custom children function to this component to render AFM execution data.</p>

        <hr className="separator" />

        <ExampleWithSource for={ExecuteExample} source={ExecuteExampleSRC} sourceJS={ExecuteExampleSRCJS} />

        <hr className="separator" />

        <h2>Execute attribute values only</h2>
        <p>To get values of a single attribute, use the AttributeElements component instead.</p>

        <hr className="separator" />

        <ExampleWithSource
            for={ExecuteAttributeValuesExample}
            source={ExecuteAttributeValuesExampleSRC}
            sourceJS={ExecuteAttributeValuesExampleSRCJS}
        />
    </div>
);
