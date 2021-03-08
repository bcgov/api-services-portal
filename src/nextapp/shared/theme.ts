import { extendTheme } from '@chakra-ui/react';

const colors = {
  'bc-blue': '#003366',
  'bc-yellow': '#FCBA19',
  text: '#313132',
  'bc-link': '#1A5A96',
  'bc-blue-alt': '#38598A',
  'bc-gray': '#f2f2f2',
  'bc-divider': '#606060',
  'bc-border-focus': '#3B99FC',
};

const buttonVariants = {
  primary: { bg: 'bc-blue', color: 'white', borderRadius: 4 },
  secondary: { bg: 'bc-yellow', color: 'white', borderRadius: 4 },
  tertiary: { bg: 'bc-link', color: 'white', borderRadius: 4 },
};
const theme = extendTheme({
  colors,
  fonts: {
    body: 'BCSans, "Noto Sans", Verdana, Arial, system-ui, sans-serif',
    heading: 'BCSans, "Noto Sans", system-ui, sans-serif',
    mono: 'Consolas, Menlo, monospace',
  },
  styles: {
    global: {
      body: {
        background: '#f1f1f1',
      },
      'body > div:first-of-type': {
        height: '100vh',
        display: 'flex',
        flexDir: 'column',
      },
    },
  },
  components: {
    IconButton: {
      variants: buttonVariants,
    },
    Button: {
      variants: buttonVariants,
    },
    Input: {
      variants: {
        'bc-input': {
          field: {
            bg: 'white',
            border: '2px solid',
            borderColor: '#606060',
            _focus: {
              borderColor: 'bc-border-focus',
            },
          },
        },
      },
    },
    Select: {
      variants: {
        'bc-input': {
          field: {
            bg: 'white',
            border: '2px solid',
            borderColor: '#606060',
            _focus: {
              borderColor: 'bc-border-focus',
            },
          },
        },
      },
    },
  },
});

export default theme;
