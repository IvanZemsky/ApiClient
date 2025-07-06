import type { QueryRequestInit } from "./types"

type QueryErrorCode = number | "ECONNABORTED"

export class QueryError extends Error {
  code?: QueryErrorCode
  config?: QueryRequestInit

  constructor(code?: QueryErrorCode, message?: string, config?: QueryRequestInit) {
    super(message)
    this.name = "QueryError"
    this.code = code
    this.config = config
  }

  static readonly ECONNABORTED = "ECONNABORTED"
}
