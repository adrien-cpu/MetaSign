/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
        './src/pages/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#3B82F6',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                input: 'var(--input)',
                ring: 'var(--ring)',
            },
        },
    },
    plugins: [],
}