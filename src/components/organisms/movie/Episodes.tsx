import { useTheme } from '@hooks'
import { useGetTvSeriesEpisodesQuery } from '@store/kinopoisk'
import { getNoun } from '@utils'
import React from 'react'
import { Text, View } from 'react-native'

type Props = {
	id: number
}

export const Episodes = ({ id: tvSeriesId }: Props) => {
	const { colors } = useTheme()

	const { data, isFetching } = useGetTvSeriesEpisodesQuery({ tvSeriesId })

	if (isFetching) {
		return (
			<View style={{ marginTop: 40, marginBottom: 2 }}>
				<View style={{ width: '60%', height: 22, marginTop: 5, backgroundColor: colors.bg200 }} />
				<View style={{ width: '30%', height: 12, marginTop: 15, backgroundColor: colors.bg200 }} />
				<View style={{ width: '30%', height: 12, marginTop: 15, backgroundColor: colors.bg200 }} />
			</View>
		)
	}

	if (!data) return null

	console.log('episodes data:', data)

	const episodeNumber = data.releasedEpisodes.items[0]?.number
	const seasonNumber = data.releasedEpisodes.items[0]?.season?.number

	const totalEpisodes = ['Всего %d эпизод', 'Всего %d эпизода', 'Всего %d эпизодов']
	const releasedEpisodes = ['Вышел %d эпизод', 'Вышло %d эпизода', 'Вышло %d эпизодов']
	const inSeason = ['в %d сезоне', 'во %d сезоне']

	return (
		<View style={{ marginTop: 40 }}>
			<Text style={{ color: colors.text100, fontSize: 22, fontWeight: '600', marginBottom: 9 }}>Список эпизодов</Text>
			{data.releasedEpisodes.items.length > 0 && (
				<Text style={{ fontSize: 15, fontWeight: '400', lineHeight: 20, color: colors.text200, marginBottom: 5 }}>
					{getNoun(episodeNumber, releasedEpisodes[0], releasedEpisodes[1], releasedEpisodes[2]).replace('%d', episodeNumber.toString())} {(seasonNumber === 2 ? inSeason[1] : inSeason[0]).replace('%d', seasonNumber.toString())}.
				</Text>
			)}
			<Text style={{ fontSize: 15, fontWeight: '400', lineHeight: 20, color: colors.text200 }}>{getNoun(data.episodesCount, totalEpisodes[0], totalEpisodes[1], totalEpisodes[2]).replace('%d', data.episodesCount.toString())}.</Text>
		</View>
	)
}
