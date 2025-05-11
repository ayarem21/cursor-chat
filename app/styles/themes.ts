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
    background: '#FFFFFF',
    text: '#1E1F22',
    primary: '#8AB4F8',
    secondary: '#F28B82',
    inputBackground: '#F0F2F5',
    buttonHover: 'rgba(0, 0, 0, 0.1)',
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#1E1F22',
    text: '#FFFFFF',
    primary: '#8AB4F8',
    secondary: '#F28B82',
    inputBackground: '#303134',
    buttonHover: 'rgba(255, 255, 255, 0.1)',
  },
}; 