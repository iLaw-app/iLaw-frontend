import { Platform, Modal, View, StyleSheet } from 'react-native';
import React from 'react';

type Props = {
  visible: boolean;
  onRequestClose?: () => void;
  children: React.ReactNode;
};

export function AppModal({ visible, onRequestClose, children }: Props) {
  if (Platform.OS !== 'web') {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
        {children}
      </Modal>
    );
  }
  if (!visible) return null;
  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }]}>
      {children}
    </View>
  );
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
  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 9999 }]}>
      {children}
    </View>
  );
}
