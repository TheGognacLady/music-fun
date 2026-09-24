import { z } from 'zod'
import { imagesSchema } from '@/common/schemas'

export type Images = z.infer<typeof imagesSchema>
