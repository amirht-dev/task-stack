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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ComponentProps, useId } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

const providers = [FcGoogle, FaGithub];

function GridPattern({ className, ...props }: ComponentProps<'svg'>) {
  const id = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn(
        '[--fg:theme(colors.neutral.200)] [--bg:none] [--zoom:2] [--width:1px]',
        className
      )}
    >
      <defs>
        <pattern
          id={id}
          width="20"
          height="20"
          style={{
            transform: 'scale(var(--zoom))',
          }}
          patternUnits="userSpaceOnUse"
        >
          <rect width="100%" height="100%" fill="var(--bg)" />
          <path
            fill="none"
            strokeWidth="var(--width)"
            stroke="var(--fg)"
            d="M10 0v20ZM0 10h20Z"
          />
        </pattern>
      </defs>
      <rect width="800%" height="800%" fill={`url(#${id})`} />
    </svg>
  );
}

const SignIn = () => {
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
              Welcome back
            </CardTitle>
            <CardDescription>
              Please enter your details to sign in
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

            <form className="mt-10">
              <Input
                placeholder="Enter your email..."
                variant="lg"
                type="email"
              />
              <Input
                placeholder="Enter your password..."
                type="password"
                variant="lg"
                className="mt-7"
              />

              <div className="mt-4 flex items-center justify-between">
                <Label className="flex items-center gap-2">
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
          </CardContent>

          <CardFooter>
            <p className="mx-auto text-sm">
              Don&apos;t have account yet? <Link href="/sign-up">Sign up</Link>
            </p>
          </CardFooter>
        </div>
      </Card>
    </>
  );
};

export default SignIn;
