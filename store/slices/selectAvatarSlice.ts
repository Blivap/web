import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { AvatarListMeta, IAvatar } from "@/types";

export const emptyAvatarListMeta: AvatarListMeta = {
  page: 1,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

interface SelectAvatarState {
  avatars: IAvatar[] | null;
  meta: AvatarListMeta;
  isLoading: boolean;
  selectedAvatar: string | null;
  isModalOpen: boolean;
}

const initialState: SelectAvatarState = {
  avatars: null,
  meta: emptyAvatarListMeta,
  isLoading: false,
  selectedAvatar: null,
  isModalOpen: false,
};

const selectAvatarSlice = createSlice({
  name: "selectAvatar",
  initialState,
  reducers: {
    setAvatarPage: (
      state,
      action: PayloadAction<{ avatars: IAvatar[]; meta: AvatarListMeta }>,
    ) => {
      state.avatars = action.payload.avatars;
      state.meta = action.payload.meta;
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
    openAvatarModal: (state) => {
      state.isModalOpen = true;
    },
    closeAvatarModal: (state) => {
      state.isModalOpen = false;
    },
  },
});

export const {
  setAvatarPage,
  setIsLoading,
  toggleSelectedAvatar,
  setSelectedAvatar,
  openAvatarModal,
  closeAvatarModal,
} = selectAvatarSlice.actions;

export default selectAvatarSlice.reducer;
