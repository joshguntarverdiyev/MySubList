import { ActionSheetIOS, Alert, Linking, Platform } from 'react-native'

interface MailApp {
  label: string
  url: string
}

// Detection needs each scheme declared in app.json > ios.infoPlist.LSApplicationQueriesSchemes.
const MAIL_APPS: MailApp[] = [
  { label: 'Apple Mail', url: 'message://' },
  { label: 'Gmail', url: 'googlegmail://' },
  { label: 'Outlook', url: 'ms-outlook://' },
  { label: 'Yahoo Mail', url: 'ymail://' },
]

const open = (app: MailApp) => Linking.openURL(app.url).catch(() => {})

/**
 * Let the user pick which mail app to open (Apple Mail / Gmail / Outlook / Yahoo).
 * Only installed apps are offered; opens directly if there's just one, and falls
 * back to the system mail composer if none are detected.
 */
export async function openMailApp(): Promise<void> {
  const installed: MailApp[] = []
  for (const app of MAIL_APPS) {
    try {
      if (await Linking.canOpenURL(app.url)) installed.push(app)
    } catch {
      // Scheme not queryable on this platform — skip it.
    }
  }

  if (installed.length === 0) {
    await Linking.openURL('mailto:').catch(() => {})
    return
  }
  if (installed.length === 1) {
    await open(installed[0])
    return
  }

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: 'Open Mail App',
        options: [...installed.map((a) => a.label), 'Cancel'],
        cancelButtonIndex: installed.length,
      },
      (i) => { if (i < installed.length) open(installed[i]) },
    )
  } else {
    Alert.alert('Open Mail App', undefined, [
      ...installed.map((a) => ({ text: a.label, onPress: () => open(a) })),
      { text: 'Cancel', style: 'cancel' },
    ])
  }
}
