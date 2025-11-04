import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext.js';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Login = () => {
    const { setUserName } = useAppContext();
    const [usernameInput, setUsernameInput] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (usernameInput.trim()) {
            setUserName(usernameInput);
        } else {
            setUserName('Guest'); // Default if empty
        }
        navigate('/calendar');
    };

    return (
        <>
            <Header />
            <main className="p-6 max-w-lg mx-auto pt-28">
                <h1 className="text-2xl font-merriweather text-center mb-6">Login Page</h1>
                <p className="text-center mb-4">Please log in with your credentials.</p>
                <form className="p-6 bg-white/50 rounded-lg shadow-lg" onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sepia-text font-bold mb-1">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="w-full p-2 border border-sepia-text/30 rounded-md focus:ring-primary-brand focus:border-primary-brand"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sepia-text font-bold mb-1">Password:</label>
                        <input type="password" id="password" name="password" className="w-full p-2 border border-sepia-text/30 rounded-md focus:ring-primary-brand focus:border-primary-brand" />
                    </div>
                    <button type="submit" className="w-full text-center bg-primary-brand text-white py-2 px-4 rounded hover:bg-primary-brand/90">
                        Log In
                    </button>
                </form>
            </main>
            <Footer />
        </>
    );
};

export default Login;