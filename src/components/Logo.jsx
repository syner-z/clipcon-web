import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link className="logo" to="/" aria-label="CLIPY 홈">
      <span className="logo-mark"><span /></span>
      <span>CLIPY</span>
      <em>BETA</em>
    </Link>
  )
}
