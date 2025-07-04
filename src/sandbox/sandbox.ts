// TEST

import { QueryClient } from "../core/client";

const client = new QueryClient({
   baseURL: "https://jsonplaceholder.typicode.com",
   headers: {
      "Test-Header": "TEST_VALUE_A",
   },
});

client.interceptors.response.use(async (response) => {
   if (response.status === 200) {
      console.log("SUCCESS");
   }
});

client.interceptors.request.use(async (request) => {
   request.headers = { ...request.headers, Authorization: "Bearer token TEST" };
});

async function fetchTodo(todoId: number) {
   return await client.get(`todos/${todoId}`, {
      query: { include: "profile" },
      timeout: 500,
   });
}


async function fakePost() {
   return await client.post(`todos`, {
      body: { title: "test" },
      headers: {
         "Test-Header": "TEST_VALUE_B",
      },
   });
}

async function fetchTodo2(todoId: number) {
   return await client.get(`todos/${todoId}`, {
      query: { include: "profile" },
   });
}

async function main() {
    try {
        await fetchTodo(1);
    } catch (error) {
        console.error("Ошибка при выполнении fetchTodo:", error);
    }

    try {
        await fakePost();
    } catch (error) {
        console.error("Ошибка при выполнении fakePost:", error);
    }

    try {
        await fetchTodo2(2);
    } catch (error) {
        console.error("Ошибка при выполнении fetchTodo2:", error);
    }
}

main();