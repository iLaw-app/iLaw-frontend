import { Platform, Modal, View } from 'react-native';
import React from 'react';

type Props = {
  visible: boolean;
  onRequestClose?: () => void;
  children: React.ReactNode;
};

// 웹 미리보기 프레임은 콘텐츠 View에 paddingTop:30 / paddingBottom:5 가 있어서,
// 모달이 그 여백까지 덮도록 위/아래로 넘치게 깔아준다(프레임 바깥은 overflow:hidden으로 잘림).
const WEB_OVERLAY = { position: 'absolute' as const, top: -30, left: 0, right: 0, bottom: -5, zIndex: 9999 };

export function AppModal({ visible, onRequestClose, children }: Props) {
  if (Platform.OS !== 'web') {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
        {children}
      </Modal>
    );
  }
  if (!visible) return null;
  return <View style={WEB_OVERLAY}>{children}</View>;
}

export function BottomSheet({ visible, onRequestClose, children }: Props) {
  if (Platform.OS !== 'web') {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onRequestClose}>
        {children}
      </Modal>
    );
  }
  if (!visible) return null;
  return <View style={WEB_OVERLAY}>{children}</View>;
}
