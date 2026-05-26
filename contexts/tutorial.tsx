import React, { createContext, useContext, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type TutorialCtx = {
  visible: boolean;
  show: () => void;
  complete: (dontShowAgain: boolean) => Promise<void>;
};

const TutorialContext = createContext<TutorialCtx>({
  visible: false,
  show: () => {},
  complete: async () => {},
});

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  const complete = async (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      if (Platform.OS === 'web') {
        localStorage.setItem('airo_tutorial_done', '1');
      } else {
        await SecureStore.setItemAsync('airo_tutorial_done', '1');
      }
    }
    setVisible(false);
  };

  return (
    <TutorialContext.Provider value={{ visible, show: () => setVisible(true), complete }}>
      {children}
    </TutorialContext.Provider>
  );
}

export const useTutorial = () => useContext(TutorialContext);
