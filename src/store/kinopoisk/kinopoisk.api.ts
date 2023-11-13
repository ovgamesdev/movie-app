import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ToastAndroid } from 'react-native'
import { RootState } from '../store'
import { IErrorResponse, IResponse, ISlug } from './types'

export const kinopoiskApi = createApi({
	reducerPath: 'api/kinopoisk',
	keepUnusedDataFor: 300,

	baseQuery: fetchBaseQuery({
		baseUrl: 'https://api.kinopoisk.dev/',
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).settings.settings.kinopoiskToken

			if (token.length > 0) {
				headers.set('X-API-KEY', token)
			}

			return headers
		},
		validateStatus: (response, body) => response.status === 200
	}),
	endpoints: build => ({
		getListBySlug: build.query<IResponse<ISlug>, string>({
			query: (slug: string, page = 1, limit = 250) => ({
				url: `v1.4/movie?page=1&limit=10&selectFields=id&selectFields=name&selectFields=enName&selectFields=alternativeName&selectFields=isSeries&selectFields=year&selectFields=releaseYears&selectFields=poster&lists=${slug}`
			}),
			transformErrorResponse: (response: { status: number; data: IErrorResponse }, meta, arg) => {
				switch (response.data.error) {
					case 'Unauthorized':
						ToastAndroid.show('KP: Токен указан некорректно!', ToastAndroid.LONG)
						return { ...response.data, message: 'KP: Токен указан некорректно!' }
					case 'Forbidden':
						ToastAndroid.show('KP: Превышен дневной лимит!', ToastAndroid.LONG)
						return { ...response.data, message: 'KP: Превышен дневной лимит!' }
					default:
						ToastAndroid.show('KP: Неизвестная ошибка', ToastAndroid.LONG)
						return response.data
				}
			},
			keepUnusedDataFor: 43200
		})
	})
})

export const { useGetListBySlugQuery } = kinopoiskApi
