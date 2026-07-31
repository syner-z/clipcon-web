import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link className="logo" to="/" aria-label="CLIPCON 홈">
      <span className="logo-mark"><span /></span>
      <span>CLIPCON</span>
      <em>BETA</em>
    </Link>
  )
}
