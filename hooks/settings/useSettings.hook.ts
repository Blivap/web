import { useEditProfile } from "@/hooks/auth/useEditProfile.hook";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword.hook";
import { useChangePassword } from "@/hooks/auth/useChangePassword.hook";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";

export function useSettings() {
  const { user } = useDashboard();
  const { updateProfile, isLoading: isProfileLoading } = useEditProfile();
  const { forgotPassword, isLoading: isPasswordResetRequesting } =
    useForgotPassword();
  const { changePassword, isLoading: isChangePasswordLoading } =
    useChangePassword();

  return {
    user,
    updateProfile,
    forgotPassword,
    changePassword,
    isProfileLoading,
    isPasswordResetRequesting,
    isChangePasswordLoading,
  };
}
