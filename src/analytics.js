// Google Analytics 4 연동. VITE_GA_ID가 비어 있으면 스크립트를 아예 내려받지 않으며
// 아래 함수들은 모두 조용히 아무 일도 하지 않는다. 개발 환경의 기본 상태가 이쪽이다.
const GA_ID = import.meta.env.VITE_GA_ID

// 이용자가 넣은 클립 주소는 /create?url=... 형태로 주소창에 남는다. 페이지뷰에
// window.location.href를 그대로 실으면 그 클립 주소까지 구글로 넘어가므로,
// 개인정보처리방침이 고지한 이전 항목 안에 머물도록 경로만 조립해서 보낸다.
const locationFor = (path) => `${window.location.origin}${path}`

export function initAnalytics() {
  if (!GA_ID) return

  window.dataLayer = window.dataLayer || []
  // arguments 객체를 그대로 밀어 넣어야 해서 화살표 함수로는 쓸 수 없다.
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', GA_ID, {
    // 라우트 전환은 App에서 직접 잡아 보낸다. 여기서 자동 전송까지 켜두면
    // 첫 화면이 두 번 세어진다. GA 콘솔의 향상된 측정에서 '브라우저 기록 이벤트
    // 기반 페이지 변경'도 함께 꺼야 중복이 완전히 사라진다.
    send_page_view: false,
    // 동의 배너 없이 운영하기로 한 만큼 광고·행태 신호는 받지 않는다.
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
}

export function trackPageView(path, title) {
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: locationFor(path),
  })
}

// 파라미터에는 클립 주소·클립 제목·계정 정보와 서버가 준 에러 문구를 넣지 않는다.
// 무엇이 실려 올지 통제할 수 없는 값은 고지한 국외 이전 항목을 벗어나기 때문이다.
export function track(name, params) {
  window.gtag?.('event', name, params)
}
