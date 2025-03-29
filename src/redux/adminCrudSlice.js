import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to fetch data
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Something went wrong with the API.");
  }

  return response.json();
};

// Fetch entities
export const fetchEntities = createAsyncThunk(
  "adminCrud/fetchEntities",
  async ({ endpoint }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/${endpoint}`, {
        method: "GET",
        credentials: "include",
      });

      const { data, message, success } = await handleApiError(response);
      console.log(data);
      return { data, message, success };
    } catch (error) {
      return rejectWithValue("Unable to connect");
    }
  }
);

export const fetchNames = createAsyncThunk(
  "adminCrud/fetchNames",
  async ({ endpoint }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/protected/${endpoint}`, {
        method: "GET",
        credentials: "include",
      });

      const { data, message, success } = await handleApiError(response);
      return { names: data, message, success };
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
      const { data, message, success } = await handleApiError(response);

      console.log(data, message, success);
      return { data, message, success };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add entity.");
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
      const { data, message, success } = await handleApiError(response);
      console.log(data, message, success);
      return { data, message, success };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add entity.");
    }
  }
);

const adminCrudSlice = createSlice({
  name: "adminCrud",
  initialState: {
    names: [],
    entities: [],
    success: false,
    message: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Entities
      .addCase(fetchEntities.fulfilled, (state, action) => {
        state.entities = action.payload.data;
        state.success = action.payload.success;
        state.message = action.payload.message;
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.success = false;
        state.message = action.error.message || "Failed to fetch entities";
      })

      // Fetch Names
      .addCase(fetchNames.fulfilled, (state, action) => {
        state.names = action.payload.names; // Store 'names'
        state.success = action.payload.success;
        state.message = action.payload.message;
      })
      .addCase(fetchNames.rejected, (state, action) => {
        state.success = false;
        state.message = action.error.message || "Failed to fetch names";
      })

      // Add Entity
      .addCase(addEntity.fulfilled, (state, action) => {
        state.entities.push(action.payload.data);
        state.success = action.payload.success;
        state.message = action.payload.message;
      })
      .addCase(addEntity.rejected, (state, action) => {
        state.success = false;
        state.message = action.error.message || "Failed to add entity";
      })

      // Delete Entity
      .addCase(deleteEntity.fulfilled, (state, action) => {
        state.entities = state.entities.filter(
          (entity) => entity.id !== action.payload.data.id
        );
        state.success = action.payload.success;
        state.message = action.payload.message;
      })
      .addCase(deleteEntity.rejected, (state, action) => {
        state.success = false;
        state.message = action.error.message || "Failed to delete entity";
      });
  },
});

export default adminCrudSlice.reducer;
