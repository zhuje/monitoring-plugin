import { ThemeOptions } from '@mui/material';
import { typography } from '@perses-dev/components';
import {
  chart_color_blue_100,
  chart_color_blue_300,
  chart_color_blue_500,
  t_color_white,
} from '@patternfly/react-tokens';

// Perses design system color palettes (from @perses-dev/components, not exported as values)
const blue = {
  50: '#E7F1FC',
  100: '#D0E3FA',
  150: '#B8D5F7',
  200: '#A1C7F5',
  300: '#72ABF0',
  400: '#438FEB',
  500: '#1473E6',
  600: '#105CB8',
  700: '#0C458A',
  800: '#082E5C',
  850: '#062345',
  900: '#04172E',
  950: '#020C17',
};

const green = {
  50: '#EAF9F1',
  100: '#D5F2E3',
  150: '#C1ECD4',
  200: '#ACE5C6',
  300: '#82D9AA',
  400: '#59CC8D',
  500: '#2FBF71',
  600: '#26995A',
  700: '#1C7344',
  800: '#134C2D',
  850: '#0E3922',
  900: '#092617',
  950: '#05130B',
};

const grey = {
  50: '#F0F1F6',
  100: '#E1E3ED',
  150: '#D2D5E4',
  200: '#C3C7DB',
  300: '#A4ACC8',
  400: '#8690B6',
  500: '#717CA4',
  600: '#535D83',
  700: '#3E4662',
  800: '#2A2E42',
  850: '#1F2331',
  900: '#151721',
  950: '#0A0C10',
};

const orange = {
  50: '#FFF5E8',
  100: '#FFECD2',
  150: '#FFE2BB',
  200: '#FFD9A4',
  300: '#FFC577',
  400: '#FFB249',
  500: '#FF9F1C',
  600: '#CC7F16',
  700: '#995F11',
  800: '#66400B',
  850: '#4D3008',
  900: '#332006',
  950: '#1A1003',
};

const purple = {
  50: '#EFE9FD',
  100: '#E0D2FC',
  150: '#D0BCFA',
  200: '#C1A6F8',
  300: '#A179F5',
  400: '#824DF1',
  500: '#6320EE',
  600: '#4F1ABE',
  700: '#3B138F',
  800: '#280D5F',
  850: '#1E0A47',
  900: '#140630',
  950: '#0A0318',
};

const red = {
  50: '#FDEDED',
  100: '#FBDADA',
  150: '#F9C8C8',
  200: '#F7B5B5',
  300: '#F29191',
  400: '#EE6C6C',
  500: '#EA4747',
  600: '#BD3939',
  700: '#902B2B',
  800: '#621D1D',
  850: '#4C1616',
  900: '#350F0F',
  950: '#1F0808',
};

function mapPatternFlyBackground(): ThemeOptions['palette'] {
  return {
    background: {
      default: 'var(--pf-t--global--background--color--primary--default)',
      paper: 'var(--pf-t--global--background--color--secondary--default)',
      code: 'var(--pf-t--global--background--color--action--plain--default)',
      tooltip: 'var(--pf-t--global--background--color--inverse--default)',
      lighter: 'var(--pf-t--global--background--color--floating--default)',
      border: 'var(--pf-t--global--border--color--default)',
      navigation: 'var(--pf-t--global--background--color--secondary--default)',
      overlay: 'var(--pf-t--global--background--color--backdrop--default)',
    },
  };
}

function mapPatternFlyText(): ThemeOptions['palette'] {
  return {
    text: {
      primary: 'var(--pf-t--global--text--color--regular)',
      secondary: 'var(--pf-t--global--text--color--subtle)',
      disabled: 'var(--pf-t--global--text--color--disabled)',
      navigation: 'var(--pf-t--global--text--color--regular)',
      accent: 'var(--pf-t--global--text--color--subtle)',
      link: 'var(--pf-t--global--text--color--link--default)',
      linkHover: 'var(--pf-t--global--text--color--link--hover)',
    },
  };
}

