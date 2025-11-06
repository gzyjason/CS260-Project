import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
// We no longer import useAppContext here, as login is handled by the server.
import Header from '../components/Header';
import Footer from '../components/Footer';

const Login = () => {
    const navigate = useNavigate();

    // We now need state for password and any error messages
    const [usernameInput, setUsernameInput] = useState('');
    const [password, setPassword] = useState('');
    const [displayError, setDisplayError] = useState(null);

    // This function is based on Simon's loginOrCreate
    async function loginOrCreate(endpoint) {
        // Clear any previous errors
        setDisplayError(null);

        try {
            const response = await fetch(endpoint, {
                method: 'post',
                body: JSON.stringify({ email: usernameInput, password: password }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            if (response.ok) {
                // Get the user's email back from the server
                const user = await response.json();

                // Store the username in localStorage (like Simon)
                localStorage.setItem('userName', user.email);

                // Navigate to the calendar.
                // We will later update App.jsx to detect this change and
                // update the AppProvider state.
                navigate('/calendar');
            } else {
                // If the server sends a 401, 409, etc.
                const body = await response.json();
                setDisplayError(`⚠ Error: ${body.msg}`);
            }
        } catch (err) {
            // For network errors
            setDisplayError(`⚠ Network error: ${err.message}`);
        }
    }

    return (
        <>
            <Header />
            <main className="p-6 max-w-lg mx-auto pt-28">
                <h1 className="text-2xl font-merriweather text-center mb-6">Login Page</h1>
                <p className="text-center mb-4">Please log in or create an account.</p>

                {/* We replace the <form> with a <div> to handle multiple buttons */}
                <div className="p-6 bg-white/50 rounded-lg shadow-lg">
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sepia-text font-bold mb-1">Email:</label>
                        <input
                            type="text"
                            id="username"
                            className="w-full p-2 border border-sepia-text/30 rounded-md focus:ring-primary-brand focus:border-primary-brand"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sepia-text font-bold mb-1">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full p-2 border border-sepia-text/30 rounded-md focus:ring-primary-brand focus:border-primary-brand"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Simple error display (replaces Simon's MessageDialog) */}
                    {displayError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{displayError}</span>
                            <span
                                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                                onClick={() => setDisplayError(null)}
                            >
                                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 2.651a1.2 1.2 0 1 1-1.697-1.697L8.18 10 5.53 7.349a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-2.651a1.2 1.2 0 1 1 1.697 1.697L11.819 10l2.651 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
                            </span>
                        </div>
                    )}

                    {/* We now have two buttons, just like Simon */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => loginOrCreate('/api/auth/login')}
                            disabled={!usernameInput || !password}
                            className="w-full text-center bg-primary-brand text-black py-2 px-4 rounded hover:opacity-90 transition duration-150 font-semibold disabled:opacity-50"
                        >
                            Log In
                        </button>
                        <button
                            type="button"
                            onClick={() => loginOrCreate('/api/auth/create')}
                            disabled={!usernameInput || !password}
                            className="w-full text-center bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition duration-150 font-semibold disabled:opacity-50"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Login;