import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
import { setUser, setLoading } from './store/authSlice.js'

// Components (we'll create these next)
import Login from './components/Auth/Login.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import ProjectView from './components/Project/ProjectView.jsx'

function App() {
  const dispatch = useDispatch()
  const { user, isAuthenticated, loading } = useSelector(state => state.auth)

  useEffect(() => {
    // Check if user is already logged in
    const getSession = async () => {
      dispatch(setLoading(true))
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        dispatch(setUser(session.user))
      }
      dispatch(setLoading(false))
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          dispatch(setUser(session.user))
        } else {
          dispatch(setUser(null))
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [dispatch])

  if (loading) {
    return (
      <div className="fullscreen-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/project/:id"
          element={isAuthenticated ? <ProjectView /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
        />
      </Routes>
    </div>
  )
}

export default App
