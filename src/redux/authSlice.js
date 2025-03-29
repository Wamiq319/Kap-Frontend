import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

// Get user from localStorage
const storedUser = JSON.parse(localStorage.getItem("user")) || null;

// Helper function to fetch data
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
};

// Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const { data, message, success } = await handleApiError(response);

      if (success) {
        localStorage.setItem("user", JSON.stringify(data));
      }
      return { success, message, data };
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Create User
export const createUser = createAsyncThunk(
  "auth/createUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const { message, success } = await handleApiError(response);

      return { success, message };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message || "User creation failed");
    }
  }
);

// Update Admin
export const updateAdmin = createAsyncThunk(
  "auth/updateAdmin",
  async ({ adminId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/update-admin/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      const { data, message, success } = await handleApiError(response);
      return { success, message, data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update admin");
    }
  }
);

// Update Password
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async ({ userId, newPassword, oldPassword }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/auth/update-password/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword, oldPassword }),
          credentials: "include",
        }
      );

      const { data, message, success } = await handleApiError(response);
      return { success, message, data };
    } catch (error) {
      return rejectWithValue(error.message || "Password update failed");
    }
  }
);

// Delete User
export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/protected/user/delete/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const { message, success } = await handleApiError(response);

      return { success, message };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message || "User creation failed");
    }
  }
);
// Logout User
export const logout = createAsyncThunk("auth/logout", async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  localStorage.removeItem("user");
  localStorage.removeItem("data");
});

// Get Users
export const getUsers = createAsyncThunk(
  "auth/getUsers",
  async (endpoint = "", { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/user/${endpoint}`, {
        method: "GET",
        credentials: "include",
      });

      const { data, message, success } = await handleApiError(response);
      console.log(data);
      return { success, message, data };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch users");
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState: {
    data: storedUser,
    users: [],
    success: false,
    message: "",
  },
  reducers: {
    logout: (state) => {
      state.data = null;
      state.success = false;
      state.message = "";
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.data = action.payload.data;
          state.success = action.payload.success;
          state.message = action.payload.message;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.success = false;
        state.message = action.payload || "Login failed";
      })

      // Create User
      .addCase(createUser.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.data = action.payload.data;
          state.success = action.payload.success;
          state.message = action.payload.message;
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.success = false;
        state.message = action.payload || "User creation failed";
      })

      // Update Admin
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.data = action.payload.data;
        state.success = action.payload.success;
        state.message = action.payload.message;
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.success = false;
        state.message = action.payload || "Failed to update admin";
      })

      // Update Password
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.data = action.payload.data;
        state.success = action.payload.success;
        state.message = action.payload.message;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.success = false;
        state.message = action.payload || "Password update failed";
      })

      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.data = action.payload.data;
        state.success = action.payload.success;
        state.message = action.payload.message;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.success = false;
        state.message = action.payload || "Delete failed";
      })
      //Get Users
      .addCase(getUsers.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.users = action.payload.data; // Add users array to state
          state.success = action.payload.success;
          state.message = action.payload.message;
        }
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.success = false;
        state.message = action.payload || "Failed to fetch users";
      })

      // Handle Logout
      .addCase(logout.fulfilled, (state) => {
        state.data = null;
        state.success = false;
        state.message = "";
      });
  },
});

export const { logout: logoutAction } = authSlice.actions;
export default authSlice.reducer;
