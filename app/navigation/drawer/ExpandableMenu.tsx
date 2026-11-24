import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import imagePath from "../../constant/imagePath";
import colors from "../../res/colors";
import fonts from "../../res/fonts";
import AppConstants from "../../constant/AppConstants";
import { DrawerMenuItem, DrawerMenuSection } from "./drawerMenuConfig";

interface ExpandableMenuProps {
  sections: DrawerMenuSection[];
  expandedSectionId: string | null;
  activeItemId: string | null;
  onSectionPress: (section: DrawerMenuSection) => void;
  onItemPress: (item: DrawerMenuItem) => void;
}

export default function ExpandableMenu({
  sections,
  expandedSectionId,
  activeItemId,
  onSectionPress,
  onItemPress,
}: ExpandableMenuProps) {
  const renderItem = (item: DrawerMenuItem, isLast: boolean) => {
    const isActive = item.id === activeItemId;
    const tintColor = isActive
      ? colors.appThemeColor
      : colors.leftNavBarNameColor;

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onItemPress(item)}
        activeOpacity={AppConstants.textActiveOpacity}
        style={[
          styles.itemRow,
          isLast && styles.lastItemRow,
          isActive && styles.activeItemRow,
        ]}
      >
        <View style={styles.labelRow}>
          <Image source={item.icon} style={{ tintColor }} />
          <Text style={[styles.itemText, { color: tintColor }]}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {sections
      .filter((sections) =>sections.drawerMenuSectionVisible!=false)
      .map((section) => {
        const isExpanded = section.id === expandedSectionId;
        const hasChildren = section.items.length > 0;
        const tintColor = isExpanded
          ? colors.appThemeColor
          : colors.leftNavBarNameColor;

        return (
          <View key={section.id}>
            <TouchableOpacity
              onPress={() => onSectionPress(section)}
              activeOpacity={AppConstants.textActiveOpacity}
              style={[
                styles.sectionRow,
                isExpanded && hasChildren && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.labelRow}>
                <Image source={section.icon} style={{ tintColor }} />
                <Text style={[styles.sectionText, { color: tintColor }]}>
                  {section.title}
                </Text>
              </View>
              {hasChildren && (
                <Image
                  source={
                    isExpanded
                      ? imagePath.leftNavUpArrow
                      : imagePath.leftNavDownArrow
                  }
                />
              )}
            </TouchableOpacity>
            {isExpanded && hasChildren && (
              <View style={styles.subMenu}>
                {section.items
                  .filter((item) => item.drawerMenuItemVisible !== false)
                  .map((item, index, visibleItems) =>
                    renderItem(item, index === visibleItems.length - 1),
                  )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(238, 238, 242, 1)",
  },
  sectionText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    fontWeight: "400",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  subMenu: {
    backgroundColor: colors.white,
  },
  itemRow: {
    paddingLeft: 50,
    paddingVertical: 12,
  },
  lastItemRow: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(238, 238, 242, 1)",
  },
  activeItemRow: {
    backgroundColor: "rgba(224, 224, 224, .5)",
  },
  itemText: {
    fontSize: 14,
  },
});
