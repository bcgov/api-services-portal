const brightness = {
    default: '60%',
    light: '95%',
    dark: '14%',
  };

const tint = (opacity = 1, theme = 'default') =>
  `hsla(261, 84%, ${brightness[theme]}, ${opacity})`;

export const styles = {
    app: {
      padding: 10,
    //   maxWidth: 600,
      color: tint(1, 'dark'),
      fontFamily: 'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
    },
    mainHeading: {
      fontWeight: 900,
      marginTop: 10,
    },
    introText: {
      lineHeight: 1.9,
      padding: '5px',
      color: tint(0.6, 'dark'),
    },
    note: {
        lineHeight: 1.9,
        padding: '5px',
        color: tint(1, 'dark'),
        fontSize: '120%'
    },
    divider: {
      marginTop: 30,
      marginLeft: 0,
      width: 48,
      height: 4,
      borderWidth: 0,
      backgroundColor: tint(0.3),
    },
    formWrapper: {
    //   maxWidth: 500,
    },
    appHeading: {
      textTransform: 'uppercase',
      fontWeight: 900,
      marginTop: 50,
    } as React.CSSProperties,
    formInput: {
      color: tint(1, 'dark'),
      padding: '12px 16px',
      fontSize: '1.25em',
      width: '100%',
      borderRadius: 6,
      border: 0,
      background: tint(0.3),
    },

    listItem: {
      padding: '8px 4px',
      fontSize: '1.25em',
      fontWeight: 600,
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
      borderTop: `1px solid ${tint(0.2)}`,
    },

    deleteIcon: { width: 20, height: 20, fill: tint() },

    deleteButton: {
      background: 0,
      border: 0,
      padding: 0,
      cursor: 'pointer',
    },

    primaryButton: {
      display: 'inline-block',
      background: tint(0.4),
      height: "50px",
      padding: "5px",
      cursor: 'pointer',
      borderRadius: '5px',
      margin: '5px'

    },

    innerModal: {
        width: '100%',
        display: 'block',
    },

    form: {
        border: "1px solid black",
        borderRadius: "10px",
        margin: "10px",
        padding: "10px"
    }


  }

const empty = () => false
export default empty

  
