import UserButton from '@/components/UserButton';

const Navbar = () => {
  return (
    <div className="h-16 bg-white border-b border-neutral-200 flex items-center px-10">
      <div className="flex flex-col">
        <span className="text-lg font-semibold">Home</span>
        <span className="text-neutral-600 text-sm">
          Monitor all your projects and tasks here
        </span>
      </div>
      <UserButton triggerClassName="ms-auto" />
    </div>
  );
};

export default Navbar;
