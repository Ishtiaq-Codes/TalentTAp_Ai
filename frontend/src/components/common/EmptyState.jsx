export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      {Icon && (
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-sm transition-transform hover:scale-105 duration-300">
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl pointer-events-none" />
          <Icon className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>
      {description && <p className="mt-2.5 max-w-sm text-sm text-slate-500 leading-relaxed">{description}</p>}
      {action && <div className="mt-8 transition-all hover:-translate-y-0.5">{action}</div>}
    </div>
  )
}
