'use client';

import { ProgressCircle } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { HiOutlineSelector } from 'react-icons/hi';
import useSelectWorkspace from '../hooks/useSelectWorkspace';
import useWorkspacesQuery from '../hooks/useWorkspacesQuery';

type WorkspaceSwitcherProps = {
  classname?: string;
};

const WorkspaceSwitcher = ({ classname }: WorkspaceSwitcherProps) => {
  const { data, isError, isLoading, isSuccess, isFetching } =
    useWorkspacesQuery();
  const { selectedWorkspace, selectWorkspace } = useSelectWorkspace();

  if (isError || (isSuccess && data.length === 0)) return null;

  return (
    <Select
      disabled={isLoading}
      indicatorPosition="right"
      onValueChange={selectWorkspace}
      value={selectedWorkspace?.$id}
    >
      <SelectTrigger icon={<HiOutlineSelector />} className={classname}>
        <SelectValue placeholder="Select workspace" />
        {isFetching && (
          <ProgressCircle
            value={25}
            size={16}
            strokeWidth={2}
            className="text-primary animate-spin ms-auto"
          />
        )}
      </SelectTrigger>

      <SelectContent>
        {data?.map((workspace) => (
          <SelectItem key={workspace.$id} value={workspace.$id}>
            <span className="flex items-center gap-2">
              {workspace.image && (
                <div className="relative size-4 rounded overflow-hidden">
                  <Image
                    src={workspace.image.url}
                    alt={workspace.name}
                    className="object-cover object-center absolute"
                    fill
                  />
                </div>
              )}
              {workspace.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default WorkspaceSwitcher;
