import { signupAction } from '@/actions/auth.action';
import { signUpSchema, SignUpSchemaType } from '@/utils/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

function useSignup() {
  const router = useRouter();
  const form = useForm<SignUpSchemaType>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      termAndConditions: false,
    },
    resolver: zodResolver(signUpSchema),
  });

  const submitHandler = form.handleSubmit(async ({ email, password }) => {
    const signupPromise = signupAction({ email, password });

    toast.promise(signupPromise, {
      loading: 'creating account',
      success: () => {
        router.push('/sign-in');
        return {
          message: 'Signup successfully',
        };
      },
      error: (error) => ({
        message:
          error instanceof Error ? error.message : 'failed to create account',
      }),
      richColors: true,
      position: 'top-center',
    });
  });

  return { form, submitHandler };
}

export default useSignup;
