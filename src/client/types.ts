export type QueryClientConfig = {
   baseURL?: string;
   withCredentials?: boolean;
};

export type QueryRequestInit = Omit<RequestInit, "body"> & {
   method: QueryHTTPMethod;
   input: RequestInfo;
   body?: Record<string, JSONifiable>;
   query?: QueryParam;
};

export type QueryHTTPMethod =
   | "GET"
   | "POST"
   | "DELETE"
   | "PUT"
   | "PATCH"
   | "HEAD"
   | "OPTIONS"
   | "TRACE"
   | "CONNECT";

export type WithoutBody<T> = Omit<T, "body">;

type JSONifiable =
   | string
   | number
   | boolean
   | null
   | { [key: string]: JSONifiable }
   | JSONifiable[];

export type QueryRequestFnOptions = Omit<QueryRequestInit, "input" | "method">;

export type QueryParam = Record<string, string>;
