import {
  DiscriminatedResponse,
  DiscriminatedResponseWithData,
} from '@/types/utils';
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
      error:
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'something wrong happened please try again later',
    };
  }
}
