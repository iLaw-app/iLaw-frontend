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

  // 건너뛰든 완료하든 한 번 본 뒤엔 다시 안 뜨게 done 플래그 저장.
  // (신규 가입 시엔 onboarding에서 이 플래그를 지워 다시 보여준다)
  const complete = async (_dontShowAgain: boolean) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('airo_tutorial_done', '1');
    } else {
      await SecureStore.setItemAsync('airo_tutorial_done', '1');
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
