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

// Generic CRUD operations
export const fetchEntities = createAsyncThunk(
  "adminCrud/fetchEntities",
  async ({ endpoint }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/${endpoint}`, {
        method: "GET",
        credentials: "include",
      });
      return await handleApiError(response);
    } catch (error) {
      return rejectWithValue("Unable to connect");
    }
  }
);

export const addEntity = createAsyncThunk(
  "adminCrud/addEntity",
  async ({ endpoint, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/${endpoint}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      return await handleApiError(response);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add entity.");
    }
  }
);

export const updateEntity = createAsyncThunk(
  "adminCrud/updateEntity",
  async ({ endpoint, id, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/${endpoint}/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      return await handleApiError(response);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update entity.");
    }
  }
);

export const deleteEntity = createAsyncThunk(
  "adminCrud/deleteEntity",
  async ({ endpoint, id }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/${endpoint}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      return await handleApiError(response);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete entity.");
    }
  }
);

const adminCrudSlice = createSlice({
  name: "adminCrud",
  initialState: {
    entities: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch entities
      .addCase(fetchEntities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntities.fulfilled, (state, action) => {
        state.loading = false;
        state.entities = action.payload;
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch data.";
      })

      // Add entity
      .addCase(addEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.entities.push(action.payload);
      })
      .addCase(addEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add entity.";
      })

      // Update entity
      .addCase(updateEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEntity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.entities.findIndex(
          (e) => e.id === action.payload.id
        );
        if (index !== -1) {
          state.entities[index] = action.payload;
        }
      })
      .addCase(updateEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update entity.";
      })

      // Delete entity
      .addCase(deleteEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.entities = state.entities.filter((e) => e.id !== action.payload);
      })
      .addCase(deleteEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete entity.";
      });
  },
});

export default adminCrudSlice.reducer;
