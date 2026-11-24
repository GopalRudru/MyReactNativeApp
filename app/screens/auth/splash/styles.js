import { StyleSheet } from "react-native";
import colors from "../../../res/colors";
import { scale } from "react-native-size-matters";

const styles = StyleSheet.create({
    containerViewStyle: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.white
      },
      logoStyle: {
        width: 200,
        height: 200,
      },
})

export default styles