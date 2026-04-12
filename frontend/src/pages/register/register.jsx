import { useState } from 'react';
import './style.css';
import SignupForm from '../../components/auth/register/register.jsx';
import ActivateAccount from '../../components/auth/register/activate.jsx';

export default function Signup() {
    const [signupComplete, setSignupComplete] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    
    const handleSignupSuccess = (email) => {
        setUserEmail(email);
        setSignupComplete(true);
    };

    return (
        <div>
            <div className="signUpContainer">
                {signupComplete
                    ? <ActivateAccount email={userEmail} />
                    : <SignupForm onSignupSuccess={handleSignupSuccess} />
                }
            </div>
        </div>
    );
}