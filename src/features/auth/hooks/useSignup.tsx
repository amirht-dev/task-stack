import Toast from '@/components/Toast';
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
    const id = toast.custom(
      () => <Toast variant="loading" title="Creating account" />,
      {
        id: 'signup',
      }
    );
    const res = await signupAction({ email, password });

    if (res.success) {
      toast.custom(
        () => <Toast variant="success" title="Signup successfully" />,
        { id }
      );
      router.push('/sign-in');
    } else {
      toast.custom(
        () => (
          <Toast
            variant="destructive"
            title="Failed to create account"
            description={res.error.message}
          />
        ),
        {
          id,
        }
      );
    }
  });

  return { form, submitHandler };
}

export default useSignup;
