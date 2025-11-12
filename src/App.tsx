import { useState, useRef, useEffect, FormEvent } from 'react'
import './App.css'
import { ClassificationResponse, StepExecution, Step, StepGroups } from './types'

interface AvailableTask {
  taskId: string
  taskName: string
  description: string
}

function App() {
  const [query, setQuery] = useState<string>('')
  const [response, setResponse] = useState<ClassificationResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [steps, setSteps] = useState<Map<string, StepExecution>>(new Map())
  const [executingSteps, setExecutingSteps] = useState<Set<string>>(new Set())
  const [availableTasks, setAvailableTasks] = useState<AvailableTask[]>([])
  const [showTaskSelector, setShowTaskSelector] = useState<boolean>(false)
  const [originalQuery, setOriginalQuery] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch available tasks on mount
  useEffect(() => {
    fetchAvailableTasks()
  }, [])

  const fetchAvailableTasks = async () => {
    try {
      const response = await fetch('http://localhost:8093/api/v1/tasks', {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbmdpbmVlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IEVuZ2luZWVyIiwicm9sZXMiOlsicHJvZHVjdGlvbl9zdXBwb3J0Iiwic3VwcG9ydF9hZG1pbiJdLCJpYXQiOjE3NjI0NjYzNTksImV4cCI6MjA3NzgyNjM1OX0.v8amYkiJOS2dT9MQaZJBkdN-8rWrs-rfxqgVCtgTu3Q'
        }
      })
      if (response.ok) {
        const tasks = await response.json()
        setAvailableTasks(tasks)
      }
    } catch (err) {
      console.error('Failed to fetch available tasks:', err)
    }
  }

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
      const requestBody = {
        query: query.trim(),
        userId: 'ops-engineer-test'
      }

      const apiResponse = await fetch('http://localhost:8093/api/v1/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbmdpbmVlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IEVuZ2luZWVyIiwicm9sZXMiOlsicHJvZHVjdGlvbl9zdXBwb3J0Iiwic3VwcG9ydF9hZG1pbiJdLCJpYXQiOjE3NjI0NjYzNTksImV4cCI6MjA3NzgyNjM1OX0.v8amYkiJOS2dT9MQaZJBkdN-8rWrs-rfxqgVCtgTu3Q'
        },
        body: JSON.stringify(requestBody)
      })

      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status} ${apiResponse.statusText}`)
      }

      const data: ClassificationResponse = await apiResponse.json()
      
      // Check if classification failed
      if (!data.taskId || data.taskId === 'UNKNOWN') {
        setOriginalQuery(query)
        setShowTaskSelector(true)
        setResponse(null)
        setQuery('')
        return
      }
      
      setResponse(data)
      setQuery('')
      setShowTaskSelector(false)
      
      // Auto-execute the first auto-executable step from prechecks
      if (data.steps && data.steps.prechecks && data.steps.prechecks.length > 0) {
        const firstAutoStep = data.steps.prechecks.find(step => step.autoExecutable)
        if (firstAutoStep) {
          const stepIndex = data.steps.prechecks.indexOf(firstAutoStep)
          setTimeout(() => {
            executeStep(stepIndex, firstAutoStep, data, 'prechecks')
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

  const handleTaskSelection = async (taskId: string) => {
    setLoading(true)
    setError(null)
    setShowTaskSelector(false)

    try {
      const requestBody = {
        query: originalQuery,
        userId: 'ops-engineer-test',
        taskId: taskId
      }

      const apiResponse = await fetch('http://localhost:8093/api/v1/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbmdpbmVlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IEVuZ2luZWVyIiwicm9sZXMiOlsicHJvZHVjdGlvbl9zdXBwb3J0Iiwic3VwcG9ydF9hZG1pbiJdLCJpYXQiOjE3NjI0NjYzNTksImV4cCI6MjA3NzgyNjM1OX0.v8amYkiJOS2dT9MQaZJBkdN-8rWrs-rfxqgVCtgTu3Q'
        },
        body: JSON.stringify(requestBody)
      })

      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status} ${apiResponse.statusText}`)
      }

      const data: ClassificationResponse = await apiResponse.json()
      setResponse(data)
      
      // Auto-execute first auto-executable step in prechecks
      if (data.steps?.prechecks && data.steps.prechecks.length > 0) {
        const firstAutoStep = data.steps.prechecks.find(step => step.autoExecutable)
        if (firstAutoStep) {
          const stepIndex = data.steps.prechecks.indexOf(firstAutoStep)
          setTimeout(() => {
            executeStep(stepIndex, firstAutoStep, data, 'prechecks')
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

  // Helper function to check if any previous step has failed
  const hasPreviousStepFailed = (stepIndex: number, stepGroup: string, response: ClassificationResponse): boolean => {
    // Check all steps in the same group before this step
    const currentGroup = response.steps?.[stepGroup as keyof StepGroups]
    if (currentGroup) {
      for (let i = 0; i < stepIndex; i++) {
        const prevStepId = `${response.taskId}-${stepGroup}-${i}`
        const prevStepExecution = steps.get(prevStepId)
        if (prevStepExecution?.status === 'FAILED') {
          return true
        }
      }
    }
    
    // Check all steps in previous groups (prechecks -> procedure -> postchecks)
    const groupOrder = ['prechecks', 'procedure', 'postchecks', 'rollback']
    const currentGroupIndex = groupOrder.indexOf(stepGroup)
    
    if (currentGroupIndex > 0) {
      // Check all previous groups
      for (let g = 0; g < currentGroupIndex; g++) {
        const prevGroup = groupOrder[g]
        const prevGroupSteps = response.steps?.[prevGroup as keyof StepGroups]
        if (prevGroupSteps) {
          for (let i = 0; i < prevGroupSteps.length; i++) {
            const prevStepId = `${response.taskId}-${prevGroup}-${i}`
            const prevStepExecution = steps.get(prevStepId)
            if (prevStepExecution?.status === 'FAILED') {
              return true
            }
          }
        }
      }
    }
    
    return false
  }

  // Helper function to parse JSON message and extract string
  const parseMessage = (message: string | undefined): string => {
    if (!message) return 'Completed'
    
    try {
      const parsed = JSON.parse(message)
      // If it's an object with a message property, return that
      if (typeof parsed === 'object' && parsed !== null && 'message' in parsed) {
        return String(parsed.message)
      }
      // If it's already a string, return it
      return String(parsed)
    } catch {
      // If it's not JSON, return as is
      return message
    }
  }

  const renderStepGroup = (stepList: Step[], response: ClassificationResponse, stepGroup: string) => {
    return stepList.map((step, idx) => {
      const stepId = `${response.taskId}-${stepGroup}-${idx}`
      const stepExecution = steps.get(stepId)
      const isExecuting = executingSteps.has(stepId)
      const hasPreviousFailed = hasPreviousStepFailed(idx, stepGroup, response)
      const isDisabled = hasPreviousFailed && !stepExecution
      
      return (
        <div key={idx} className="step-wrapper">
          <div className="step-row">
            <div className={`step-card ${stepExecution?.status?.toLowerCase() || 'pending'}`}>
              <div className="step-content">
                <div className="step-header">
                  <span className="step-number">{step.stepNumber}</span>
                  <div className="step-info">
                    <span className="step-name-with-api" title={`${step.description} ${step.method} ${step.path}`}>
                      {step.description} <span className="step-method">{step.method}</span> <span className="step-path">{step.path}</span>
                    </span>
                  </div>
                  <span className={`step-status ${stepExecution?.status?.toLowerCase() || 'pending'}`}>
                    {stepExecution?.status === 'COMPLETED' && '✓'}
                    {stepExecution?.status === 'FAILED' && '✗'}
                    {stepExecution?.status === 'RUNNING' && '⟳'}
                    {stepExecution?.status === 'APPROVAL_REQUIRED' && '⏸'}
                    {!stepExecution && !isExecuting && '○'}
                  </span>
                </div>
              </div>
              <div className="step-actions">
                {!stepExecution && !isExecuting && step.autoExecutable && (
                  <button
                    className="step-button auto-execute"
                    onClick={() => executeStep(idx, step, response, stepGroup)}
                    disabled={isDisabled}
                    style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    Run
                  </button>
                )}
                {!stepExecution && !isExecuting && !step.autoExecutable && (
                  <button
                    className="step-button approve"
                    onClick={() => executeStep(idx, step, response, stepGroup, true)}
                    disabled={isDisabled}
                    style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    Approve & Run
                  </button>
                )}
                {isExecuting && (
                  <span className="executing" style={{ fontSize: '0.85rem' }}>⟳ Running...</span>
                )}
                {(stepExecution?.status === 'CANCELLED') && (
                  <span style={{ fontSize: '0.85rem', color: '#90a4ae' }}>✗ Cancelled</span>
                )}
                {isDisabled && !stepExecution && !isExecuting && (
                  <span style={{ fontSize: '0.85rem', color: '#90a4ae' }}>⏸ Blocked by previous failure</span>
                )}
              </div>
            </div>
            {(stepExecution?.result || stepExecution?.errorMessage) && (
              <div className="step-message-container">
                {stepExecution?.result && (
                  <div className={`step-details ${stepExecution.result.success ? 'success' : 'error'}`}>
                    {stepExecution.result.success ? '✓ ' : '✗ '}
                    {parseMessage(stepExecution.result.message) ?? stepExecution.result.data?.status ?? 'Completed'}
                  </div>
                )}
                {stepExecution?.errorMessage && (
                  <div className="step-details error">
                    ✗ {stepExecution.errorMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    })
  }

  const executeStep = async (stepIndex: number, step: Step, response: ClassificationResponse, stepGroup: string, _skipApproval = false) => {
    const stepId = `${response.taskId}-${stepGroup}-${stepIndex}`
    setExecutingSteps(prev => new Set(prev).add(stepId))
    
    // Extract role from JWT token (decode the payload)
    // JWT format: header.payload.signature
    const jwtToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbmdpbmVlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IEVuZ2luZWVyIiwicm9sZXMiOlsicHJvZHVjdGlvbl9zdXBwb3J0Iiwic3VwcG9ydF9hZG1pbiJdLCJpYXQiOjE3NjI0NjYzNTksImV4cCI6MjA3NzgyNjM1OX0.v8amYkiJOS2dT9MQaZJBkdN-8rWrs-rfxqgVCtgTu3Q'
    const tokenParts = jwtToken.split(' ')
    const token = tokenParts.length > 1 ? tokenParts[1] : jwtToken
    
    let roleName = 'Production Support' // Default role name
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
        // Use the first role, converting snake_case to Title Case
        const role = payload.roles[0]
        roleName = role.split('_').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }
    } catch (e) {
      console.warn('Failed to parse JWT token for role extraction', e)
    }
    
    const stepRequest = {
      taskId: response.taskId,
      stepNumber: step.stepNumber,
      entities: response.extractedEntities,
      userId: 'ops-engineer-test',
      authToken: jwtToken,
      roleName: roleName
    }

    try {
      const apiResponse = await fetch('http://localhost:8093/api/v1/execute-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbmdpbmVlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IEVuZ2luZWVyIiwicm9sZXMiOlsicHJvZHVjdGlvbl9zdXBwb3J0Iiwic3VwcG9ydF9hZG1pbiJdLCJpYXQiOjE3NjI0NjYzNTksImV4cCI6MjA3NzgyNjM1OX0.v8amYkiJOS2dT9MQaZJBkdN-8rWrs-rfxqgVCtgTu3Q',
          'Role-Name': roleName
        },
        body: JSON.stringify(stepRequest)
      })

      if (!apiResponse.ok) {
        throw new Error(`Step execution failed: ${apiResponse.status}`)
      }

      const stepResponse = await apiResponse.json()
      
      // Parse response body to extract message if it's JSON
      let message = stepResponse.responseBody || 'Step completed'
      if (stepResponse.responseBody) {
        try {
          const parsed = JSON.parse(stepResponse.responseBody)
          if (typeof parsed === 'object' && parsed !== null && 'message' in parsed) {
            message = String(parsed.message)
          } else {
            message = stepResponse.responseBody
          }
        } catch {
          // Not JSON, use as is
          message = stepResponse.responseBody
        }
      }
      
      // Update step status - map backend response to UI format
      const stepExecution: StepExecution = {
        stepId: stepId,
        requestId: response.taskId,
        stepName: step.description,
        status: stepResponse.success ? 'COMPLETED' : 'FAILED',
        type: 'API_EXECUTION',
        requiresApproval: false,
        result: stepResponse.success ? {
          success: true,
          message: message,
          data: { statusCode: stepResponse.statusCode },
          statusCode: stepResponse.statusCode
        } : undefined,
        errorMessage: stepResponse.errorMessage
      }
      
      setSteps(prev => {
        const newMap = new Map(prev)
        newMap.set(stepId, stepExecution)
        return newMap
      })
      
      // If this step completed successfully, check if we should auto-execute the next step in same group
      if (stepResponse.success) {
        const currentGroup = response.steps?.[stepGroup as keyof StepGroups]
        if (currentGroup) {
          const nextStepIndex = stepIndex + 1
          const nextStep = currentGroup[nextStepIndex]
          
          // Only auto-execute next step if it exists and is auto-executable
          if (nextStep && nextStep.autoExecutable) {
            setTimeout(() => {
              executeStep(nextStepIndex, nextStep, response, stepGroup)
            }, 500)
          }
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
          requestId: response.taskId,
          stepName: step.description,
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

        {/* Task Selector (when classification is UNKNOWN) */}
        {showTaskSelector && availableTasks.length > 0 && (
          <div className="task-selector-container">
            <div className="task-selector">
              <h3>⚠️ I couldn't understand that. What would you like to do?</h3>
              <p className="original-query">Query: "{originalQuery}"</p>
              <div className="task-options">
                {availableTasks.map((task) => (
                  <div 
                    key={task.taskId} 
                    className="task-option"
                    onClick={() => handleTaskSelection(task.taskId)}
                  >
                    <div className="task-option-header">
                      <span className="task-option-icon">○</span>
                      <span className="task-option-name">{task.taskName}</span>
                    </div>
                    <div className="task-option-description">{task.description}</div>
                  </div>
                ))}
              </div>
              <button 
                className="task-selector-dismiss"
                onClick={() => setShowTaskSelector(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="response-container">
            <div className="response-sections-horizontal">
              <div className="response-section">
                <h3>Classification</h3>
                <div className="response-content">
                  <p><strong>Task ID:</strong> {response.taskId || 'N/A'}</p>
                  <p><strong>Task Name:</strong> {response.taskName || 'N/A'}</p>
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

            {response.warnings && response.warnings.length > 0 && (
              <div className="response-section">
                <h3>Warnings</h3>
                <div className="response-content">
                  {response.warnings.map((warning, idx) => (
                    <p key={idx} style={{ color: '#ff9800' }}>⚠️ {warning}</p>
                  ))}
                </div>
              </div>
            )}

            {response.steps && (
              <div className="response-section">
                <h3>Runbook Steps</h3>
                <div className="response-content">
                  {response.steps.prechecks && response.steps.prechecks.length > 0 && (
                    <div className="step-group">
                      <h4 className="step-group-header">Pre-checks</h4>
                      <div className="steps-container">
                        {renderStepGroup(response.steps.prechecks, response, 'prechecks')}
                      </div>
                    </div>
                  )}
                  
                  {response.steps.procedure && response.steps.procedure.length > 0 && (
                    <div className="step-group">
                      <h4 className="step-group-header">Procedure</h4>
                      <div className="steps-container">
                        {renderStepGroup(response.steps.procedure, response, 'procedure')}
                      </div>
                    </div>
                  )}
                  
                  {response.steps.postchecks && response.steps.postchecks.length > 0 && (
                    <div className="step-group">
                      <h4 className="step-group-header">Post-checks</h4>
                      <div className="steps-container">
                        {renderStepGroup(response.steps.postchecks, response, 'postchecks')}
                      </div>
                    </div>
                  )}
                  
                  {response.steps.rollback && response.steps.rollback.length > 0 && (
                    <div className="step-group">
                      <h4 className="step-group-header">Rollback</h4>
                      <div className="steps-container">
                        {renderStepGroup(response.steps.rollback, response, 'rollback')}
                      </div>
                    </div>
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

