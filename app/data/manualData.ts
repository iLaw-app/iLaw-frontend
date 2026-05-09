export type ContentBlock =
  | { type: 'summary'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'box'; text: string }
  | { type: 'bullet'; items: string[] };

export type Question = {
  id: string;
  categoryId: string;
  question: string;
};

export type QuestionDetail = {
  id: string;
  categoryLabel: string;
  question: string;
  content: ContentBlock[];
};

export type EmergencyNumber = {
  label: string;
  number: string;
};

export type HelpCenter = {
  name: string;
  phone: string;
  address: string;
  region: string;
};

export const CATEGORY_LABELS: Record<string, string> = {
  'child-abuse': '아동학대/가정폭력',
  'labor': '노동',
  'finance': '금융',
  'sexual-violence': '성폭력',
  'online-violence': '온라인폭력',
  'birth-adoption': '출생·양육',
  'guardianship': '법정대리인',
};

export const QUESTIONS: Record<string, Question[]> = {
  'child-abuse': [
    { id: 'ca-1', categoryId: 'child-abuse', question: '청소년이 받는 학대도 아동학대인가요?' },
    { id: 'ca-2', categoryId: 'child-abuse', question: '가정폭력 신고는 어떻게 하나요?' },
    { id: 'ca-3', categoryId: 'child-abuse', question: '부모의 체벌도 아동학대인가요?' },
    { id: 'ca-4', categoryId: 'child-abuse', question: '아동학대를 당하면 어디에 요청을 해야 하나요?' },
    { id: 'ca-5', categoryId: 'child-abuse', question: '아동학대 신고 후 어떤 절차가 진행되나요?' },
    { id: 'ca-6', categoryId: 'child-abuse', question: '가정폭력 목격 시 신고해도 되나요?' },
  ],
  'labor': [
    { id: 'la-1', categoryId: 'labor', question: '아르바이트 최저시급을 못 받았어요.' },
    { id: 'la-2', categoryId: 'labor', question: '부당하게 해고당했어요. 어떻게 해야 하나요?' },
    { id: 'la-3', categoryId: 'labor', question: '근로계약서를 안 썼어요.' },
    { id: 'la-4', categoryId: 'labor', question: '퇴직금을 못 받았을 때 어떻게 하나요?' },
  ],
  'finance': [
    { id: 'fi-1', categoryId: 'finance', question: '사기를 당했을 때 어떻게 해야 하나요?' },
    { id: 'fi-2', categoryId: 'finance', question: '친구에게 빌려준 돈을 못 받고 있어요.' },
    { id: 'fi-3', categoryId: 'finance', question: '보이스피싱 피해를 당했어요.' },
  ],
  'sexual-violence': [
    { id: 'sv-1', categoryId: 'sexual-violence', question: '성폭력 피해를 당했을 때 어떻게 신고하나요?' },
    { id: 'sv-2', categoryId: 'sexual-violence', question: '데이트폭력이란 무엇인가요?' },
    { id: 'sv-3', categoryId: 'sexual-violence', question: '성희롱과 성추행은 다른 건가요?' },
  ],
  'online-violence': [
    { id: 'ov-1', categoryId: 'online-violence', question: '사이버 괴롭힘은 어떻게 신고하나요?' },
    { id: 'ov-2', categoryId: 'online-violence', question: '악플을 단 사람을 처벌할 수 있나요?' },
    { id: 'ov-3', categoryId: 'online-violence', question: '불법 촬영물이 유포됐어요.' },
  ],
  'birth-adoption': [
    { id: 'ba-1', categoryId: 'birth-adoption', question: '출생신고는 어떻게 하나요?' },
    { id: 'ba-2', categoryId: 'birth-adoption', question: '양육비를 받지 못하고 있어요.' },
    { id: 'ba-3', categoryId: 'birth-adoption', question: '입양 절차는 어떻게 되나요?' },
  ],
  'guardianship': [
    { id: 'gu-1', categoryId: 'guardianship', question: '친권이란 무엇인가요?' },
    { id: 'gu-2', categoryId: 'guardianship', question: '미성년후견인은 어떻게 선임하나요?' },
    { id: 'gu-3', categoryId: 'guardianship', question: '친권 상실은 어떤 경우에 가능한가요?' },
  ],
};

