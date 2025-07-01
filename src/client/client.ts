export class APIQueryClient {
   private baseURL?: string;

   constructor(options: QueryClientOptions) {
      this.baseURL = this.formatBaseURL(options.baseURL);
   }

   async get<T>(
      url: string,
      options: WithoutBody<QueryRequestFnOptions>
   ): Promise<T> {
      return await this.queryFn<T>({
         ...options,
         input: url,
         method: "GET",
      });
   }

   async post<T>(url: string, options: QueryRequestFnOptions): Promise<T> {
      return await this.queryFn<T>({
         ...options,
         input: url,
         method: "POST",
      });
   }

   private async queryFn<T>(initOptions: QueryRequestInit): Promise<T> {
      const { input, ...options } = initOptions;

      const url = this.getInputString(input, options.query);
      const body = options.body ? JSON.stringify(options.body) : undefined;

      const preparedOptions = {
         ...options,
         body,
      };

      const response = await fetch(url, preparedOptions);

      return response.json();
   }

   private getInputString(input: RequestInfo, query?: QueryParam): string {
      const searchParams = new URLSearchParams(query);

      return `${this.baseURL}${input}?${searchParams}`;
   }

   private formatBaseURL(baseURL?: string): string {
      if (!baseURL) {
         return "";
      }
      return baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
   }
}

type QueryClientOptions = {
   baseURL?: string;
};

type QueryRequestInit = Omit<RequestInit, "body"> & {
   method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
   input: RequestInfo;
   body?: Record<string, JSONifiable>;
   query?: QueryParam;
};

type WithoutBody<T> = Omit<T, "body">;

type JSONifiable =
   | string
   | number
   | boolean
   | null
   | { [key: string]: JSONifiable }
   | JSONifiable[];

type QueryRequestFnOptions = Omit<QueryRequestInit, "input" | "method">;

type QueryParam = Record<string, string>;
