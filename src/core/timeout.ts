import { QueryError } from "./error"
import type { QueryInterceptors } from "./interceptors"

type RequestTimeoutConfig = {
  timeout: number
  responseInterceptors: QueryInterceptors<Response>
}

export class RequestTimeout {
  private responseInterceptors: QueryInterceptors<Response>
  private timeout: number

  constructor(config: RequestTimeoutConfig) {
    this.responseInterceptors = config.responseInterceptors
    this.timeout = config.timeout
  }

  createPromise(): {
    timeoutId: NodeJS.Timeout | undefined
    timeoutPromise: Promise<unknown>
    signal: AbortSignal
  } {
    const controller = new AbortController()
    const signal = controller.signal

    let timeoutId: NodeJS.Timeout | undefined

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new QueryError(QueryError.ECONNABORTED, "Request timed out")
        controller.abort(error)
        reject(error)
      }, this.timeout)
    })

    return { timeoutId, signal, timeoutPromise }
  }

  async runRequestWithTimeout<T>(url: RequestInfo, options: RequestInit): Promise<T> {
    const { signal, timeoutPromise } = this.createPromise()
    const fetchPromise = fetch(url, { ...options, signal })
    
    return await this.race<T>(fetchPromise, timeoutPromise)
  }

  private async race<T>(
    fetchPromise: Promise<Response>,
    timeoutPromise: Promise<any>,
    timeoutId?: NodeJS.Timeout,
  ): Promise<T> {
    const response = await Promise.race<[Response, unknown]>([fetchPromise, timeoutPromise])

    if (response instanceof Response) {
      clearTimeout(timeoutId)
      await this.responseInterceptors.run(response)
      return response.json()
    } else {
      // REFACTOR
      throw new QueryError(QueryError.ECONNABORTED, "Request timed out")
    }
  }
}
