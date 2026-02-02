import { useEditProfile } from "@/app/hooks/auth/useEditProfile.hook";
import { useChangePassword } from "@/app/hooks/auth/useChangePassword.hook";
import { useDashboard } from "@/app/hooks/dashboard/useDashboard.hook";

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
