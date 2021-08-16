import { extendTheme, withDefaultVariant } from '@chakra-ui/react';

const colors = {
  'bc-blue': '#003366',
  'bc-yellow': '#FCBA19',
  text: '#313132',
  'bc-component': '#606060',
  'bc-link': '#1A5A96',
  'bc-blue-alt': '#38598A',
  'bc-gray': '#f2f2f2',
  'bc-border-focus': '#3B99FC',
  'bc-error': '#D8292F',
  'bc-success': '#2E8540',
};
const _focus = {
  outline: '4px solid',
  outlineOffset: 1,
  outlineColor: 'bc-border-focus',
};
const _disabled = {
  opacity: 0.3,
  cursor: 'not-allowed',
};
const _invalid = {
  borderColor: 'bc-error',
};
const _valid = {
  borderColor: 'bc-success',
};

const buttonVariants = {
  primary: {
    bg: 'bc-blue',
    color: 'white',
    _disabled: {
      ..._disabled,
      _hover: {
        background: 'bc-blue',
      },
    },
  },
  secondary: {
    bg: 'white',
    color: 'bc-blue',
    border: '2px solid',
    borderColor: 'bc-blue',
    _disabled: {
      ..._disabled,
      _hover: {
        background: 'bc-blue',
      },
    },
  },
  header: {
    bg: 'bc-yellow',
    color: 'white',
    _disabled: {
      ..._disabled,
      _hover: {
        background: 'bc-yellow',
      },
    },
  },
};
const theme = extendTheme(
  {
    colors,
    fonts: {
      body: 'BCSans, "Noto Sans", Verdana, Arial, system-ui, sans-serif',
      heading: 'BCSans, "Noto Sans", system-ui, sans-serif',
      mono: 'Consolas, Menlo, monospace',
    },
    styles: {
      global: {
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
          _focus,
          _disabled,
        },
        sizes: {
          md: {
            py: '12px',
            px: '36px',
          },
        },
        variants: buttonVariants,
        defaultProps: {
          variant: 'primary',
        },
      },
      Checkbox: {
        baseStyle: {
          '& label > span': {
            borderColor: 'red',
          },
        },
        variants: {
          'bc-input': {
            borderColor: 'red',
            color: 'bc-component',
            _checked: {
              background: 'bc-component',
              color: 'bc-component',
            },
          },
        },
      },
      Input: {
        variants: {
          'bc-input': {
            field: {
              bg: 'white',
              border: '2px solid',
              borderColor: 'bc-component',
              _focus,
              _disabled,
              _invalid,
              _valid,
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
              borderColor: 'bc-component',
              padding: '8px 45px 8px 15px',
              _focus,
              _disabled,
              _invalid,
              _valid,
            },
          },
        },
      },
      Textarea: {
        variants: {
          'bc-input': {
            bg: 'white',
            border: '2px solid',
            borderColor: 'bc-component',
            _focus,
            _disabled,
            _invalid,
            _valid,
          },
        },
      },
      FormLabel: {
        baseStyle: {
          // Hack since we can't make the default requiredIndicator: '' in themeing
          '& > span': {
            display: 'none',
          },
          '& + div': {
            mb: 4,
            color: 'component',
          },
        },
      },
      FormErrorMessage: {
        variants: {
          'bc-input': {
            fontWeight: 'bold',
          },
        },
      },
    },
  },
  withDefaultVariant({
    variant: 'bc-input',
    components: ['Checkbox', 'Input', 'FormErrorMessage', 'Select', 'Textarea'],
  })
);

export default theme;
