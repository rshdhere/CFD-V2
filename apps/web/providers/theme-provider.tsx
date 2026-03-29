import {
  ThemeProviderProps,
  ThemeProvider as NextThemesProvider,
} from "next-themes";

export const ThemesProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};
