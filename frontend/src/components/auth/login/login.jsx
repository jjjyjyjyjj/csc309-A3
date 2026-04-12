import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './style.css';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: loginError } = await login(email, password);

    if (loginError) {
      setError(loginError.message || 'Login failed');
      setIsLoading(false);
      return;
    }

    setEmail('');
    setPassword('');
    setIsLoading(false);
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess();
    }
  };

  return (
    <div className="loginPage">
        <div className="loginFormWrapper">
            <h1 className="formTitle">Login</h1>
            <h2 className="formSubtitle">Welcome back! Please login to your account.</h2>
            <form onSubmit={handleSubmit} className="loginForm">
                <div className="inputField">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        data-cy="email-input"
                    />
                </div>
                <div className="inputField">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        data-cy="password-input"
                    />
                </div>
                {error && <p className="modalError" data-cy="error-msg">{error}</p>}
                <div className="formActions">
                    <button type="submit" data-cy="login-btn" className="actionBtn" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    <button type="button" onClick={() => navigate('/register')} className="forgotLink">
                        Don't have an account?
                    </button>
                    <button type="button" onClick={() => navigate('/reset')} className="forgotLink">
                        Forgot Password?
                    </button>
                </div>
            </form>
        </div>
    </div>
);
};

export default LoginForm;