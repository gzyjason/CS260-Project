import Header from '../components/Header';
import Footer from '../components/Footer';

const Login = () => (
    <>
        <Header />
        <main className="p-6 max-w-lg mx-auto pt-28">
            <h1 className="text-2xl font-merriweather text-center mb-6">Login Page</h1>
            <p className="text-center mb-4">Please log in with your credentials.</p>
            <form className="p-6 bg-white/50 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sepia-text font-bold mb-1">Username:</label>
                    <input type="text" id="username" name="username" className="w-full p-2 border border-sepia-text/30 rounded-md focus:ring-primary-brand focus:border-primary-brand" />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sepia-text font-bold mb-1">Password:</label>
                    <input type="password" id="password" name="password" className="w-full p-2 border border-sepia-text/30 rounded-md focus:ring-primary-brand focus:border-primary-brand" />
                </div>
                <Link to="/calendar" className="block text-center bg-primary-brand text-white py-2 px-4 rounded hover:bg-primary-brand/90">Log In</Link>
            </form>
        </main>
        <Footer />
    </>
);

export default Login;