import { QueryError } from "./error"

export class RequestTimeout {
  private timeout: number

  constructor(timeout: number) {
    this.timeout = timeout
  }

  async runRequestWithTimeout(url: RequestInfo, options: RequestInit): Promise<Response> {
    const { timeoutId, signal, timeoutPromise } = this.createTimeoutPromise()
    const fetchPromise = this.createFetchTimeout(url, { ...options, signal }, timeoutId)

    return this.race(fetchPromise, timeoutPromise)
  }

  private async createFetchTimeout(
    url: RequestInfo,
    options: RequestInit,
    timeoutId: NodeJS.Timeout | undefined,
  ): Promise<Response> {
    return fetch(url, options).then(async (response) => {
      clearTimeout(timeoutId)
      return response
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

  private async race(
    fetchPromise: Promise<Response>,
    timeoutPromise: Promise<unknown>,
  ): Promise<Response> {
    return (await Promise.race([fetchPromise, timeoutPromise])) as Promise<Response>
  }
}
