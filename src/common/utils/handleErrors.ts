import {isErrorWithDetail} from "@/common/utils/isErrorWithDetail.ts";
import {trimToMaxLength} from "@/common/utils/trimToMaxLength.ts";
import {isErrorWithProperty} from "@/common/utils/isErrorWithProperty.ts";
import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {errorToast} from "@/common/utils/errorToast.ts";


export const handleErrors = (error: FetchBaseQueryError)=> {
    if(error) {
        switch(error.status) {
            case 'TIMEOUT_ERROR':
            case 'PARSING_ERROR':
            case 'CUSTOM_ERROR':
            case 'FETCH_ERROR':
                errorToast(error.error)
                break

            case 400:
                if(isErrorWithDetail(error.data)) {
                    const errorMessage = error.data.errors[0].detail
                    if(errorMessage.includes('refresh')) return
                    errorToast(trimToMaxLength(error.data.errors[0].detail))
                } else {
                    errorToast(JSON.stringify(error))
                }
                break
            case 403:
                if(isErrorWithDetail(error.data)) {
                    errorToast(trimToMaxLength(error.data.errors[0].detail))
                } else {
                    errorToast(JSON.stringify(error))
                }
                break
            case 404:
                //✅ Type assertion
                //toast((result.error.data as {error: string}).error, {type: 'error', theme: 'colored'})
                //✅ Type Predicate
                // if(isErrorWithError(result.error.data)) {
                //     toast(result.error.data.error, {type: 'error', theme: 'colored'})
                // } else {
                //     toast(JSON.stringify(result.error.data), {type: 'error', theme: 'colored'})
                // }

                if(isErrorWithProperty(error.data, 'error')) {
                    errorToast(error.data.error)
                } else {
                    errorToast(JSON.stringify(error.data))
                }
                break

            case 429:
                //✅ Type assertion
                //toast((result.error.data as {message: string}).message, {type: 'error', theme: 'colored'})
                //✅ JSON.stringify
                // toast(JSON.stringify(result.error.data) , {type: 'error', theme: 'colored'})
                //✅ Type Predicate
                if(isErrorWithProperty(error.data, 'message')) {
                    errorToast(error.data.message)
                } else {
                    errorToast(JSON.stringify(error.data) )
                }
                break

            default:
                if(error.status >= 500 && error.status < 600) {
                    errorToast('Server error occurred. Please, try again')
                } else {
                    errorToast('Some error occurred')
                }
        }
    }
}