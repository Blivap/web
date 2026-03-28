import { useAppSelector } from "@/app/store/hooks";
import { useCheckUser } from "../auth/useCheckUser.hook";

export const useDashboard = () => {
  const { isChecking } = useCheckUser();
  const { user } = useAppSelector((state) => state.auth);

  return { user, isChecking };
};
