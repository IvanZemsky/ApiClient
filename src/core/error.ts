export class QueryError extends Error {
    code?: string;
    constructor(message: string, code?: string) {
        super(message);
        this.name = "QueryError";
        this.code = code;
        // Set the prototype explicitly
        Object.setPrototypeOf(this, QueryError.prototype);
    }
}