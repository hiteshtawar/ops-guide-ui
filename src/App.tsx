import { useState, useRef, useEffect, FormEvent } from 'react'
import './App.css'
import { ClassificationResponse, ApiRequest, StepExecution, StepExecutionRequest } from './types'

function App() {
  const [query, setQuery] = useState<string>('')
  const [response, setResponse] = useState<ClassificationResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [steps, setSteps] = useState<Map<string, StepExecution>>(new Map())
  const [executingSteps, setExecutingSteps] = useState<Set<string>>(new Set())
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
      
      // Auto-execute only the first auto-executable step that doesn't require approval
      // Do NOT auto-execute steps that come after approval-required steps
      if (data.nextSteps?.stepMetadata) {
        const stepsMetadata = data.nextSteps.stepMetadata
        const firstAutoStepIndex = stepsMetadata.findIndex((meta, idx) => {
          // Find first auto-executable step that doesn't require approval
          // BUT only execute if no approval-required step comes before it
          if (meta.autoExecutable && !meta.requiresApproval) {
            // Check if there's an approval-required step before this one
            const hasApprovalBefore = stepsMetadata.slice(0, idx).some(m => m.requiresApproval)
            return !hasApprovalBefore
          }
          return false
        })
        
        // Only execute the first auto step if found
        if (firstAutoStepIndex !== -1) {
          const stepName = data.nextSteps.typicalSteps[firstAutoStepIndex]
          setTimeout(() => {
            executeStep(firstAutoStepIndex, stepName, data)
          }, 500)
        }
      }
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

  const executeStep = async (stepIndex: number, stepName: string, response: ClassificationResponse, skipApproval = false) => {
    const stepId = `${response.requestId}-step-${stepIndex}`
    setExecutingSteps(prev => new Set(prev).add(stepId))
    
    const stepMeta = response.nextSteps?.stepMetadata?.[stepIndex]
    
    const stepRequest: StepExecutionRequest = {
      requestId: response.requestId,
      stepIndex: String(stepIndex),
      stepName: stepName,
      taskId: response.classification?.taskId || '',
      extractedEntities: response.extractedEntities,
      skipApproval: skipApproval,
      apiEndpoint: stepMeta?.apiEndpoint || undefined,
      httpMethod: stepMeta?.httpMethod || undefined,
      apiParameters: stepMeta?.apiParameters || undefined
    }

    try {
      const apiResponse = await fetch('http://localhost:8093/v1/steps/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'ops-engineer-test',
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvcHMtZW5naW5lZXItdGVzdCIsIm5hbWUiOiJUZXN0IE9wZXJhdG9yIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjE3MDA5OTk5OTksInJvbGVzIjpbIm9wc19lbmdpbmVlciJdfQ.SAMPLE_JWT_TOKEN'
        },
        body: JSON.stringify(stepRequest)
      })

      if (!apiResponse.ok) {
        throw new Error(`Step execution failed: ${apiResponse.status}`)
      }

      const stepExecution: StepExecution = await apiResponse.json()
      
      // Update step status
      setSteps(prev => {
        const newMap = new Map(prev)
        newMap.set(stepId, stepExecution)
        return newMap
      })
      
      // If this step completed successfully, check if we should auto-execute the next step
      if (stepExecution.status === 'COMPLETED' && stepExecution.result?.success) {
        const nextStepIndex = stepIndex + 1
        const nextStepMeta = response.nextSteps?.stepMetadata?.[nextStepIndex]
        
        // Only auto-execute next step if it's auto-executable and doesn't require approval
        if (nextStepMeta && nextStepMeta.autoExecutable && !nextStepMeta.requiresApproval) {
          const nextStepName = response.nextSteps.typicalSteps[nextStepIndex]
          // Wait a bit before executing next step
          setTimeout(() => {
            executeStep(nextStepIndex, nextStepName, response)
          }, 500)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Step execution failed'
      console.error('Step execution error:', err)
      
      // Update step with error
      setSteps(prev => {
        const newMap = new Map(prev)
        newMap.set(stepId, {
          stepId: stepId,
          requestId: response.requestId,
          stepName: stepName,
          status: 'FAILED',
          type: 'VALIDATION',
          requiresApproval: false,
          errorMessage: errorMessage
        })
        return newMap
      })
    } finally {
      setExecutingSteps(prev => {
        const newSet = new Set(prev)
        newSet.delete(stepId)
        return newSet
      })
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
            <div className="response-sections-horizontal">
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
            </div>

            {response.nextSteps && (
              <div className="response-section">
                <h3>Next Steps</h3>
                <div className="response-content">
                  <p>{response.nextSteps.description}</p>
                  {response.nextSteps.typicalSteps && (
                    <div className="steps-container">
                      {response.nextSteps.typicalSteps.map((stepName, idx) => {
                        const stepId = `${response.requestId}-step-${idx}`
                        const step = steps.get(stepId)
                        const isExecuting = executingSteps.has(stepId)
                        const stepMeta = response.nextSteps.stepMetadata?.[idx]
                        const autoExecutable = stepMeta?.autoExecutable ?? false
                        const requiresApproval = stepMeta?.requiresApproval ?? false
                        
                        return (
                          <div key={idx} className="step-wrapper">
                            <div className="step-row">
                              <div className={`step-card ${step?.status?.toLowerCase() || 'pending'}`}>
                                <div className="step-content">
                                  <div className="step-header">
                                    <span className="step-number">{idx + 1}</span>
                                    <span className="step-name">{stepName}</span>
                                    <span className={`step-status ${step?.status?.toLowerCase() || 'pending'}`}>
                                      {step?.status === 'COMPLETED' && '✓'}
                                      {step?.status === 'FAILED' && '✗'}
                                      {step?.status === 'RUNNING' && '⟳'}
                                      {step?.status === 'APPROVAL_REQUIRED' && '⏸'}
                                      {!step && !isExecuting && '○'}
                                    </span>
                                  </div>
                                </div>
                                <div className="step-actions">
                                  {!step && !isExecuting && autoExecutable && !requiresApproval && (
                                    <button
                                      className="step-button auto-execute"
                                      onClick={() => executeStep(idx, stepName, response)}
                                    >
                                      Run
                                    </button>
                                  )}
                                  {!step && !isExecuting && requiresApproval && (
                                    <>
                                      <button
                                        className="step-button approve"
                                        onClick={() => executeStep(idx, stepName, response, true)}
                                      >
                                        Approve
                                      </button>
                                      <button
                                        className="step-button reject"
                                        onClick={() => {
                                          setSteps(prev => {
                                            const newMap = new Map(prev)
                                            newMap.set(stepId, {
                                              stepId: stepId,
                                              requestId: response.requestId,
                                              stepName: stepName,
                                              status: 'CANCELLED',
                                              type: stepMeta?.stepType as any || 'VALIDATION',
                                              requiresApproval: requiresApproval
                                            })
                                            return newMap
                                          })
                                        }}
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {isExecuting && (
                                    <span className="executing" style={{ fontSize: '0.85rem' }}>⟳ Running...</span>
                                  )}
                                  {(step?.status === 'CANCELLED') && (
                                    <span style={{ fontSize: '0.85rem', color: '#90a4ae' }}>✗ Rejected</span>
                                  )}
                                </div>
                              </div>
                              {(step?.result || step?.errorMessage) && (
                                <div className="step-message-container">
                                  {step?.result && (
                                    <div className={`step-details ${step.result.success ? 'success' : 'error'}`}>
                                      {step.result.success ? '✓ ' : '✗ '}
                                      {step.result.message || step.result.data?.status || 'Completed'}
                                    </div>
                                  )}
                                  {step?.errorMessage && (
                                    <div className="step-details error">
                                      ✗ {step.errorMessage}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
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

