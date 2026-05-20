import { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Rect, Defs, ClipPath } from 'react-native-svg';
import { useAuth } from './context/auth';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type Suggestion = { type: 'manual' | 'qna'; id: number; label: string };
type Message = {
  id: number; from: 'ai' | 'user'; time: string;
  text?: string;
  summary?: string;
  suggestions?: Suggestion[];
};

function nowStr() {
  const d = new Date();
  const h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
  return `${h < 12 ? '오전' : '오후'} ${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m}`;
}

function SendIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <G clipPath="url(#clip_aic_send)">
        <Path d="M12.1067 18.062C12.1383 18.1408 12.1933 18.2081 12.2643 18.2548C12.3353 18.3015 12.4189 18.3254 12.5038 18.3232C12.5888 18.321 12.671 18.2929 12.7395 18.2426C12.808 18.1924 12.8595 18.1223 12.8871 18.042L18.3007 2.2175C18.3274 2.1437 18.3324 2.06384 18.3154 1.98726C18.2983 1.91068 18.2598 1.84054 18.2043 1.78506C18.1488 1.72958 18.0787 1.69104 18.0021 1.67396C17.9255 1.65689 17.8456 1.66197 17.7718 1.68863L1.94736 7.10226C1.86699 7.12983 1.79697 7.18132 1.7467 7.24982C1.69644 7.31833 1.66833 7.40057 1.66615 7.48551C1.66398 7.57046 1.68784 7.65403 1.73453 7.72502C1.78122 7.79601 1.84852 7.85102 1.92737 7.88266L8.53201 10.5312C8.7408 10.6148 8.93049 10.7398 9.08967 10.8987C9.24884 11.0575 9.37419 11.247 9.45815 11.4557L12.1067 18.062Z" stroke="white" strokeWidth="1.66573" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M18.2014 1.78809L9.08984 10.8988" stroke="white" strokeWidth="1.66573" strokeLinecap="round" strokeLinejoin="round"/>
      </G>
      <Defs><ClipPath id="clip_aic_send"><Rect width="19.9888" height="19.9888" fill="white"/></ClipPath></Defs>
    </Svg>
  );
}

function SuggestionCard({ sg, onPress }: { sg: Suggestion; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.sgCard} onPress={onPress} activeOpacity={0.75}>
      <View style={s.sgTypeRow}>
        <Ionicons
          name={sg.type === 'manual' ? 'book-outline' : 'chatbubble-outline'}
          size={12}
          color="#9CAF88"
        />
        <Text style={s.sgTypeText}>{sg.type === 'manual' ? '매뉴얼' : 'QNA'}</Text>
      </View>
      <Text style={s.sgTitle}>{sg.label}</Text>
    </TouchableOpacity>
  );
}

