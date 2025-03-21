import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import govReducer from "./govSlice";
import adminCrudReducer from "./adminCrudSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    gov: govReducer,
    adminCrud: adminCrudReducer,
  },
});

export default store;
