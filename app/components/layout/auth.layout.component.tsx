export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 flex justify-center items- w-full h-full">
      {children}
      <div className="w-1/2 bg-[#960018] rounded-l-[60px] h-full"></div>
    </div>
  );
};
