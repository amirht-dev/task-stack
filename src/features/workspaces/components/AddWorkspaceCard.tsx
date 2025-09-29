import { CirclePlus } from 'lucide-react';
import WorkspaceFormDialog from './WorkspaceFormDialog';

const AddWorkspaceCard = () => {
  return (
    <WorkspaceFormDialog
      trigger={
        <button className="h-[178px] border-dashed rounded-xl flex items-center border justify-center border-muted-foreground/50 cursor-pointer">
          <CirclePlus className="size-10 text-muted-foreground/50" />
        </button>
      }
    />
  );
};

export default AddWorkspaceCard;
