import ConfigPage from '../../components/config/config';
import './style.css';

export default function SystemConfiguration (){
    return (
        <div className='configContainer'>
        <h1>System Configurations</h1>
        <ConfigPage />
        </div>
    )
}