export default function AiChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 0, from: 'ai', time: nowStr(),
      text: '안녕하세요!\n\n저는 상황을 요약하고 관련 콘텐츠를 찾아드리는 아이로 AI 챗봇입니다.\n\n지금 겪고 있는 일이나 궁금한 점을 편하게 물어보세요.\n자세히 알려주시면 상황에 맞는 정보를 더 빠르게 찾아드릴 수 있어요.\n\n예시\n"학교에서 친구에게 협박을 받고 있어요. 어떻게 해야 하나요?"\n"집에서 힘든 일이 있는데 도움받을 수 있는 곳이 궁금해요."\n\n⚠️ 심각하거나 긴급한 상황이라면 먼저 112에 신고해주세요.\n또한 정확한 답변이 필요하다면 Q&A 게시판에서 변호사님께 질문할 수 있어요.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [kbVisible, setKbVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKbVisible(true)
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKbVisible(false)
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  const scroll = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text, time: nowStr() }]);
    setInput('');
    setLoading(true);
    scroll();

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const now = nowStr();
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1, from: 'ai', time: now,
          summary: data.situationSummary ?? data.summary ?? '죄송합니다, 답변을 불러오는 중 오류가 발생했습니다.',
        },
        {
          id: Date.now() + 2, from: 'ai', time: now,
          text: data.legalAdvice,
          suggestions: data.suggestions,
        },
      ]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: 'ai', time: nowStr(),
        text: '죄송합니다, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      }]);
    } finally {
      setLoading(false);
      scroll();
    }
  };

  return (
    <View style={s.container}>
      {/* Header extends into notch */}
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#586144" />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>상황 진단하기</Text>
          <Text style={s.headerSub}>AI 법률 진단 챗봇</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(msg =>
            msg.from === 'ai' ? (
              <View key={msg.id} style={s.aiRow}>
                <View style={s.aiMeta}>
                  <View style={s.aiAvatar}><Text style={s.aiAvatarText}>AI</Text></View>
                  <Text style={s.msgTime}>{msg.time}</Text>
                </View>

                {msg.summary ? (
                  /* Structured: two separate boxes */
                  <View style={s.aiBoxes}>
                    {/* Box 1: 상황 요약 */}
                    <View style={s.aiBubble}>
                      <Text style={s.summaryHeader}>상황 요약</Text>
                      <Text style={s.aiBubbleText}>{msg.summary}</Text>
                    </View>

                    {/* Box 2: 관련 콘텐츠 */}
                    {(msg.suggestions ?? []).length > 0 && (
                      <View style={s.sgBox}>
                        <Text style={s.sgBoxHeader}>관련 콘텐츠를 클릭하여 도움 받아보세요!</Text>
                        {msg.suggestions!.map((sg, i) => (
                          <SuggestionCard
                            key={i}
                            sg={sg}
                            onPress={() => sg.type === 'qna'
                              ? router.push(`/qna/${sg.id}` as any)
                              : router.push(`/manual-detail?articleId=${sg.id}` as any)
                            }
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  /* Plain text bubble + optional suggestions */
                  <View style={s.aiBoxes}>
                    <View style={s.aiBubble}>
                      <Text style={s.aiBubbleText}>{msg.text}</Text>
                    </View>
                    {(msg.suggestions ?? []).length > 0 && (
                      <View style={s.sgBox}>
                        <Text style={s.sgBoxHeader}>관련 콘텐츠를 클릭하여 도움 받아보세요!</Text>
                        {msg.suggestions!.map((sg, i) => (
                          <SuggestionCard
                            key={i}
                            sg={sg}
                            onPress={() => sg.type === 'qna'
                              ? router.push(`/qna/${sg.id}` as any)
                              : router.push(`/manual-detail?articleId=${sg.id}` as any)
                            }
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ) : (
              /* User message: bubble on top, time below (right-aligned) */
              <View key={msg.id} style={s.userCol}>
                <View style={s.userBubble}>
                  <Text style={s.userBubbleText}>{msg.text}</Text>
                </View>
                <Text style={s.msgTime}>{msg.time}</Text>
              </View>
            )
          )}
          {loading && (
            <View style={s.aiRow}>
              <View style={s.aiMeta}>
                <View style={s.aiAvatar}><Text style={s.aiAvatarText}>AI</Text></View>
              </View>
              <View style={s.aiBubble}>
                <Text style={s.loadingDots}>•  •  •</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[s.inputBar, { paddingBottom: kbVisible ? 8 : Math.max(insets.bottom, 16) }]}>
          <View style={s.inputRow}>
            <TextInput
              style={s.textInput}
              placeholder="상황을 입력하세요"
              placeholderTextColor="rgba(10,10,10,0.50)"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity
              style={s.sendBtn}
              onPress={handleSend}
              disabled={!input.trim() || loading}
              activeOpacity={0.8}
            >
              <SendIcon />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },

  header: {
    backgroundColor: '#EFF4E1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 4,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#586144', lineHeight: 26 },
  headerSub: { fontSize: 12, color: '#9CAF88', lineHeight: 18 },

  scroll: { padding: 20, paddingBottom: 16, gap: 20 },

  aiRow: { gap: 8 },
  aiMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 9999,
    backgroundColor: '#CCD9BA',
    justifyContent: 'center', alignItems: 'center',
  },
  aiAvatarText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  msgTime: { fontSize: 12, fontWeight: '400', color: '#6A7282', lineHeight: 16 },

  aiBoxes: { gap: 8 },

  aiBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    gap: 6,
  },
  summaryHeader: {
    fontSize: 14, fontWeight: '700', color: '#1E2939',
    lineHeight: 20, letterSpacing: -0.15,
  },
  aiBubbleText: { fontSize: 16, fontWeight: '400', color: '#1E2939', lineHeight: 26, letterSpacing: -0.312 },
  loadingDots: { fontSize: 20, color: '#9CAF88', letterSpacing: 4 },

  /* Suggestions box */
  sgBox: {
    maxWidth: '85%',
    padding: 17.535,
    borderRadius: 14,
    borderWidth: 1.539,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  sgBoxHeader: {
    fontSize: 14, fontWeight: '700', color: '#1E2939',
    lineHeight: 20, letterSpacing: -0.15,
  },
  sgCard: {
    borderRadius: 10,
    borderWidth: 0.77,
    borderColor: '#FFF',
    backgroundColor: '#FFF',
    paddingHorizontal: 12.761,
    paddingTop: 12.761,
    paddingBottom: 13.906,
    gap: 6.842,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  sgTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sgTypeText: { fontSize: 11, fontWeight: '600', color: '#9CAF88' },
  sgTitle: { fontSize: 14, fontWeight: '500', color: '#364153', lineHeight: 20 },

  /* User message */
  userCol: { alignItems: 'flex-end', gap: 4 },
  userBubble: {
    maxWidth: '75%',
    backgroundColor: '#DFEDBE',
    borderRadius: 16,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  userBubbleText: { fontSize: 15, color: '#1E2939', lineHeight: 22 },

  /* Input bar */
  inputBar: {
    borderTopWidth: 0.77,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  textInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    fontSize: 16, color: '#0a0a0a',
    letterSpacing: -0.312,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 9999,
    backgroundColor: '#D1D5DC',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
});
