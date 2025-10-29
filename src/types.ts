export interface ClassificationResponse {
  request_id: string
  status: string
  timestamp: string
  input: {
    query: string
    environment: string
    user_id: string
  }
  classification: {
    use_case: string
    task_id: string | null
    confidence: number
    service: string
    environment: string
  }
  extracted_entities: {
    [key: string]: string | null
    case_id?: string
    order_id?: string
    service?: string
    target_status?: string
  }
  next_steps?: {
    description: string
    runbook: string
    api_spec: string
    typical_steps: string[]
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

