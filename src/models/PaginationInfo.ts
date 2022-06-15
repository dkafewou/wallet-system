export default class PaginationInfo {
  totalResults: number
  pages: number
  resultsPerPage: number
  currentPage: number

  constructor(totalResults: number, currentPage: number, maxResults: number) {
    this.totalResults = Number(totalResults)
    this.resultsPerPage = Number(maxResults)
    this.currentPage = Number(currentPage)
    this.pages = Math.ceil(totalResults / maxResults)
  }

  get [Symbol.toStringTag]() {
    return "PaginationInfo"
  }
}
