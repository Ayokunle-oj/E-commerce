import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../theme/useTheme";
import type { ThemeMode } from "../../theme/theme";
import "./themeToggle.css";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "Automatic", Icon: Monitor },
] as const satisfies readonly {
  value: ThemeMode;
  label: string;
  Icon: typeof Sun;
}[];

function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <fieldset className="theme-toggle">
      <legend className="theme-toggle__legend">Appearance</legend>
      <div className="theme-toggle__options">
        {OPTIONS.map(({ value, label, Icon }) => (
          <label className="theme-toggle__option" key={value}>
            <input
              className="theme-toggle__input"
              type="radio"
              name="theme"
              value={value}
              checked={mode === value}
              onChange={() => setMode(value)}
            />
            <span className="theme-toggle__box">
              <Icon size={18} aria-hidden="true" />
              {label}
            </span>
          </label>
        ))}
      </div>
      <p className="theme-toggle__hint">
        Automatic follows your phone's light or dark setting.
      </p>
    </fieldset>
  );
}

export default ThemeToggle;
