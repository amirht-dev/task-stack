'use client';

import AuthCard from '@/components/AuthCard';
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
import { providers } from '@/constants';
import useSignup from '@/hooks/useSignup';
import Link from 'next/link';

const SignUp = () => {
  const { form, submitHandler } = useSignup();

  return (
    <AuthCard
      title="Create an account"
      description="Get started with an account in Task Stack"
      footer={
        <>
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </>
      }
    >
      <div className="flex gap-4">
        {providers.map((Icon, idx) => (
          <Button key={idx} className="flex-1" variant="outline" size="lg">
            <Icon className="size-6" />
          </Button>
        ))}
      </div>

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
                    placeholder="Email..."
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
                    placeholder="Password..."
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Confirm password..."
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

          <Label className="flex items-center gap-2 mt-4">
            <Checkbox />
            <span className="text-sm">
              By registering you agree with our Terms & Conditions
            </span>
          </Label>

          <Button type="submit" className="w-full mt-6" size="lg">
            Sign Up
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default SignUp;
