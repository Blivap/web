import { useAppSelector } from "@/app/store/hooks";
import { useState, useEffect } from "react";
export const useDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);
  return { user, isLoading };
};
