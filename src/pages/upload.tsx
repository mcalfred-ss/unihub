import { useState } from 'react'
import { useRouter } from 'next/router'
import { uploadPost } from '@/utils/uploadPost'
import FilePicker from '@/components/FilePicker'
import SuccessToast from '@/components/ui/SuccessToast'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const [formData, setFormData] = useState({
    program_name: '',
    year: '',
    school: '',
    type: 'note',
    title: '',
  })

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    setSuccess(false)
    setShowSuccessToast(false)

    // Create preview URL for images/PDFs
    if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleFileRemove = () => {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    if (!formData.program_name || !formData.year || !formData.school) {
      setError('Please fill in all required fields')
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const post = await uploadPost(file, {
        program_name: formData.program_name,
        year: formData.year,
        school: formData.school,
        type: formData.type,
        title: formData.title,
      })

      console.log('Upload successful:', post)
      setSuccess(true)
      setShowSuccessToast(true)
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)
      setFormData({
        program_name: '',
        year: '',
        school: '',
        type: 'note',
        title: '',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      console.error('Upload error:', err)
      
      // Provide more helpful error messages
      let displayError = errorMessage
      
      // Database insert errors (from server API)
      if (errorMessage.includes('Database insert failed')) {
        const actualError = errorMessage.replace('Database insert failed: ', '')
        if (actualError.includes('row-level security') || actualError.includes('policy')) {
          displayError = 'Database insert blocked by security policy. The server API uses service role key and should bypass RLS. Check server logs and verify SUPABASE_SERVICE_ROLE_KEY is correct.'
        } else {
          displayError = `Database error: ${actualError}`
        }
      }
      // Storage upload errors
      else if (errorMessage.includes('Storage upload failed')) {
        displayError = errorMessage.replace('Storage upload failed: ', '')
      }
      // Generic errors
      else if (errorMessage.includes('row-level security') || errorMessage.includes('policy')) {
        displayError = 'Upload blocked by security policy. Please check your database configuration.'
      }
      
      setError(displayError)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-green to-pastel-pink p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Resources
        </button>

        <h1 className="text-4xl font-bold text-primary-600 mb-8 text-center">
          Upload Resource
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-8">
          {/* Section A: Program Name, Year, School */}
          <div className="space-y-4 border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.program_name}
                onChange={(e) =>
                  setFormData({ ...formData, program_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Engineering"
              />
            </div>
          </div>

          {/* Section B: Type, Optional Title */}
          <div className="space-y-4 border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="note">Note</option>
                <option value="question">Question</option>
                <option value="assignment">Assignment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional title for this resource"
              />
            </div>
          </div>

          {/* Section C: File Zone */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">File Upload</h2>
            <FilePicker
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={file}
              previewUrl={previewUrl}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </button>
        </form>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <SuccessToast
          message="Upload successful! Your resource has been added."
          onClose={() => setShowSuccessToast(false)}
          autoHide={true}
          duration={3000}
        />
      )}

      {/* Footer */}
      <footer className="mt-6 text-center text-sm text-gray-500">
        Powered by{' '}
        <a
          href="https://linktr.ee/eqostack"
          target="_blank"
          rel="noreferrer"
          className="text-primary-600 hover:text-primary-700 underline"
        >
          EQOStack
        </a>
      </footer>
    </div>
  )
}

