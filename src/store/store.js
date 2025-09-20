import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import projectSlice from './projectSlice'
import taskSlice from './taskSlice'
import dashboardSlice from './dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectSlice,
  tasks: taskSlice,
  dashboard: dashboardSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
})

export default store