import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

// Utility function to handle API failures
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Something went wrong with the API.");
  }
  return response.json();
};

// Fetch all KAP companies
export const fetchKapCompanies = createAsyncThunk(
  "kap/fetchKapCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/kap/get-Companies`, {
        method: "GET",
        credentials: "include", // ✅ Include session cookies
      });
      return await handleApiError(response);
    } catch (error) {
      return rejectWithValue("Unable to connect");
    }
  }
);

// Add a new KAP company
export const addKapCompany = createAsyncThunk(
  "kap/addKapCompany",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/kap//create-Company`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      return await handleApiError(response);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add company.");
    }
  }
);

// Update an existing company
export const updateKapCompany = createAsyncThunk(
  "kap/updateKapCompany",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/kap/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      return await handleApiError(response);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update company.");
    }
  }
);

// Delete a company
export const deleteKapCompany = createAsyncThunk(
  "kap/deleteKapCompany",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/kap/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      return await handleApiError(response);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete company.");
    }
  }
);

const kapSlice = createSlice({
  name: "kap",
  initialState: {
    kapCompanies: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch companies
      .addCase(fetchKapCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKapCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.kapCompanies = action.payload;
      })
      .addCase(fetchKapCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch data.";
      })

      // Add company
      .addCase(addKapCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addKapCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.kapCompanies.push(action.payload);
      })
      .addCase(addKapCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add company.";
      })

      // Update company
      .addCase(updateKapCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateKapCompany.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.kapCompanies.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.kapCompanies[index] = action.payload;
        }
      })
      .addCase(updateKapCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update company.";
      })

      // Delete company
      .addCase(deleteKapCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteKapCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.kapCompanies = state.kapCompanies.filter(
          (c) => c.id !== action.payload
        );
      })
      .addCase(deleteKapCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete company.";
      });
  },
});

export default kapSlice.reducer;
