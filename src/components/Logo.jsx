import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link className="logo" to="/" aria-label="CLIPCON 홈">
      <img className="logo-mark" src="/assets/logo-mark.png" alt="" width="29" height="29" />
      <span>CLIPCON</span>
      <em>BETA</em>
    </Link>
  )
}