export const QUESTION_DETAILS: Record<string, QuestionDetail> = {
  'ca-1': {
    id: 'ca-1',
    categoryLabel: '아동학대/가정폭력',
    question: '청소년이 받는 학대도 아동학대인가요?',
    content: [
      { type: 'summary', text: '청소년이 받는 학대도 아동학대에 해당해요.' },
      { type: 'heading', text: '어떤 경우에 아동학대가 되나요?' },
      { type: 'text', text: "법적으로 만 18세 미만은 모두 '아동'에 해당해요.\n따라서 청소년도 아동으로 포함되기 때문에, 청소년이 받는 학대 역시 모두 아동학대에 해당해요." },
      { type: 'text', text: '아동학대는 크게 두 가지 경우를 포함해요.' },
      { type: 'bullet', items: [
        '폭력 및 가혹행위 → 신체적, 정신적, 성적 폭력 등으로 아동의 건강이나 발달을 방해하는 경우예요',
        '유기 및 방임 → 보호자가 아동을 보살피지 않거나 방치하는 경우예요',
      ]},
      { type: 'subheading', text: '아동학대란?' },
      { type: 'text', text: '아동학대란 다음과 같은 경우를 말해요.' },
      { type: 'box', text: '보호자를 포함한 성인이 아동의 건강이나 복지를 해치거나 정상적인 발달을 방해하는 모든 행위 또는 보호자가 아동을 버리거나(유기), 방치하거나 제대로 돌보지 않는 것(방임)을 의미해요.' },
      { type: 'subheading', text: '아동학대의 예시' },
      { type: 'text', text: '다음과 같은 경우들은 모두 아동학대에 해당할 수 있어요.' },
      { type: 'bullet', items: [
        '아동·청소년을 때리거나 꼬집는 등 신체적 폭력을 하는 경우',
        '잠을 재우지 않는 등 기본적인 생활을 방해하는 경우',
        '정기적으로 친구와 비교하거나 차별·편애하며 정서적 고통을 주는 경우',
        '가족 내에서 원하지 않는 일을 시키는 경우',
        '"버러지다"라고 하거나 힘든 일을 대신하도록 내몰는 경우',
        '가정폭력을 보게 하는 등 정서적 학대를 하는 경우',
        '신체를 만지거나 보여달라고 하는 성적 행위를 하는 경우',
        '촬영 영상이나 사진을 보여주는 경우',
        '위험한 환경에 방치하거나 필요한 의식주를 제공하지 않는 경우',
        '보호자가 아동을 버리거나 집에 두고 가출하는 경우',
      ]},
    ],
  },
  'ca-2': {
    id: 'ca-2',
    categoryLabel: '아동학대/가정폭력',
    question: '가정폭력 신고는 어떻게 하나요?',
    content: [
      { type: 'summary', text: '112 또는 1366에 전화해서 신고할 수 있어요.' },
      { type: 'heading', text: '신고 방법' },
      { type: 'bullet', items: [
        '112(경찰): 즉각적인 도움이 필요할 때',
        '1366(여성긴급전화): 가정폭력 전용 상담·신고',
        '1577-1391(아동보호전문기관): 아동 보호 전문 상담',
      ]},
      { type: 'text', text: '신고는 본인이 직접 하지 않아도 되고, 제3자(이웃, 선생님 등)도 신고할 수 있어요.' },
      { type: 'subheading', text: '신고 후 절차' },
      { type: 'bullet', items: [
        '경찰 현장 출동 및 피해자 보호 조치',
        '가정폭력 상담소 또는 보호시설 연계',
        '필요 시 긴급임시조치 (가해자 퇴거 명령 등)',
      ]},
    ],
  },
  'ca-3': {
    id: 'ca-3',
    categoryLabel: '아동학대/가정폭력',
    question: '부모의 체벌도 아동학대인가요?',
    content: [
      { type: 'summary', text: '네, 부모라도 자녀를 체벌하는 것은 아동학대에 해당해요.' },
      { type: 'heading', text: '체벌과 아동학대' },
      { type: 'text', text: '2021년 민법 개정으로 부모의 자녀 체벌권(징계권)이 삭제되었어요. 이제 훈육 목적이라도 신체적 체벌은 법적으로 허용되지 않아요.' },
      { type: 'box', text: '따귀를 때리거나, 몽둥이로 때리거나, 발로 차는 등 모든 신체적 폭력은 아동학대에 해당해요.' },
      { type: 'subheading', text: '경미한 체벌도 해당되나요?' },
      { type: 'text', text: '손바닥으로 때리는 것, 꼬집는 것 등 경미한 신체적 접촉도 아동학대가 될 수 있어요. 상황과 정도에 따라 판단해요.' },
    ],
  },
  'ca-4': {
    id: 'ca-4',
    categoryLabel: '아동학대/가정폭력',
    question: '아동학대를 당하면 어디에 요청을 해야 하나요?',
    content: [
      { type: 'summary', text: '112, 1577-1391, 또는 학교 선생님·상담사에게 도움을 요청할 수 있어요.' },
      { type: 'heading', text: '도움을 받을 수 있는 곳' },
      { type: 'bullet', items: [
        '112: 경찰 신고 (즉각적인 위험 상황)',
        '1577-1391: 아동보호전문기관 (24시간 운영)',
        '학교 선생님 또는 상담 선생님',
        '가까운 아동보호전문기관 방문',
        '아동 지킴이집 (주황색 표지판)',
      ]},
      { type: 'subheading', text: '비밀 보장' },
      { type: 'text', text: '신고한 사람의 신원은 철저히 보호돼요. 신고자를 밝히지 않아도 신고할 수 있어요.' },
    ],
  },
  'ca-5': {
    id: 'ca-5',
    categoryLabel: '아동학대/가정폭력',
    question: '아동학대 신고 후 어떤 절차가 진행되나요?',
    content: [
      { type: 'summary', text: '신고 후 현장조사 → 피해아동 보호 → 수사 및 법적 조치 순으로 진행돼요.' },
      { type: 'heading', text: '신고 후 절차' },
      { type: 'bullet', items: [
        '경찰·아동보호전문기관 현장 출동 (4시간 이내)',
        '피해아동 안전 확인 및 응급조치',
        '필요 시 피해아동 분리·보호 조치',
        '수사 및 가해자 형사처벌',
        '심리치료, 의료지원 등 사후관리',
      ]},
      { type: 'box', text: '피해아동이 원하지 않아도 국가가 직권으로 개입할 수 있어요. 신고만 해도 전문가가 나머지를 도와줘요.' },
    ],
  },
  'ca-6': {
    id: 'ca-6',
    categoryLabel: '아동학대/가정폭력',
    question: '가정폭력 목격 시 신고해도 되나요?',
    content: [
      { type: 'summary', text: '네, 당사자가 아니어도 누구나 신고할 수 있고, 적극 권장해요.' },
      { type: 'heading', text: '제3자 신고' },
      { type: 'text', text: '가정폭력을 목격한 이웃, 친구, 선생님 등 누구든 신고할 수 있어요. 신고 의무자(교사, 의사 등)는 법적으로 신고해야 할 의무가 있어요.' },
      { type: 'subheading', text: '신고자 보호' },
      { type: 'text', text: '신고자의 신원은 절대 공개되지 않아요. 보복이나 불이익을 받지 않도록 법으로 보호돼요.' },
    ],
  },
};

