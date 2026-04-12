import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './style.css';

const SignupForm = ({ onSignupSuccess }) => {
  const [role, setRole] = useState('regular'); // 'regular' or 'business'

  // shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [postalAddress, setPostalAddress] = useState('');

  // regular-only fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');

  // business-only fields
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();

  const passwordRules = useMemo(() => [
    { key: 'minLen',   label: 'At least 8 characters',                    test: (pw) => pw.length >= 8 },
    { key: 'upper',    label: 'At least one uppercase letter (A–Z)',       test: (pw) => /[A-Z]/.test(pw) },
    { key: 'lower',    label: 'At least one lowercase letter (a–z)',       test: (pw) => /[a-z]/.test(pw) },
    { key: 'number',   label: 'At least one number (0–9)',                 test: (pw) => /[0-9]/.test(pw) },
    { key: 'special',  label: 'At least one special character (!@#$%^&*)', test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw) },
  ], []);

  const passwordChecklist = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, ok: rule.test(password) })),
    [password, passwordRules]
  );

  const allPasswordRulesOk = useMemo(
    () => passwordChecklist.every((r) => r.ok),
    [passwordChecklist]
  );

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError(null);
    // Clear role-specific fields when switching
    setFirstName(''); setLastName(''); setBirthday('');
    setBusinessName(''); setOwnerName('');setLat(''); setLon('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!allPasswordRulesOk) {
      setError('Please meet all password requirements before signing up.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    // Build payload based on role
    const payload = role === 'regular'
      ? { first_name: firstName, 
        last_name: lastName, 
        email, 
        password, 
        ...(phoneNumber    && { phone_number: phoneNumber }),
        ...(postalAddress  && { postal_address: postalAddress }),
        ...(birthday       && { birthday })}
      : {business_name: businessName, 
        owner_name: ownerName, 
        email, 
        password, 
        phone_number: phoneNumber,
        postal_address: postalAddress,
        location: {
        lat: parseFloat(lat) || 0, 
        lon: parseFloat(lon) || 0
      }}

    const { error: signupError } = await signup(email, password, role, payload);

    if (signupError) {
      setError(signupError.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onSignupSuccess?.(email);
  };

  const metCount = passwordChecklist.filter((r) => r.ok).length;

  return (
    <div className="signupPage">
        <div className="signupFormWrapper">
      <h1 className="formTitle">Sign Up</h1>
      <h2 className="formSubtitle">Create an account to get started.</h2>

      {/* Role selector */}
      <div className="roleSelector">
        <button
          type="button"
          className={`roleBtn ${role === 'regular' ? 'roleActive' : ''}`}
          onClick={() => handleRoleChange('regular')}
        >
          Regular User
        </button>
        <button
          type="button"
          className={`roleBtn ${role === 'business' ? 'roleActive' : ''}`}
          onClick={() => handleRoleChange('business')}
        >
          Business
        </button>
      </div>

      <div className="signupLayout">
        <form onSubmit={handleSubmit} className="signupForm">

          {/* regular-only fields */}
          {role === 'regular' && (
            <>
              <div className="inputField">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" type="text" placeholder="FIRST NAME"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading} required />
              </div>
              <div className="inputField">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" type="text" placeholder="LAST NAME"
                  value={lastName} onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading} required />
              </div>
            </>
          )}

          {/* business-only fields */}
          {role === 'business' && (
            <>
              <div className="inputField">
                <label htmlFor="businessName">Business Name</label>
                <input id="businessName" type="text" placeholder="BUSINESS NAME"
                  value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                  disabled={isLoading} required />
              </div>
              <div className="inputField">
                <label htmlFor="ownerName">Owner Full Name</label>
                <input id="ownerName" type="text" placeholder="OWNER FULL NAME"
                  value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                  disabled={isLoading} required />
              </div>
            </>
          )}

          {/* shared fields */}
          <div className="inputField">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="EMAIL"
              value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading} required />
          </div>
          
          <div className="inputField">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input id="phoneNumber" type="tel" placeholder="PHONE NUMBER"
              value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading} required={role === 'business'} />
          </div>
          <div className="inputField">
            <label htmlFor="postalAddress">Postal Address</label>
            <input id="postalAddress" type="text" placeholder="POSTAL ADDRESS"
              value={postalAddress} onChange={(e) => setPostalAddress(e.target.value)}
              disabled={isLoading} required={role === 'business'} />
          </div>

          {/* regular-only: birthday */}
          {role === 'regular' && (
            <div className="inputField">
              <label htmlFor="birthday">Birthday</label>
              <input id="birthday" type="date" 
                value={birthday} onChange={(e) => setBirthday(e.target.value)}
                disabled={isLoading} />
            </div>
          )}

          {/* business-only: location */}
          {role === 'business' && (
            <>
              <div className="inputField">
                <label htmlFor="lat">Location (lat)</label>
                <input id="lat" type="text" placeholder="LOCATION LAT"
                  value={lat} onChange={(e) => setLat(e.target.value)}
                  disabled={isLoading} required/>
              </div>

              <div className="inputField">
                <label htmlFor="lon">Location (lon)</label>
                <input id="lon" type="text" placeholder="LOCATION LON"
                  value={lon} onChange={(e) => setLon(e.target.value)}
                  disabled={isLoading} required/>
              </div>
            </>
          )}

          <div className="inputField">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="PASSWORD"
              value={password} onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading} required />
          </div>

          <div className="inputField">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" placeholder="CONFIRM PASSWORD"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading} required />
          </div>

          {error && (
            <div data-cy="error-msg" style={{ color: '#ff8000ff', marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>
              {error}
            </div>
          )}

          <div className="formActions">
            <button data-cy="signup-btn" type="submit" className="actionBtn" disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <aside className="passwordRequirements" aria-live="polite">
          <div className="passwordRequirementsTitle">
            Password requirements ({metCount}/{passwordChecklist.length})
          </div>
          <ul className="passwordRequirementsList">
            {passwordChecklist.map((rule) => (
              <li key={rule.key} className={`passwordRequirementsItem ${rule.ok ? 'passwordReqMet' : 'passwordReqUnmet'}`}>
                <span className="passwordReqIcon" aria-hidden="true">{rule.ok ? '✓ ' : '✗ '}</span>
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      </div>
    </div>
);
};

export default SignupForm;