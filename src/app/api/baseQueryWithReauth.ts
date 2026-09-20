import {Mutex} from "async-mutex";
import type {BaseQueryFn, FetchArgs, FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {baseQuery} from "@/app/api/baseQuery.ts";
import {areTokens, handleErrors} from "@/common/utils";
import {AUTH_KEYS} from "@/common/constants";
import {baseApi} from "@/app/api/baseApi.ts";


const mutex = new Mutex()

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args, api, extraOptions
) => {
    await mutex.waitForUnlock()

    let result = await baseQuery(args, api, extraOptions)
    if (result.error && result.error.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire()
            try {
                const refreshToken = localStorage.getItem(AUTH_KEYS.refreshToken)

                const refreshResult = await baseQuery({
                    url: 'auth/refresh',
                    method: 'POST',
                    body: {refreshToken}
                }, api, extraOptions)
                if (refreshResult.data && areTokens(refreshResult.data)) {
                    localStorage.setItem(AUTH_KEYS.refreshToken, refreshResult.data.refreshToken)
                    localStorage.setItem(AUTH_KEYS.accessToken, refreshResult.data.accessToken)
                    result = await baseQuery(args, api, extraOptions)
                } else {
                    // @ts-ignore
                    api.dispatch(baseApi.endpoints.logout.initiate())
                }

            } finally {
                release()
            }
        }
    }

    if (result.error && result.error.status !== 401) {
        handleErrors(result.error)
    }


    return result
}

