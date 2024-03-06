import { Button } from '@components/atoms'
import { NavigateNextIcon } from '@icons'
import { useGetTvSeriesEpisodesQuery } from '@store/kinopoisk'
import { getNoun } from '@utils'
import type { FC } from 'react'
import { Platform, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
	id: number
	onPress: () => void
	disabled: boolean
}

export const Episodes: FC<Props> = ({ id: tvSeriesId, onPress, disabled }) => {
	const { styles, theme } = useStyles(stylesheet)

	const { data, isFetching, isError } = useGetTvSeriesEpisodesQuery({ tvSeriesId })

	if (isFetching) {
		return (
			<View style={styles.loading}>
				<View style={styles.loadingLine1} />
				<View style={styles.loadingLine2} />
				<View style={styles.loadingLine3} />
			</View>
		)
	}

	if (!data?.releasedEpisodes) return null

	const episodeNumber = data.releasedEpisodes.items[0]?.number
	const seasonNumber = data.releasedEpisodes.items[0]?.season?.number

	const totalEpisodes = ['Всего %d эпизод', 'Всего %d эпизода', 'Всего %d эпизодов']
	const releasedEpisodes = ['Вышел %d эпизод', 'Вышло %d эпизода', 'Вышло %d эпизодов']
	const inSeason = ['в %d сезоне', 'во %d сезоне']

	return (
		<View style={styles.container}>
			<Button focusable={!disabled} disabled={disabled} animation='scale' transparent flexDirection='row' padding={0} onPress={onPress}>
				<Text style={styles.title}>Список эпизодов</Text>
				{!Platform.isTV && !disabled && <NavigateNextIcon width={32} height={32} fill={theme.colors.text100} style={styles.buttonIcon} />}
			</Button>

			{data.releasedEpisodes.items.length > 0 && (
				<Text style={styles.details1}>
					{getNoun(episodeNumber, releasedEpisodes[0], releasedEpisodes[1], releasedEpisodes[2]).replace('%d', episodeNumber.toString())} {(seasonNumber === 2 ? inSeason[1] : inSeason[0]).replace('%d', seasonNumber.toString())}.
				</Text>
			)}
			<Text style={styles.details2}>{getNoun(data.episodesCount, totalEpisodes[0], totalEpisodes[1], totalEpisodes[2]).replace('%d', data.episodesCount.toString())}.</Text>
		</View>
	)
}

const stylesheet = createStyleSheet(theme => ({
	button: {
		color: theme.colors.text100,
		fontSize: 22,
		fontWeight: '600',
		marginBottom: 9
	},
	buttonIcon: {
		marginLeft: 3,
		transform: [{ translateY: -3 }]
	},
	//
	loading: {
		marginTop: 40,
		marginBottom: 2
	},
	loadingLine1: {
		width: '60%',
		height: 22,
		marginTop: 5,
		backgroundColor: theme.colors.bg200
	},
	loadingLine2: {
		width: '30%',
		height: 12,
		marginTop: 15,
		backgroundColor: theme.colors.bg200
	},
	loadingLine3: {
		width: '30%',
		height: 12,
		marginTop: 15,
		backgroundColor: theme.colors.bg200
	},
	container: {
		marginTop: 40
	},
	title: {
		color: theme.colors.text100,
		fontSize: 22,
		fontWeight: '600',
		margin: -3,
		marginBottom: 6
	},
	details1: {
		fontSize: 15,
		fontWeight: '400',
		lineHeight: 20,
		color: theme.colors.text200,
		marginBottom: 5
	},
	details2: {
		fontSize: 15,
		fontWeight: '400',
		lineHeight: 20,
		color: theme.colors.text200
	}
}))
