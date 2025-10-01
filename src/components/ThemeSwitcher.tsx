import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

const themeIcon: Record<string, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const ThemeSwitcher = () => {
  const { themes, theme, setTheme } = useTheme();

  if (!theme) return;

  return (
    <Tabs value={theme} onValueChange={setTheme}>
      <TabsList className="grid grid-cols-3">
        {themes.map((theme) => {
          const Icon = themeIcon[theme];
          return (
            <TabsTrigger value={theme} key={theme}>
              <Icon className="size-4" />
              <span>{theme}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default ThemeSwitcher;
