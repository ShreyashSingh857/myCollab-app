import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchProjectsWithCounts, createProject, ensureOwnerMembership as ensureOwnerMembershipSQL } from '../lib/api/dashboard'
import { USE_FIREBASE } from '../config';
import { listUserProjectsWithCounts, createProjectDoc, ensureOwnerMembership as ensureOwnerMembershipFB } from '../lib/firebaseServices/projects';
import { ensureOwnerMembership as ensureOwnerMembershipMemberFB } from '../lib/firebaseServices/membership';

export const loadProjects = createAsyncThunk('projects/loadAll', async (_, { getState, rejectWithValue }) => {
  try {
    if (USE_FIREBASE) {
      const userId = getState().auth.user?.id;
      if (!userId) return [];
      return await listUserProjectsWithCounts(userId);
    } else {
      return await fetchProjectsWithCounts();
    }
  } catch (e) { return rejectWithValue(e.message) }
})

export const createNewProject = createAsyncThunk('projects/create', async (payload, { getState, rejectWithValue }) => {
  try {
    const userId = getState().auth.user?.id;
    if (!userId) throw new Error('Not authenticated');
    if (USE_FIREBASE) {
      const project = await createProjectDoc({ ...payload, owner_id: userId });
      try { await ensureOwnerMembershipMemberFB(project.id, userId); } catch (_) {}
      return { ...project, total: 0, done: 0, progress: 0 };
    } else {
      const project = await createProject({ ...payload, owner_id: userId });
      try { await ensureOwnerMembershipSQL(project.id, userId); } catch (_) {}
      return project;
    }
  } catch (e) { return rejectWithValue(e.message) }
})

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null
}

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload
    },
    addProject: (state, action) => {
      state.projects.push(action.payload)
    },
    updateProject: (state, action) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
    },
    deleteProject: (state, action) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => { state.error = action.payload }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProjects.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loadProjects.fulfilled, (state, action) => { state.loading = false; state.projects = action.payload })
      .addCase(loadProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to load projects' })
      .addCase(createNewProject.pending, (state) => { state.loading = true })
      .addCase(createNewProject.fulfilled, (state, action) => { state.loading = false; state.projects.push(action.payload) })
      .addCase(createNewProject.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to create project' })
  }
})

export const { 
  setProjects, 
  addProject, 
  updateProject, 
  deleteProject, 
  setCurrentProject, 
  setLoading, 
  setError 
} = projectSlice.actions

export default projectSlice.reducer