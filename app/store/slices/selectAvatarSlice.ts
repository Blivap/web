import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { IAvatar } from "@/app/types";

interface SelectAvatarState {
  avatars: IAvatar[] | null;
  isLoading: boolean;
  selectedAvatar: string | null;
}

const initialState: SelectAvatarState = {
  avatars: null,
  isLoading: false,
  selectedAvatar: null,
};

const selectAvatarSlice = createSlice({
  name: "selectAvatar",
  initialState,
  reducers: {
    setAvatars: (state, action: PayloadAction<IAvatar[] | null>) => {
      state.avatars = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleSelectedAvatar: (state, action: PayloadAction<string>) => {
      state.selectedAvatar =
        state.selectedAvatar === action.payload ? null : action.payload;
    },
    setSelectedAvatar: (state, action: PayloadAction<string | null>) => {
      state.selectedAvatar = action.payload;
    },
  },
});

export const {
  setAvatars,
  setIsLoading,
  toggleSelectedAvatar,
  setSelectedAvatar,
} = selectAvatarSlice.actions;

export default selectAvatarSlice.reducer;
