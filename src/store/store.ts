import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { User } from "@/types/user";

interface UserState {
  users: User[];
  isHydrated: boolean;
}

const initialState: UserState = {
  users: [],
  isHydrated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.isHydrated = true;
    },
    addUser: (state, action: PayloadAction<Omit<User, "id">>) => {
      const newUser: User = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.users.push(newUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("users", JSON.stringify(state.users));
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
        if (typeof window !== "undefined") {
          localStorage.setItem("users", JSON.stringify(state.users));
        }
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
      if (typeof window !== "undefined") {
        localStorage.setItem("users", JSON.stringify(state.users));
      }
    },
  },
});

export const { setUsers, addUser, updateUser, deleteUser } = userSlice.actions;

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
