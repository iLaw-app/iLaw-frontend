import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Block =
  | { t: 'h1'; s: string }
  | { t: 'h2'; s: string }
  | { t: 'h3'; s: string }
  | { t: 'p'; s: string }
  | { t: 'ol'; items: string[] }
  | { t: 'ul'; items: string[] }
  | { t: 'table'; headers: [string, string]; rows: [string, string][] }
  | { t: 'div' };

const CONTENT: Block[] = [
  { t: 'h1', s: '아이로 개인정보처리방침' },
  { t: 'p', s: '아이로는 아동·청소년이 법률 정보를 쉽게 이해하고 필요한 도움을 찾을 수 있도록 돕는 서비스입니다. 아이로는 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령에 따라 개인정보를 안전하게 처리하기 위해 노력합니다.' },
  { t: 'p', s: '본 개인정보처리방침은 아이로가 어떤 개인정보를 수집하고, 왜 이용하며, 얼마나 보관하고, 어떻게 보호하는지 안내하기 위해 작성되었습니다.' },
  { t: 'p', s: '본 방침은 아이로 유저테스트 및 MVP 서비스에 적용됩니다.' },
  { t: 'ul', items: [
    '시행일: 2026년 5월 28일',
    '개인정보처리자: 아이로 운영팀',
    '문의: 오픈채팅방 \'아이로 앱 유저테스트\' 혹은 이메일 [cyj030531@gmail.com]',
  ]},
  { t: 'div' },
  { t: 'h2', s: '1. 개인정보의 처리 목적' },
  { t: 'p', s: '아이로는 다음 목적을 위해 필요한 최소한의 개인정보를 처리합니다.' },
  { t: 'h3', s: '1) 회원가입 및 로그인' },
  { t: 'ul', items: [
    '회원 식별',
    '로그인 상태 관리',
    '서비스 이용자 구분',
    '부정 이용 방지',
  ]},
  { t: 'h3', s: '2) 서비스 제공' },
  { t: 'ul', items: [
    '매뉴얼, Q&A, 커뮤니티, 기관 정보 제공',
    '검색 및 챗봇 기능 제공',
    '스크랩, 내가 쓴 질문, 내가 쓴 글 확인',
    '마이페이지 기능 제공',
  ]},
  { t: 'h3', s: '3) Q&A 운영' },
  { t: 'ul', items: [
    '질문 등록',
    '질문 상태 관리',
    '전문가 또는 운영자 답변 제공',
    '답변 완료 여부 표시',
    '부적절한 질문 관리',
    '개인정보 노출 방지',
  ]},
  { t: 'h3', s: '4) 커뮤니티 운영' },
  { t: 'ul', items: [
    '게시글 및 댓글 등록',
    '게시글 정렬 및 조회',
    '부적절한 게시글 관리',
    '개인정보, 명예훼손, 2차 피해 가능성이 있는 내용 확인 및 조치',
  ]},
  { t: 'h3', s: '5) 기관 연결' },
  { t: 'ul', items: [
    '문제 유형별 관련 기관 정보 제공',
    '지역 기반 기관 정보 안내',
    '상담기관, 법률지원기관, 청소년지원기관 안내',
  ]},
  { t: 'h3', s: '6) 서비스 개선 및 유저테스트 분석' },
  { t: 'ul', items: [
    '서비스 이용 흐름 확인',
    '기능 오류 확인',
    '사용성 개선',
    '유저테스트 결과 분석',
    '콘텐츠 및 기능 개선',
  ]},
  { t: 'div' },
  { t: 'h2', s: '2. 처리하는 개인정보 항목' },
  { t: 'p', s: '아이로는 유저테스트 및 MVP 단계에서 필요한 최소한의 개인정보만 처리합니다.' },
  { t: 'h3', s: '1) 회원가입 및 로그인 시' },
  { t: 'table', headers: ['구분', '처리 항목'], rows: [
    ['필수', '소셜 로그인 식별값, 이메일, 지역, 생년월일, 성별'],
    ['자동 생성', '닉네임 또는 사용자 ID'],
  ]},
  { t: 'p', s: '※ 아이로는 유저테스트 및 MVP 단계에서 이름, 주민등록번호, 전화번호, 상세 주소, 학교명 등 불필요한 개인정보를 수집하지 않는 것을 원칙으로 합니다.' },
  { t: 'h3', s: '2) Q&A 이용 시' },
  { t: 'table', headers: ['구분', '처리 항목'], rows: [
    ['필수', '질문 제목, 질문 내용, 카테고리, 작성일, 답변 상태'],
    ['선택', '관련 지역, 연령대'],
  ]},
  { t: 'p', s: '질문 내용에는 이용자가 직접 입력한 정보가 포함될 수 있습니다. 이용자는 질문 작성 시 이름, 학교명, 전화번호, 주소, 주민등록번호 등 자신이나 타인을 알아볼 수 있는 정보를 입력하지 않아야 합니다.' },
  { t: 'h3', s: '3) 커뮤니티 이용 시' },
  { t: 'table', headers: ['구분', '처리 항목'], rows: [
    ['필수', '게시글 내용, 댓글 내용, 작성일, 작성자 닉네임 또는 사용자 ID'],
    ['선택', '게시글 내 이용자가 직접 입력한 내용'],
  ]},
  { t: 'p', s: '커뮤니티 게시글에는 개인정보나 타인을 특정할 수 있는 내용을 포함하지 않아야 합니다.' },
  { t: 'h3', s: '4) 마이페이지 이용 시' },
  { t: 'table', headers: ['구분', '처리 항목'], rows: [
    ['활동 정보', '스크랩한 콘텐츠, 내가 쓴 질문, 내가 쓴 게시글, 최근 활동 내역'],
  ]},
  { t: 'h3', s: '5) 서비스 이용 과정에서 자동 생성되는 정보' },
  { t: 'table', headers: ['구분', '처리 항목'], rows: [
    ['이용기록', '접속 일시, 이용한 기능, 검색어, 조회한 콘텐츠'],
    ['기기정보', '브라우저 정보, 기기 정보, 웹앱 버전'],
    ['로그정보', '접속 IP, 오류 로그'],
  ]},
  { t: 'div' },
  { t: 'h2', s: '3. 수집하지 않는 정보' },
  { t: 'p', s: '아이로는 유저테스트 및 MVP 단계에서 원칙적으로 다음 정보를 수집하지 않습니다.' },
  { t: 'ol', items: [
    '실명',
    '주민등록번호',
    '전화번호',
    '상세 주소',
    '학교명',
    '보호자 정보',
    '신분증 정보',
    '정확한 위치정보',
  ]},
  { t: 'p', s: '다만, 이용자가 Q&A나 커뮤니티에 위 정보를 직접 입력할 수 있으므로, 아이로는 개인정보 입력을 피하도록 안내하고, 필요 시 해당 내용을 삭제하거나 비공개 처리할 수 있습니다.' },
  { t: 'div' },
  { t: 'h2', s: '4. 만 14세 미만 아동의 개인정보 처리에 관한 사항' },
  { t: 'p', s: '아이로는 아동·청소년을 위한 서비스로서 만 14세 미만 이용자가 접근할 가능성을 인지하고 있습니다.' },
  { t: 'p', s: '다만, 유저테스트 및 MVP 단계에서는 개인정보를 최소한으로 수집하고, 실명, 전화번호, 상세 주소, 학교명 등 직접 식별 가능성이 높은 정보는 수집하지 않는 것을 원칙으로 합니다.' },
  { t: 'p', s: '현재 회원가입 시 수집하는 생년월일, 성별, 지역 정보는 유저테스트 분석, 서비스 개선, 이용자 특성 파악 및 적절한 콘텐츠 제공을 위한 최소 정보로 활용됩니다.' },
  { t: 'p', s: '만 14세 미만 아동의 개인정보 처리 및 법정대리인 동의 방식은 정식 상용화 전 별도의 법률 검토를 거쳐 운영정책에 반영할 예정입니다.' },
  { t: 'p', s: '만 14세 미만 이용자는 Q&A나 커뮤니티에 이름, 학교명, 연락처, 주소 등 자신이나 타인을 알아볼 수 있는 정보를 입력하지 않아야 합니다.' },
  { t: 'div' },
  { t: 'h2', s: '5. 개인정보의 처리 및 보유 기간' },
  { t: 'p', s: '아이로는 개인정보의 처리 목적이 달성될 때까지 개인정보를 보유하며, 목적이 달성되면 지체 없이 삭제하거나 익명화합니다.' },
  { t: 'table', headers: ['구분', '보유 기간'], rows: [
    ['회원 로그인 정보', '회원탈퇴 또는 유저테스트 종료 시까지'],
    ['지역, 생년월일, 성별', '회원탈퇴 또는 유저테스트 종료 시까지'],
    ['Q&A 질문 및 답변', '삭제 요청 또는 유저테스트 종료 시까지'],
    ['커뮤니티 게시글 및 댓글', '삭제 요청 또는 유저테스트 종료 시까지'],
    ['스크랩 및 마이페이지 활동 정보', '회원탈퇴 또는 유저테스트 종료 시까지'],
    ['서비스 이용기록 및 오류 로그', '서비스 개선 및 오류 확인 목적 달성 시까지'],
    ['익명화된 통계 자료', '서비스 개선 및 발표·연구 목적상 보관 가능'],
  ]},
  { t: 'p', s: '공개 Q&A나 커뮤니티 게시글은 개인정보를 삭제하거나 익명화한 뒤 서비스 개선, 유저테스트 결과 정리, 발표 자료 작성 목적으로 활용될 수 있습니다.' },
  { t: 'div' },
  { t: 'h2', s: '6. 개인정보의 파기 절차 및 방법' },
  { t: 'p', s: '아이로는 개인정보 보유 기간이 지나거나 처리 목적이 달성된 경우 해당 개인정보를 삭제하거나 익명화합니다.' },
  { t: 'ol', items: [
    '보유 기간이 지난 개인정보를 확인합니다.',
    '법령상 보관이 필요한 정보가 있는지 확인합니다.',
    '보관 필요가 없는 개인정보를 삭제하거나 익명화합니다.',
    '전자적 파일 형태의 개인정보는 복구하기 어려운 방식으로 삭제합니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '7. 개인정보의 제3자 제공' },
  { t: 'p', s: '아이로는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.' },
  { t: 'p', s: '다만, 다음의 경우에는 예외적으로 제공될 수 있습니다.' },
  { t: 'ol', items: [
    '이용자가 별도로 동의한 경우',
    '법령에 따라 제공이 요구되는 경우',
    '이용자의 생명, 신체, 안전에 긴급한 위험이 있다고 판단되는 경우',
    'Q&A 답변을 위해 인증된 전문가가 질문 내용을 확인하는 경우',
  ]},
  { t: 'p', s: 'Q&A 답변을 위해 전문가가 질문 내용을 확인하는 경우에도, 아이로는 이용자의 이메일, 로그인 정보 등 계정 정보를 제공하지 않는 것을 원칙으로 합니다. 다만, 이용자가 질문 내용에 개인정보를 직접 입력한 경우 해당 정보가 노출될 수 있으므로 질문 작성 시 개인정보를 입력하지 않아야 합니다.' },
  { t: 'p', s: '기관 연결 기능은 원칙적으로 기관명, 연락처, 홈페이지 등 정보를 안내하는 방식으로 운영되며, 아이로가 이용자의 개인정보를 기관에 직접 전달하지 않습니다. 향후 기관에 개인정보를 전달해야 하는 기능이 추가되는 경우 별도의 동의를 받습니다.' },
  { t: 'div' },
  { t: 'h2', s: '8. 개인정보 처리업무의 위탁' },
  { t: 'p', s: '아이로는 서비스 운영을 위해 일부 개인정보 처리업무를 외부 서비스에 위탁할 수 있습니다.' },
  { t: 'table', headers: ['위탁 업무', '위탁 내용'], rows: [
    ['웹앱/서버 운영', '서비스 데이터 저장 및 운영'],
    ['소셜 로그인', '로그인 인증'],
    ['알림 또는 이메일 발송', '서비스 안내 및 문의 응대'],
  ]},
  { t: 'p', s: '유저테스트 단계에서 실제 위탁업체가 확정된 경우, 위탁받는 자와 위탁 업무 내용을 개인정보처리방침에 반영합니다.' },
  { t: 'div' },
  { t: 'h2', s: '9. 개인정보의 국외 이전' },
  { t: 'p', s: '아이로는 현재 이용자의 개인정보를 국외로 이전하지 않는 것을 원칙으로 합니다.' },
  { t: 'p', s: '다만, 향후 해외 클라우드, 소셜 로그인, 분석 도구 등을 사용하여 개인정보가 국외로 이전되는 경우에는 이전되는 개인정보 항목, 이전 국가, 이전받는 자, 이용 목적, 보유 기간 등을 별도로 안내합니다.' },
  { t: 'div' },
  { t: 'h2', s: '10. 개인정보의 안전성 확보조치' },
  { t: 'p', s: '아이로는 개인정보 보호를 위해 다음 조치를 취합니다.' },
  { t: 'ol', items: [
    '개인정보 접근 권한을 필요한 운영자에게만 부여합니다.',
    '비밀번호를 직접 수집하는 경우 암호화하여 저장합니다.',
    'Q&A와 커뮤니티에서 개인정보가 노출되지 않도록 안내합니다.',
    '개인정보가 포함된 게시글은 삭제 또는 비공개 처리할 수 있습니다.',
    '서비스 오류 및 보안 문제를 확인하기 위해 로그를 관리합니다.',
    '전문가 답변 권한은 운영자가 승인한 사람에게만 부여합니다.',
  ]},
  { t: 'div' },
  { t: 'h2', s: '11. 민감정보의 공개 가능성 및 비공개 선택 방법' },
  { t: 'p', s: '아이로의 Q&A와 커뮤니티는 이용자가 자신의 상황을 직접 작성하는 구조이므로, 질문이나 게시글 내용에 민감한 정보가 포함될 수 있습니다.' },
  { t: 'p', s: '예를 들어 다음과 같은 내용이 포함될 수 있습니다.' },
  { t: 'ul', items: [
    '학교폭력',
    '가정폭력',
    '아동학대',
    '성폭력',
    '노동 착취',
    '사이버 피해',
    '가족관계 문제',
    '자해 위험',
    '범죄 피해',
    '특정 학교, 지역, 인물에 관한 정보',
  ]},
  { t: 'p', s: '이용자는 Q&A나 커뮤니티 작성 시 자신이나 타인을 알아볼 수 있는 정보를 입력하지 않아야 합니다. 민감한 내용은 공개 게시글로 작성하지 않는 것이 좋습니다.' },
  { t: 'p', s: '아이로는 개인정보, 민감정보, 명예훼손, 2차 피해 가능성이 있는 내용이 포함되었다고 판단하는 경우 해당 게시글을 비공개 처리하거나 일부 내용을 삭제할 수 있습니다.' },
  { t: 'div' },
  { t: 'h2', s: '12. 개인정보 자동 수집 장치의 설치·운영 및 거부' },
  { t: 'p', s: '아이로는 서비스 개선과 오류 확인을 위해 접속 기록, 이용 기록, 기기 정보, 오류 로그 등을 자동으로 수집할 수 있습니다.' },
  { t: 'p', s: '이용자는 브라우저 또는 기기 설정을 통해 쿠키 저장, 앱 추적, 알림 수신 등을 제한할 수 있습니다. 다만, 일부 설정을 제한하는 경우 서비스의 일부 기능 이용이 어려울 수 있습니다.' },
  { t: 'div' },
  { t: 'h2', s: '13. 정보주체와 법정대리인의 권리 및 행사방법' },
  { t: 'p', s: '이용자와 법정대리인은 언제든지 자신의 개인정보에 대해 다음 권리를 행사할 수 있습니다.' },
  { t: 'ol', items: [
    '개인정보 열람 요청',
    '개인정보 수정 요청',
    '개인정보 삭제 요청',
    '개인정보 처리정지 요청',
    '동의 철회',
    '회원탈퇴',
    'Q&A 또는 커뮤니티 게시글 삭제 요청',
  ]},
  { t: 'p', s: '권리 행사는 서비스 내 기능 또는 아이로 운영팀 문의를 통해 할 수 있습니다. 아이로는 요청을 받은 경우 필요한 확인 절차를 거쳐 처리합니다.' },
  { t: 'div' },
  { t: 'h2', s: '14. 개인정보 보호책임자 및 문의처' },
  { t: 'p', s: '아이로는 개인정보 처리와 관련한 문의 및 요청을 처리하기 위해 다음 담당자를 둡니다.' },
  { t: 'ul', items: [
    '개인정보 보호책임자: 아이로 운영팀',
    '문의 방법: 오픈채팅방 \'아이로 앱 유저테스트\' 혹은 이메일 [cyj030531@gmail.com]',
  ]},
  { t: 'div' },
  { t: 'h2', s: '15. 권익침해 구제방법' },
  { t: 'p', s: '이용자는 개인정보 침해로 인한 상담이나 피해 구제를 위해 아래 기관에 문의할 수 있습니다.' },
  { t: 'ul', items: [
    '개인정보침해신고센터: privacy.kisa.or.kr / 국번 없이 118',
    '개인정보분쟁조정위원회: www.kopico.go.kr / 1833-6972',
    '경찰청 사이버수사국: ecrm.police.go.kr / 국번 없이 182',
  ]},
  { t: 'div' },
  { t: 'h2', s: '16. 개인정보처리방침의 변경' },
  { t: 'p', s: '아이로는 서비스 기능, 운영 방식, 관련 법령의 변경에 따라 개인정보처리방침을 수정할 수 있습니다.' },
  { t: 'p', s: '개인정보처리방침이 변경되는 경우 서비스 내 공지 또는 별도 안내를 통해 변경 내용을 알립니다.' },
  { t: 'ul', items: [
    '현재 개인정보처리방침 시행일: 2026년 5월 28일',
    '이전 개인정보처리방침 보기: 해당 없음',
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
    case 'table':
      return (
        <View key={i} style={s.table}>
          <View style={[s.tableRow, s.tableHeader]}>
            <Text style={[s.tableCell, s.tableCellLeft, s.tableHeaderText]}>{block.headers[0]}</Text>
            <Text style={[s.tableCell, s.tableCellRight, s.tableHeaderText]}>{block.headers[1]}</Text>
          </View>
          {block.rows.map(([left, right], j) => (
            <View key={j} style={[s.tableRow, j % 2 === 1 && s.tableRowAlt]}>
              <Text style={[s.tableCell, s.tableCellLeft, s.tableCellLabelText]}>{left}</Text>
              <Text style={[s.tableCell, s.tableCellRight]}>{right}</Text>
            </View>
          ))}
        </View>
      );
    default: return null;
  }
}

export default function PrivacyScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#586144" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>개인정보처리방침</Text>
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {CONTENT.map(renderBlock)}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  table: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden', marginBottom: 12 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tableRowAlt: { backgroundColor: '#F9FBF5' },
  tableHeader: { backgroundColor: '#EFF4E6' },
  tableHeaderText: { fontWeight: '700', color: '#586144' },
  tableCell: { fontSize: 13, color: '#4A5565', lineHeight: 20, paddingVertical: 8, paddingHorizontal: 10 },
  tableCellLeft: { width: 110, borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  tableCellRight: { flex: 1 },
  tableCellLabelText: { fontWeight: '600', color: '#586144' },
});
