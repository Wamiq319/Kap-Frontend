import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

// Get user from localStorage
const storedUser = JSON.parse(localStorage.getItem("user")) || null;

/**
 * 🔹 Login User (Sends credentials to backend)
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Sends session cookie
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      document.cookie
        .split(";")
        .forEach((cookie) => console.log("Cookie:", cookie));

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to connect.");
    }
  }
);

/**
 * 🔹 Check Session Validity (Ensures user is logged in)
 */
export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/session`, {
        method: "GET",
        credentials: "include", // Ensures session cookies are sent
      });

      if (!response.ok) {
        throw new Error("Session expired");
      }

      const data = await response.json();
      return data.user; // Return user if session is valid
    } catch (error) {
      return rejectWithValue("Session expired, please log in again.");
    }
  }
);

/**
 * 🔹 Logout User (Clears session & localStorage)
 */
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include", // Removes session cookie from backend
  });

  // Clear localStorage after logout
  localStorage.removeItem("user");
});

/**
 * 🔹 Update User Profile
 */
export const updateAdmin = createAsyncThunk(
  "auth/updateAdmin",
  async (updatedData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/update-admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      return rejectWithValue("Try again");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    status: "idle",
    error: null,
  },
  reducers: {
    /**
     * 🔹 Logout Reducer (Clears state & localStorage)
     */
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Handle Session Check
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload; // Keep user logged in
      })
      .addCase(checkSession.rejected, (state) => {
        state.user = null;
        localStorage.removeItem("user"); // Auto logout if session is invalid
      })

      // Handle Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        localStorage.removeItem("user");
      })

      // Handle Profile Update
      .addCase(updateAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
