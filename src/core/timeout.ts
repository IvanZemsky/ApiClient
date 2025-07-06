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

  async runRequestWithTimeout<T>(url: RequestInfo, options: RequestInit): Promise<T> {
    const { timeoutId, signal, timeoutPromise } = this.createTimeoutPromise()
    const fetchPromise = this.createFetchTimeout<T>(url, { ...options, signal }, timeoutId)

    return await this.race<T>(fetchPromise, timeoutPromise)
  }

  private async createFetchTimeout<T>(
    url: RequestInfo,
    options: RequestInit,
    timeoutId: NodeJS.Timeout | undefined,
  ): Promise<T> {
    return fetch(url, options).then(async (response) => {
      clearTimeout(timeoutId)
      await this.responseInterceptors.run(response)
      return response.json() as T
    })
  }

  private createTimeoutPromise(): {
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

  private async race<T>(fetchPromise: Promise<T>, timeoutPromise: Promise<unknown>): Promise<T> {
    return (await Promise.race([fetchPromise, timeoutPromise])) as Promise<T>
  }
}
