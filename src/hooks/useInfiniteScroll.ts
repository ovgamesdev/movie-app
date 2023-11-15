import { UseQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { useCallback, useEffect, useMemo, useState } from 'react'

const calculateMaxPages = (total: number, limit: number) => {
	return Math.ceil(total / limit)
}

const isValidNotEmptyArray = <T>(array: T[]): boolean => {
	return !!(array && array?.length && array?.length > 0)
}

export interface IListQueryResponse<T> {
	docs: T[]
	total: number
	page: number
	limit: number
}

// TODO types
export const useInfiniteScroll = <T>(useGetDataListQuery: UseQuery<any>, { limit = 10, ...queryParameters }) => {
	const [localPage, setLocalPage] = useState(1)
	const [data, setData] = useState<T[]>([])
	const queryResponse = useGetDataListQuery({ page: localPage, limit, ...queryParameters })

	const { docs: fetchData = [], page: remotePage = 1, total: remoteTotal = 0, limit: remoteLimit } = (queryResponse?.data as IListQueryResponse<T>) || {}

	useEffect(() => {
		if (isValidNotEmptyArray(fetchData)) {
			if (localPage === 1) setData(fetchData)
			else if (localPage === remotePage) {
				setData(previousData => [...previousData, ...fetchData])
			}
		}
	}, [fetchData])

	// TODO test in need useMemo
	const maxPages = useMemo<number>(() => calculateMaxPages(remoteTotal, remoteLimit), [remoteTotal, remoteLimit])

	// TODO test in need useCallback
	const refresh = useCallback(() => setLocalPage(1), [])

	const readMore = () => {
		if (localPage < maxPages && localPage === remotePage) {
			setLocalPage(page => page + 1)
		}
	}

	return { data, localPage, readMore, refresh, isLoading: queryResponse?.isLoading, isFetching: queryResponse?.isFetching }
}
