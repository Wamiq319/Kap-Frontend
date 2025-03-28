import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import adminCrudReducer from "./adminCrudSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminCrud: adminCrudReducer,
  },
});

export default store;
