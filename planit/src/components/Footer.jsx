const Footer = () => (
    <footer className="text-center p-4 text-sepia-text/80">
        <hr className="mb-2 border-t border-sepia-text/30" />
        <div className="flex flex-wrap justify-center items-center text-sm space-x-4">
            <span>Source:</span>
            <a href="https://github.com/gzyjason/CS260-Project.git" className="hover:text-primary-brand">GitHub</a>
            <span>|</span>
            <span>Logo Credit:</span>
            <a href="https://www.vecteezy.com/free-vector/planet" className="hover:text-primary-brand">Planet Vectors by Vecteezy</a>
        </div>
        <hr className="my-2 border-t border-sepia-text/30" />
    </footer>
);

export default Footer;