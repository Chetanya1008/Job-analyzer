// Spinner
export const Spinner = ({ size = 'md' }) => {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'
  return (
    <div className={`${s} border-2 border-brand-500 border-t-transparent rounded-full animate-spin`} />
  )
}

// Alert / Toast
export const Alert = ({ type = 'error', message }) => {
  if (!message) return null
  const styles = {
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    success: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  }
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  )
}

// Page header
export const PageHeader = ({ title, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-2xl font-semibold text-zinc-100">{title}</h1>
    {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
  </div>
)

// Stat card
export const StatCard = ({ label, value, sub, accent }) => (
  <div className="card">
    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-3xl font-bold ${accent || 'text-zinc-100'}`}>{value}</p>
    {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
  </div>
)

// Section card with title
export const Section = ({ title, children, className = '' }) => (
  <div className={`card ${className}`}>
    {title && <h3 className="text-sm font-semibold text-zinc-300 mb-4 pb-3 border-b border-zinc-800">{title}</h3>}
    {children}
  </div>
)

// Pill tag list
export const TagList = ({ items = [], variant = 'green' }) => {
  if (!items.length) return <p className="text-xs text-zinc-500 italic">None</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={variant === 'green' ? 'badge-green' : variant === 'red' ? 'badge-red' : 'badge-yellow'}>
          {item}
        </span>
      ))}
    </div>
  )
}

// Loading overlay for AI ops
export const LoadingOverlay = ({ message = 'Processing with AI...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-sm text-zinc-400">{message}</p>
  </div>
)
