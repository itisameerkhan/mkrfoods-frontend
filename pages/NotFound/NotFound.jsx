import { useNavigate } from 'react-router-dom';
import './NotFound.scss';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="content-wrapper">
                <div className="error-code-container">
                    <h1 className="error-code">404</h1>
                    <div className="cloud-overlay"></div>
                </div>
                
                <div className="text-content">
                    <h2>Sorry, that page could not be found</h2>
                    <p>The requested page either doesn't exist or you don't have access to it.</p>
                    
                    <button className="home-button" onClick={() => navigate('/')}>
                        Go Back Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
