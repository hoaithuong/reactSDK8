// (C) 2020 GoodData Corporation
import { IUserSettingsService, IUserSettings } from "@gooddata/sdk-backend-spi";
import { userLoginMd5FromAuthenticatedPrincipal } from "../../utils/api";
import { BearAuthenticatedCallGuard } from "../../types";

export class BearUserSettingsService implements IUserSettingsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard) {}

    public async query(): Promise<IUserSettings> {
        return this.authCall(async (sdk, context) => {
            const userLoginMd5 = userLoginMd5FromAuthenticatedPrincipal(context.principal);

            const flags = await sdk.user.getUserFeatureFlags(userLoginMd5);

            return {
                userId: userLoginMd5,
                ...flags,
            };
        });
    }
}
