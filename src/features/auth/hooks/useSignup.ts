import { signupAction } from '@/features/auth/actions';
import { signUpSchema, SignUpSchemaType } from '@/features/auth/schemas';
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
    const id = toast.loading('Creating account', {
      id: 'signup',
      description: undefined,
    });
    const res = await signupAction({ email, password });

    if (res.success) {
      toast.success('Signup successfully', { id, description: undefined });
      router.push('/sign-in');
    } else {
      toast.error('Failed to create account', {
        id,
        description: res.error.message,
      });
    }
  });

  return { form, submitHandler };
}

export default useSignup;
