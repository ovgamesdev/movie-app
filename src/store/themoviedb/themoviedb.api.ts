import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ToastAndroid } from 'react-native'
import Config from 'react-native-config'

interface IMovieTMDBBase {
	id: number
	backdrop_path: string | null
	poster_path: string | null
}

interface IMovieTMDBMovie extends IMovieTMDBBase {
	title: string
	original_title: string
	media_type: 'movie'
	release_date: string
}
interface IMovieTMDBTv extends IMovieTMDBBase {
	name: string
	original_name: string
	media_type: 'tv'
	first_air_date: string
}
type IMovieTMDBResults = IMovieTMDBMovie | IMovieTMDBTv

export interface IMovieTMDBDataResults {
	name: string
	overview: string
	poster_path: string
	season_number: number
	vote_average: number
	number_of_episodes: number
	number_of_seasons: number
	seasons: {
		air_date: string
		episode_count: number
		id: number
		name: string
		overview: string
		poster_path: string
		season_number: number
		vote_average: number
	}[]
}
interface IMovieTMDBSeasonResults {
	_id: string
	air_date: string
	name: string
	overview: string
	poster_path: string
	season_number: number
	vote_average: number
	episodes: {
		air_date: string
		episode_number: number
		episode_type: string
		id: number
		name: string
		overview: string
		production_code: string
		runtime: number
		season_number: number
		show_id: number
		still_path: string
		vote_average: number
		vote_count: number
		crew: any[]
		guest_stars: any[]
	}[]
}

export const getTMDBPosterImage = (image: string) => {
	return `https://image.tmdb.org/t/p/w220_and_h330_face${image}`
}

export const themoviedbApi = createApi({
	reducerPath: 'api/themoviedb',
	refetchOnFocus: true,

	baseQuery: fetchBaseQuery({
		baseUrl: 'https://api.themoviedb.org/3/',
		validateStatus: (response, body) => {
			// if (!(body.data?.movieListBySlug?.movies?.items?.length > 0) && body.errors?.length > 0) {
			// 	return false
			// }

			return response.status === 200
		}
	}),
	endpoints: build => ({
		getMovieById: build.query<IMovieTMDBResults, { id: string }>({
			query: ({ id }) => ({
				url: `find/${id}?external_source=imdb_id&language=ru-RU&api_key=${Config.THEMOVIEDB_TOKEN}`,
				method: 'get'
			}),
			transformResponse: (response, meta, arg) => {
				const data = (response as any)?.tv_results?.[0] ?? (response as any)?.movie_results?.[0]

				return data ?? null
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('TMDB: Неизвестная ошибка', ToastAndroid.LONG)
			}
		}),
		getMovieDataById: build.query<IMovieTMDBDataResults, { id: string; season?: number }>({
			query: ({ id, season }) => ({
				url: `tv/${id}?external_source=imdb_id&language=ru-RU&api_key=${Config.THEMOVIEDB_TOKEN}${typeof season === 'number' ? `&append_to_response=season/${season}` : ''}`,
				method: 'get'
			}),
			transformResponse: (response, meta, arg) => {
				// const data = (response as any)?.tv_results?.[0] ?? (response as any)?.movie_results?.[0]

				return (response as any) ?? null
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('TMDB: Неизвестная ошибка', ToastAndroid.LONG)
			}
		}),
		getMovieSeasonById: build.query<IMovieTMDBSeasonResults, { id: string; season: number }>({
			query: ({ id, season }) => ({
				url: `tv/${id}/season/${season}?external_source=imdb_id&language=ru-RU&api_key=${Config.THEMOVIEDB_TOKEN}`,
				method: 'get'
			}),
			transformResponse: (response, meta, arg) => {
				// const data = (response as any)?.tv_results?.[0] ?? (response as any)?.movie_results?.[0]

				return (response as any) ?? null
			},
			transformErrorResponse: (response, meta, arg) => {
				console.log('transformErrorResponse', { response, meta, arg })

				ToastAndroid.show('TMDB: Неизвестная ошибка', ToastAndroid.LONG)
			}
		})
	})
})

export const { useGetMovieByIdQuery, useGetMovieDataByIdQuery, useGetMovieSeasonByIdQuery } = themoviedbApi
