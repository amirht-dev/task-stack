import {
  DiscriminatedResponse,
  DiscriminatedResponseWithData,
} from '@/types/utils';
import { AppwriteException } from 'node-appwrite';
import 'server-only';
import { Promisable } from 'type-fest';

export async function handleResponse(
  cb: () => Promisable<void>
): Promise<DiscriminatedResponse>;
export async function handleResponse<T>(
  cb: () => Promisable<T>
): Promise<DiscriminatedResponseWithData<T>>;
export async function handleResponse(
  cb: () => unknown
): Promise<DiscriminatedResponse | DiscriminatedResponseWithData<unknown>> {
  try {
    const data = await cb();
    return {
      success: true,
      data,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);

    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : typeof error === 'string'
            ? error
            : 'something wrong happened please try again later',
        type: error instanceof AppwriteException ? error.type : undefined,
      },
    };
  }
}

export function unwrapDiscriminatedResponse<TData>(
  response: DiscriminatedResponseWithData<TData>
): TData;
export function unwrapDiscriminatedResponse(
  response: DiscriminatedResponse
): void;
export function unwrapDiscriminatedResponse(
  response: DiscriminatedResponse | DiscriminatedResponseWithData<unknown>
) {
  if (!response.success) throw new Error(response.error.message);
  return 'data' in response ? response.data : undefined;
}
