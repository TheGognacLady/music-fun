import type {ZodType} from "zod";
import type {FetchBaseQueryError, NamedSchemaError} from "@reduxjs/toolkit/query";
import {errorToast} from "@/common/utils/errorToast.ts";

export const withZodCatch = <T extends ZodType>(schema: T)=> ({
    responseSchema: schema,
    catchSchemaFailure: (err: NamedSchemaError): FetchBaseQueryError => {
        errorToast('Zod Error Details are in console', err.issues)
        return {
            status: 'CUSTOM_ERROR',
            error: 'Schema validation failed'
        }
    }
})