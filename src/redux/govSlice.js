import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

// Utility function to handle API failures
const handleApiError = async (response) => {
  if (!response.ok) {
    throw new Error("Internal Server Error");
  }
  return response.json();
};

// Fetch all government sectors
export const fetchGovSectors = createAsyncThunk(
  "gov/fetchGovSectors", // Unique name
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/gov/get-govSectors`, {
        method: "GET",
        credentials: "include",
      });
      return await handleApiError(response);
    } catch (error) {
      return rejectWithValue("Unable to connect");
    }
  }
);

// Add a new government sector
export const addGovSector = createAsyncThunk(
  "gov/create-govSector", // Unique name
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/protected/gov/create-govSector`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      return await handleApiError(response);
    } catch (error) {
      console.log("Error:", error);
      return rejectWithValue(error.message || "Failed to add sector.");
    }
  }
);

const govSlice = createSlice({
  name: "gov",
  initialState: {
    govSectors: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch government sectors
      .addCase(fetchGovSectors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGovSectors.fulfilled, (state, action) => {
        state.loading = false;
        state.govSectors = action.payload;
      })
      .addCase(fetchGovSectors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch data.";
      })

      // Add government sector
      .addCase(addGovSector.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGovSector.fulfilled, (state, action) => {
        state.loading = false;
        state.govSectors.push(action.payload);
      })
      .addCase(addGovSector.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add sector.";
      });
  },
});

export default govSlice.reducer;
