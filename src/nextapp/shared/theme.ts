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
  primary: {
    bg: 'bc-blue',
    color: 'white',
  },
  secondary: {
    bg: 'white',
    color: 'bc-blue',
    border: '2px solid',
    borderColor: 'bc-blue',
  },
  header: { bg: 'bc-yellow', color: 'white' },
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
      baseStyle: {
        borderRadius: 4,
        _hover: {
          opacity: 0.8,
          textDecoration: 'underline',
        },
        _active: {
          opacity: 1,
        },
        _focus: {
          outline: '4px solid',
          outlineColor: 'bc-border-focus',
          outlineOffset: 1,
        },
        '&:disabled': {
          opacity: 0.4,
        },
        '&:disabled:hover': {
          opacity: 0.4,
        },
      },
      sizes: {
        md: {
          py: '12px',
          px: '36px',
        },
      },
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
            padding: '8px 45px 8px 15px',
            _focus: {
              outline: '4px solid',
              outlineOffset: 1,
              outlineColor: 'bc-border-focus',
            },
          },
        },
      },
    },
    Textarea: {
      variants: {
        'bc-input': {
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
});

export default theme;
