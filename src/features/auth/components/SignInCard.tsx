'use client';

import LabeledSeparator from '@/components/LabeledSeparator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OAuthProviders from '@/features/auth/components/OAuthProviders';
import { signInSchema, SignInSchemaType } from '@/features/auth/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import useSignIn from '../hooks/useSignIn';
import AuthCard from './AuthCard';

const SignInCard = () => {
  const { signIn } = useSignIn();
  const form = useForm<SignInSchemaType>({
    defaultValues: {
      email: 'test@gmail.com',
      password: '12345678',
    },
    resolver: zodResolver(signInSchema),
  });

  const submitHandler = form.handleSubmit(async (data) => {
    signIn({ method: 'credentials', data });
  });

  return (
    <AuthCard
      title="Welcome back"
      description="Please enter your details to sign in"
      footer={
        <>
          Don&apos;t have account yet? <Link href="/sign-up">Sign up</Link>
        </>
      }
    >
      <OAuthProviders />

      <LabeledSeparator label="or" className="mt-6" />

      <Form {...form}>
        <form className="mt-10" onSubmit={submitHandler}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter your email..."
                    variant="lg"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter your password..."
                    type="password"
                    variant="lg"
                    className="mt-7"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4 flex items-center justify-between">
            <Label className="flex items-center gap-2" variant="secondary">
              <Checkbox />
              <span>Remember me</span>
            </Label>

            <Button asChild mode="link" variant="ghost" underlined="solid">
              <Link href="">Forgot password?</Link>
            </Button>
          </div>

          <Button type="submit" className="w-full mt-6" size="lg">
            Sign in
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default SignInCard;
