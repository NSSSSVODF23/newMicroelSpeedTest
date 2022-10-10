export interface PublicApiResponse<T> {
    isError?: boolean
    errorMessage?: string
    responseBody?: T
}
