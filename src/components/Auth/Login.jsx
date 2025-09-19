import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../../lib/supabase.js'
import { setLoading, setError } from '../../store/authSlice.js'
import { FaLock, FaUser, FaEnvelope } from 'react-icons/fa'

function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const dispatch = useDispatch()
  const [toast, setToast] = useState(null) // simple local toast message

  const handleAuth = async (e) => {
    e.preventDefault()
    
    if (isSignUp && password !== confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match' })
      return
    }

    dispatch(setLoading(true))
    dispatch(setError(null))

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        })
        
        if (error) throw error
        
        setToast({ type: 'success', message: 'Check your email for verification link' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        
        setToast({ type: 'success', message: 'Successfully logged in' })
      }
    } catch (error) {
      dispatch(setError(error.message))
      setToast({ type: 'error', message: error.message })
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>MyCollab</h1>
          <p>{isSignUp ? 'Create your account' : 'Welcome back!'}</p>
        </div>
        {toast && (
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        )}
        <form onSubmit={handleAuth}>
          <div className="form-grid">
            {isSignUp && (
              <div className="form-control">
                <label>Full Name</label>
                <div className="input-icon">
                  <FaUser />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}
            <div className="form-control">
              <label>Email</label>
              <div className="input-icon">
                <FaEnvelope />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div className="form-control">
              <label>Password</label>
              <div className="input-icon">
                <FaLock />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            {isSignUp && (
              <div className="form-control">
                <label>Confirm Password</label>
                <div className="input-icon">
                  <FaLock />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}
            <button className="primary-btn" type="submit">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>
        <div className="switch-auth">
          <span>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            type="button"
            className="link-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login