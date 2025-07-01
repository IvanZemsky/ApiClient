import { APIQueryClient } from "./client/client";

const client = new APIQueryClient({ baseURL: "https://jsonplaceholder.typicode.com" });

async function fetchTodo(todoId: number) {
    return await client.get(`todos/${todoId}`, {
        query: { include: "profile" },
    });
}

await fetchTodo(1);