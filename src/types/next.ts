import { FC, ReactNode } from "react";
import { Simplify, UnionToIntersection } from "type-fest";

type PromiseAble<T> = T | Promise<T>;

type SingleParam<P extends string = string> = P;
type CatchAllParam<P extends string = string> = P[];
type OptionalCatchAllParam<P extends string = string> = P[][];

type ParamObjectType<
  TParamKey extends string = string,
  TParamValue = unknown,
> = Record<TParamKey, TParamValue>;

type ConvertAbleParams<P extends string = string> =
  | SingleParam<P>
  | CatchAllParam<P>
  | OptionalCatchAllParam<P>;

type ParamType<P extends string = string> =
  | ConvertAbleParams<P>
  | ParamObjectType<P, unknown>;

type ParamObject<T extends ConvertAbleParams> =
  T extends OptionalCatchAllParam<infer P>
    ? ParamObjectType<P, string[] | undefined>
    : T extends CatchAllParam<infer P>
      ? ParamObjectType<P, string[]>
      : T extends SingleParam<infer P>
        ? ParamObjectType<P, string>
        : never;

export type NextParams<
  T extends ParamType,
  TParentParams extends ParamObjectType = never,
> = Simplify<
  UnionToIntersection<
    | (T extends ParamObjectType
        ? T
        : T extends ConvertAbleParams
          ? ParamObject<T>
          : never)
    | TParentParams
  >
>;

type NextParamsObject<TParams = never> = [TParams] extends [ParamType]
  ? {
      params: Promise<NextParams<TParams>>;
    }
  : never;

// components
export type NextPageProps<TParams extends ParamType = never> =
  NextParamsObject<TParams> & {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  };

export type NextPage<TParams extends ParamType = never> = FC<
  NextPageProps<TParams>
>;

export type NextLayoutProps<TParams extends ParamType = never> = {
  children: ReactNode;
} & NextParamsObject<TParams>;

export type NextLayout<TParams extends ParamType = never> = FC<
  NextLayoutProps<TParams>
>;
// ==========================

// functions
export type GenericStaticParamsReturnType<TParams extends ParamType> =
  PromiseAble<Array<NextParams<TParams>>>;

export type GenericStaticParams<TParams extends ParamType> =
  () => GenericStaticParamsReturnType<TParams>;

export type ServerFunction<TParams extends unknown[], TReturn = void> = (
  ...params: TParams
) => Promise<TReturn>;

export type FormServerAction<
  TParams extends unknown[] = [],
  TReturn = void,
> = ServerFunction<[...TParams, formData: FormData], TReturn>;

export type UseActionStateServerActionFunction<
  T = void,
  TParams extends unknown[] = [],
> = FormServerAction<[currentState: T, ...TParams], T>;

export type UseActionStateServerFunctionFunction<
  T = void,
  TParams extends unknown[] = [],
> = ServerFunction<[currentState: T, ...TParams], T>;
