import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, Image, Dimensions, TextInput, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import imagePath from '../constant/imagePath';
import colors from '../res/colors';
import fonts from '../res/fonts';
import { AstricString } from '../utils/helpers';
import strings from '../res/strings';
import AppConstants from '../constant/AppConstants';
import { s } from 'react-native-size-matters';
const { height, width } = Dimensions.get('window')
const documentOptions = [
  { label: 'Aadhar Card', value: 'aadhar' },
  { label: 'PAN Card', value: 'pan' },
  { label: 'Passport', value: 'passport' },
  { label: 'Passport1', value: 'passport1' },
  { label: 'Passport2', value: 'passport2' },
  { label: 'Passport3', value: 'passport3' },
];

interface UploadDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  isUploaded?: boolean;
  isViewOnly?: boolean;
  isPreview?: boolean;
  onUpload?: () => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ visible, onClose, isUploaded, isViewOnly, isPreview, onUpload }) => {
  const [documentType, setDocumentType] = React.useState(null);
  const [internalIsUploaded, setInternalIsUploaded] = React.useState(isUploaded);
  const [isPreviewVisible, setIsPreviewVisible] = React.useState(isPreview);

  const documentsList = [
    { id: '1', title: 'Visa Copy' },
    { id: '2', title: 'Demand Letter' },
    { id: '3', title: 'Forex Remittance 1' },
    { id: '4', title: 'Last Semester Result' },
  ];

  const previewDocument = () => {
    return (
      <View style={{ width: '100%', height: 500, }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={true}>
        <Image
          source={imagePath.splashLogo}
          style={styles.previewImage}
          resizeMode="contain"
        />
        </ScrollView>
      </View>
    )
  }

  const documentContent = () => {

    return (

      internalIsUploaded ?
        <View>
          {documentsList.map(({ id, title }) => (
            <View key={id} style={styles.borderContainer}>
              <View style={{ justifyContent: 'space-between' }}>
                <AstricString label={title} style={styles.titleStyle} />
                <Text style={styles.subTitleStyle}>
                  {strings.Upto_10_mb}
                </Text>
              </View>
              <View style={styles.eyeDeleteIconStyle}>
                <TouchableOpacity
                  activeOpacity={AppConstants.buttonActiveOpacity}
                  onPress={() => setIsPreviewVisible(true)}>
                  <Image
                    source={imagePath.eye}
                    style={[styles.plusIcon, { tintColor: colors.appThemeColor }]}
                  />
                </TouchableOpacity>
                {isViewOnly ? null : (
                  <TouchableOpacity activeOpacity={AppConstants.buttonActiveOpacity}>
                    <Image
                      source={imagePath.delete}
                      style={styles.plusIcon}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          {isViewOnly ? null :
            <Pressable
              style={styles.uploadSection}
              onPress={() => {
                
              }}>
              <Image source={imagePath.plus} />
              <Text style={styles.uploadText}>{strings.Add_New_Document}</Text>
            </Pressable>
          }
        </View>
        :
        <>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Document Name</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholder}
              selectedTextStyle={styles.selectedText}
              iconStyle={styles.iconStyle}
              data={documentOptions}
              labelField="label"
              valueField="value"
              placeholder=""
              value={documentType}
              onChange={item => setDocumentType(item.value)}
            />
            <AstricString label={strings.Other_Document_Name} style={{ ...styles.label, marginTop: 4 }} />
            <TextInput
              style={styles.dropdown}
              placeholder={strings.Enter_Other_Document_Name}
            />
          </View>
          <Pressable style={styles.uploadSection}>
            <Image source={imagePath.plus} />
            <Text style={styles.uploadText}>{strings.Upload_Document}</Text>
          </Pressable>
        </>
    )
  }

  return (

    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Image
              source={imagePath.cross}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
          {!isPreviewVisible && (
            <View style={{ marginLeft: 30, marginRight: 24 }}>
            <Text style={styles.title}>{isUploaded ? strings.Upload_Document : strings.Upload_New_Document}</Text>
            {documentContent()}
          </View>
          )}
          {isPreviewVisible && (
            <View style={{ marginHorizontal: 30, marginVertical: 24 }}>
              {previewDocument()}
            </View>
          )}
          
        </View>
      </View>
    </Modal>
  );
};

export default UploadDocumentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 20,
    width: width - 48,
    elevation: 10,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  title: {
    color: 'rgba(75, 70, 92, 0.9)',
    fontSize: 20,
    fontFamily: fonts.bold,
    marginBottom: 20,
    marginTop: 44,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 6,
    color: '#333',
  },
  dropdown: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  placeholder: {
    color: '#aaa',
  },
  selectedText: {
    color: '#000',
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  uploadSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 44,
    marginBottom: 24
  },
  uploadText: {
    color: colors.appThemeColor,
    marginLeft: 8,
    fontFamily: fonts.bold,
  },
  eyeDeleteIconStyle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  borderContainer: { paddingHorizontal: 16, paddingVertical: 12, marginTop: 16, borderWidth: 1, borderRadius: 12, borderColor: '#A8AAAE', flexDirection: 'row', justifyContent: 'space-between' },
  titleStyle: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.subHeaderTextColor },
  subTitleStyle: { fontSize: 12, fontFamily: fonts.regular, color: colors.subHeaderTextColor },
  plusIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: "contain",
  },
  previewImage:{ width: '100%', height: '100%', resizeMode: 'contain' }
});
