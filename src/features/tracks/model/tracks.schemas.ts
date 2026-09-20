import {z} from "zod";
import {userSchema} from "@/common/schemas";

export const trackRelationshipsSchema = z.object({
    artists: z.object({
        data: z.array(z.object({
            id: z.string(),
            type: z.string(),
        }))
    })
})

export const trackAttachmentSchema = z.object({
    id: z.string(),
    addedAt: z.string(),
    updatedAt: z.string(),
    version: z.number(),
    url: z.string(),
    contentType: z.string(),
    originalName: z.string(),
    fileSize: z.number(),
})


export const  trackAttributesSchema = z.object({
    title: z.string(),
    addedAt: z.string(),
    attachments: z.array(trackAttachmentSchema),
    user: userSchema,
})


export const trackDataSchema = z.object({
id: z.string(),
    type: z.literal('tracks'),
    attributes: trackAttributesSchema,
    relationships: trackRelationshipsSchema,
})


export const tracksIncludedSchema = z.object({
    id: z.string(),
    type: z.literal('artists'),
    attributes: z.object({
        name: z.string(),
    })
})

export const tracksMetaSchema = z.object({
    nextCursor: z.string().nullable(),
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number().nullable(),
    pagesCount: z.number().nullable(),
})


export const fetchTracksResponseSchema = z.object({
    data: z.array(trackDataSchema),
    included: z.array(tracksIncludedSchema),
    meta: tracksMetaSchema,
})
