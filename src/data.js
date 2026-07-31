export const stickerAssets = {
  victory: '/assets/jelly-sticker.png',
  laugh: '/assets/stickers/laugh.png',
  surprised: '/assets/stickers/surprised.png',
  love: '/assets/stickers/love.png',
  cry: '/assets/stickers/cry.png',
  angry: '/assets/stickers/angry.png',
  think: '/assets/stickers/think.png',
}

export const specs = [
  ['스티커 이미지', 'PNG / GIF · 740 × 640px', '24개'],
  ['메인 이미지', '240 × 240px', '1개'],
  ['탭 이미지', '96 × 74px', '1개'],
  ['파일 설정', 'RGB · 72dpi 이상', '각 1MB 이하'],
  ['애니메이션 GIF', '최대 3초 · 100프레임', '24개 · LOOP ∞'],
]

export const filmAssets = [
  stickerAssets.laugh,
  stickerAssets.surprised,
  stickerAssets.love,
  stickerAssets.cry,
  stickerAssets.angry,
  stickerAssets.think,
  stickerAssets.victory,
]

export const faqItems = [
  {
    question: '치지직 클립 주소만 있으면 되나요?',
    answer: '네. 공개된 치지직 클립 URL을 붙여 넣으면 인상적인 표정과 움직임이 있는 구간을 분석해 스티커 후보로 정리하는 흐름입니다.',
  },
  {
    question: '움직이는 스티커도 OGQ 규격에 맞나요?',
    answer: '네. 움직이는 스티커는 사진 한 장이 아니라 여러 프레임이 들어 있는 GIF 24개로 구성합니다. 각 GIF는 740×640px, 최대 3초, 100프레임 이하, 1MB 이하 기준을 반영합니다.',
  },
  {
    question: '만든 스티커를 바로 판매할 수 있나요?',
    answer: '다운로드한 파일을 OGQ 크리에이터 스튜디오에 직접 등록하고 심사를 요청해야 합니다. 최종 승인 여부는 OGQ의 심사 기준에 따라 결정됩니다.',
  },
  {
    question: '클립과 캐릭터의 저작권은 어떻게 되나요?',
    answer: '본인에게 사용 권한이 있는 영상만 이용해야 합니다. 타인의 얼굴, 캐릭터, 방송 장면을 활용할 때는 초상권과 저작권 등 필요한 권리를 먼저 확인해 주세요.',
  },
  {
    question: '네이버나 치지직의 공식 서비스인가요?',
    answer: '아니요. CLIPCON은 치지직·네이버·OGQ와 제휴하거나 공식 운영되는 서비스가 아닌 독립적인 크리에이터 도구입니다.',
  },
]
