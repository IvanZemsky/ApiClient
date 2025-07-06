# Curry Query

A simple, lightweight open-source axios-like HTTP query client

### Getting started

##### Installation with npm:

```
npm i curry-query
```

##### Creating a client instance:

```
const client = new QueryClient({
 baseURL: "your://base.url",
})
```

##### Making a request:

```
// GET
async function fetchTodo(todoId: number) {
  return await client.get<Todo>(`todos/${todoId}`, {
    query: { include: "profile" },
    timeout: 5000,
  })
}
```
```
// POST
async function createTodo() {
  return await client.post<Todo>("todos", {
    body: { title: "test" },
  })
}
```

##### Adding interceptors

```
// Request
client.interceptors.request.use(async (request) => {
  request.headers = { ...request.headers, Authorization: "Bearer token ..." }
})
```

```
// Response
client.interceptors.response.use(async (response) => {
  if (response.status === 200) {
    console.log("success")
  }
})
```

#### Client Config:
```
type QueryClientConfig = {
  baseURL?: string
  withCredentials?: boolean
  headers?: HeadersInit
  timeout?: number
}
```
