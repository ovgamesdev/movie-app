import { BookmarksIcon, HomeIcon, NotificationsIcon, SearchIcon, SettingsIcon } from '@icons'
import { HomeTabParamList } from '@navigation'
import { RouteProp } from '@react-navigation/native'
import { FC } from 'react'
import { SvgProps } from 'react-native-svg'

interface Props extends SvgProps {
	route: RouteProp<HomeTabParamList, keyof HomeTabParamList>
}

export const TabBarIcon: FC<Props> = ({ route, ...props }) => {
	switch (route.name) {
		case 'Content':
			return <HomeIcon {...props} />
		case 'Settings':
			return <SettingsIcon {...props} />
		case 'Notices':
			return <NotificationsIcon {...props} />
		case 'Search':
			return <SearchIcon {...props} />
		case 'Bookmarks':
			return <BookmarksIcon {...props} />
	}
}
