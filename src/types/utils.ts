import {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
} from 'react';
import {
  Merge,
  OmitIndexSignature,
  PickIndexSignature,
  Primitive,
} from 'type-fest';
import { SimpleMerge } from 'type-fest/source/merge';

export type PropsWithAsChild<P = object> = Merge<
  P,
  {
    asChild?: boolean;
  }
>;

export type PropsWithComponentPropsWithoutRef<
  T extends ElementType,
  P = object
> = Merge<ComponentPropsWithoutRef<T>, P>;

export type PropsWithComponentPropsWithRef<
  T extends ElementType,
  P = object
> = Merge<ComponentPropsWithRef<T>, P>;

export type OneOrMore<T> = T | T[];

export type DistributedMerge<Destination, Source> = Destination extends infer T
  ? Merge<T, Source>
  : never;

export type UnwrapLiteralUnion<T, P extends Primitive> = T extends P & {}
  ? P extends T
    ? never
    : T // Check if T is exactly (string & {})
  : T;

export type UnSimplifiedMerge<Destination, Source> = SimpleMerge<
  PickIndexSignature<Destination>,
  PickIndexSignature<Source>
> &
  SimpleMerge<OmitIndexSignature<Destination>, OmitIndexSignature<Source>>;

export type DiscriminatedResponse =
  | { success: true }
  | { success: false; error: { message: string; type?: string } };

export type DiscriminatedResponseWithData<TData> =
  | { success: true; data: TData }
  | { success: false; error: { message: string; type?: string } };
