'use client';

import GridPattern from '@/components/GridPattern';
import LabeledSeparator from '@/components/LabeledSeparator';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { signUpSchema, SignUpSchemaType } from '@/utils/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const SignUp = () => {
  const form = useForm<SignUpSchemaType>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<SignUpSchemaType> = (data) => {
    console.log(data);
    const promise = new Promise((res) => setTimeout(res, 2000));

    toast.promise(promise, {
      success: 'Signup successfully',
      loading: 'creating account',
      error: 'failed to create account',
      richColors: true,
      position: 'top-center',
    });
  };

  return (
    <>
      <Card className="max-w-md w-full relative rounded-3xl">
        <GridPattern
          className="absolute top-1/2 left-1/2 -translate-x-1/2 [--zoom:3] [--width:0.5px] -translate-y-1/2 w-[150%] rounded-full [--fg:white] h-[400px] bg-[radial-gradient(--alpha(var(--color-primary)/10%)_0%,--alpha(var(--color-primary)/10%)_50%,transparent_70%)]"
          style={{
            maskImage:
              'radial-gradient(black 0%, transparent 80%, transparent 100%)',
          }}
        />
        <div className="p-6 overflow-hidden relative bg-white rounded-[inherit]">
          <span
            className="w-[300px] h-[200px] inline-block absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 bg-primary/12"
            style={{
              maskImage:
                'radial-gradient(black 0%, transparent 80%, transparent 100%)',
            }}
          >
            <GridPattern className="size-full [--zoom:1.6] [--fg:black] opacity-6 [--width:0.5px]" />
          </span>
          <CardHeader className="flex flex-col border-none relative">
            <Logo variant="icon" className="w-14" />
            <CardTitle className="text-2xl leading-none mt-2">
              Create an account
            </CardTitle>
            <CardDescription>
              Get started with an account in Task Stack
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-6 p-0">
            <div className="flex gap-4">
              {providers.map((Icon, idx) => (
                <Button
                  key={idx}
                  className="flex-1"
                  variant="outline"
                  size="lg"
                >
                  <Icon className="size-6" />
                </Button>
              ))}
            </div>

            <LabeledSeparator label="or" className="mt-6" />

            <Form {...form}>
              <form className="mt-10" onSubmit={form.handleSubmit(onSubmit)}>
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
          </CardContent>

          <CardFooter>
            <p className="mx-auto text-sm">
              Already have an account? <Link href="/sign-in">Sign in</Link>
            </p>
          </CardFooter>
        </div>
      </Card>
    </>
  );
};

export default SignUp;
