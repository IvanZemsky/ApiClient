import { QueryInterceptors } from "./interceptors";
import type {
   QueryClientOptions,
   WithoutBody,
   QueryRequestFnOptions,
   QueryRequestInit,
   QueryParam,
   QueryHTTPMethod,
} from "./types";

export class QueryClient {
   private config: QueryClientOptions;

   public interceptors = {
      request: new QueryInterceptors<QueryRequestInit>(),
      response: new QueryInterceptors<Response>(),
   };

   constructor(options: QueryClientOptions) {
      this.config = {
         ...options,
         baseURL: this.formatBaseURL(options.baseURL),
         withCredentials: options.withCredentials,
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
      const body = options.body ? JSON.stringify(options.body) : undefined;

      const preparedOptions: RequestInit = {
         ...options,
         body,
         credentials: this.config.withCredentials ? "include" : "same-origin",
      };

      const response = await fetch(url, preparedOptions);
      await this.interceptors.response.run(response);

      return response.json();
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
