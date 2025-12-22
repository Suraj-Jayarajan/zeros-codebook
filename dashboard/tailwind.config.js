/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            boxShadow: {
                'neumorph': '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
                'neumorph-inset': 'inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff'
            },
            backgroundColor: {
                'neumorph': '#e0e0e0'
            }
        },
    },
    plugins: [],
}
