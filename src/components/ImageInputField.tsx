import { FileWithPreview } from '@/hooks/useFileUpload';
import { generateRandomColorImageFile } from '@/utils/client';
import { ComponentProps, useState } from 'react';
import { FaArrowsRotate } from 'react-icons/fa6';
import ImageInput from './ImageInput';
import { Button } from './ui/button';

type ImageInputFieldProps = ComponentProps<typeof ImageInput> & {
  onGenerateRandomColor?: (file: FileWithPreview) => void;
};

const ImageInputField = ({
  onGenerateRandomColor,
  ...inputProps
}: ImageInputFieldProps) => {
  const [file, setFile] = useState<FileWithPreview>();
  return (
    <div className="flex items-start justify-between gap-2">
      <ImageInput
        {...inputProps}
        file={inputProps.file ?? file}
        onFileChange={(file) => {
          inputProps.onFileChange?.(file);
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
};

export default ImageInputField;
