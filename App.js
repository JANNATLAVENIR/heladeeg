import React from 'react'
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Constants from 'expo-constants'
import { WebView } from 'react-native-webview'

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0]
const appUrl = process.env.EXPO_PUBLIC_WEB_URL || (expoHost ? `http://${expoHost}:3000` : null)

export default function App() {
  if (!appUrl) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" />
        <View style={styles.message}>
          <Text style={styles.title}>HelAdeeg lama xiriirin</Text>
          <Text style={styles.copy}>Xir app-ka oo kombiyuutarka ka bilow `npm run dev:expo`, ka dibna mar kale iska sawir QR code-ka.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <WebView
        source={{ uri: appUrl }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#0d9488" />
            <Text style={styles.loadingText}>HelAdeeg waa furmayaa…</Text>
          </View>
        )}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['http://*', 'https://*']}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  webview: { flex: 1, backgroundColor: '#f8fafc' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#f8fafc' },
  loadingText: { color: '#475569', fontSize: 15 },
  message: { flex: 1, padding: 28, justifyContent: 'center', gap: 12 },
  title: { color: '#0f172a', fontSize: 22, fontWeight: '700' },
  copy: { color: '#475569', fontSize: 16, lineHeight: 24 },
})
