import { Button, ImageBackground, Input, InputType } from '@components/atoms'
import { ModalContainer, ModalType } from '@components/organisms'
import { useActions } from '@hooks'
import { navigation, RootStackParamList } from '@navigation'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MovieType } from '@store/kinopoisk'
import { FC, useRef, useState } from 'react'
import { ToastAndroid, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = NativeStackScreenProps<RootStackParamList, 'ChangeFilm'>

export const ChangeFilm: FC<Props> = ({
	route: {
		params: { data: item, other }
	}
}) => {
	const modalContainerRef = useRef<ModalType>(null)

	const refPoster = useRef<InputType>(null)
	const refYear = useRef<InputType>(null)

	const { styles, theme } = useStyles(stylesheet)

	const { addItemToSearchHistory } = useActions()

	const onClose = () => modalContainerRef.current?.close()

	const [title, setTitle] = useState<string>(other?.title ?? '')
	const [poster, setPoster] = useState<string | null>(other?.poster ?? null)
	const [type, setType] = useState<MovieType>(other?.type ?? 'Film')
	const [year, setYear] = useState<number | null>(other?.year ?? null)

	const [isTitleSuccess, setIsTitleSuccess] = useState<boolean>(false)
	const [isPosterSuccess, setIsPosterSuccess] = useState<boolean>(true)
	const [isYearSuccess, setIsYearSuccess] = useState<boolean>(true)

	// console.log('data:', { title, poster, type, year })
	// console.log('data validation:', { isTitleSuccess, isPosterSuccess, isYearSuccess })

	return (
		<ModalContainer ref={modalContainerRef}>
			<View style={styles.container}>
				<View style={styles.header} />

				<View style={styles.buttonContainer}>
					<Input defaultValue={title} onChangeText={text => (setTitle(text), setIsTitleSuccess(text.length > 0))} placeholder='Введите название фильма..' onSubmitEditing={() => refPoster.current?.focus()} returnKeyType='next' submitBehavior='submit' />
					<View style={{ flexDirection: 'row', gap: 5 }}>
						<Input
							ref={refPoster}
							value={poster ?? ''}
							onChangeText={text => {
								setPoster(text)

								if (text.length === 0) {
									setIsPosterSuccess(true)
								} else if (!(text.startsWith('http://') || text.startsWith('https://'))) {
									setIsPosterSuccess(false)
								}
							}}
							placeholder='Ссылка на постер https://..'
							flex={1}
							onSubmitEditing={() => refYear.current?.focus()}
							returnKeyType='next'
							submitBehavior='submit'
						/>
						{poster !== null && poster.length !== 0 && (poster.startsWith('http://') || poster.startsWith('https://')) && (
							<ImageBackground
								source={{ uri: poster }}
								style={{ height: 46, aspectRatio: 3 / 4 }}
								resizeMethod='resize'
								resizeMode='center'
								onError={() => {
									setIsPosterSuccess(false)
									console.log('ImageBackground error', poster)
								}}
								onLoad={() => {
									setIsPosterSuccess(true)
									console.log('ImageBackground load', poster)
								}}
							/>
						)}
					</View>
					<Input
						ref={refYear}
						value={year === null ? '' : String(year)}
						onChangeText={text => {
							const isNull = isNaN(Number(text)) || text.length === 0

							if (isNull) {
								setYear(null)
								setIsYearSuccess(true)
								return
							}

							setYear(Number(text))
							setIsYearSuccess(text.length === 4 && Number(text) > 0)
						}}
						placeholder='Год выхода'
						keyboardType='numeric'
						onSubmitEditing={async e => console.log(e.nativeEvent.text)}
					/>
					<View style={{ flexDirection: 'row', gap: 5 }}>
						<Button isActive={type === 'Film'} text='Фильм' flex={1} onPress={() => setType('Film')} textColor={theme.colors.text200} activeTextColor={theme.colors.primary300} buttonColor={theme.colors.bg200} activeButtonColor={theme.colors.primary100} activePressedButtonColor={theme.getColorForTheme({ dark: 'primary200', light: 'text200' })} />
						<Button isActive={type === 'TvSeries'} text='Сериал' flex={1} onPress={() => setType('TvSeries')} textColor={theme.colors.text200} activeTextColor={theme.colors.primary300} buttonColor={theme.colors.bg200} activeButtonColor={theme.colors.primary100} activePressedButtonColor={theme.getColorForTheme({ dark: 'primary200', light: 'text200' })} />
					</View>
				</View>

				<View style={{ height: 10 }} />

				<View style={styles.buttonContainer}>
					<View style={{ height: 1 }} />
					<Button
						text='Открыть'
						onPress={() => {
							if (!isTitleSuccess) {
								ToastAndroid.show(`Некорректное название`, ToastAndroid.SHORT)
								return
							}
							if (!isPosterSuccess) {
								ToastAndroid.show(`Некорректный постер`, ToastAndroid.SHORT)
								return
							}
							if (!isYearSuccess) {
								ToastAndroid.show(`Некорректный год`, ToastAndroid.SHORT)
								return
							}

							addItemToSearchHistory({ id: item.id, title, poster, type, year })
							navigation.replace('Movie', { data: { id: item.id, type }, other: { title, poster, year } })
						}}
					/>
					<Button
						text='Закрыть'
						onPress={() => {
							onClose()
						}}
					/>
				</View>
			</View>
		</ModalContainer>
	)
}

const stylesheet = createStyleSheet(theme => ({
	modal: {
		justifyContent: 'flex-end',
		margin: 0,
		padding: 0
	},
	container: {
		backgroundColor: theme.colors.bg100,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 10,
		paddingTop: 0,
		paddingBottom: 35
	},
	header: {
		backgroundColor: theme.colors.bg300,
		width: 30,
		height: 4,
		margin: 6,
		alignSelf: 'center',
		borderRadius: 10
	},
	title: {
		color: theme.colors.text100,
		fontSize: 16,
		fontWeight: '700',
		paddingTop: 5
	},
	detailText: {
		color: theme.colors.text200,
		paddingTop: 5
	},
	buttonContainer: {
		// flexDirection: 'row',
		gap: 10
	}
}))
