// (C) 2019-2020 GoodData Corporation
import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { withLoading, IWithLoadingEvents, WithLoadingResult, DataViewWindow } from "./withLoading";
import { DataViewFacade } from "../base";

/**
 * Configuration for the withExecution HOC. All configuration parameters can be either actual parameter values
 * or functions to obtain them from the wrapped component props.
 *
 * If functions are specified, the HOC will call them with the wrapped component props as parameter and then use
 * the resulting values as if they were passed directly.
 *
 * @public
 */
export interface IWithExecution<T> {
    /**
     * Specify execution that the HOC will drive.
     */
    execution: IPreparedExecution | ((props: T) => IPreparedExecution);

    /**
     * Optionally customize data window to load.
     *
     * By default the HOC loads all the data available in the execution's result.
     */
    window?: DataViewWindow | ((props: T) => DataViewWindow | undefined);

    /**
     * Optionally specify event callbacks which the HOC will trigger in different situations.
     */
    events?: IWithLoadingEvents<T> | ((props: T) => IWithLoadingEvents<T>);

    /**
     * Optionally customize, whether execution & data loading should start as soon as component is mounted.
     *
     * Default is true. When not loading on mount, the wrapped component can trigger the load by calling the
     * reload() function which the HOC injects into its props.
     */
    loadOnMount?: boolean | ((props: T) => boolean);

    /**
     * Optionally specify function that will be called during component prop updates and will be used to
     * determine whether execution should be re-run and data reloaded.
     *
     * @param prevProps - previous props
     * @param nextProps - next props
     */
    shouldRefetch?: (prevProps: T, nextProps: T) => boolean;
}

/**
 * A React HOC that for driving an execution to get data view that can be visualized.
 *
 * @public
 */
export function withExecution<T>(params: IWithExecution<T>) {
    const { execution, events, loadOnMount, shouldRefetch, window } = params;

    return (WrappedComponent: React.ComponentType<T & WithLoadingResult>) => {
        const withLoadingParams = {
            promiseFactory: async (props: T, window?: DataViewWindow) => {
                const _execution = typeof execution === "function" ? execution(props) : execution;
                const executionResult = await _execution.execute();
                const dataView = !window
                    ? await executionResult.readAll()
                    : await executionResult.readWindow(window.offset, window.size);

                return DataViewFacade.for(dataView);
            },
            loadOnMount,
            events,
            shouldRefetch,
            window,
        };

        return withLoading(withLoadingParams)(WrappedComponent);
    };
}
