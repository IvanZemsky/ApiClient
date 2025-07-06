import type { QueryClientConfig, QueryParam, QueryRequestInit } from "./types"

export class RequestPreparer {
  private config: QueryClientConfig

  constructor(config: QueryClientConfig) {
    this.config = config
  }

  prepareRequest(initOptions: QueryRequestInit): [RequestInfo, RequestInit] {
    return [
      this.getInputString(initOptions.input, initOptions.query),
      this.prepareOptions(initOptions),
    ]
  }

  protected prepareOptions(options: QueryRequestInit): RequestInit {
    const headers = this.defineHeaders(options.headers)
    const body = options.body ? JSON.stringify(options.body) : undefined

    return {
      ...this.config,
      ...options,
      credentials: this.config.withCredentials ? "include" : "same-origin",
      headers,
      body,
    }
  }

  private defineHeaders(queryHeaders: HeadersInit | undefined): HeadersInit {
    return {
      ...this.config.headers,
      ...queryHeaders,
    }
  }

  private getInputString(input: RequestInfo, query?: QueryParam): string {
    const base = `${this.config.baseURL}${input}`
    if (query) {
      const searchParams = new URLSearchParams(query)
      return `${base}?${searchParams}`
    }
    return base
  }
}
