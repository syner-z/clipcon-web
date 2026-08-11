import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

// 이용약관·개인정보처리방침을 같은 마크업으로 렌더한다. 문서 내용은
// src/legal/*.js 데이터가 갖고 있고, 여기서는 형태만 책임진다.
// list와 table은 선택 필드다 — 없는 섹션이 대부분이다.
export default function LegalPage({ doc }) {
  const { pathname } = useLocation()

  // 푸터 링크로 들어오면 스크롤이 문서 하단에 남는다.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (!doc) return null

  const isTerms = pathname === '/terms'

  return (
    <div className="site-shell">
      <SiteHeader variant="create" />

      <main className="legal">
        <div className="container legal-inner">
          <h1>{doc.title}</h1>
          {doc.effectiveDate && <p className="legal-date">시행일 {doc.effectiveDate}</p>}
          {doc.intro && <p className="legal-intro">{doc.intro}</p>}

          {(doc.sections ?? []).map((section, index) => (
            <section className="legal-section" key={section.heading ?? index}>
              {section.heading && <h2>{section.heading}</h2>}
              {(section.paragraphs ?? []).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
              {section.list?.length > 0 && (
                <ul>
                  {section.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}
              {section.table?.rows?.length > 0 && (
                <div className="legal-table-wrap">
                  <table className="legal-table">
                    {section.table.head?.length > 0 && (
                      <thead>
                        <tr>{section.table.head.map((cell, i) => <th key={i}>{cell}</th>)}</tr>
                      </thead>
                    )}
                    <tbody>
                      {section.table.rows.map((row, i) => (
                        <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          <p className="legal-crosslink">
            {isTerms
              ? <>개인정보 처리에 대한 내용은 <Link to="/privacy">개인정보처리방침</Link>에서 확인하세요.</>
              : <>서비스 이용 조건은 <Link to="/terms">이용약관</Link>에서 확인하세요.</>}
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
