import { extendTheme, withDefaultVariant } from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

const colors = {
  'bc-blue': '#003366',
  'bc-yellow': '#FCBA19',
  'bc-yellow-light': transparentize('#FCBA19', 0.1)({}),
  text: '#313132',
  'bc-component': '#606060',
  'bc-empty': '#60606080',
  'bc-link': '#1A5A96',
  'bc-blue-alt': '#38598A',
  'bc-light-blue': '#77ACF1',
  'bc-gray': '#f2f2f2',
  'bc-border-focus': '#3B99FC',
  'bc-outline': '#e1e1e5',
  'bc-error': '#D8292F',
  'bc-success': '#2E8540',
  'bc-background': '#f1f1f1',
  'bc-divider': '#e8e8e8',
  ui: {
    500: '#606060',
  },
  primary: {
    500: '#003366',
  },
  green: {
    '50': '#ECF8EF',
    '100': '#CAEDD1',
    '200': '#A8E1B4',
    '300': '#86D596',
    '400': '#64C979',
    '500': '#42BD5B',
    '600': '#349849',
    '700': '#277237',
    '800': '#1A4C24',
    '900': '#0D2612',
  },
  red: {
    '50': '#FBE9EA',
    '100': '#F4C3C4',
    '200': '#ED9C9F',
    '300': '#E67579',
    '400': '#DF4E53',
    '500': '#D8272D',
    '600': '#AD1F24',
    '700': '#81181B',
    '800': '#561012',
    '900': '#2B0809',
  },
};
const _focus = {
  // outline: '4px solid',
  // outlineOffset: 1,
  // outlineColor: 'bc-border-focus',
  outline: 'none',
  borderColor: 'bc-blue-alt',
  boxShadow: 'sm',
};
const _disabled = {
  opacity: 0.4,
  cursor: 'not-allowed',
};
const _invalid = {
  borderColor: 'bc-error',
};
const _valid = {
  borderColor: 'bc-success',
};

const getAlertStatusColor = (color: string) => {
  switch (color) {
    case 'blue':
      return 'bc-light-blue';
    case 'green':
      return 'bc-success';
    case 'orange':
      return 'bc-yellow';
    case 'red':
      return 'bc-error';
    default:
      return color;
  }
};

const alertVariants = {
  outline: ({ colorScheme, theme }) => {
    const color = getAlertStatusColor(colorScheme);
    return {
      container: {
        paddingStart: 3,
        borderWidth: '1px',
        borderColor: color,
        borderRadius: 4,
        bg: transparentize(color, 0.1)(theme),
      },
      icon: {
        color: color,
      },
    };
  },
  status: ({ colorScheme }) => {
    const color = getAlertStatusColor(colorScheme);
    return {
      container: {
        paddingStart: 3,
        borderWidth: '1px',
        borderColor: 'white',
        bg: 'white',
      },
      icon: {
        color: color,
      },
    };
  },
};

const buttonVariants = {
  primary: {
    bg: 'bc-blue',
    color: 'white',
    _disabled: {
      ..._disabled,
      _hover: {
        bg: '#003366 !important', // Use the hex value of bc-blue directly, necessary oddly.
        opacity: 0.4,
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
  success: {
    bg: 'bc-success',
    color: 'white',
    _disabled: {
      ..._disabled,
      _hover: {
        background: 'bc-success',
      },
    },
  },
  danger: {
    bg: 'bc-error',
    color: 'white',
    _disabled: {
      ..._disabled,
      _hover: {
        background: 'bc-error',
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
      boxShadow: 'none',
      color: 'bc-link',
      opacity: 1,
    },
    _active: {
      boxShadow: 'none',
    },
    _focus: {
      boxShadow: 'none',
    },
  },
  ghost: {
    color: 'bc-blue',
    borderColor: 'transparent',
    boxShadow: 'none',
    px: 3,
    _hover: {
      bgColor: 'transparent',
      textDecor: 'none',
    },
    _active: {
      bgColor: '#F2F5F7',
      boxShadow: 'none',
      outlineColor: 'transparent',
    },
    _focus: {
      borderColor: 'bc-blue-alt',
      boxShadow: 'none',
      // bgColor: '#F2F5F7',
      outlineColor: 'transparent',
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
          background: 'bc-background',
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
      Alert: {
        variants: alertVariants,
        defaultProps: {
          variant: 'status',
        },
      },
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
          label: {
            color: 'text',
          },
          '& label': {
            borderColor: 'bc-component',
          },
          borderRadius: 0,
          '.chakra-checkbox__control': {
            borderRadius: 0,
          },
          control: {
            borderColor: 'bc-component',
          },
        },
        defaultProps: {
          // size: 'lg',
          colorScheme: 'primary',
        },
      },
      Radio: {
        baseStyle: {
          control: {
            cursor: 'pointer',
          },
        },
        defaultProps: {
          size: 'lg',
          colorScheme: 'primary',
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
          code: {
            bg: 'white',
            border: '2px solid',
            borderColor: 'bc-component',
            fontFamily: 'Consolas,Lucida Console,Menlo,Monaco,monospace',
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
          '& + div:not(.chakra-select__wrapper)': {
            mb: 2,
            mt: -2,
            color: 'bc-component',
          },
        },
        helperText: {
          color: 'bc-component',
        },
      },
      FormError: {
        baseStyle: {
          text: {
            fontWeight: 'normal',
            fontSize: 'md',
            clear: 'both',
            overflow: 'hidden',

            'textarea + &': {
              mt: 0,
            },
          },
        },
      },
      Menu: {
        baseStyle: {
          item: {
            pr: 14,
            pl: 5,
            color: 'bc-blue',
          },
        },
      },
      Modal: {
        baseStyle: {
          header: {
            pt: 6,
            px: 8,
          },
          body: {
            px: 8,
          },
          footer: {
            px: 8,
            pb: 6,
            pt: 8,
          },
        },
      },
      Switch: {
        defaultProps: {
          colorScheme: 'primary',
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
              fontWeight: 'normal',
              textTransform: 'none',
              letterSpacing: 'normal',
              color: 'text',
              py: 5,
              px: 9,
            },
            td: {
              px: 9,
            },
          },
        },
      },
      Tabs: {
        variants: {
          line: {
            tab: {
              color: 'bc-component',
              _notFirst: {
                ml: 6,
              },
              _selected: {
                fontWeight: 'bold',
                color: 'bc-blue',
                outline: 'none',
                borderBottomWidth: 3,
              },
              _focus: {
                boxShadow: 'none',
              },
            },
          },
        },
      },
      Tag: {
        baseStyle: {
          label: {
            lineHeight: '1.4',
          },
        },
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
          outline: (props) => {
            const getLabelBgColor = (env: string) => {
              switch (env) {
                case 'prod':
                  return '#C2ED9850';
                case 'sandbox':
                  return '#333ed420';
                case 'test':
                  return '#8ed2cd40';
                case 'dev':
                  return '#fed77650';
                case 'conformance':
                  return '#f59b7c40';
                case 'other':
                  return '#f1f48730';
                case 'red':
                  return transparentize('bc-error', 0.1)(theme);
                default:
                  return '#e9f0f8';
              }
            };

            return {
              container: {
                borderRadius: 4,
                backgroundColor: getLabelBgColor(props.colorScheme),
                border: '1px solid',
                borderColor:
                  props.colorScheme === 'red' ? 'bc-error' : '#8e8e8e30',
                color: 'text',
                boxShadow: 'none',
              },
            };
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
            icon: {
              color: 'bc-component',
            },
          },
        },
      },
      Tooltip: {
        baseStyle: {
          bgColor: '#373d3f',
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
