module.exports = {
  purge: [
    './nextapp/components/**/*.{js,ts,jsx,tsx}',
    './nextapp/pages/**/*.{js,ts,jsx,tsx}',
    './nextapp/shared/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'media', // 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['BCSans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif'],
    },
    extend: {
      height: {
        header: '65px',
      },
      textColor: {
        main: '#313132',
        link: '#1A5A96',
      },
      colors: {
        'bc-blue': '#003366',
        'bc-yellow': '#FCBA19',
        text: '#313132',
        'bc-blue-alt': '#38598A',
        'bc-gray': '#f2f2f2',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
