import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postRequest } from '../../api/apiClient/apiService';
import { decryptData } from '../../utils/encrypt';
import { createModuleLogger } from '../../utils/logger';

// Create apislice-specific logger
const logger = createModuleLogger("ApiSlice");

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    logger.log('Payload', payload)
    const { status, data } = await postRequest('api/v1/user/send-otp', payload);
    
    if (status === 200) {
        logger.log('Response', data)
        return data;
    }
    logger.log('status', status)
    logger.log('data', data)
    logger.log('message', message)
    return rejectWithValue({ status, data });
  }
);

const apiSlice = createSlice({
  name: 'api',
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  reducers: {
    resetApiState: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetApiState } = apiSlice.actions;
export default apiSlice.reducer;
