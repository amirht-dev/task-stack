'use client';

import GridPattern from '@/components/GridPattern';
import Logo from '@/components/Logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PropsWithChildren, ReactNode } from 'react';

export type AuthCardProps = PropsWithChildren<{
  title: string;
  description: string;
  footer: ReactNode;
}>;

const AuthCard = ({ title, description, children, footer }: AuthCardProps) => {
  return (
    <Card className="max-w-md w-full relative rounded-3xl">
      <GridPattern
        className="absolute top-1/2 left-1/2 -translate-x-1/2 [--zoom:3] [--width:0.5px] -translate-y-1/2 w-[150%] rounded-full dark:[--fg:var(--color-neutral-600)] [--fg:white] h-[400px] bg-[radial-gradient(--alpha(var(--color-primary)/10%)_0%,--alpha(var(--color-primary)/10%)_50%,transparent_70%)]"
        style={{
          maskImage:
            'radial-gradient(black 0%, transparent 80%, transparent 100%)',
        }}
      />
      <div className="p-6 overflow-hidden relative bg-card rounded-[inherit]">
        <span
          className="w-[300px] h-[200px] inline-block absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 bg-primary/12"
          style={{
            maskImage:
              'radial-gradient(black 0%, transparent 80%, transparent 100%)',
          }}
        >
          <GridPattern className="size-full [--zoom:1.6] [--fg:black] dark:[--fg:white] dark:opacity-10 opacity-6 [--width:0.5px]" />
        </span>
        <CardHeader className="flex flex-col border-none relative">
          <Logo variant="icon" className="w-14" />
          <CardTitle className="text-2xl leading-none mt-2">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="mt-6 p-0">{children}</CardContent>

        <CardFooter>
          <p className="mx-auto text-sm">{footer}</p>
        </CardFooter>
      </div>
    </Card>
  );
};

export default AuthCard;
