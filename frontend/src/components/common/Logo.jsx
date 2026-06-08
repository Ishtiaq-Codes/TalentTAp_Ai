import { Link } from 'react-router-dom'

export default function Logo({ collapsed = false, linkTo = '/' }) {
  const content = (
    <div className="flex items-center gap-2.5">
      {/* Custom TT Monogram Symbol (Imported from Figma) */}
      <div className="relative flex h-8 w-12 items-center justify-center shrink-0">
        <img
          src="/monogram.svg"
          alt="TalentTap Monogram"
          className="absolute max-w-none h-[250%] w-auto object-contain mix-blend-multiply"
        />
      </div>

      {/* Figma Wordmark */}
      {!collapsed && (
        <img
          src="/talenttap-wordmark.svg"
          alt="TalentTap Wordmark"
          className="h-12 w-auto object-contain shrink-0"
          style={{ marginLeft: '-0.75rem' }}
        />
      )}
    </div>
  )

  return linkTo ? <Link to={linkTo} className="hover:opacity-90 transition-opacity">{content}</Link> : content
}
