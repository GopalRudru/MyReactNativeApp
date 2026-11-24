import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import imagePath from "../constant/imagePath";
import strings from "../res/strings";
import fonts from "../res/fonts";
import colors from "../res/colors";
interface RemarkHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

const RemarkHistory: React.FC<RemarkHistoryModalProps> = ({ visible, onClose }) => {

  const remarkList = [
    { id: '1', title: 'Visa Copy' },
    { id: '2', title: 'Demand Letter' },
    { id: '3', title: 'Forex Remittance 1' },
    { id: '4', title: 'Last Semester Result' },
  ];
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>
              {strings.Remark_History}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Image
                source={imagePath.cross}
                style={styles.crossIconStyle}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          {remarkList.map(({ id, title }) => (
            <View style={styles.contentContainer} key={id}>
              <View style={styles.fallbackImage}>
                <Text style={styles.fallbackText}>
                  {'Avatar Image'.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.title}>
                  Customer
                </Text>
                <Text style={styles.subTitle}>
                  {strings.Remark_History}
                </Text>
              </View>
              <Text style={styles.dateStyle}>
                23/05/2025
              </Text>
            </View>
          ))}
        </View>


      </View>
    </Modal>
  );
};

export default RemarkHistory;

const styles = StyleSheet.create({
  dateStyle:{ alignItems: 'flex-end', fontSize: 14, fontFamily: fonts.regular, color: colors.guidelinesTextColor },
  subTitle:{ fontSize: 14, fontFamily: fonts.regular, color: colors.subHeaderTextColor },
  title:{ fontSize: 16, fontFamily: fonts.bold, color: 'rgb(51, 51, 51)' },
  crossIconStyle:{ width: 24, height: 24 },
  contentContainer:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  titleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 64, },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 20,
    width: '90%',
    height: '60%',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
  },
  headerTitle: {
    position: 'absolute',
    left: 12,
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.appThemeColor,
  },
  fallbackImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: 'rgb(224, 247, 250)',
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: colors.appThemeColor,
    fontFamily: fonts.regular,
    fontSize: 20,
  },
})