function mapPatternFlyPrimary(): ThemeOptions['palette'] {
  return {
    primary: {
      main: 'var(--pf-t--global--color--brand--default)',
      dark: 'var(--pf-t--global--color--brand--clicked)',
      light: 'var(--pf-t--global--color--brand--hover)',
      contrastText: t_color_white.value,
    },
  };
}

function mapPatternFlySecondary(): ThemeOptions['palette'] {
  return {
    secondary: {
      main: 'var(--pf-t--global--text--color--regular)',
      dark: 'var(--pf-t--global--text--color--regular)',
      light: 'var(--pf-t--global--text--color--subtle)',
    },
  };
}

function mapPatternFlyStatusColors(): ThemeOptions['palette'] {
  return {
    error: {
      main: 'var(--pf-t--global--color--status--danger--default)',
      dark: 'var(--pf-t--global--color--status--danger--clicked)',
      light: 'var(--pf-t--global--color--status--danger--hover)',
    },
    warning: {
      main: 'var(--pf-t--global--color--status--warning--default)',
      dark: 'var(--pf-t--global--color--status--warning--clicked)',
      light: 'var(--pf-t--global--color--status--warning--hover)',
    },
    success: {
      main: 'var(--pf-t--global--color--status--success--default)',
      dark: 'var(--pf-t--global--color--status--success--clicked)',
      light: 'var(--pf-t--global--color--status--success--hover)',
    },
    info: {
      main: 'var(--pf-t--global--color--status--info--default)',
      dark: 'var(--pf-t--global--color--status--info--clicked)',
      light: 'var(--pf-t--global--color--status--info--hover)',
    },
  };
}

function getDesignSystemColors() {
  return {
    designSystem: { blue, green, grey, orange, purple, red },
  };
}

function getGreyPalette(mode: 'light' | 'dark') {
  return mode === 'light'
    ? {
        50: grey[50],
        100: grey[100],
        200: grey[200],
        300: grey[300],
        400: grey[400],
        500: grey[500],
        600: grey[600],
        700: grey[700],
        800: grey[800],
        900: grey[900],
        950: grey[950],
      }
    : {
        50: grey[950],
        100: grey[900],
        200: grey[800],
        300: grey[700],
        400: grey[600],
        500: grey[500],
        600: grey[400],
        700: grey[300],
        800: grey[200],
        900: grey[100],
        950: grey[50],
      };
}

function mapPatternFlyTypography(): ThemeOptions['typography'] {
  return {
    ...typography,
    fontFamily: 'var(--pf-t--global--font--family--body)',
    subtitle1: {
      fontFamily: 'var(--pf-t--global--font--family--heading)',
      fontWeight: 'var(--pf-t--global--font--weight--heading--default)',
      lineHeight: 'var(--pf-v6-c-card__title-text--LineHeight)',
      fontSize: 'var(--pf-t--global--font--size--heading--sm)',
    },
    h2: {
      fontWeight: 'var(--pf-t--global--font--weight--body--default)',
      fontSize: 'var(--pf-t--global--font--size--600)',
    },
  };
}

