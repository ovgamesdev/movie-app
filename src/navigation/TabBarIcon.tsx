import { BookmarksIcon, HomeIcon, SearchIcon, SettingsIcon } from '@icons'
import { HomeTabParamList } from '@navigation'
import { RouteProp } from '@react-navigation/native'
import { SvgProps } from 'react-native-svg'

export const TabBarIcon = ({ route, ...props }: { route: RouteProp<HomeTabParamList, keyof HomeTabParamList> } & SvgProps) => {
	switch (route.name) {
		case 'Content':
			return <HomeIcon {...props} />
		case 'Settings':
			return <SettingsIcon {...props} />
		case 'Search':
			return <SearchIcon {...props} />
		case 'Bookmarks':
			return <BookmarksIcon {...props} />
	}
}
