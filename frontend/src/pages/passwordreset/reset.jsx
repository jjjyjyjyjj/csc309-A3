import './style.css';
import PasswordResetForm from '../../components/auth/passwordreset/reset.jsx';

export default function PasswordReset() {
    const handleResetSuccess = () => {
        console.log('Password reset successful');
        // user state will update, and useEffect will check the profile
    };

    return (
        <div>
            <div className="resetContainer">
                <PasswordResetForm onResetSuccess={handleResetSuccess} />
            </div>
        </div>
    );
}