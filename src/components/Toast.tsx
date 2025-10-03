import { CircleCheck, TriangleAlert } from 'lucide-react';
import { ComponentProps, ReactNode } from 'react';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from './ui/alert';
import { ProgressCircle } from './ui/progress';

type ToastProps = {
  variant?:
    | Extract<
        ComponentProps<typeof Alert>['variant'],
        'success' | 'destructive'
      >
    | 'loading';
  title: ReactNode;
  description?: ReactNode;
};

const toastIcon: Record<NonNullable<ToastProps['variant']>, ReactNode> = {
  loading: (
    <ProgressCircle
      value={25}
      className="animate-spin"
      size={20}
      strokeWidth={2}
    />
  ),
  success: <CircleCheck />,
  destructive: <TriangleAlert />,
};

const Toast = ({ variant, title, description }: ToastProps) => {
  return (
    <Alert
      variant={variant === 'loading' ? undefined : variant}
      appearance="light"
      className="min-w-2xs max-w-md"
    >
      {variant && <AlertIcon>{toastIcon[variant]}</AlertIcon>}
      <AlertContent>
        <AlertTitle>{title}</AlertTitle>
        {!!description && <AlertDescription>{description}</AlertDescription>}
      </AlertContent>
    </Alert>
  );
};

export default Toast;