function mapPatternFlyComponents(isDark: boolean): ThemeOptions['components'] {
  const brandColor = isDark ? chart_color_blue_100.value : chart_color_blue_300.value;

  return {
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiClock-meridiemText': {
            color: 'var(--pf-t--global--text--color--regular)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--pf-t--global--border--radius--medium)',
          borderColor: 'var(--pf-t--global--border--color--default)',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          '&.MuiCardHeader-root': {
            borderBottom: 'none',
            paddingBlockEnd: 'var(--pf-t--global--spacer--md)',
            paddingBlockStart: 'var(--pf-t--global--spacer--md)',
            paddingLeft: 'var(--pf-t--global--spacer--md)',
            paddingRight: 'var(--pf-t--global--spacer--md)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&.MuiCardContent-root': {
            borderTop: 'none',
            '&:last-child': {
              paddingBottom: 'var(--pf-t--global--spacer--md)',
              paddingLeft: 'var(--pf-t--global--spacer--sm)',
              paddingRight: 'var(--pf-t--global--spacer--md)',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: 'var(--pf-t--global--border--color--default)',
        },
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--pf-t--global--border--color--default)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--pf-t--global--border--color--default)',
          },
        },
        input: {
          padding: '8.5px 14px',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: 'var(--pf-t--global--text--color--regular)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&.MuiButton-colorPrimary': {
            borderRadius: 'var(--pf-t--global--border--radius--pill)',
            borderColor: 'var(--pf-t--global--border--color--default)',
            color: brandColor,
          },
          '&.MuiButton-contained.MuiButton-colorPrimary': {
            color: t_color_white.value,
          },
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          '& .MuiButton-root': {
            borderRadius: 'var(--pf-t--global--border--radius--tiny) !important',
          },
        },
        grouped: {
          borderRadius: 'var(--pf-t--global--border--radius--tiny)  !important',
        },
        firstButton: {
          borderRadius: 'var(--pf-t--global--border--radius--tiny)  !important',
        },
        lastButton: {
          borderRadius: 'var(--pf-t--global--border--radius--tiny)  !important',
        },
        middleButton: {
          borderRadius: 'var(--pf-t--global--border--radius--tiny)  !important',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&.MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl.MuiInputLabel-animated.MuiInputLabel-sizeMedium.MuiInputLabel-outlined.MuiFormLabel-colorPrimary[data-shrink="false"]':
            {
              top: '-7px',
            },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.MuiButtonBase-root.MuiTab-root.Mui-selected': {
            color: brandColor,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          '&.MuiTabs-indicator': {
            backgroundColor: brandColor,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          '&.MuiDrawer-paper.MuiDrawer-paperAnchorRight': {
            borderTopLeftRadius: 'var(--pf-t--global--border--radius--medium) !important',
            borderBottomLeftRadius: 'var(--pf-t--global--border--radius--medium) !important',
            borderTopRightRadius: '0 !important',
            borderBottomRightRadius: '0 !important',
          },
          '&.MuiDrawer-paper.MuiDrawer-paperAnchorLeft': {
            borderTopRightRadius: 'var(--pf-t--global--border--radius--medium) !important',
            borderBottomRightRadius: 'var(--pf-t--global--border--radius--medium) !important',
            borderTopLeftRadius: '0 !important',
            borderBottomLeftRadius: '0 !important',
          },
          '& .MuiButton-colorSecondary': {
            borderRadius: 'var(--pf-t--global--border--radius--pill) !important',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--pf-t--global--border--radius--medium) !important',
          '&.MuiAccordion-root': {
            borderRadius: 'var(--pf-t--global--border--radius--medium) !important',
          },
          '&::before': {
            opacity: '0 !important',
          },
          backgroundColor:
            'var(--pf-t--global--background--color--action--plain--default) !important',
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--pf-t--global--border--radius--medium) !important',
          backgroundColor: 'var(--pf-t--global--background--color--floating--default) !important',
          '&.Mui-expanded': {
            borderBottomLeftRadius: '0 !important',
            borderBottomRightRadius: '0 !important',
            borderTopLeftRadius: 'var(--pf-t--global--border--radius--medium) !important',
            borderTopRightRadius: 'var(--pf-t--global--border--radius--medium) !important',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--pf-t--global--background--color--floating--default) !important',
          borderBottomLeftRadius: 'var(--pf-t--global--border--radius--medium) !important',
          borderBottomRightRadius: 'var(--pf-t--global--border--radius--medium) !important',
          borderTopLeftRadius: '0 !important',
          borderTopRightRadius: '0 !important',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontWeight: 'var(--pf-t--global--font--weight--body--default) !important',
        },
      },
    },
  };
}

export function mapPatternFlyThemeToMUI(theme: 'light' | 'dark'): ThemeOptions {
  const isDark = theme === 'dark';

  return {
    typography: mapPatternFlyTypography(),
    palette: {
      mode: isDark ? 'dark' : 'light',
      ...mapPatternFlyPrimary(),
      ...mapPatternFlySecondary(),
      ...mapPatternFlyBackground(),
      ...mapPatternFlyText(),
      ...mapPatternFlyStatusColors(),
      ...getDesignSystemColors(),
      grey: getGreyPalette(theme),
      common: { white: '#FFFFFF', black: '#000000' },
    },
    components: mapPatternFlyComponents(isDark),
  };
}
