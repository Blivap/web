import { useAppSelector } from "@/app/store/hooks";

export const useDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  return { user };
};
