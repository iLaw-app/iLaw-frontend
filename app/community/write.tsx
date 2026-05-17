import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

function PhotoIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M15.8333 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5Z" stroke="#364153" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M7.08333 8.33333C7.77369 8.33333 8.33333 7.77369 8.33333 7.08333C8.33333 6.39298 7.77369 5.83333 7.08333 5.83333C6.39298 5.83333 5.83333 6.39298 5.83333 7.08333C5.83333 7.77369 6.39298 8.33333 7.08333 8.33333Z" stroke="#364153" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M17.5 12.5L13.3333 8.33333L4.16667 17.5" stroke="#364153" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function PollIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M2.5 2.5V15.8317C2.5 16.2739 2.67559 16.6981 2.98816 17.0106C3.30072 17.3232 3.72493 17.4988 4.16708 17.4988H17.4988" stroke="#364153" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M14.9977 14.1641V7.5" stroke="#364153" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10.8312 14.1644V4.16602" stroke="#364153" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M6.6653 14.1637V11.665" stroke="#364153" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export default function CommunityWriteScreen() {
  const router = useRouter();
  const { editId, editTitle, editContent } = useLocalSearchParams<{ editId?: string; editTitle?: string; editContent?: string }>();
  const isEditing = !!editId;
  const { accessToken } = useAuth();
  const [title, setTitle] = useState(editTitle ?? '');
  const [content, setContent] = useState(editContent ?? '');
  const [pollActive, setPollActive] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [photos, setPhotos] = useState<{ uri: string; type: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);

  const addOption = () => {
    if (pollOptions.length < 5) setPollOptions(prev => [...prev, '']);
  };

  const updateOption = (idx: number, val: string) => {
    setPollOptions(prev => prev.map((o, i) => i === idx ? val : o));
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const ext = (asset.uri.split('.').pop() ?? 'jpg').toLowerCase();
      const type = asset.mimeType ?? (ext === 'jpg' ? 'image/jpeg' : `image/${ext}`);
      setPhotos(prev => [...prev, { uri: asset.uri, type, name: `photo.${ext}` }]);
    }
  };

  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const uploadPhoto = async (photo: { uri: string; type: string; name: string }): Promise<string> => {
    const formData = new FormData();
    formData.append('image', { uri: photo.uri, type: photo.type, name: photo.name } as any);
    const res = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    if (!res.ok) throw new Error('이미지 업로드 실패');
    const data = await res.json();
    return data.url as string;
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('입력 오류', '제목을 입력해주세요.'); return; }
    if (!accessToken) { Alert.alert('로그인 필요', '로그인 후 이용해주세요.'); return; }
    setSubmitting(true);
    try {
      const body: Record<string, any> = { title: title.trim(), content: content.trim() || undefined };
      if (pollActive) {
        const validOptions = pollOptions.filter(o => o.trim());
        if (validOptions.length >= 2) {
          body.poll = { options: validOptions.map(label => ({ label, votes: 0 })) };
        }
      }
      if (photos.length > 0) {
        try {
          body.imageUrls = await Promise.all(photos.map(uploadPhoto));
        } catch {
          Alert.alert('사진 업로드 실패', '사진을 업로드하지 못했습니다. 사진 없이 게시합니다.');
        }
      }

      const url = isEditing ? `${API_BASE}/community/${editId}` : `${API_BASE}/community`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.back();
      } else {
        const data = await res.json().catch(() => ({}));
        Alert.alert('오류', data.message ?? '저장에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const showPlaceholder = content.length === 0 && !pollActive && !contentFocused;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#586144" />
          </TouchableOpacity>
          <Text style={s.topBarTitle}>{isEditing ? '수정하기' : '글쓰기'}</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Main input card */}
          <View style={s.inputCard}>
            <TextInput
              style={s.titleInput}
              placeholder="제목을 입력하세요"
              placeholderTextColor="#99A1AF"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <View style={s.cardDivider} />

            {/* Content area */}
            <View style={[s.contentWrapper, { minHeight: showPlaceholder ? 380 : 100 }]}>
              <TextInput
                style={[s.contentInput, { minHeight: showPlaceholder ? 380 : 100 }]}
                value={content}
                onChangeText={setContent}
                onFocus={() => setContentFocused(true)}
                onBlur={() => setContentFocused(false)}
                multiline
                textAlignVertical="top"
              />
              {showPlaceholder && (
                <View style={s.placeholder} pointerEvents="none">
                  <Text style={s.phMain}>내용을 입력하세요</Text>
                  <Text style={s.phBlank}>{' '}</Text>
                  <Text style={s.phSection}>커뮤니티 글쓰기 주의사항</Text>
                  <Text style={s.phDesc}>커뮤니티는 서로의 고민과 경험을 나누는 공간입니다.</Text>
                  <Text style={s.phDesc}>안전한 이용을 위해 아래 내용을 지켜주세요.</Text>
                  <Text style={s.phBlank}>{' '}</Text>
                  <Text style={s.phSection}>작성 전 꼭 확인해주세요</Text>
                  <Text style={s.phItem}>1. 이름, 학교, 주소, 연락처 등 개인을 알아볼 수 있는 정보는 쓰지 말아주세요.</Text>
                  <Text style={s.phItem}>2. 다른 사람을 비난하거나 상처 줄 수 있는 표현은 피해주세요.</Text>
                  <Text style={s.phItem}>3. 정확하지 않은 법률 정보를 단정적으로 작성하지 말아주세요.</Text>
                  <Text style={s.phItem}>4. 긴급한 위험 상황이라면</Text>
                  <Text style={s.phItemIndent}>커뮤니티보다 112, 1388, 가까운 보호기관에 먼저 도움을 요청해주세요.</Text>
                  <Text style={s.phItem}>5. 작성한 글은 운영 기준에 따라 수정되거나 숨김 처리될 수 있어요.</Text>
                </View>
              )}
            </View>

            {/* Poll container — inside the card */}
            {pollActive && (
              <View style={s.pollCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.pollLabel}>선택지 (2~5개)</Text>
                  <TouchableOpacity onPress={() => { setPollActive(false); setPollOptions(['', '']); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={18} color="#99A1AF" />
                  </TouchableOpacity>
                </View>
                {pollOptions.map((opt, i) => (
                  <TextInput
                    key={i}
                    style={s.pollOptionInput}
                    placeholder={`선택지 ${i + 1}`}
                    placeholderTextColor="#9CAF88"
                    value={opt}
                    onChangeText={v => updateOption(i, v)}
                  />
                ))}
                {pollOptions.length < 5 && (
                  <TouchableOpacity onPress={addOption} activeOpacity={0.7}>
                    <Text style={s.addOptionText}>+ 선택지 추가</Text>
                  </TouchableOpacity>
                )}
                <View style={{ height: 16 }} />
              </View>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <View style={s.photoRow}>
                {photos.map((photo, i) => (
                  <View key={i} style={s.photoThumb}>
                    <Image source={{ uri: photo.uri }} style={s.photoImg} />
                    <TouchableOpacity style={s.photoRemove} onPress={() => removePhoto(i)}>
                      <Ionicons name="close-circle" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 16 }} />
          </View>

          {/* Divider + media buttons */}
          <View style={s.mediaDivider} />
          <View style={s.mediaRow}>
            <TouchableOpacity style={s.mediaBtn} onPress={handleAddPhoto} activeOpacity={0.8}>
              <PhotoIcon />
              <Text style={s.mediaBtnText}>사진 추가</Text>
            </TouchableOpacity>
            {!pollActive && (
              <TouchableOpacity style={s.mediaBtn} onPress={() => setPollActive(true)} activeOpacity={0.8}>
                <PollIcon />
                <Text style={s.mediaBtnText}>투표 추가</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[s.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Text style={s.submitBtnText}>{submitting ? (isEditing ? '수정 중...' : '게시 중...') : (isEditing ? '수정 완료' : '글 게시하기')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  topBar: {
    height: 66,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 17,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
    position: 'relative',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { position: 'absolute', left: 16, top: 16, zIndex: 1, padding: 4 },
  topBarTitle: { fontSize: 20, fontWeight: '700', color: '#586144', lineHeight: 36, letterSpacing: 0.07 },

  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 12 },

  inputCard: {
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    paddingTop: 16, paddingHorizontal: 16, paddingBottom: 0,
    gap: 16,
  },

  titleInput: {
    height: 28,
    fontSize: 18, fontWeight: '700', color: '#1a1a1a',
    letterSpacing: -0.449, paddingVertical: 0,
  },
  cardDivider: { height: 1, backgroundColor: '#D1D5DC' },

  contentWrapper: { position: 'relative' },
  contentInput: {
    fontSize: 14, color: '#1a1a1a', lineHeight: 24,
    textAlignVertical: 'top', padding: 0,
  },
  placeholder: { position: 'absolute', top: 0, left: 0, right: 0 },
  phMain:       { fontSize: 14, color: '#99A1AF', lineHeight: 24 },
  phBlank:      { fontSize: 14, color: 'transparent', lineHeight: 20 },
  phSection:    { fontSize: 13, fontWeight: '700', color: '#99A1AF', lineHeight: 24 },
  phDesc:       { fontSize: 13, color: '#99A1AF', lineHeight: 22 },
  phItem:       { fontSize: 12, color: '#99A1AF', lineHeight: 22 },
  phItemIndent: { fontSize: 12, color: '#99A1AF', lineHeight: 22, paddingLeft: 18 },

  pollCard: {
    borderRadius: 14,
    borderWidth: 1, borderColor: '#D0D8E3',
    backgroundColor: '#F2F6F9',
    paddingTop: 16, paddingHorizontal: 16, paddingBottom: 0,
    gap: 16,
  },
  pollLabel: { fontSize: 14, fontWeight: '700', color: '#586144', lineHeight: 20, letterSpacing: -0.15 },
  pollOptionInput: {
    height: 41, paddingHorizontal: 16,
    borderRadius: 10, borderWidth: 0.678, borderColor: '#E5E7EB',
    backgroundColor: '#FFF', fontSize: 14, color: '#1a1a1a',
  },
  addOptionText: { fontSize: 16, fontWeight: '700', color: '#586144', lineHeight: 24, letterSpacing: -0.312 },

  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoThumb: { width: 72, height: 72, borderRadius: 8, position: 'relative' },
  photoImg: { width: 72, height: 72, borderRadius: 8 },
  photoRemove: { position: 'absolute', top: -6, right: -6 },

  mediaDivider: { height: 1, backgroundColor: '#E5E7EB' },
  mediaRow: { flexDirection: 'row', gap: 8 },
  mediaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 10, backgroundColor: '#F3F4F6',
  },
  mediaBtnText: { fontSize: 14, fontWeight: '700', color: '#364153', lineHeight: 20, letterSpacing: -0.15 },

  submitBtn: {
    width: 290, alignSelf: 'center',
    paddingVertical: 16, borderRadius: 9999,
    backgroundColor: '#B2D36E', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
