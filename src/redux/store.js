import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import kapReducer from "./kapSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    kap: kapReducer,
  },
});

export default store;
