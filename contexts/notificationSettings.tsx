import { createContext, useContext, useState } from 'react';

type NotificationSettings = {
  answer: boolean;
  scrap: boolean;
  manual: boolean;
  newQuestion: boolean;
  community: boolean;
};

type NotificationSettingsContextType = {
  settings: NotificationSettings;
  toggle: (key: keyof NotificationSettings) => void;
};

const NotificationSettingsContext = createContext<NotificationSettingsContextType | null>(null);

export function NotificationSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>({
    answer: true,
    scrap: true,
    manual: false,
    newQuestion: true,
    community: true,
  });

  const toggle = (key: keyof NotificationSettings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <NotificationSettingsContext.Provider value={{ settings, toggle }}>
      {children}
    </NotificationSettingsContext.Provider>
  );
}

export function useNotificationSettings() {
  const ctx = useContext(NotificationSettingsContext);
  if (!ctx) throw new Error('useNotificationSettings must be used within NotificationSettingsProvider');
  return ctx;
}
