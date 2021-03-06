// (C) 2019-2020 GoodData Corporation
import { ApiResponseError, ApiExecutionResponseError } from "@gooddata/gd-bear-client";
import {
    AnalyticalBackendError,
    DataTooLargeError,
    NoDataError,
    NotAuthenticated,
    ProtectedDataError,
    UnexpectedError,
    UnexpectedResponseError,
    isAnalyticalBackendError,
} from "@gooddata/sdk-backend-spi";
import get from "lodash/get";
import includes from "lodash/includes";
import * as HttpStatusCodes from "http-status-codes";

export function isApiResponseError(error: any): error is ApiResponseError {
    return (error as ApiResponseError).response !== undefined;
}

export function isApiExecutionResponseError(error: Error): error is ApiExecutionResponseError {
    return !!(error as ApiExecutionResponseError).executionResponse;
}

function getJSONFromText(data: string): object | null {
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

function isComplainingAboutAuthorization(error: ApiResponseError): boolean {
    // execution on protected data will actually return with 400 + with error messaging talking about this

    if (error.response.status !== HttpStatusCodes.BAD_REQUEST) {
        return false;
    }

    const message = get(getJSONFromText(error.responseBody), "error.message", "");

    return includes(message, "Attempt to execute protected report unsafely");
}

export function convertExecutionApiError(error: any): AnalyticalBackendError {
    if (isApiResponseError(error)) {
        if (error.response.status === HttpStatusCodes.NO_CONTENT) {
            return new NoDataError("Server returned no data");
        } else if (error.response.status === HttpStatusCodes.REQUEST_TOO_LONG) {
            return new DataTooLargeError(
                "Server has reached data size limits when processing this request",
                error,
            );
        } else if (isComplainingAboutAuthorization(error)) {
            return new ProtectedDataError("Request not authorized", error);
        }
    }

    return convertApiError(error);
}

export function convertApiError(error: any): AnalyticalBackendError {
    if (isAnalyticalBackendError(error)) {
        return error;
    }

    if (isApiResponseError(error)) {
        if (error.response.status === HttpStatusCodes.UNAUTHORIZED) {
            return new NotAuthenticated("Not authenticated against backend");
        }

        return new UnexpectedResponseError(error.message, error.response.status, error.responseBody, error);
    }

    return new UnexpectedError("An unexpected error has occurred", error);
}
