import { getServerSideProps } from '@/pages/devportal/access';
import { extendTheme, withDefaultVariant } from '@chakra-ui/react';
import { mode, transparentize } from '@chakra-ui/theme-tools';

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
  'bc-background': '#f1f1f1',
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

const getAlertStatusColor = (color) => {
  switch(color) {
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
  outline: ( props ) => {
    const { colorScheme: c, theme: t } = props;
    const color = getAlertStatusColor(c);
    return { 
      container: {
        paddingStart: 3,
        borderWidth: "1px",
        borderColor: color,
        bg: transparentize(color, 0.1)(t),
      },
      icon: {
        color: color,
      }
    }
  },
  status: ( props ) => {
    const { colorScheme: c} = props;
    const color = getAlertStatusColor(c);
    return { 
      container: {
        paddingStart: 3,
        borderWidth: "1px",
        borderColor: 'white',
        bg: 'white',
      },
      icon: {
        color: color,
      }
    }
  }
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
          colorScheme: 'primary',
        },
      },
      Radio: {
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
            mt: -2,
            color: 'component',
          },
        },
      },
      Menu: {
        baseStyle: {
          item: {
            pr: 14,
            pl: 5,
          },
        },
      },
      Modal: {
        baseStyle: {
          header: {
            pt: 12,
            px: 10,
          },
          body: {
            px: 10,
          },
          footer: {
            px: 10,
            pb: 8,
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
              pb: 5,
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
              _selected: {
                fontWeight: 'bold',
                color: 'bc-blue',
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
            icon: {
              color: 'bc-component',
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
