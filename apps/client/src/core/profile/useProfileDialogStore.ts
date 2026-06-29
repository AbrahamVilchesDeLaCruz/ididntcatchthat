import { create } from 'zustand';

interface ProfileDialogState {
  open: boolean;
  openProfileDialog: () => void;
  closeProfileDialog: () => void;
}

export const useProfileDialogStore = create<ProfileDialogState>((set) => ({
  open: false,
  openProfileDialog: () => set({ open: true }),
  closeProfileDialog: () => set({ open: false }),
}));
