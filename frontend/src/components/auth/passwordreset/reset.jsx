import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../../services/api';
import './style.css';

const PasswordResetForm = ({ onResetSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [step, setStep] = useState(1); // 1 = request token, 2 = reset password
  const [resetToken, setResetToken] = useState(null);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post(`/auth/resets`, { email });
      setResetToken(res.data.resetToken);
      setStep(2); 
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) setError('No account found with this email.');
      else if (status === 429) setError('Please wait before requesting another reset.');
      else setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/auth/resets/${resetToken}`, { email, password });
      setSuccess(true);
      onResetSuccess?.();
      navigate('/login');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError('Email does not match this reset token.');
      else if (status === 404) setError('Reset token not found or already used.');
      else if (status === 410) setError('Reset token has expired. Please request a new one.');
      else setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // if (success) {
  //   return (
  //     <div className="resetFormWrapper">
  //       <h1 className="formTitle">All done!</h1>
  //       <p className="formSubtitle">Your password has been reset successfully.</p>
  //       <button className="actionBtn" onClick={() => navigate('/login')}>
  //         Go to Login
  //       </button>
  //     </div>
  //   );
  // }

  // return (
  //   <div className="resetFormWrapper">
  //     <h1 className="formTitle">Reset Password</h1>
  //     <p className="formSubtitle">Enter your email and a new password below.</p>

  //     <form onSubmit={handleRequestReset} className="resetForm">

  //       <div className="inputField">
  //         <label htmlFor="email">Email</label>
  //         <input
  //           id="email"
  //           type="email"
  //           placeholder="Your Email"
  //           value={email}
  //           onChange={(e) => setEmail(e.target.value)}
  //           disabled={isLoading}
  //           required
  //         />
  //       </div>

  //       <div className="inputField">
  //         <label htmlFor="password">New Password</label>
  //         <input
  //           id="password"
  //           type="password"
  //           placeholder="Enter new password"
  //           value={password}
  //           onChange={(e) => setPassword(e.target.value)}
  //           disabled={isLoading}
  //         />
  //       </div>

  //       <div className="inputField">
  //         <label htmlFor="confirmPassword">Confirm Password</label>
  //         <input
  //           id="confirmPassword"
  //           type="password"
  //           placeholder="Confirm new password"
  //           value={confirmPassword}
  //           onChange={(e) => setConfirmPassword(e.target.value)}
  //           disabled={isLoading}
  //         />
  //       </div>

  //       {error && (
  //         <div style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '700' }}>
  //           {error}
  //         </div>
  //       )}

  //       <div className="formActions">
  //         <button type="submit" className="actionBtn" disabled={isLoading}>
  //           {isLoading ? 'Resetting...' : 'Reset Password'}
  //         </button>
  //       </div>

  //     </form>
  //   </div>
  // );
   if (step === 1) {
    return (
      <div className="resetFormWrapper">
        <h1 className="formTitle">Forgot Password</h1>
        <p className="formSubtitle">Enter your email to receive a reset token.</p>
        <form onSubmit={handleRequestReset} className="resetForm">
          <div className="inputField">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          {error && (
            <div style={{ color: '#edcca7ff', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '700' }}>
              {error}
            </div>
          )}
          <div className="formActions">
            <button type="submit" className="actionBtn" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Token'}
            </button>
            <button type="button" className="forgotLink" onClick={() => navigate('/login')}>
              Back to Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 2 — enter new password
  return (
    <div className="resetFormWrapper">
      <h1 className="formTitle">Reset Password</h1>
      <p className="formSubtitle">Enter your new password below.</p>
      <form onSubmit={handleResetPassword} className="resetForm">
        <div className="inputField">
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="inputField">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        {error && (
          <div style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '700' }}>
            {error}
          </div>
        )}
        <div className="formActions">
          <button type="submit" className="actionBtn" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetForm;