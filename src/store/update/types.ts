export interface IOptions {
	apkVersionUrl: string
	fileProviderAuthority: string
}

export interface IRemote {
	versionCode: number
	versionName: string
	forceUpdate: boolean
	whatsNew: string
	apkUrl: string
	whatsNewOptions?: { title: string; options: { title: string }[] }[]
}

export interface IDownload {
	completed: boolean
	progress?: { received: number; total: number }
	error?: string
}
