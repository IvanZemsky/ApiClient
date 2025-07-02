// TEST

import { QueryClient } from "./client/client";

const client = new QueryClient({
   baseURL: "https://jsonplaceholder.typicode.com",
});

client.interceptors.response.add(async (response) => {
   if (response.status === 200) {
      console.log("SUCCESS");
   }
});

client.interceptors.request.add(async (request) => {
   request.headers = { ...request.headers, Authorization: "Bearer token TEST" };
});

async function fetchTodo(todoId: number) {
   return await client.get(`todos/${todoId}`, {
      query: { include: "profile" },
   });
}

await fetchTodo(1);

async function fakePost() {
   return await client.post(`todos`, {body: {title: "test"}});
}

await fakePost();
