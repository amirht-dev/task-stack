import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const themeIcon: Record<string, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const ThemeSwitcher = () => {
  const { themes, theme, setTheme } = useTheme();
  console.log(theme);

  if (!theme) return;

  const ActiveIcon = themeIcon[theme];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <ActiveIcon className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {themes.map((theme) => {
            const Icon = themeIcon[theme];
            return (
              <DropdownMenuRadioItem value={theme} key={theme}>
                <div className="flex items-center gap-2">
                  <Icon className="size-4" />
                  <span>{theme}</span>
                </div>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
