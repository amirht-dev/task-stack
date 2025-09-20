import {
  FileUploadOptions,
  FileWithPreview,
  formatBytes,
  useFileUpload,
} from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import Image from 'next/image';
import { ComponentPropsWithRef } from 'react';
import { IoImageOutline } from 'react-icons/io5';
import { Merge } from 'type-fest';
import { Button } from './ui/button';

type ImageInputProps = Merge<
  ComponentPropsWithRef<'input'>,
  Pick<FileUploadOptions, 'maxSize' | 'onError'> & {
    file?: FileWithPreview;
    onFileChange?: (file: FileWithPreview) => void;
  }
>;

const ImageInput = ({
  maxSize = 500 * 1024,
  file,
  onFileChange,
  onError,
  ...inputProps
}: ImageInputProps) => {
  const [
    { files, isDragging },
    {
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
    },
  ] = useFileUpload({
    accept: 'image/*',
    multiple: false,
    maxFiles: 1,
    onFilesChange: (files) => {
      const file = files[0];
      onFileChange?.(file ?? undefined);
    },
    maxSize,
    onError,
  });

  const currentFile: FileWithPreview = file ?? files[0];
  const previewUrl =
    currentFile?.preview ??
    (currentFile?.file instanceof File
      ? URL.createObjectURL(currentFile?.file)
      : undefined);

  const handleRemove = () => {
    if (currentFile) {
      removeFile(currentFile.id);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="relative">
        <div
          className={cn(
            'group size-18 border-dashed border rounded-xl flex items-center justify-center relative overflow-hidden has-disabled:bg-neutral-100 has-disabled:cursor-not-allowed',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/20',
            previewUrl && 'border-solid'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            {...getInputProps(inputProps)}
            type="file"
            className="sr-only"
          />
          {previewUrl ? (
            <Image
              src={previewUrl}
              fill
              className="object-cover object-center"
              alt={currentFile?.file.name}
            />
          ) : (
            <IoImageOutline className="size-10 text-neutral-400 group-has-disabled:text-neutral-300" />
          )}
        </div>
        {currentFile && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleRemove}
            className="size-4 absolute translate-x-1/2 -translate-y-1/3 end-0 top-0 rounded-full"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm line-clamp-1">
          {currentFile ? currentFile.file.name : 'choose image'}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          PNG, JPG up to {formatBytes(maxSize)}
        </p>
      </div>
    </div>
  );
};

export default ImageInput;
