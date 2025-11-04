/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-brand': '#6A5ACD', // Example: Slate Blue
                'creamy-bg': '#FAF3E0',     // Example: A creamy off-white
                'sepia-text': '#704214',    // Example: A sepia brown
            },
            fontFamily: {
                'merriweather': ['Merriweather', 'serif'],
            }
        },
    },
    plugins: [],
}