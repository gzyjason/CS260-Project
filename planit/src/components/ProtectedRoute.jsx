import { useAppContext } from '../hooks/useAppContext';
import { Navigate } from 'react-router-dom';

/**
 * This component protects routes that require a user to be logged in.
 * It checks the 'userName' from our context.
 */
const ProtectedRoute = ({ children }) => {
    const { userName } = useAppContext();

    if (userName === 'Guest') {
        // If user is 'Guest', redirect them to the login page ("/")
        return <Navigate to="/" replace />;
    }

    // If user is logged in (e.g., 'jason@byu.edu'), show the page
    return children;
};

export default ProtectedRoute;