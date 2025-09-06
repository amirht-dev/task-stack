import { signUpSchema, SignUpSchemaType } from '@/utils/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

function useSignup() {
  const form = useForm<SignUpSchemaType>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(signUpSchema),
  });

  const submitHandler = form.handleSubmit((data) => {
    console.log(data);
    const promise = new Promise((res) => setTimeout(res, 2000));

    toast.promise(promise, {
      success: 'Signup successfully',
      loading: 'creating account',
      error: 'failed to create account',
      richColors: true,
      position: 'top-center',
    });
  });

  return { form, submitHandler };
}

export default useSignup;
