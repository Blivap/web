import { useEditProfile } from "@/hooks/auth/useEditProfile.hook";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword.hook";
import { useDashboard } from "@/hooks/dashboard/useDashboard.hook";

export function useSettings() {
  const { user } = useDashboard();
  const { updateProfile, isLoading: isProfileLoading } = useEditProfile();
  const { forgotPassword, isLoading: isPasswordResetRequesting } =
    useForgotPassword();

  return {
    user,
    updateProfile,
    forgotPassword,
    isProfileLoading,
    isPasswordResetRequesting,
  };
}
