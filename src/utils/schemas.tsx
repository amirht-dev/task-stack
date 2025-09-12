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
    termAndConditions: z
      .boolean()
      .refine(Boolean, 'you must accept terms and conditions'),
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

export const signInSchema = z.object({
  email: signUpSchema.shape.email,
  password: signUpSchema.shape.password,
});

export type SignInSchemaType = z.infer<typeof signInSchema>;

export const oauthSchema = z.object({
  userId: z.string(),
  secret: z.string(),
});

export type OAuthSchemaType = z.infer<typeof oauthSchema>;
