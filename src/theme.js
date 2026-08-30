// src/theme.js
// Sistema de design simples e centralizado, usado por todos os componentes
// para manter cores, espaçamentos e tipografia consistentes no app.

export const colors = {
  primary: '#2E7D32', // verde — remete ao contexto agrícola do app
  primaryDark: '#1B5E20',
  primaryLight: '#E8F5E9',
  accent: '#F9A825', // amarelo — usado em alertas de atenção média
  danger: '#C62828',
  dangerLight: '#FFEBEE',
  success: '#2E7D32',
  successLight: '#E8F5E9',
  background: '#F4F6F5',
  surface: '#FFFFFF',
  border: '#E0E0E0',
  textPrimary: '#1B1B1B',
  textSecondary: '#6B6B6B',
  textInverse: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const typography = {
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  body: { fontSize: 15, color: colors.textPrimary },
  caption: { fontSize: 12, color: colors.textSecondary },
};

// Sombra sutil reutilizada nos cards, compatível com iOS e Android
export const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};
