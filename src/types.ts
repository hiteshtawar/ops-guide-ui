export interface ClassificationResponse {
  requestId: string
  status: string
  timestamp: string
  input: {
    query: string
    environment: string
    userId: string
  }
  classification: {
    useCase: string
    taskId: string
    confidence: number
    service: string
    environment: string
  }
  extractedEntities: {
    [key: string]: string | null
    entity_type?: string
    case_id?: string
    order_id?: string
    service?: string
    target_status?: string
  }
  nextSteps?: {
    description: string
    runbook: string
    apiSpec: string
    typicalSteps: string[]
  }
}

export interface ApiRequest {
  user_id: string
  query: string
  context: {
    reason: string
    priority: string
    requested_by: string
    timestamp: string
    [key: string]: unknown
  }
  environment: string
}

