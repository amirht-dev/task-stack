/* eslint-disable @typescript-eslint/no-explicit-any */
export type RootErrorHandler = (context: {
  error: Error;
  operationName: string;
}) => void;

export type OperationErrorHandler = (error: Error) => void;

export type OperationProps<T extends (...args: any) => any> = {
  name: string;
  fn: T;
  rollbackFn: (data: Awaited<ReturnType<T>>) => Promise<any> | any;
  onError?: OperationErrorHandler;
};

export type RollbackItem = {
  fn: () => Promise<void> | void;
  operationName: string;
};

export type OperationReturnType<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T> | undefined>;

export class Transaction {
  private _rollbacks: Array<RollbackItem> = [];
  private _error: Error | null = null;
  private _onError: RootErrorHandler | undefined;
  private _rollbackExecutionMode: 'concurrent' | 'sequential' = 'concurrent';

  constructor(options?: {
    onError?: RootErrorHandler;
    rollbackExecutionMode?: 'concurrent' | 'sequential';
  }) {
    this._onError = options?.onError;
    if (options?.rollbackExecutionMode)
      this._rollbackExecutionMode = options?.rollbackExecutionMode;
  }

  get error() {
    return this._error;
  }

  operation<T extends (...args: any) => any>({
    name,
    fn,
    rollbackFn,
    onError,
  }: OperationProps<T>): OperationReturnType<T> {
    return async (
      ...args: Parameters<T>
    ): Promise<ReturnType<T> | undefined> => {
      try {
        if (this.error) return;

        const res = await fn(...args);

        this._rollbacks.push({
          fn: () => rollbackFn(res),
          operationName: name,
        });

        return res;
      } catch (error) {
        if (error instanceof Error) {
          this._error = error;
          this._onError?.({ error, operationName: name });
          onError?.(error);
        }

        if (this._rollbackExecutionMode === 'concurrent') {
          await Promise.all(
            this._rollbacks
              .filter((rollback) => rollback.operationName !== name)
              .map((rollback) => rollback.fn())
          );
        } else {
          for (const rollback of this._rollbacks) {
            if (rollback.operationName === name) continue;
            await rollback.fn();
          }
        }
      }
    };
  }

  handleThrowError() {
    if (this.error) throw this.error;
  }
}