export const HELP_INFO: Record<string, { emergency: EmergencyNumber[]; centers: HelpCenter[] }> = {
  'child-abuse': {
    emergency: [
      { label: '아동학대', number: '112 또는 1577-1391' },
      { label: '가정폭력', number: '112 또는 1366' },
      { label: '학교폭력', number: '117' },
    ],
    centers: [
      { name: '서울특별시 아동보호전문기관', phone: '02-2040-4242', address: '서울 중구 남대문로', region: '서울' },
      { name: '서울북부 아동보호전문기관', phone: '02-923-5440', address: '서울 강북구', region: '서울' },
      { name: '서울 가정폭력상담소', phone: '02-2263-6465', address: '서울 마포구', region: '서울' },
      { name: '경기도 아동보호전문기관', phone: '031-245-5567', address: '경기 수원시', region: '경기' },
      { name: '경기북부 아동보호전문기관', phone: '031-877-7600', address: '경기 의정부시', region: '경기' },
      { name: '인천 아동보호전문기관', phone: '032-421-4818', address: '인천 남동구', region: '인천' },
      { name: '부산 아동보호전문기관', phone: '051-240-6400', address: '부산 동구', region: '부산' },
      { name: '대구 아동보호전문기관', phone: '053-422-1391', address: '대구 중구', region: '대구' },
      { name: '광주 아동보호전문기관', phone: '062-385-1391', address: '광주 북구', region: '광주' },
      { name: '대전 아동보호전문기관', phone: '042-254-6790', address: '대전 중구', region: '대전' },
    ],
  },
  'labor': {
    emergency: [
      { label: '고용노동부', number: '1350' },
      { label: '청소년근로권익센터', number: '1644-3119' },
    ],
    centers: [
      { name: '서울지방고용노동청', phone: '02-2250-5700', address: '서울 중구 청계천로', region: '서울' },
      { name: '서울강남지청', phone: '02-3465-8300', address: '서울 강남구', region: '서울' },
      { name: '경기지청', phone: '031-230-5800', address: '경기 수원시 팔달구', region: '경기' },
      { name: '인천지방고용노동청', phone: '032-460-4500', address: '인천 남동구', region: '인천' },
      { name: '부산지방고용노동청', phone: '051-850-6300', address: '부산 동구', region: '부산' },
    ],
  },
  'finance': {
    emergency: [
      { label: '금융감독원', number: '1332' },
      { label: '경찰청 사이버범죄', number: '182' },
    ],
    centers: [
      { name: '서울금융복지상담센터', phone: '02-2251-5500', address: '서울 중구', region: '서울' },
      { name: '경기도 서민금융복지지원센터', phone: '031-120', address: '경기 수원시', region: '경기' },
    ],
  },
  'sexual-violence': {
    emergency: [
      { label: '성폭력 피해', number: '1366' },
      { label: '여성긴급전화', number: '1366' },
      { label: '해바라기센터', number: '1899-3075' },
    ],
    centers: [
      { name: '서울해바라기센터(아동)', phone: '02-3274-1375', address: '서울 서대문구', region: '서울' },
      { name: '부산해바라기센터', phone: '051-244-1375', address: '부산 서구', region: '부산' },
      { name: '경기해바라기센터(아동)', phone: '031-708-1375', address: '경기 성남시', region: '경기' },
    ],
  },
  'online-violence': {
    emergency: [
      { label: '사이버범죄 신고', number: '182' },
      { label: '불법촬영물 신고', number: '1377' },
    ],
    centers: [
      { name: '방송통신심의위원회', phone: '02-3219-5114', address: '서울 양천구', region: '서울' },
      { name: '디지털성범죄피해자지원센터', phone: '02-735-8994', address: '서울 마포구', region: '서울' },
    ],
  },
  'birth-adoption': {
    emergency: [
      { label: '아동권리보장원', number: '02-6943-2070' },
    ],
    centers: [
      { name: '서울가정법원', phone: '02-2056-1114', address: '서울 서초구', region: '서울' },
      { name: '경기가정법원', phone: '031-210-1114', address: '경기 수원시', region: '경기' },
    ],
  },
  'guardianship': {
    emergency: [
      { label: '법원행정처', number: '02-3480-1100' },
    ],
    centers: [
      { name: '서울가정법원', phone: '02-2056-1114', address: '서울 서초구', region: '서울' },
      { name: '대한법률구조공단', phone: '132', address: '전국', region: '서울' },
    ],
  },
};

export default function _() { return null; }
