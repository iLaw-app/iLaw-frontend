import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/auth';
import { AppModal } from '../components/AppModal';

const API_BASE = 'https://ilaw-backend.up.railway.app';

type Block =
  | { t: 'h1'; s: string }
  | { t: 'h2'; s: string }
  | { t: 'h3'; s: string }
  | { t: 'p'; s: string }
  | { t: 'ol'; items: string[] }
  | { t: 'ul'; items: string[] }
  | { t: 'div' };

const CONTENT: Block[] = [
  { t: 'h1', s: '아이로 이용약관' },
  { t: 'h2', s: '제1조 목적' },
  { t: 'p', s: '본 약관은 아이로가 제공하는 아동·청소년을 위한 쉬운 법률 가이드 서비스의 이용과 관련하여, 서비스와 이용자 사이의 권리, 의무, 책임사항 및 서비스 이용 조건을 정하는 것을 목적으로 합니다.' },
  { t: 'p', s: '아이로는 아동·청소년이 법률·권리 정보를 쉽게 이해하고, 관련 질문과 경험을 나누며, 필요한 지원기관을 찾을 수 있도록 돕는 정보 공유 및 연결 플랫폼입니다.' },
  { t: 'div' },
  { t: 'h2', s: '제2조 용어의 정의' },
  { t: 'p', s: '본 약관에서 사용하는 용어의 의미는 다음과 같습니다.' },
  { t: 'ol', items: [
    '"서비스"란 아이로가 제공하는 매뉴얼, Q&A, 커뮤니티, 기관 연결, 검색, 챗봇, 마이페이지 등의 기능을 말합니다.',
    '"이용자"란 서비스에 접속하여 아이로가 제공하는 콘텐츠와 기능을 이용하는 사람을 말합니다.',
    '"회원"이란 서비스에 가입하여 Q&A 작성, 커뮤니티 작성, 스크랩, 마이페이지 등 개인화 기능을 이용하는 사람을 말합니다.',
    '"콘텐츠"란 서비스에서 제공하는 매뉴얼, Q&A, 커뮤니티 게시글, 기관 정보, 이미지, 문구 등을 말합니다.',
    '"Q&A"란 이용자가 법률·권리 관련 질문을 작성하고, 서비스 운영자 또는 전문가가 답변을 제공하는 기능을 말합니다.',
    '"전문가"란 변호사, 공익법률단체 관계자 등 서비스 운영자가 답변 권한을 부여한 사람을 말합니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제3조 서비스의 내용' },
  { t: 'p', s: '아이로는 다음 기능을 제공합니다.' },
  { t: 'ol', items: [
    '아동·청소년 법률 문제와 관련된 매뉴얼 제공',
    '관련 상담기관, 지원기관, 법률지원기관 정보 제공',
    '이용자가 질문을 작성하고 답변을 확인할 수 있는 Q&A 기능',
    '이용자들이 권리 문제와 경험을 공유할 수 있는 커뮤니티 기능',
    '검색 및 챗봇을 통한 콘텐츠 안내',
    '스크랩, 내가 쓴 질문, 내가 쓴 글 등을 확인할 수 있는 마이페이지 기능',
  ]},
  { t: 'p', s: '단, 유저테스트 단계에서는 일부 기능이 제한적으로 제공될 수 있습니다.' },
  { t: 'div' },
  { t: 'h2', s: '제4조 서비스의 성격 및 한계' },
  { t: 'ol', items: [
    '아이로는 아동·청소년이 필요한 법률·권리 정보를 쉽게 확인하고, 경험과 고민을 안전하게 나누며, 필요한 경우 관련 지원기관으로 연결될 수 있도록 돕는 법률·권리 정보 공유 및 지원 연결 플랫폼입니다.',
    '아이로에서 제공하는 매뉴얼, Q&A, 챗봇 안내 및 기관 정보는 일반적인 정보 제공을 목적으로 하며, 개별 사건에 대한 확정적인 법률 판단, 변호사 선임, 소송 대리, 행정 절차 대리를 의미하지 않습니다.',
    '이용자는 구체적인 법률 판단이나 긴급한 보호가 필요한 경우 변호사, 공공기관, 상담기관, 수사기관 등 관련 기관에 직접 상담 또는 도움을 요청해야 합니다.',
    '생명·신체의 위험, 폭력, 학대, 성폭력, 자해 위험 등 긴급한 상황에서는 서비스 이용보다 112, 1388, 117 등 관련 기관에 즉시 연락하는 것을 우선해야 합니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제5조 회원가입 및 서비스 이용' },
  { t: 'ol', items: [
    '이용자는 서비스가 정한 절차에 따라 회원가입을 할 수 있습니다.',
    '서비스는 회원가입 및 유저테스트 운영을 위해 필요한 최소한의 정보를 수집합니다.',
    '회원가입 시 수집될 수 있는 정보는 소셜 로그인 정보, 지역, 생년월일, 성별 등입니다.',
    '이용자는 가입 및 서비스 이용 시 정확한 정보를 입력해야 하며, 타인의 정보를 무단으로 사용해서는 안 됩니다.',
    '아이로는 유저테스트 및 MVP 단계에서 이름, 주민등록번호, 전화번호, 상세 주소, 학교명 등 불필요한 개인정보를 요구하지 않는 것을 원칙으로 합니다.',
    '만 14세 미만 아동의 개인정보 처리 및 법정대리인 동의 방식은 정식 상용화 전 별도의 법률 검토를 거쳐 운영정책에 반영할 예정입니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제6조 Q&A 이용' },
  { t: 'ol', items: [
    '회원은 Q&A 기능을 통해 법률·권리 관련 질문을 작성할 수 있습니다.',
    '질문 작성 시 이용자는 이름, 학교명, 전화번호, 주소, 주민등록번호, 가족이나 타인의 실명 등 개인을 알아볼 수 있는 정보를 입력하지 않아야 합니다.',
    '질문 내용에 개인정보, 민감한 정보, 욕설, 비방, 명예훼손 가능성이 있는 내용이 포함된 경우 서비스 운영자는 해당 질문을 수정 요청, 비공개 처리 또는 삭제할 수 있습니다.',
    '전문가 답변은 일반적인 법률 정보와 초기 대응 방향을 안내하기 위한 것이며, 개별 사건에 대한 법률 자문이나 법적 대리로 해석되지 않습니다.',
    '답변이 완료되지 않은 질문은 서비스 화면에서 답변 대기 상태로 표시될 수 있습니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제7조 커뮤니티 이용' },
  { t: 'ol', items: [
    '커뮤니티는 이용자가 권리 문제, 고민, 경험, 질문 등을 공유하고 의견을 나눌 수 있는 공간입니다.',
    '이용자는 커뮤니티에 글을 작성할 때 자신이나 타인의 개인정보를 포함하지 않아야 합니다.',
    '다음 내용은 게시할 수 없습니다:\n  • 타인의 개인정보를 포함한 내용\n  • 욕설, 비방, 혐오 표현\n  • 명예훼손 또는 모욕 가능성이 있는 내용\n  • 불법 행위를 조장하는 내용\n  • 성적 표현, 폭력적 표현, 2차 피해를 유발할 수 있는 내용\n  • 광고, 홍보, 도배성 게시물\n  • 서비스 목적과 관련 없는 내용',
    '서비스 운영자는 안전한 커뮤니티 환경을 위해 게시글을 사전 또는 사후 검토할 수 있으며, 부적절한 게시글은 숨김, 수정 요청 또는 삭제할 수 있습니다.',
    '유저테스트 단계에서는 커뮤니티 기능이 제한적으로 운영될 수 있습니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제8조 기관 정보 및 연결' },
  { t: 'ol', items: [
    '아이로는 이용자의 문제 유형과 지역에 따라 관련 상담기관, 지원기관, 법률지원기관 정보를 제공합니다.',
    '서비스에서 제공하는 기관 정보는 이용자가 도움을 찾는 데 참고할 수 있는 정보이며, 기관의 실제 상담 가능 여부, 운영 시간, 지원 범위는 변경될 수 있습니다.',
    '아이로는 원칙적으로 이용자의 개인정보를 기관에 직접 전달하지 않습니다.',
    '향후 기관 연결 과정에서 이용자의 개인정보를 기관에 제공해야 하는 경우, 사전에 별도의 동의를 받습니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제9조 이용자의 금지행위' },
  { t: 'p', s: '이용자는 다음 행위를 해서는 안 됩니다.' },
  { t: 'ol', items: [
    '타인의 개인정보를 무단으로 작성하거나 공개하는 행위',
    '허위 정보 또는 타인을 비방하는 내용을 게시하는 행위',
    '욕설, 혐오 표현, 성적 표현, 폭력적 표현을 게시하는 행위',
    '불법 행위를 조장하거나 범죄 방법을 안내하는 행위',
    '서비스 운영을 방해하는 행위',
    '광고, 홍보, 도배성 게시물을 작성하는 행위',
    '서비스 콘텐츠를 무단 복제, 배포, 수정, 상업적으로 이용하는 행위',
    '기타 관련 법령 또는 서비스 운영정책을 위반하는 행위',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제10조 게시물의 관리' },
  { t: 'ol', items: [
    '이용자가 작성한 질문, 게시글, 댓글 등이 운영정책에 위반된다고 판단되는 경우 서비스 운영자는 해당 게시물을 숨김, 비공개, 수정 요청 또는 삭제할 수 있습니다.',
    '개인정보가 포함된 게시물은 이용자 보호를 위해 사전 통보 없이 일부 내용이 삭제되거나 비공개 처리될 수 있습니다.',
    '공개 Q&A나 커뮤니티 게시글은 다른 이용자에게 도움이 되는 콘텐츠로 활용될 수 있으나, 이 경우 개인정보를 삭제하거나 익명화합니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제11조 콘텐츠의 권리' },
  { t: 'ol', items: [
    '아이로가 제작한 매뉴얼, 화면 구성, 이미지, 문구 등 콘텐츠의 권리는 아이로 또는 정당한 권리자에게 있습니다.',
    '이용자가 작성한 질문, 게시글, 댓글의 권리는 해당 이용자에게 있습니다.',
    '다만, 이용자는 자신이 작성한 게시물을 서비스 운영, 콘텐츠 개선, 유저테스트 결과 분석, 공개 Q&A 제공 등의 목적으로 아이로가 익명화하여 활용하는 것에 동의합니다.',
    '이용자는 서비스 콘텐츠를 운영자의 허락 없이 상업적으로 이용할 수 없습니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제12조 서비스의 변경 및 중단' },
  { t: 'ol', items: [
    '아이로는 유저테스트 및 MVP 단계에서 기능을 수정, 추가, 삭제하거나 일부 서비스를 일시적으로 중단할 수 있습니다.',
    '서비스 점검, 오류, 외부 서비스 장애, 운영상 필요가 있는 경우 서비스 이용이 제한될 수 있습니다.',
    '중요한 변경사항이 있는 경우 서비스 내 공지 또는 별도 안내를 통해 알립니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제13조 책임의 제한' },
  { t: 'ol', items: [
    '아이로는 제공 정보의 정확성과 최신성을 유지하기 위해 노력하지만, 법령, 제도, 기관 정보는 변경될 수 있습니다.',
    '이용자는 서비스에서 제공하는 정보를 참고자료로 활용해야 하며, 구체적인 사건 해결을 위해서는 관련 전문가 또는 기관에 직접 상담해야 합니다.',
    '아이로는 이용자가 서비스에 작성한 내용의 진실성, 적법성, 타인의 권리 침해 여부에 대해 모든 책임을 부담하지 않습니다.',
    '다만, 서비스 운영자는 이용자 보호를 위해 부적절한 게시물이나 개인정보 노출을 확인한 경우 필요한 조치를 취할 수 있습니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제14조 탈퇴 및 이용 종료' },
  { t: 'ol', items: [
    '회원은 언제든지 서비스에서 탈퇴를 요청할 수 있습니다.',
    '회원탈퇴 시 회원 정보와 개인화 기록은 삭제됩니다.',
    '다만, 공개 Q&A나 커뮤니티 게시글은 다른 이용자에게 도움이 되는 콘텐츠로 활용될 수 있으며, 이 경우 개인정보를 삭제하거나 익명화한 뒤 보관할 수 있습니다.',
    '유저테스트 종료 시 서비스 운영자는 테스트 목적 달성 후 수집된 개인정보를 삭제하거나 익명화할 수 있습니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '제15조 문의' },
  { t: 'p', s: '서비스 이용과 관련한 문의는 아이로 운영팀에 연락할 수 있습니다.' },
  { t: 'ul', items: [
    '운영자: 아이로 운영팀',
    '문의 방법: 운영팀이 별도로 안내한 오픈채팅방 혹은 이메일 [cyj030531@gmail.com]',
  ]},
];

function renderBlock(block: Block, i: number) {
  switch (block.t) {
    case 'h1': return <Text key={i} style={s.h1}>{block.s}</Text>;
    case 'h2': return <Text key={i} style={s.h2}>{block.s}</Text>;
    case 'h3': return <Text key={i} style={s.h3}>{block.s}</Text>;
    case 'p':  return <Text key={i} style={s.p}>{block.s}</Text>;
    case 'div': return <View key={i} style={s.div} />;
    case 'ol':
      return (
        <View key={i} style={s.list}>
          {block.items.map((item, j) => (
            <View key={j} style={s.listRow}>
              <Text style={s.listNum}>{j + 1}.</Text>
              <Text style={s.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case 'ul':
      return (
        <View key={i} style={s.list}>
          {block.items.map((item, j) => (
            <View key={j} style={s.listRow}>
              <Text style={s.listBullet}>•</Text>
              <Text style={s.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    default: return null;
  }
}

export default function TermsScreen() {
  const router = useRouter();
  const { accessToken, clearAuth } = useAuth();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);

  const doWithdraw = async () => {
    setShowWithdrawModal(false);
    try {
      await fetch(`${API_BASE}/auth/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {}
    await clearAuth();
    setShowWithdrawSuccess(true);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#586144" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>이용약관</Text>
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {CONTENT.map(renderBlock)}
        <View style={s.withdrawSection}>
          <Text style={s.withdrawSectionTitle}>회원 탈퇴</Text>
          <Text style={s.withdrawSectionDesc}>탈퇴 시 모든 개인화 데이터(질문 제외)가 삭제됩니다.</Text>
          <TouchableOpacity style={s.withdrawBtn} onPress={() => setShowWithdrawModal(true)} activeOpacity={0.8}>
            <Text style={s.withdrawBtnText}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <AppModal visible={showWithdrawModal} onRequestClose={() => setShowWithdrawModal(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setShowWithdrawModal(false)}>
          <Pressable style={s.modalCard} onPress={() => {}}>
            <Text style={s.modalTitle}>정말로 아이로를 떠나시나요?</Text>
            <Text style={s.modalBody}>{'탈퇴하시면\n지금까지 스크랩한 자료가\n 모두 사라져요.'}</Text>
            <TouchableOpacity style={s.withdrawConfirmBtn} onPress={doWithdraw} activeOpacity={0.8}>
              <Text style={s.withdrawConfirmBtnText}>탈퇴할게요</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </AppModal>

      <AppModal visible={showWithdrawSuccess} onRequestClose={() => {}}>
        <Pressable style={s.modalOverlay} onPress={() => {}}>
          <Pressable style={s.modalCard} onPress={() => {}}>
            <Text style={s.modalTitle}>회원탈퇴가 완료되었습니다.</Text>
            <Text style={s.modalBody}>{'언제든 다시 돌아와주세요.\n아이로는 항상 여러분을 응원합니다!'}</Text>
            <TouchableOpacity style={s.confirmBtn} onPress={() => { setShowWithdrawSuccess(false); router.replace('/'); }} activeOpacity={0.8}>
              <Text style={s.confirmBtnText}>확인</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </AppModal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFFF8' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#586144' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  h1: { fontSize: 22, fontWeight: '700', color: '#586144', marginBottom: 16, lineHeight: 30 },
  h2: { fontSize: 17, fontWeight: '700', color: '#586144', marginTop: 8, marginBottom: 8, lineHeight: 26 },
  h3: { fontSize: 15, fontWeight: '600', color: '#586144', marginTop: 6, marginBottom: 6 },
  p:  { fontSize: 14, color: '#4A5565', lineHeight: 22, marginBottom: 8 },
  div: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  list: { marginBottom: 8 },
  listRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  listNum: { fontSize: 14, color: '#586144', fontWeight: '600', width: 24, marginTop: 1 },
  listBullet: { fontSize: 14, color: '#586144', width: 16, marginTop: 1 },
  listText: { flex: 1, fontSize: 14, color: '#4A5565', lineHeight: 22 },

  withdrawSection: {
    marginTop: 16, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB',
    alignItems: 'center', gap: 8,
  },
  withdrawSectionTitle: { fontSize: 16, fontWeight: '700', color: '#C10007' },
  withdrawSectionDesc: { fontSize: 13, color: '#6A7282', textAlign: 'center', lineHeight: 20 },
  withdrawBtn: {
    marginTop: 4, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 9999, borderWidth: 1, borderColor: '#C10007',
  },
  withdrawBtnText: { fontSize: 14, fontWeight: '600', color: '#C10007' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: 16,
  },
  modalCard: {
    width: '100%', maxWidth: 361, borderRadius: 24,
    borderWidth: 1.356, borderColor: '#FFF', backgroundColor: '#FFF',
    paddingTop: 25.504, paddingHorizontal: 25, paddingBottom: 18.471,
    alignItems: 'center', gap: 14.025,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 15, elevation: 6,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#4A5565', lineHeight: 28, letterSpacing: -0.449, textAlign: 'center' },
  modalBody: { fontSize: 14, color: '#364153', lineHeight: 22, textAlign: 'center' },
  withdrawConfirmBtn: {
    width: 209, height: 36, borderRadius: 14,
    backgroundColor: '#FB2C36', justifyContent: 'center', alignItems: 'center',
  },
  withdrawConfirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  confirmBtn: {
    width: 209, height: 36, borderRadius: 14,
    backgroundColor: '#B2D36E', justifyContent: 'center', alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
