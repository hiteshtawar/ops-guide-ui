import { useState, useRef, useEffect, FormEvent } from 'react'
import './App.css'
import { ClassificationResponse, ApiRequest } from './types'

function App() {
  const [query, setQuery] = useState<string>('')
  const [response, setResponse] = useState<ClassificationResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get greeting based on time
  const getGreeting = (): string => {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      return 'Good morning'
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon'
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening'
    } else {
      return 'Good night'
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const fileType = file.type
      
      if (fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'application/pdf') {
        // Handle file upload - you can add logic here to process the file
        console.log('File selected:', file.name, fileType)
        // For now, just show a message or add to context
        alert(`📎 File "${file.name}" selected (${fileType})`)
      } else {
        alert('⚠️ Please select only JPEG or PDF files')
        e.target.value = '' // Clear the input
      }
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [query])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const requestBody: ApiRequest = {
        user_id: 'ops-engineer-test',
        query: query.trim(),
        context: {
          reason: 'UI request',
          priority: 'normal',
          requested_by: 'ops-engineer-test',
          timestamp: new Date().toISOString()
        },
        environment: 'prod'
      }

      const apiResponse = await fetch('http://localhost:8093/v1/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'ops-engineer-test',
          'X-Idempotency-Key': crypto.randomUUID(),
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvcHMtZW5naW5lZXItdGVzdCIsIm5hbWUiOiJUZXN0IE9wZXJhdG9yIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjE3MDA5OTk5OTksInJvbGVzIjpbIm9wc19lbmdpbmVlciJdfQ.SAMPLE_JWT_TOKEN'
        },
        body: JSON.stringify(requestBody)
      })

      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status} ${apiResponse.statusText}`)
      }

      const data: ClassificationResponse = await apiResponse.json()
      setResponse(data)
      setQuery('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) {
        form.requestSubmit()
      }
    }
  }

  return (
    <div className="app">
      <div className="container">
        {/* Greeting */}
        <div className="greeting">
          <span className="greeting-icon">🌐</span>
          <h1 className="greeting-text">{getGreeting()}</h1>
        </div>

        {/* Input Area */}
        <form className="input-container" onSubmit={handleSubmit}>
          <div className="input-box">
            <textarea
              ref={textareaRef}
              className="input-field"
              placeholder="💬 How can I help you today?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            
            <div className="input-footer">
              <div className="input-footer-left">
                <label htmlFor="file-upload" className="attach-button" title="Attach JPEG or PDF">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".jpeg,.jpg,.pdf,image/jpeg,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              
              <div className="input-footer-right">
                <button
                  type="submit"
                  className="send-button"
                  disabled={!query.trim() || loading}
                  aria-label="Send"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8L14 8M10 4L14 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="status-message loading">
            <div className="spinner"></div>
            <span>⚡ Processing your request...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="status-message error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="response-container">
            <div className="response-section">
              <h3>Classification</h3>
              <div className="response-content">
                <p><strong>Task:</strong> {response.classification?.taskId || 'N/A'}</p>
                <p><strong>Confidence:</strong> {response.classification?.confidence?.toFixed(2) || 'N/A'}</p>
                <p><strong>Service:</strong> {response.classification?.service || 'N/A'}</p>
              </div>
            </div>

            {response.extractedEntities && Object.keys(response.extractedEntities).length > 0 && (
              <div className="response-section">
                <h3>Extracted Entities</h3>
                <div className="response-content">
                  {Object.entries(response.extractedEntities).map(([key, value]) => (
                    value && <p key={key}><strong>{key}:</strong> {value}</p>
                  ))}
                </div>
              </div>
            )}

            {response.nextSteps && (
              <div className="response-section">
                <h3>Next Steps</h3>
                <div className="response-content">
                  <p>{response.nextSteps.description}</p>
                  {response.nextSteps.typicalSteps && (
                    <ul>
                      {response.nextSteps.typicalSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  )}
                  {response.nextSteps.runbook && (
                    <p className="runbook-link">Runbook: {response.nextSteps.runbook}</p>
                  )}
                  {response.nextSteps.apiSpec && (
                    <p className="runbook-link">API Spec: {response.nextSteps.apiSpec}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

