import { QueryInterceptors } from "./interceptors";
import type {
   QueryClientConfig,
   WithoutBody,
   QueryRequestFnOptions,
   QueryRequestInit,
   QueryParam,
   QueryHTTPMethod,
} from "./types";

export class QueryClient {
   private config: QueryClientConfig;

   public interceptors = {
      request: new QueryInterceptors<QueryRequestInit>(),
      response: new QueryInterceptors<Response>(),
   };

   constructor(config: QueryClientConfig) {
      this.config = {
         ...config,
         baseURL: this.formatBaseURL(config.baseURL),
      };
   }

   async get<T>(
      url: string,
      options: WithoutBody<QueryRequestFnOptions>
   ): Promise<T> {
      return this.request<T>("GET", url, options);
   }

   async post<T>(url: string, options: QueryRequestFnOptions): Promise<T> {
      return this.request<T>("POST", url, options);
   }

   async delete<T>(url: string, options: WithoutBody<QueryRequestFnOptions>) {
      return this.request<T>("DELETE", url, options);
   }

   async put<T>(url: string, options: QueryRequestFnOptions): Promise<T> {
      return this.request<T>("PUT", url, options);
   }

   async patch<T>(url: string, options: QueryRequestFnOptions): Promise<T> {
      return this.request<T>("PATCH", url, options);
   }

   async head<T>(url: string, options: WithoutBody<QueryRequestFnOptions>) {
      return this.request<T>("HEAD", url, options);
   }

   async options<T>(url: string, options: WithoutBody<QueryRequestFnOptions>) {
      return this.request<T>("OPTIONS", url, options);
   }

   async trace<T>(url: string, options: WithoutBody<QueryRequestFnOptions>) {
      return this.request<T>("TRACE", url, options);
   }

   async connect<T>(url: string, options: WithoutBody<QueryRequestFnOptions>) {
      return this.request<T>("CONNECT", url, options);
   }

   private async request<T>(
      method: QueryHTTPMethod,
      url: string,
      options: QueryRequestFnOptions
   ): Promise<T> {
      return this.queryFn<T>({
         ...options,
         input: url,
         method,
      });
   }

   private async queryFn<T>(initOptions: QueryRequestInit): Promise<T> {
      await this.interceptors.request.run(initOptions);

      const { input, ...options } = initOptions;

      const url = this.getInputString(input, options.query);
      const preparedOptions = this.prepareOptions(initOptions);
      const timeout = this.defineQueryTimeout(options.timeout);

      if (timeout) {
         const { signal, timeoutPromise } = this.createTimeoutPromise(timeout);
         preparedOptions.signal = signal;

         const fetchPromise = fetch(url, preparedOptions);
         return await this.timeoutRace<T>(fetchPromise, timeoutPromise);
      }

      const response = await fetch(url, preparedOptions);
      
      await this.interceptors.response.run(response);
      return response.json();
   }

   private async timeoutRace<T>(
      fetchPromise: Promise<Response>,
      timeoutPromise: Promise<any>
   ): Promise<T> {
      try {
         const response = await Promise.race([fetchPromise, timeoutPromise]);

         if (response instanceof Response) {
            await this.interceptors.response.run(response);
            return response.json();
         } else {
            throw new Error("aborted-by-timeout");
         }
      } catch (error: any) {
         this.handleAbortError(error);
         throw error;
      }
   }

   private prepareOptions(options: QueryRequestInit): RequestInit {
      const headers = this.defineQueryHeaders(options.headers);
      const body = options.body ? JSON.stringify(options.body) : undefined;

      return {
         ...this.config,
         ...options,
         credentials: this.config.withCredentials ? "include" : "same-origin",
         headers,
         body,
      };
   }

   private handleAbortError(error: any) {
      if (
         error.name === "AbortError" ||
         error.message === "aborted-by-timeout"
      ) {
         error.code = "aborted-by-timeout";
      }
   }

   private createTimeoutPromise(timeout: number): {
      signal: AbortSignal;
      timeoutPromise: Promise<any>;
   } {
      const controller = new AbortController();
      const signal = controller.signal;

      const timeoutPromise = new Promise((_, reject) => {
         setTimeout(() => {
            controller.abort("aborted-by-timeout");
            reject(new Error("aborted-by-timeout"));
         }, timeout);
      });

      return { signal, timeoutPromise };
   }

   private defineQueryHeaders(
      queryHeaders: HeadersInit | undefined
   ): HeadersInit {
      return {
         ...this.config.headers,
         ...queryHeaders,
      };
   }

   private defineQueryTimeout(
      queryTimeout: number | undefined
   ): number | undefined {
      return queryTimeout ? queryTimeout : this.config.timeout;
   }

   private getInputString(input: RequestInfo, query?: QueryParam): string {
      const searchParams = new URLSearchParams(query);
      return `${this.config.baseURL}${input}?${searchParams}`;
   }

   private formatBaseURL(baseURL?: string): string {
      if (!baseURL) {
         return "";
      }
      return baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
   }
}
