import { useState, useRef } from 'react'
import { analyzeAllAPI } from '../services/api'
import { Alert } from '../components/UI'

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  const radius = 44
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="#27272a" strokeWidth="9" />
        <circle
          cx="55" cy="55" r={radius} fill="none"
          stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
        <text x="55" y="50" textAnchor="middle" fill={color} fontSize="22" fontWeight="bold" dominantBaseline="central">
          {score}%
        </text>
        <text x="55" y="70" textAnchor="middle" fill="#71717a" fontSize="10">
          match
        </text>
      </svg>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'skillGap', label: '🎯 Skill Gap' },
  { id: 'questions', label: '💬 Interview Prep' },
  { id: 'atsResume', label: '⚡ ATS Resume' },
]

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const fileRef = useRef(null)
  const resultsRef = useRef(null)

  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('skillGap')
  const [copied, setCopied] = useState(false)

  // ── File handling ────────────────────────────────────────────
  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are accepted.')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be smaller than 5MB.')
      return
    }
    setFile(f)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFileChange({ target: { files: [f] } })
  }

  // ── Submit ───────────────────────────────────────────────────
  const handleGenerate = async () => {
    setError('')

    if (!file) return setError('Please upload your resume (PDF or DOCX).')
    if (jobDescription.trim().length < 50)
      return setError('Please paste a job description (at least 50 characters).')

    setLoading(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('jobDescription', jobDescription.trim())

      const res = await analyzeAllAPI.analyze(formData)
      setResults(res.data.data)
      setActiveTab('skillGap')

      // Smooth scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyATS = () => {
    navigator.clipboard.writeText(results.optimizedResume)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-100">AI Job Preparation</h1>
        <p className="text-zinc-500 mt-1.5 text-sm">
          Upload your resume + paste a job description → get full AI analysis instantly
        </p>
      </div>

      {/* ── Input Card ── */}
      <div className="card mb-6 space-y-6">

        {/* Step 1 — Resume Upload */}
        <div>
          <p className="label mb-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold mr-2">1</span>
            Upload Resume
          </p>

          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              file
                ? 'border-brand-500/60 bg-brand-500/5'
                : 'border-zinc-700 hover:border-zinc-500'
            }`}
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-brand-400">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(0)} KB · Click to replace</p>
                </div>
              </div>
            ) : (
              <>
                <svg className="w-10 h-10 text-zinc-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-zinc-300 text-sm font-medium">Drop your resume here or click to browse</p>
                <p className="text-zinc-600 text-xs mt-1">PDF or DOCX · Max 5MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
          </div>
        </div>

        {/* Step 2 — Job Description */}
        <div>
          <p className="label mb-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold mr-2">2</span>
            Paste Job Description
          </p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here — include requirements, responsibilities, and qualifications for best results..."
            rows={9}
            className="input resize-none"
          />
          <p className="text-xs text-zinc-600 mt-1.5 text-right">{jobDescription.length} characters</p>
        </div>

        {/* Error */}
        <Alert type="error" message={error} />

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full justify-center py-3 text-base"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing with AI… this may take 15–30 seconds
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Full Analysis
            </>
          )}
        </button>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="card text-center py-12 border-dashed border-brand-500/20 bg-brand-500/5">
          <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-400 font-medium text-sm">Gemini AI is working…</p>
          <p className="text-zinc-600 text-xs mt-1">Parsing resume · Analyzing skills · Generating questions · Optimizing ATS</p>
        </div>
      )}

      {/* ── Results ── */}
      {results && !loading && (
        <div ref={resultsRef}>

          {/* Match Score Banner */}
          <div className="card mb-4 flex items-center gap-6 bg-zinc-900">
            <ScoreRing score={results.skillGap.matchScore} />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-zinc-100 mb-1">Analysis Complete</h2>
              <p className="text-sm text-zinc-400">
                Your resume matches <span className={`font-semibold ${
                  results.skillGap.matchScore >= 70 ? 'text-brand-400' :
                  results.skillGap.matchScore >= 40 ? 'text-amber-400' : 'text-red-400'
                }`}>{results.skillGap.matchScore}%</span> of the job requirements.
              </p>
              <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                <span className="text-brand-400">✅ {results.skillGap.matchingSkills.length} matching skills</span>
                <span className="text-red-400">❌ {results.skillGap.missingSkills.length} missing skills</span>
                <span className="text-zinc-400">💬 {results.interviewQuestions.technical.length + results.interviewQuestions.hr.length} questions</span>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 bg-zinc-800 rounded-xl p-1 mb-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id
                    ? 'bg-zinc-700 text-zinc-100 shadow'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Skill Gap ── */}
          {activeTab === 'skillGap' && (
            <div className="space-y-4">

              {/* Matching Skills */}
              <div className="card">
                <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                  Matching Skills ({results.skillGap.matchingSkills.length})
                </h3>
                {results.skillGap.matchingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {results.skillGap.matchingSkills.map((s, i) => (
                      <span key={i} className="badge-green">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-600 italic">No matching skills found.</p>
                )}
              </div>

              {/* Missing Skills */}
              <div className="card">
                <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Missing Skills ({results.skillGap.missingSkills.length})
                </h3>
                {results.skillGap.missingSkills.length > 0 ? (
                  <ul className="space-y-1.5">
                    {results.skillGap.missingSkills.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                        <span className="text-red-400 text-xs">✕</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-600 italic">Great — no missing skills detected!</p>
                )}
              </div>

              {/* Suggestions */}
              <div className="card">
                <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Suggestions to Improve Your Candidacy
                </h3>
                <ol className="space-y-3">
                  {results.skillGap.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-300">
                      <span className="shrink-0 w-5 h-5 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* ── Tab: Interview Questions ── */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="card">
                <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Technical Questions ({results.interviewQuestions.technical.length})
                </h3>
                <ol className="space-y-4">
                  {results.interviewQuestions.technical.map((q, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 font-mono text-xs text-brand-400 mt-0.5 w-5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-zinc-300 leading-relaxed">{q}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  HR / Behavioral Questions ({results.interviewQuestions.hr.length})
                </h3>
                <ol className="space-y-4">
                  {results.interviewQuestions.hr.map((q, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 font-mono text-xs text-brand-400 mt-0.5 w-5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm text-zinc-300 leading-relaxed">{q}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* ── Tab: ATS Resume ── */}
          {activeTab === 'atsResume' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                  ATS-Optimized Resume
                </h3>
                <button onClick={handleCopyATS} className="btn-secondary text-xs py-1.5 px-3">
                  {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-xs text-zinc-300 font-mono bg-zinc-950 rounded-lg p-5 max-h-[600px] overflow-y-auto leading-relaxed border border-zinc-800">
                {results.optimizedResume}
              </pre>
              <p className="text-xs text-zinc-600 mt-3">
                💡 Copy this text and paste it into your resume editor. Adjust formatting as needed.
              </p>
            </div>
          )}

          {/* Reset Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setResults(null)
                setFile(null)
                setJobDescription('')
                setError('')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="btn-secondary mx-auto"
            >
              ↺ Start New Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
