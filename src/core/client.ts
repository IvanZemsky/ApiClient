import { QueryInterceptors } from "./interceptors"
import { RequestPreparer } from "./request-preparer"
import { RequestTimeout } from "./timeout"
import type {
  QueryClientConfig,
  WithoutBody,
  QueryRequestFnOptions,
  QueryRequestInit,
  QueryHTTPMethod,
} from "./types"

export class QueryClient {
  private config: QueryClientConfig
  private preparer: RequestPreparer

  public interceptors = {
    request: new QueryInterceptors<QueryRequestInit>(),
    response: new QueryInterceptors<Response>(),
  }

  constructor(config: QueryClientConfig) {
    this.config = {
      ...config,
      baseURL: this.formatBaseURL(config.baseURL),
    }

    this.preparer = new RequestPreparer(this.config)
  }

  async get<T>(url: string, options: WithoutBody<QueryRequestFnOptions>): Promise<T> {
    return this.request<T>("GET", url, options)
  }

  async post<T>(url: string, options: QueryRequestFnOptions): Promise<T> {
    return this.request<T>("POST", url, options)
  }

  async delete<T>(url: string, options: WithoutBody<QueryRequestFnOptions>) {
    return this.request<T>("DELETE", url, options)
  }

  async put<T>(url: string, options: QueryRequestFnOptions): Promise<T> {
    return this.request<T>("PUT", url, options)
  }

  async patch<T>(url: string, options: QueryRequestFnOptions): Promise<T> {
    return this.request<T>("PATCH", url, options)
  }

  async head<T>(url: string, options: WithoutBody<QueryRequestFnOptions>) {
    return this.request<T>("HEAD", url, options)
  }

  async options<T>(url: string, options: WithoutBody<QueryRequestFnOptions>) {
    return this.request<T>("OPTIONS", url, options)
  }

  async trace<T>(url: string, options: WithoutBody<QueryRequestFnOptions>) {
    return this.request<T>("TRACE", url, options)
  }

  async connect<T>(url: string, options: WithoutBody<QueryRequestFnOptions>) {
    return this.request<T>("CONNECT", url, options)
  }

  private async request<T>(
    method: QueryHTTPMethod,
    url: string,
    options: QueryRequestFnOptions,
  ): Promise<T> {
    return this.queryFn<T>({
      ...options,
      input: url,
      method,
    })
  }

  private async queryFn<T>(initOptions: QueryRequestInit): Promise<T> {
    await this.interceptors.request.run(initOptions)

    const [url, preparedOptions] = this.preparer.prepareRequest(initOptions)

    const queryTimeout = this.getQueryTimeout(initOptions.timeout)

    if (queryTimeout) {
      return await this.runWithTimeout<T>(url, preparedOptions, queryTimeout)
    }

    const response = await fetch(url, preparedOptions)

    await this.interceptors.response.run(response)
    return response.json()
  }

  private async runWithTimeout<T>(
    url: RequestInfo,
    preparedOptions: RequestInit,
    queryTimeout: number,
  ) {
    const timeout = new RequestTimeout({
      responseInterceptors: this.interceptors.response,
      timeout: queryTimeout,
    })

    return await timeout.runRequestWithTimeout<T>(url, preparedOptions)
  }

  private getQueryTimeout(queryTimeout: number | undefined): number | undefined {
    return queryTimeout || this.config.timeout
  }

  private formatBaseURL(baseURL?: string): string {
    if (!baseURL) {
      return ""
    }
    return baseURL.endsWith("/") ? baseURL : `${baseURL}/`
  }
}
