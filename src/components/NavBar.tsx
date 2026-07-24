import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/standard', label: '标准' },
  { to: '/search', label: '搜索' },
  { to: '/glossary', label: '术语' },
  { to: '/quiz', label: '自测' },
  { to: '/dashboard', label: '仪表盘' },
  { to: '/notes', label: '笔记' },
]

export default function NavBar() {
  const { pathname } = useLocation()
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-20 bg-liquid-abyss/70 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto h-full px-6 flex items-center justify-between">
        <Link to="/" className="font-matter font-medium tracking-tight text-lg text-platinum flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-lavender-phosphor inline-block" aria-hidden />
          ISO <span className="text-lavender-phosphor">13485</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`uppercase text-xs font-normal tracking-[0.12em] transition-colors ${
                pathname.startsWith(l.to) ? 'text-platinum' : 'text-silver-mist hover:text-platinum'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/standard"
          className="btn-aurora hidden sm:inline-flex"
          style={{ padding: '10px 22px', fontSize: '13px' }}
        >
          开始学习
        </Link>
      </div>
    </header>
  )
}
