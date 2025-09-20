import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { auth } from './lib/firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import { setUser, setLoading } from './store/authSlice.js'

// Components (we'll create these next)
import Login from './components/Auth/Login.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import ProjectView from './components/Project/ProjectView.jsx'

function App() {
  const dispatch = useDispatch()
  const { user, isAuthenticated, loading } = useSelector(state => state.auth)
  const [authReady, setAuthReady] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    dispatch(setLoading(true))
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // Normalize to shape used previously (id, email, etc.)
        const norm = { id: fbUser.uid, email: fbUser.email, full_name: fbUser.displayName }
        dispatch(setUser(norm))
        if (location.pathname === '/login' || location.pathname === '/') navigate('/dashboard', { replace: true })
      } else {
        dispatch(setUser(null))
      }
      dispatch(setLoading(false))
      setAuthReady(true)
    })
    return () => unsub()
  }, [dispatch, navigate, location.pathname])

  // No Supabase OAuth params to clean for Firebase; keep hook empty for symmetry
  useEffect(() => {}, [])

  if (loading || !authReady) {
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
