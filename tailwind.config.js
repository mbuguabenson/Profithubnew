/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dark-bg': '#0f172a',
                'glass-bg': 'rgba(255, 255, 255, 0.05)',
                'brand-blue': '#3b82f6',
                'brand-purple': '#a855f7',
                'brand-cyan': '#06b6d4',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow-blue': '0 0 15px rgba(59, 130, 246, 0.5)',
                'glow-purple': '0 0 15px rgba(168, 85, 247, 0.5)',
                'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.5)',
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}
