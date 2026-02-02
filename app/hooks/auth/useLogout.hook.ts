import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/store/hooks";
import { logout } from "@/app/store/slices/authSlice";
import { useSnackbar } from "@/app/components/snackbar/snackbar.context";
import { $api } from "@/app/api";

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const handleLogout = async () => {
    try {
      await $api.auth.logout();
    } catch {
      // Ignore logout API errors; clear local state anyway
    }
    dispatch(logout());
    showSnackbar("Logged out successfully", "success");
    router.push("/");
  };

  return { handleLogout };
};
