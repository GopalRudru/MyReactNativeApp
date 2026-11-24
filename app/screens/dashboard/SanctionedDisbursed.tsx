import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import WebView from 'react-native-webview';

interface SanctionedDisbursedProps {
  updateLoadingFlag: (flag: boolean) => void;
}

const SanctionedDisbursed = ({ updateLoadingFlag }: SanctionedDisbursedProps) => {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* <View style={styles.header}>
        <Text style={styles.headerText}>Flexi Term Loan</Text>
      </View> */}
      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: 'https://customerportal-sit2.avanse.com/apply-now' }}
          style={styles.webview}
          onLoadStart={() => updateLoadingFlag(true)}
          onLoadEnd={() => updateLoadingFlag(false)}
          onError={() => updateLoadingFlag(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </ScrollView>
  )
}

export default SanctionedDisbursed

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  webviewContainer: {
    flex: 1,
    minHeight: 600,
    marginHorizontal: 0,
  },
  webview: {
    flex: 1,
  },
})