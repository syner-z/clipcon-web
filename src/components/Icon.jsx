const paths = {
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  link: <><path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" /><path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" /></>,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  pause: <><path d="M9 5v14" /><path d="M15 5v14" /></>,
  volume: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 9.2a4 4 0 0 1 0 5.6" /><path d="M18.5 6.5a8 8 0 0 1 0 11" /></>,
  volumeLow: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 9.2a4 4 0 0 1 0 5.6" /></>,
  mute: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m16 10 5 4" /><path d="m21 10-5 4" /></>,
  spark: <><path d="m12 3-1.2 4.3a5 5 0 0 1-3.5 3.5L3 12l4.3 1.2a5 5 0 0 1 3.5 3.5L12 21l1.2-4.3a5 5 0 0 1 3.5-3.5L21 12l-4.3-1.2a5 5 0 0 1-3.5-3.5L12 3Z" /></>,
  download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
  refresh: <><path d="M20 7h-6V1" /><path d="M20 7a9 9 0 1 0 1 7" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
  shield: <><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" /><path d="m9 12 2 2 4-4" /></>,
  wand: <><path d="m15 4 5 5L8 21l-5-5L15 4Z" /><path d="m6 14 4 4" /><path d="M6 3v4" /><path d="M4 5h4" /><path d="M19 15v4" /><path d="M17 17h4" /></>,
  motion: <><path d="M3 8h10" /><path d="M3 12h7" /><path d="M3 16h4" /><path d="m14 6 7 6-7 6V6Z" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>,
  text: <><path d="M5 7V5h14v2" /><path d="M12 5v14" /><path d="M9 19h6" /></>,
  // mute가 스피커에 X를 얹는 것과 같은 방식으로, 같은 글자 모양에 사선을 그어 짝을 만든다.
  textOff: <><path d="M5 7V5h14v2" /><path d="M12 5v14" /><path d="M9 19h6" /><path d="m4 20 16-16" /></>,
}

export default function Icon({ name, size = 20, strokeWidth = 2, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
