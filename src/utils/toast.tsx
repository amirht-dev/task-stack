import Toast from '@/components/Toast';
import { ComponentProps } from 'react';
import { ExternalToast, toast } from 'sonner';

type Props = Omit<ComponentProps<typeof Toast>, 'variant'> & {
  toastData?: ExternalToast;
};

const sonner = {
  loading: ({ toastData, ...props }: Props) => {
    const data: ExternalToast = {
      duration: Infinity,
      ...toastData,
    };
    return toast.custom(() => <Toast variant="loading" {...props} />, data);
  },
  success: ({ toastData, ...props }: Props) => {
    const data: ExternalToast = {
      duration: 3_000,
      ...toastData,
    };
    return toast.custom(() => <Toast variant="success" {...props} />, data);
  },
  error: ({ toastData, ...props }: Props) => {
    const data: ExternalToast = {
      duration: 5_000,
      ...toastData,
    };
    return toast.custom(() => <Toast variant="destructive" {...props} />, data);
  },
};

export default sonner;
