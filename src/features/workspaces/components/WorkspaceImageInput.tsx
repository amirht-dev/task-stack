'use client';

import ImageInput from '@/components/ImageInput';
import { Button } from '@/components/ui/button';
import { FileWithPreview } from '@/hooks/useFileUpload';
import { generateRandomColorImageFile } from '@/utils/client';
import { ComponentProps, useState } from 'react';
import { FaArrowsRotate } from 'react-icons/fa6';
import { Merge } from 'type-fest';

type WorkspaceImageInputProps = Merge<
  ComponentProps<typeof ImageInput>,
  {
    onGenerateRandomColor?: (file: FileWithPreview) => void;
  }
>;

function WorkspaceImageInput({
  onGenerateRandomColor,
  ...props
}: WorkspaceImageInputProps) {
  const [file, setFile] = useState<FileWithPreview>();

  return (
    <div className="flex justify-between">
      <ImageInput
        {...props}
        file={props.file ?? file}
        onFileChange={(file) => {
          props.onFileChange?.(file);
          setFile(file);
        }}
      />
      <Button
        variant="dim"
        type="button"
        onClick={async () => {
          const file = await generateRandomColorImageFile();
          setFile((prev) => {
            if (prev?.preview) URL.revokeObjectURL(prev.preview);

            return {
              file,
              id: 'random-color',
              preview: URL.createObjectURL(file),
            };
          });

          onGenerateRandomColor?.({
            file,
            id: 'random-color',
            preview: URL.createObjectURL(file),
          });
        }}
      >
        <FaArrowsRotate />
        <span>random color</span>
      </Button>
    </div>
  );
}

export default WorkspaceImageInput;
