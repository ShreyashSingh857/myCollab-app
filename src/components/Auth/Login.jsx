import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { auth, googleProvider } from '../../lib/firebase.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { setLoading, setError } from '../../store/authSlice.js'
import { FaLock, FaUser, FaEnvelope } from 'react-icons/fa'
import FloatingDoodles from '../Decor/FloatingDoodles.jsx'
import collaborationImg from '../../assets/collaboration_11473490.png'

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
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (fullName) {
          try { await updateProfile(cred.user, { displayName: fullName }) } catch (_) {}
        }
        setToast({ type: 'success', message: 'Account created' })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        setToast({ type: 'success', message: 'Successfully logged in' })
      }
    } catch (error) {
      dispatch(setError(error.message))
      setToast({ type: 'error', message: error.message })
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleGoogle = async () => {
    try {
      dispatch(setLoading(true))
      setToast(null)
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      setToast({ type: 'error', message: e.message })
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-panel brand">
        <FloatingDoodles />
        <div className="brand-inner">
          <div className="logo-block">
            <div className="logo-circle" style={{ padding:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src={collaborationImg} alt="MyCollab" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'16px' }} />
            </div>
            <h1>MyCollab</h1>
            <p className="tagline">Lightweight real-time team productivity.</p>
          </div>
          <ul className="feature-list">
            <li><span>⚡</span> Live task updates</li>
            <li><span>🗂️</span> Kanban & list views</li>
            <li><span>👥</span> Team roles & sharing</li>
            <li><span>📊</span> Progress insights</li>
            <li><span>🔐</span> Secure OAuth sign-in</li>
          </ul>
          <footer className="brand-footer">© {new Date().getFullYear()} MyCollab</footer>
        </div>
      </div>
      <div className="auth-panel form">
        <div className="form-shell">
          <div className="form-heading">
            <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
            <p>{isSignUp ? 'Join and start organizing your team.' : 'Sign in to continue working.'}</p>
          </div>
          {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
          <div className="oauth-stack">
            <button type="button" className="oauth-btn google" onClick={handleGoogle}>
              <img src="/google.svg" alt="Google" />
              <span>Continue with Google</span>
            </button>
            <div className="or-separator"><span>or</span></div>
          </div>
          <form onSubmit={handleAuth} className="auth-form">
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
              <button className="primary-btn large" type="submit">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </form>
          <div className="switch-auth alt">
            <span>{isSignUp ? 'Already registered?' : 'New here?'}</span>
            <button
              type="button"
              className="link-btn"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Create account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login