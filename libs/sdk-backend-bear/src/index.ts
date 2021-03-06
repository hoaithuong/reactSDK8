// (C) 2019-2020 GoodData Corporation

import { AnalyticalBackendConfig, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BearBackend, BearBackendConfig } from "./backend";
import { FixedLoginAndPasswordAuthProvider, ContextDeferredAuthProvider, BearAuthProviderBase } from "./auth";

/**
 * Returns function which creates instances of Analytical Backend implementation which works with the 'bear'
 * version of the GoodData platform.
 *
 * @param config - analytical backend configuration, may be omitted and provided later
 * @param implConfig - bear client specific configuration, may be omitted at this point but it cannot be provided later
 * @public
 */
function bearFactory(config?: AnalyticalBackendConfig, implConfig?: any): IAnalyticalBackend {
    return new BearBackend(config, implConfig);
}

export {
    BearBackendConfig,
    FixedLoginAndPasswordAuthProvider,
    ContextDeferredAuthProvider,
    BearAuthProviderBase,
};

export default bearFactory;
