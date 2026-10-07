/** Backend hamma javobni shu qobiq ichida qaytaradi (qubnix API bilan bir xil konvensiya). */
export interface ApiEnvelope<T> {
  statusCode: number;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
