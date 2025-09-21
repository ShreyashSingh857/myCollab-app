import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchMyTasks, createTask, updateTaskFields } from '../lib/api/dashboard'
import { USE_FIREBASE } from '../config';
// Firestore removed: use SQL API (Supabase) for tasks

export const loadMyTasks = createAsyncThunk('tasks/loadMine', async (_, { getState, rejectWithValue }) => {
  try {
    const userId = getState().auth.user?.id;
    if (!userId) return [];
    return await fetchMyTasks(userId);
  } catch (e) { return rejectWithValue(e.message) }
})

export const createNewTask = createAsyncThunk('tasks/create', async (payload, { getState, rejectWithValue }) => {
  try {
    const userId = getState().auth.user?.id;
    if (!userId) throw new Error('Not authenticated');
    const full = { creator_id: userId, assignee_id: payload.assignee_id || userId, ...payload };
    return await createTask(full);
  } catch (e) { return rejectWithValue(e.message) }
})

export const patchTask = createAsyncThunk('tasks/patch', async ({ id, fields }, { rejectWithValue }) => {
  try {
    return await updateTaskFields(id, fields);
  } catch (e) { return rejectWithValue(e.message) }
})

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  filter: {
    status: 'all',
    priority: 'all',
    assignee: 'all'
  }
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload)
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
    },
    updateTaskStatus: (state, action) => {
      const { id, status } = action.payload
      const task = state.tasks.find(t => t.id === id)
      if (task) {
        task.status = status
      }
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => { state.error = action.payload }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMyTasks.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loadMyTasks.fulfilled, (state, action) => { state.loading = false; state.tasks = action.payload })
      .addCase(loadMyTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to load tasks' })
      .addCase(createNewTask.fulfilled, (state, action) => { state.tasks.unshift(action.payload) })
      .addCase(patchTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
  }
})

export const { 
  setTasks, 
  addTask, 
  updateTask, 
  deleteTask, 
  updateTaskStatus,
  setFilter,
  setLoading, 
  setError 
} = taskSlice.actions

export default taskSlice.reducer