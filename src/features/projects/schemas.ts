import { z } from 'zod/v4';

export const CreateProjectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .refine((value) => !!value, 'name is required')
    .min(4, 'name must be at least 4 characters'),
  workspaceId: z
    .string()
    .trim()
    .refine((value) => !!value, 'ownerId is required'),
  image: z
    .file()
    .max(500_000, 'maximum size of image must be 500kb')
    .mime(['image/jpeg', 'image/png', 'image/webp'])
    .nullable(),
});
export type CreateProjectFormSchema = z.infer<typeof CreateProjectFormSchema>;
