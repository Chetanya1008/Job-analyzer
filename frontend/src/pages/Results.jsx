import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { jobAPI, aiAPI } from '../services/api'
import { PageHeader, Alert, Spinner, TagList, Section, LoadingOverlay } from '../components/UI'

// Score ring component
const ScoreRing = ({ score }) => {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  const radius = 36
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  return (
    <div className="flex flex-col items-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#27272a" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="48" y="48" textAnchor="middle" dominantBaseline="central" fill={color} fontSize="18" fontWeight="bold">
          {score}%
        </text>
      </svg>
      <p className="text-xs text-zinc-500 mt-1">Match Score</p>
    </div>
  )
}

// AI action button
const AIButton = ({ label, icon, onClick, loading, done }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all w-full ${
      done
        ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
        : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100'
    } disabled:opacity-50`}
  >
    <span className="text-lg">{icon}</span>
    <span>{done ? `${label} ✓` : label}</span>
    {loading && <Spinner size="sm" />}
  </button>
)

const TABS = ['skillGap', 'questions', 'optimized']
const TAB_LABELS = { skillGap: 'Skill Gap', questions: 'Interview Prep', optimized: 'ATS Resume' }

export default function Results() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState('skillGap')
  const [aiLoading, setAiLoading] = useState({ skillGap: false, questions: false, optimized: false })
  const [error, setError] = useState('')

  useEffect(() => {
    jobAPI.get(jobId)
      .then((res) => setJob(res.data.data))
      .catch(() => setError('Job not found.'))
      .finally(() => setFetching(false))
  }, [jobId])

  const runAI = async (type) => {
    setError('')
    setAiLoading((p) => ({ ...p, [type]: true }))
    try {
      let res
      if (type === 'skillGap') res = await aiAPI.skillGap(jobId)
      else if (type === 'questions') res = await aiAPI.interviewQuestions(jobId)
      else res = await aiAPI.optimizeResume(jobId)

      // Refresh job data to get all updated fields
      const refreshed = await jobAPI.get(jobId)
      setJob(refreshed.data.data)
      setActiveTab(type)
    } catch (err) {
      setError(err.response?.data?.message || `AI ${type} failed. Make sure your resume is uploaded.`)
    } finally {
      setAiLoading((p) => ({ ...p, [type]: false }))
    }
  }

  if (fetching) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>
  if (!job) return <div className="p-8"><Alert type="error" message={error || 'Job not found'} /></div>

  const hasSkillGap = job.skillGapAnalysis?.matchScore !== undefined
  const hasQuestions = job.interviewQuestions?.technical?.length > 0
  const hasOptimized = job.optimizedResume?.length > 0

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link to="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-3">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-100">{job.title}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {job.company && <span>{job.company} · </span>}
            {new Date(job.createdAt).toLocaleDateString()} 
            {job.sourceUrl && <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline ml-2">View Posting ↗</a>}
          </p>
        </div>
        {hasSkillGap && <ScoreRing score={job.skillGapAnalysis.matchScore} />}
      </div>

      <Alert type="error" message={error} />

      <div className="grid grid-cols-3 gap-3 mb-8">
        <AIButton
          label="Skill Gap Analysis"
          icon="🎯"
          onClick={() => runAI('skillGap')}
          loading={aiLoading.skillGap}
          done={hasSkillGap}
        />
        <AIButton
          label="Interview Prep"
          icon="💬"
          onClick={() => runAI('questions')}
          loading={aiLoading.questions}
          done={hasQuestions}
        />
        <AIButton
          label="ATS Optimizer"
          icon="⚡"
          onClick={() => runAI('optimized')}
          loading={aiLoading.optimized}
          done={hasOptimized}
        />
      </div>

      {/* Tabs (only show if there's data) */}
      {(hasSkillGap || hasQuestions || hasOptimized) && (
        <>
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-1 mb-6 w-fit">
            {TABS.filter((t) =>
              (t === 'skillGap' && hasSkillGap) ||
              (t === 'questions' && hasQuestions) ||
              (t === 'optimized' && hasOptimized)
            ).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Skill Gap Tab */}
          {activeTab === 'skillGap' && hasSkillGap && (
            <div className="grid grid-cols-2 gap-4">
              <Section title={`✅ Matching Skills (${job.skillGapAnalysis.matchingSkills.length})`}>
                <TagList items={job.skillGapAnalysis.matchingSkills} variant="green" />
              </Section>

              <Section title={`❌ Missing Skills (${job.skillGapAnalysis.missingSkills.length})`}>
                <TagList items={job.skillGapAnalysis.missingSkills} variant="red" />
              </Section>

              <div className="col-span-2">
                <Section title="💡 Suggestions to Improve">
                  <ul className="space-y-2">
                    {job.skillGapAnalysis.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <span className="text-brand-400 shrink-0 mt-0.5">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            </div>
          )}

          {/* Interview Questions Tab */}
          {activeTab === 'questions' && hasQuestions && (
            <div className="grid grid-cols-2 gap-4">
              <Section title={`⚙️ Technical Questions (${job.interviewQuestions.technical.length})`}>
                <ol className="space-y-3">
                  {job.interviewQuestions.technical.map((q, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex gap-2.5">
                      <span className="text-brand-400 shrink-0 font-mono text-xs mt-0.5">{String(i+1).padStart(2,'0')}</span>
                      {q}
                    </li>
                  ))}
                </ol>
              </Section>

              <Section title={`🤝 HR / Behavioral Questions (${job.interviewQuestions.hr.length})`}>
                <ol className="space-y-3">
                  {job.interviewQuestions.hr.map((q, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex gap-2.5">
                      <span className="text-brand-400 shrink-0 font-mono text-xs mt-0.5">{String(i+1).padStart(2,'0')}</span>
                      {q}
                    </li>
                  ))}
                </ol>
              </Section>
            </div>
          )}

          {/* Optimized Resume Tab */}
          {activeTab === 'optimized' && hasOptimized && (
            <Section title="⚡ ATS-Optimized Resume">
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => navigator.clipboard.writeText(job.optimizedResume)}
                  className="btn-secondary text-xs"
                >
                  Copy to Clipboard
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-xs text-zinc-300 font-mono bg-zinc-950 rounded-lg p-4 max-h-[600px] overflow-y-auto leading-relaxed border border-zinc-800">
                {job.optimizedResume}
              </pre>
            </Section>
          )}
        </>
      )}

      {/* Prompt to run AI if nothing done yet */}
      {!hasSkillGap && !hasQuestions && !hasOptimized && !Object.values(aiLoading).some(Boolean) && (
        <div className="card text-center py-12 border-dashed">
          <p className="text-zinc-400 text-sm">Click an AI action above to generate insights for this job.</p>
          <p className="text-zinc-600 text-xs mt-1">Each action calls Gemini AI and takes a few seconds.</p>
        </div>
      )}

      {/* Loading state for any AI in progress */}
      {Object.values(aiLoading).some(Boolean) && (
        <LoadingOverlay message="Gemini AI is analyzing your resume and job description…" />
      )}
    </div>
  )
}
