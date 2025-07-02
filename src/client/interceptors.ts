export class QueryInterceptors<T> {
   private interceptors: Interceptor<T>[] = [];

   add(interceptor: (param: T) => Promise<void>) {
      this.interceptors.push(interceptor);
   }

   async run(param: T) {
      for (const interceptor of this.interceptors) {
         await interceptor(param);
      }
   }
}

type Interceptor<T> = (param: T) => Promise<void>
