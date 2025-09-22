import { z } from 'zod/v4';

export const WorkspaceSchema = z.object({
  name: z
    .string()
    .refine((value) => value.length > 0, 'workspace name is required')
    .min(4, 'minimum length of workspace name is 4 characters'),
  image: z
    .file()
    .max(500_000)
    .mime(['image/png', 'image/jpeg', 'image/webp'])
    .nullable(),
});

export type WorkspaceSchema = z.infer<typeof WorkspaceSchema>;

export const WorkspaceNameFormUpdateSchema = (currentName: string) =>
  z.object({
    name: z
      .string()
      .trim()
      .refine((value) => value !== '', 'name is required')
      .refine(
        (value) => value !== currentName,
        'name is equal to current name'
      ),
  });

export type WorkspaceNameFormUpdateSchema = z.infer<
  ReturnType<typeof WorkspaceNameFormUpdateSchema>
>;

export const WorkspaceImageFormUpdateSchema = WorkspaceSchema.pick({
  image: true,
});

export type WorkspaceImageFormUpdateSchema = z.infer<
  typeof WorkspaceImageFormUpdateSchema
>;
