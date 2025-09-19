import { createSlice } from '@reduxjs/toolkit'

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
    setError: (state, action) => {
      state.error = action.payload
    }
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