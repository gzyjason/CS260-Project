import { Link } from 'react-router-dom';

const Header = ({ userName = 'Guest' }) => (
    <header className="flex flex-col bg-creamy-bg fixed top-0 left-0 w-full z-1000 pt-4 pb-4 px-4">
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
                <img src="/planit.png" alt="Stylized illustration of a planet" className="main-artwork w-10 rounded-xl" />
                <h1 className="font-merriweather m-0 text-xl">PlanIt!<sup>&reg;</sup></h1>
            </div>
            <p className="opacity-70 font-merriweather text-sm">Welcome, <span>{userName}</span>!</p>
        </div>
        <nav className="mt-2">
            <ul className="list-none p-0 flex justify-start space-x-4">
                <li><Link to="/about" className="hover:text-primary-brand transition duration-150 font-semibold">About</Link></li>
                <li><Link to="/calendar" className="hover:text-primary-brand transition duration-150 font-semibold">Calendar</Link></li>
                <li><Link to="/preferences" className="hover:text-primary-brand transition duration-150 font-semibold">Preferences</Link></li>
            </ul>
        </nav>
        <hr className="mt-4 border-t border-sepia-text/30" />
    </header>
);

export default Header;