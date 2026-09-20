import {z} from "zod";
import {coverSchema, currentUserReactionSchema, imagesSchema, tagSchema, userSchema} from "@/common/schemas";


export type Tag = z.infer<typeof tagSchema>
export type User = z.infer<typeof userSchema>
export type Cover = z.infer<typeof coverSchema>
export type Images = z.infer<typeof imagesSchema>
export type CurrentUserReaction = z.infer<typeof currentUserReactionSchema>

// export type Tag = {
//     id: string
//     name: string
// }
//
// export type User = {
//     id: string
//     name: string
// }
//
// export type Images = {
//     main: Cover[]
// }
//
// export type Cover = {
//     type: 'original' | 'medium' | 'thumbnail'
//     width: number
//     height: number
//     fileSize: number
//     url: string
// }