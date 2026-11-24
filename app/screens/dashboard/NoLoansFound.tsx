import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import fonts from "../../res/fonts";
import colors from "../../res/colors";
import Header from "../../components/common/Header";

interface NoLoansFoundProps {
  /** true when rendered inside DashboardScreen, which already provides a Header. */
  embedded?: boolean;
}

export default function NoLoansFound({ embedded = false }: NoLoansFoundProps) {
  const content = (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>No Loans</Text>

        <Text style={styles.subTitle}>
          Oops! You don’t have any loan.
        </Text>

        {/* Uncomment when needed */}
        {/*
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Apply for New Loan</Text>
        </TouchableOpacity>
        */}
      </View>
    </View>
  );

  if (embedded) {
    return content;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <Header
        onMenuPress={() => {}}
        onAvatarPress={() => {}}
        backIconNeeded={false}
        onBackPress={() => {}}
        onNotiIconPress={() => {}}
        setIsLoggedOut={() => {}}
      />
      {content}
    </SafeAreaView>
  );
};

//export default NoLoansFound;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    minHeight: 350,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 25,
    //fontWeight:600,
    color: "rgb(100,100,100)",
    fontFamily: fonts.semiBold
  },
  subTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "rgb(108,117,125)",
    marginTop: 8,
    marginBottom: 32,
    textAlign: "center",
    fontFamily: fonts.medium
  },
  button: {
    backgroundColor: "#00b3b5",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
