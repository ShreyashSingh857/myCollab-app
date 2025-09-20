import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDashboardSummary, fetchProjectsWithCounts, fetchMyTasks } from '../lib/api/dashboard';

export const loadDashboard = createAsyncThunk('dashboard/loadAll', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const userId = state.auth.user?.id;
    const [summary, projects, myTasks] = await Promise.all([
      fetchDashboardSummary(),
      fetchProjectsWithCounts(),
      fetchMyTasks(userId)
    ]);
    return { summary, projects, myTasks };
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const initialState = {
  summary: null,
  activity: [],
  loading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSummary: (state, action) => { state.summary = action.payload; state.activity = action.payload?.recent_activity || state.activity; },
    setActivity: (state, action) => { state.activity = action.payload; },
    addActivityEvent: (state, action) => { state.activity = [action.payload, ...state.activity].slice(0,50); },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.activity = action.payload.summary?.recent_activity || [];
        // Projects slice lives elsewhere; dispatch separately from component if needed.
      })
      .addCase(loadDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to load dashboard'; });
  }
});

export const { setSummary, setActivity, addActivityEvent, setLoading, setError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
