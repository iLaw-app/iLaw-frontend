export type QnAStatus = 'pending' | 'answered';

export type QnAItem = {
  id: string;
  title: string;
  content: string;
  categories: string[];
  authorNickname: string;
  createdAt: string;
  status: QnAStatus;
  answer?: {
    content: string;
    lawyerName: string;
    lawyerOrg: string;
    createdAt: string;
  };
};

export const MOCK_QNA: QnAItem[] = [
  {
    id: '1',
    title: '알바비를 안 주는데 어떻게 해야 하나요?',
    content: '편의점에서 3개월 동안 알바를 했는데 사장님이 계속 미룬다며 알바비를 안 줍니다. 근로계약서도 작성했는데 어떻게 해야 할까요?',
    categories: ['노동', '단변론'],
    authorNickname: '작성자103',
    createdAt: '2026-05-04',
    status: 'answered',
    answer: {
      content: '안녕하세요. 금품불지급은 근로기준법 위반입니다.\n\n**즉시 해야 할 것:**\n- 출퇴근 기록, 카카오톡 대화 내용 등 증거 수집\n- 고용노동부 고객상담센터(1350)에 임금체불 신고\n\n**대처 방법:**\n1. 근로기준법 제36조에 따라 사업장 소재지 고용노동청에 진정서 작성\n2. 근로계약서를 반드시 첨부하세요\n\n근로계약서가 있으면 매우 유리하니 걱정하지 마세요.',
      lawyerName: '김정의 변호사',
      lawyerOrg: '공법무조인법인 서울지부',
      createdAt: '2026-05-05',
    },
  },
  {
    id: '2',
    title: '부모님의 체벌이 심한데 이게 아동학대인가요?',
    content: '부모님이 자주 때리시는데 이게 아동학대에 해당하는지 궁금합니다. 신고하면 어떻게 되나요?',
    categories: ['아동학대', '단변론'],
    authorNickname: '작성자45',
    createdAt: '2026-05-03',
    status: 'pending',
  },
  {
    id: '3',
    title: '학교 단톡방에서 욕을 먹고 있어요',
    content: '반 단톡방에서 저를 비방하고 욕하는 메시지가 계속 올라옵니다. 이게 처벌받을 수 있나요?',
    categories: ['온라인폭력', '단변론'],
    authorNickname: '도움필요',
    createdAt: '2026-05-02',
    status: 'pending',
  },
  {
    id: '4',
    title: '데이트 중에 원치 않는 신체접촉을 당했어요',
    content: '사귀는 사이인데 상대방이 제가 싫다고 했는데도 계속 신체접촉을 합니다. 이게 범죄인가요?',
    categories: ['성폭력', '단변론'],
    authorNickname: '익명94',
    createdAt: '2026-04-30',
    status: 'pending',
  },
];

export const QNA_CATEGORIES = [
  '온라인폭력', '성폭력', '출생과 양육', '친권/미성년후견', '금융', '아동학대', '노동',
];

export default function _() { return null; }
