import { useEditProfile } from "@/hooks/auth/useEditProfile.hook";
import { useChangePassword } from "@/hooks/auth/useChangePassword.hook";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";

export function useSettings() {
  const { user } = useDashboard();
  const { updateProfile, isLoading: isProfileLoading } = useEditProfile();
  const { changePassword, isLoading: isPasswordLoading } = useChangePassword();

  return {
    user,
    updateProfile,
    changePassword,
    isProfileLoading,
    isPasswordLoading,
  };
}
