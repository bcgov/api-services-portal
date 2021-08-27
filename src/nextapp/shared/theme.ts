import { extendTheme, withDefaultVariant } from '@chakra-ui/react';

const colors = {
  'bc-blue': '#003366',
  'bc-yellow': '#FCBA19',
  text: '#313132',
  'bc-component': '#606060',
  'bc-link': '#1A5A96',
  'bc-blue-alt': '#38598A',
  'bc-light-blue': '#77ACF1',
  'bc-gray': '#f2f2f2',
  'bc-border-focus': '#3B99FC',
  'bc-error': '#D8292F',
  'bc-success': '#2E8540',
  ui: {
    500: '#606060',
  },
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
  flat: {
    color: 'bc-blue',
    _hover: {
      bgColor: 'bc-gray',
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
        body: {
          background: '#f1f1f1',
        },
        'body > div:first-of-type': {
          height: '100vh',
          display: 'flex',
          flexDir: 'column',
        },
        '.chakra-form__error-message': {
          fontWeight: 'bold',
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
            ..._focus,
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
          borderColor: 'bc-component',
          '& label': {
            borderColor: 'bc-component',
          },
          borderRadius: 0,
          '.chakra-checkbox__control': {
            borderRadius: 0,
          },
        },
        defaultProps: {
          size: 'lg',
          colorScheme: 'ui',
        },
      },
      Radio: {
        defaultProps: {
          size: 'lg',
          colorScheme: 'ui',
        },
      },
      Input: {
        variants: {
          'bc-input': {
            field: {
              bg: 'white',
              border: '2px solid',
              borderColor: 'bc-component',
              borderRadius: '4px',
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
              borderRadius: '4px',
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
            borderRadius: '4px',
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
      Switch: {
        defaultProps: {
          colorScheme: 'ui',
        },
      },
      Table: {
        sizes: {
          sm: { th: { fontSize: 'sm' } },
          md: { th: { fontSize: 'md' } },
          lg: { th: { fontSize: 'lg' } },
        },
        variants: {
          simple: {
            th: {
              borderBottom: '2px solid',
              borderColor: 'bc-yellow',
              textTransform: 'none',
            },
          },
        },
      },
      Tag: {
        variants: {
          'bc-input': {
            container: {
              borderRadius: 4,
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              backgroundColor: 'bc-light-blue',
            },
          },
          outline: {
            container: {
              borderRadius: 4,
              backgroundColor: '#E9F0F8',
              borderColor: 'rgba(142, 142, 142, 0.35)',
              color: 'text',
            },
          },
          drag: {
            container: {
              borderRadius: 4,
              backgroundColor: 'white',
              border: '1px solid',
              borderColor: 'bc-gray',
              color: 'text',
              fontSize: 'xs',
            },
          },
        },
      },
    },
  },
  withDefaultVariant({
    variant: 'bc-input',
    components: [
      'Checkbox',
      'Input',
      'FormErrorMessage',
      'Select',
      'Textarea',
      'Tag',
    ],
  })
);

export default theme;
