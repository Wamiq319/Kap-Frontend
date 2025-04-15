import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminCrudReducer from "./slices/adminCrudSlice";
import langReducer from "./slices/langgSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminCrud: adminCrudReducer,
    lang: langReducer,
  },
});

export default store;
