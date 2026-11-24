import { SafeAreaView, ScrollView, View } from "react-native";
import DisbursementReview from "../../components/DisbursementFormTermDetails";
import Header from "../../components/common/Header";
import ListHeader from "../../components/ListHeader";
import CopyrightComponent from "../../components/common/CopyrightComponent";
import mainStyle from "../../res/mainStyles";
import * as NavigationService from "../../navigation/NavigationService";
import { useState } from "react";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";


const DisbursementDetail = () => {
  const [step, setStep] = useState(1);

  const handleBackPress = () => {
    NavigationService.goBack();
  };

  return (
    <SafeAreaView style={mainStyle.safeArea}>
      <Header
        backIconNeeded={"true"}
        showNotification={true}
        showProfile={true}
        onBackPress={handleBackPress}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ marginLeft: 8, marginTop: 24 }}>
          <ListHeader rightText={"Disbursement Details"} />
        </View>
        <DisbursementReview onConfirm={()=> setStep(2)}/>
        <CopyrightComponent />
      </ScrollView>
      <DialogStatusPopup />
    </SafeAreaView>
  )

}

export default DisbursementDetail;