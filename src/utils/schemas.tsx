import z from 'zod/v4';

export const signUpSchema = z
  .object({
    email: z.email({
      error: (issue) =>
        issue.input === '' ? 'email address is required' : 'invalid email',
    }),
    password: z
      .string('invalid password')
      .refine((value) => value, 'password is required')
      .min(8, 'password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword)
      ctx.addIssue({
        code: 'invalid_value',
        values: [password, confirmPassword],
        input: confirmPassword,
        message: 'password and confirm password did not match',
        path: ['confirmPassword'],
      });
  });

export type SignUpSchemaType = z.infer<typeof signUpSchema>;
