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
    signal: AbortSignal
    timeoutPromise: Promise<unknown>
  } {
    const controller = new AbortController()
    const signal = controller.signal

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        controller.abort("aborted-by-timeout")
        reject(new Error("aborted-by-timeout"))
      }, this.timeout)
    })

    return { signal, timeoutPromise }
  }

  async runRequestWithTimeout<T>(url: RequestInfo, options: RequestInit): Promise<T> {
    const { signal, timeoutPromise } = this.createPromise()
    const fetchPromise = fetch(url, { ...options, signal })
    return await this.race<T>(fetchPromise, timeoutPromise)
  }

  private async race<T>(fetchPromise: Promise<Response>, timeoutPromise: Promise<any>): Promise<T> {
    try {
      const response = await Promise.race([fetchPromise, timeoutPromise])

      if (response instanceof Response) {
        await this.responseInterceptors.run(response)
        return response.json()
      } else {
        throw new Error("aborted-by-timeout")
      }
    } catch (error: any) {
      this.handleAbortError(error)
      throw error
    }
  }

  private handleAbortError(error: any) {
    if (error.name === "AbortError" || error.message === "aborted-by-timeout") {
      error.code = "aborted-by-timeout"
    }
  }
}
