'use client';

import {
  QueryClientProvider as BaseQueryCLientProvider,
  isServer,
  QueryClient,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PropsWithChildren, useEffect } from 'react';

function makeQueryClient() {
  return new QueryClient();
}

let browserQueryClient: QueryClient | null = null;

function getQueryClient() {
  if (isServer) return makeQueryClient();
  return (browserQueryClient ??= makeQueryClient());
}

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
  }
}

const QueryClientProvider = ({ children }: PropsWithChildren) => {
  const queryClient = getQueryClient();

  useEffect(() => {
    window.__TANSTACK_QUERY_CLIENT__ = queryClient;
  }, [queryClient]);

  return (
    <BaseQueryCLientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </BaseQueryCLientProvider>
  );
};

export default QueryClientProvider;
