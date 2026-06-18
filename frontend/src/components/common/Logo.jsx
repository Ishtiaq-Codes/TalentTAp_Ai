import { Link } from 'react-router-dom'

export default function Logo({ collapsed = false, linkTo = '/', theme = 'light' }) {
  const isDark = theme === 'dark'

  const content = (
    <div className="flex items-center gap-1.5">
      {/* Custom TT Monogram Symbol (Imported from Figma) */}
      <div className="relative flex h-7 w-11 items-center justify-center shrink-0">
        <img
          src={isDark ? "/simplification-dark.svg" : "/simplification.svg"}
          alt="TalentTap Monogram"
          className="absolute max-w-none h-[120%] w-auto object-contain"
        />
      </div>

      {/* Figma Wordmark */}
      {!collapsed && (
        <img
          src={isDark ? "/talenttap-wordmark-dark.svg" : "/talenttap-wordmark.svg"}
          alt="TalentTap Wordmark"
          className="h-12 w-auto object-contain shrink-0"
          style={{
            marginLeft: '-0.75rem'
          }}
        />
      )}
    </div>
  )

  return linkTo ? <Link to={linkTo} className="hover:opacity-90 transition-opacity">{content}</Link> : content
}
