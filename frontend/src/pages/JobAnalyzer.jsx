import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobAPI } from '../services/api'
import { PageHeader, Alert, Spinner } from '../components/UI'

const TABS = ['url', 'text']

export default function JobAnalyzer() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('url')
  const [form, setForm] = useState({ url: '', manualText: '', title: '', company: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: '', message: '' })

    if (tab === 'url' && !form.url) return setStatus({ type: 'error', message: 'Please enter a job URL.' })
    if (tab === 'text' && form.manualText.trim().length < 50)
      return setStatus({ type: 'error', message: 'Job description is too short (min 50 characters).' })

    setLoading(true)
    try {
      const payload = {
        title: form.title || undefined,
        company: form.company || undefined,
        ...(tab === 'url' ? { url: form.url } : { manualText: form.manualText }),
      }
      const res = await jobAPI.analyze(payload)
      const jobId = res.data.data.id
      navigate(`/results/${jobId}`)
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to analyze job.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Job Analyzer"
        subtitle="Submit a job posting to begin AI-powered skill gap and interview prep"
      />

      <div className="card">
        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1 mb-6 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setStatus({ type: '', message: '' }) }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'url' ? '🔗 Job URL' : '📝 Paste Text'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Optional metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Job Title (optional)</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior Engineer" className="input" />
            </div>
            <div>
              <label className="label">Company (optional)</label>
              <input name="company" value={form.company} onChange={handleChange} placeholder="e.g. Acme Corp" className="input" />
            </div>
          </div>

          {/* URL tab */}
          {tab === 'url' && (
            <div>
              <label className="label">Job Posting URL</label>
              <input
                name="url"
                type="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://jobs.example.com/software-engineer"
                className="input"
              />
              <p className="text-xs text-zinc-600 mt-1.5">
                Puppeteer will scrape the page. Some sites with heavy bot-detection may not work — use the text tab instead.
              </p>
            </div>
          )}

          {/* Text tab */}
          {tab === 'text' && (
            <div>
              <label className="label">Job Description</label>
              <textarea
                name="manualText"
                value={form.manualText}
                onChange={handleChange}
                placeholder="Paste the full job description here..."
                rows={12}
                className="input resize-none"
              />
              <p className="text-xs text-zinc-600 mt-1.5">{form.manualText.length} characters</p>
            </div>
          )}

          <Alert type={status.type || 'error'} message={status.message} />

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <Spinner size="sm" />
                {tab === 'url' ? 'Scraping job page…' : 'Saving…'}
              </>
            ) : (
              'Submit Job Description →'
            )}
          </button>
        </form>
      </div>

      {/* Info box */}
      <div className="card mt-6 bg-brand-500/5 border-brand-500/20">
        <h3 className="text-xs font-semibold text-brand-400 mb-2 uppercase tracking-wide">What happens next?</h3>
        <ul className="space-y-1.5 text-xs text-zinc-400">
          <li className="flex items-start gap-2"><span className="text-brand-400">1.</span> Job description is saved to your profile</li>
          <li className="flex items-start gap-2"><span className="text-brand-400">2.</span> You'll land on the Results page</li>
          <li className="flex items-start gap-2"><span className="text-brand-400">3.</span> Run Skill Gap Analysis, Interview Prep, or ATS Optimizer with one click each</li>
        </ul>
      </div>
    </div>
  )
}
