import { SafeAreaView, View } from 'react-native'
import React from 'react'
import mainStyle from '../../res/mainStyles'
import { useRoute } from '@react-navigation/native';
import Header from './Header'
import * as NavigationService from "../../navigation/NavigationService"
import Pdf from 'react-native-pdf'
import { createModuleLogger } from '../../utils/logger'

const PdfScreen = () => {
    const route = useRoute();
    const { URL }: any = route.params || {};
    const logger = createModuleLogger("PdfScreen");
    logger.log(`PDF URL: ${URL}`);

    const handleBackPress = () => {
        NavigationService.goBack()
    }
    return (
        <SafeAreaView style={mainStyle.safeArea}>
            <Header
                onMenuPress={() => {}}
                onAvatarPress={() => {}}
                backIconNeeded={true}
                onBackPress={handleBackPress}
                showProfile={false}
                showNotification={false}
                onNotiIconPress={() => {}}
            />

            <View style={mainStyle.heightOnePx} />

            <Pdf
                trustAllCerts={false}
                source={{ uri: URL, cache: true }}
                onLoadComplete={(numberOfPages, filePath) => {
                    logger.log(`PDF loaded successfully: ${numberOfPages} pages`);
                }}
                onError={(error) => {
                    logger.error("PDF loading error:", error);
                }}
                style={{ flex: 1 }}
            />
        </SafeAreaView>
    )
}

export default PdfScreen