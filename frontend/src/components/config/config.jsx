import { useState } from 'react';
import api from '../../services/api';
import './style.css';

function configPage() {
    const [config, setConfig] = useState({
        reset_cooldown: 1,
        negotiation_window: 900,
        job_start_window: 168,
        availability_timeout: 300
    });

    const updateConfig = async (endpoint, key, value) => {
        try {
            // The payload key must match the specific endpoint
            const payload = { [key]: Number(value) };
            const { data } = await api.patch(`/system/${endpoint}`, payload);
            
            // Update local state with the 200 OK response
            setConfig(prev => ({ ...prev, ...data }));
            alert("Configuration updated successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update configuration");
        }
    };

return (
    <div className="config-container">
        <div className='resetCooldown'>
            <h3>Reset Cooldown</h3>
            <h4>The reset cooldown for users requesting to change their password </h4>
            <p>Current Cooldown: {config.reset_cooldown}s</p>
            <label>Set a new value: </label>
            <input 
                type="number" 
                placeholder=" Enter a new value" 
                onBlur={(e) => updateConfig('reset-cooldown', 'reset_cooldown', e.target.value)} 
            />
        </div>
        <div className='negoWindow'>
            <h3>Negotiation Window</h3>
            <h4>The duration of ongoing negotiations</h4>
            <p>Current Negotiation Window: {config.negotiation_window}s</p>
            <label>Set a new value: </label>
            <input 
                type="number" 
                placeholder=" Enter a new value" 
                onBlur={(e) => updateConfig('negotiation-window', 'negotiation_window', e.target.value)} 
            />
        </div>
        <div className='jobStart'>
            <h3>Job Start Window</h3>
            <h4>The limit for how far ahead businesses can set the job start time for a posting </h4>
            <p>Current Job Start Window: {config.job_start_window}s</p>
            <label>Set a new value: </label>
            <input 
                type="number" 
                placeholder=" Enter a new value" 
                onBlur={(e) => updateConfig('job-start-window', 'job_start_window', e.target.value)} 
            />
        </div>
        <div className='availTime'>
            <h3>Availability Timeout</h3>
            <h4>The amount of time inactive before the regular user is considered unavailable </h4>
            <p>Current Availability Timeout: {config.availability_timeout}s</p>
            <label>Set a new value: </label>
            <input 
                type="number" 
                placeholder=" Enter a new value" 
                onBlur={(e) => updateConfig('availability-timeout', 'availability_timeout', e.target.value)} 
            />
        </div>
    </div>
)
}

export default configPage;
