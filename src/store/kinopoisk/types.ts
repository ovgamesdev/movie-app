interface IShortImage {
	url: string | null
	previewUrl: string | null
}

interface IYearRange {
	start?: number | null
	end?: number | null
}

export interface ISlug {
	id: number
	name?: string | null
	enName?: string | null
	year: number | null
	poster: IShortImage
	alternativeName: string | null
	isSeries: boolean
	releaseYears?: [IYearRange]
}

export interface ISuccessResponse<T> {
	docs: T[]
	total: number
	limit: number
	page: number
	pages: number
}

export interface IErrorResponse {
	statusCode: number
	message: string
	error: string
}

export type IResponse<T> = ISuccessResponse<T> & IErrorResponse
