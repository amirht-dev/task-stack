'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HiOutlineSelector } from 'react-icons/hi';
import useSelectWorkspace from '../hooks/useSelectWorkspace';
import useWorkspacesQuery from '../hooks/useWorkspacesQuery';

type WorkspaceSwitcherProps = {
  classname?: string;
};

const WorkspaceSwitcher = ({ classname }: WorkspaceSwitcherProps) => {
  const { data, isError, isLoading } = useWorkspacesQuery();
  const { selectedWorkspace, selectWorkspace } = useSelectWorkspace();

  if (isError) return null;

  return (
    <Select
      disabled={isLoading}
      indicatorPosition="right"
      onValueChange={selectWorkspace}
      value={selectedWorkspace?.$id}
    >
      <SelectTrigger icon={<HiOutlineSelector />} className={classname}>
        <SelectValue placeholder="Select workspace" />
      </SelectTrigger>

      <SelectContent>
        {data?.rows.map((workspace) => (
          <SelectItem key={workspace.$id} value={workspace.$id}>
            <span className="flex items-center gap-2">
              <Avatar className="size-4">
                <AvatarImage src={workspace.image} alt={workspace.name} />
              </Avatar>
              {workspace.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default WorkspaceSwitcher;
