import { createSlice } from '@reduxjs/toolkit'

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
    setError: (state, action) => {
      state.error = action.payload
    }
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