// METHOD IS PRIVATE. CHANGE TO 'PUBLUC' BEFORE TESTING
// ABSOLUTELY DO NOT FORGET TO RETURN IN BACK TO 'PRIVATE'

// import { describe, it, expect } from 'vitest';
// import { APIQueryClient } from "../client";

// describe('getInputString', () => {
//   it('should return correct URL with baseURL and query params', () => {
//     const api = new APIQueryClient({baseURL: "https://api.example.com/"});
//     const result = api.getInputString('users', { page: '2', limit: '10' });

//     expect(result).toBe('https://api.example.com/users?page=2&limit=10');
//   });

//   it('should return correct URL without baseURL but with query params', () => {
//     const api = new APIQueryClient({baseURL: 'https://api.example.com/'});
//     const result = api.getInputString('data', { sort: 'asc' });

//     expect(result).toBe('https://api.example.com/data?sort=asc');
//   });

//   it('should return correct URL with baseURL and no query params', () => {
//     const api = new APIQueryClient({baseURL: "https://api.example.com/"});
//     const result = api.getInputString('posts');

//     expect(result).toBe('https://api.example.com/posts?');
//   });

//   it('should encode query params properly', () => {
//     const api = new APIQueryClient({baseURL: 'https://api.example.com/'});
//     const result = api.getInputString('search', { q: 'node.js & typescript' });

//     expect(result).toBe('https://api.example.com/search?q=node.js+%26+typescript');
//   });
// });