import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './activate.css';

const ActivateAccount = ({ email }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const resetToken = localStorage.getItem('resetToken');

    if (!resetToken) {
      setError('No activation token found. Please register again.');
      setIsLoading(false);
      return;
    }

    try {
      await api.post(`/auth/resets/${resetToken}`, { email });

      // clean up token after successful activation
      localStorage.removeItem('resetToken');
      localStorage.removeItem('resetTokenExpiry');

      setSuccess(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError('This email does not match your registration.');
      else if (status === 404) setError('Activation token not found or already used.');
      else if (status === 410) setError('Activation token has expired. Please register again.');
      else setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="activateWrapper">
        <h1 className="formTitle">Account activated!</h1>
        <p className="formSubtitle">Your account is ready. You can now log in.</p>
        <button className="actionBtn" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="activateWrapper">
      <h1 className="formTitle">Activate Your Account</h1>
      <p className="formSubtitle">Please click the button below to activate your account.</p>
      {error && <div className="errorMessage">{error}</div>}
      <button onClick={handleSubmit} disabled={isLoading} className="activateButton">
        {isLoading ? 'Activating...' : 'Activate Account'}
      </button>
    </div>
  )
}

export default ActivateAccount;