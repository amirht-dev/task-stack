import { signupAction } from '@/features/auth/actions';
import { signUpSchema, SignUpSchemaType } from '@/features/auth/schemas';
import sonner from '@/utils/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

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
    const id = sonner.loading({
      title: 'Creating account',
      toastData: {
        id: 'signup',
      },
    });

    const res = await signupAction({ email, password });

    if (res.success) {
      sonner.success({
        title: 'Signup successfully',
        toastData: {
          id,
        },
      });
      router.push('/sign-in');
    } else {
      sonner.error({
        title: 'Failed to create account',
        description: res.error.message,
        toastData: {
          id,
        },
      });
    }
  });

  return { form, submitHandler };
}

export default useSignup;
