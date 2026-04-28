import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { resumeAPI } from '../services/api'
import { PageHeader, Alert, Spinner } from '../components/UI'

export default function ResumeUpload() {
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [existing, setExisting] = useState(null)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    resumeAPI.get(user.id)
      .then((res) => setExisting(res.data.data))
      .catch(() => setExisting(null))
      .finally(() => setFetching(false))
  }, [user.id])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) {
      setStatus({ type: 'error', message: 'Only PDF and DOCX files are accepted.' })
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File must be smaller than 5MB.' })
      return
    }
    setFile(f)
    setStatus({ type: '', message: '' })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFileChange({ target: { files: [f] } })
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setStatus({ type: '', message: '' })
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const res = await resumeAPI.upload(formData)
      setStatus({ type: 'success', message: 'Resume uploaded and parsed successfully!' })
      setFile(null)
      // Refresh existing
      const refreshed = await resumeAPI.get(user.id)
      setExisting(refreshed.data.data)
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Upload failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Resume Upload"
        subtitle="Upload your resume in PDF or DOCX format for AI analysis"
      />

      {/* Existing resume card */}
      {!fetching && existing && (
        <div className="card mb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-100">{existing.fileName}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {existing.fileType.toUpperCase()} • Last updated {new Date(existing.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <span className="badge-green">Active</span>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`card border-2 border-dashed cursor-pointer transition-colors mb-4 ${
          file ? 'border-brand-500/50 bg-brand-500/5' : 'border-zinc-700 hover:border-zinc-500'
        }`}
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="text-center py-10">
          <svg className="w-12 h-12 text-zinc-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {file ? (
            <>
              <p className="text-brand-400 font-medium text-sm">{file.name}</p>
              <p className="text-zinc-500 text-xs mt-1">{(file.size / 1024).toFixed(0)} KB • Click to change</p>
            </>
          ) : (
            <>
              <p className="text-zinc-300 font-medium text-sm">Drop your resume here</p>
              <p className="text-zinc-500 text-xs mt-1">or click to browse · PDF & DOCX · Max 5MB</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Alert type={status.type || 'error'} message={status.message} />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="btn-primary mt-4"
      >
        {loading ? <><Spinner size="sm" /> Parsing resume…</> : 'Upload & Parse Resume'}
      </button>

      {/* Tips */}
      <div className="card mt-8">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Tips for best results</h3>
        <ul className="space-y-2 text-xs text-zinc-500">
          <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Use a text-based PDF (not a scanned image)</li>
          <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Include a clear skills section for better gap analysis</li>
          <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Quantified achievements improve the AI optimization output</li>
          <li className="flex items-start gap-2"><span className="text-brand-400 mt-0.5">→</span> Uploading again will replace your current resume</li>
        </ul>
      </div>
    </div>
  )
}
