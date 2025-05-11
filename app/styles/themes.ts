export interface Theme {
  name: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    inputBackground: string;
    buttonHover: string;
  };
}

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#E8E9EC',
    text: '#4A5568',
    primary: '#5D7AB9',
    secondary: '#C65F5F',
    inputBackground: '#F0F1F4',
    buttonHover: 'rgba(0, 0, 0, 0.08)',
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#141518',
    text: '#B0B8C1',
    primary: '#546DA8',
    secondary: '#B35757',
    inputBackground: '#1E2124',
    buttonHover: 'rgba(255, 255, 255, 0.03)',
  },
}; 