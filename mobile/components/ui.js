import React from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { colors, radius, shadows, spacing } from "../theme";

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function PageHeader({ title, subtitle, eyebrow, action }) {
  return (
    <View style={styles.pageHeader}>
      {!!eyebrow && <Text style={styles.pageEyebrow}>{eyebrow}</Text>}
      <View style={styles.pageHeaderRow}>
        <View style={styles.pageHeaderMain}>
          <Text style={styles.pageTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
        </View>
        {action ? <View style={styles.pageAction}>{action}</View> : null}
      </View>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Heading({ children, style }) {
  return <Text style={[styles.heading, style]}>{children}</Text>;
}

export function SubText({ children, style, numberOfLines }) {
  return (
    <Text numberOfLines={numberOfLines} style={[styles.subText, style]}>
      {children}
    </Text>
  );
}

export function AppButton({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  loading = false,
  disabled = false,
}) {
  const variantStyle =
    variant === "soft"
      ? styles.buttonSoft
      : variant === "danger"
        ? styles.buttonDanger
        : variant === "success"
          ? styles.buttonSuccess
          : styles.buttonPrimary;
  const variantText =
    variant === "soft"
      ? styles.buttonTextSoft
      : variant === "danger"
        ? styles.buttonTextPrimary
        : styles.buttonTextPrimary;
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        isDisabled ? styles.buttonDisabled : null,
        pressed ? styles.buttonPressed : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "soft" ? colors.primary : colors.onPrimary} />
      ) : (
        <Text style={[styles.buttonText, variantText, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function AppInput(props) {
  return (
    <TextInput
      placeholderTextColor={colors.subtext}
      selectionColor={colors.primary}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>?</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

export function StatusBadge({ label, tone = "neutral" }) {
  const badgeTone =
    tone === "success"
      ? styles.badgeSuccess
      : tone === "danger"
        ? styles.badgeDanger
        : tone === "warning"
          ? styles.badgeWarning
          : styles.badgeNeutral;
  const textTone =
    tone === "success"
      ? styles.badgeTextSuccess
      : tone === "danger"
        ? styles.badgeTextDanger
        : tone === "warning"
          ? styles.badgeTextWarning
          : styles.badgeTextNeutral;
  return (
    <View style={[styles.badge, badgeTone]}>
      <Text style={[styles.badgeText, textTone]}>{label}</Text>
    </View>
  );
}

export function LoadingView({ label = "Loading..." }) {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export function SectionHeader({ title, action }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      {!!action && <Text style={styles.sectionHeaderAction}>{action}</Text>}
    </View>
  );
}

export function StatCard({ label, value, tone = "neutral", style }) {
  const toneStyle =
    tone === "primary"
      ? styles.statPrimary
      : tone === "success"
        ? styles.statSuccess
        : tone === "warning"
          ? styles.statWarning
          : styles.statNeutral;
  return (
    <View style={[styles.statCard, toneStyle, style]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function TableStatusChip({ label, status = "free" }) {
  const chipStyle =
    status === "bill"
      ? styles.tableBill
      : status === "occupied"
        ? styles.tableOccupied
        : styles.tableFree;
  const textStyle =
    status === "bill"
      ? styles.tableBillTxt
      : status === "occupied"
        ? styles.tableOccupiedTxt
        : styles.tableFreeTxt;
  return (
    <View style={[styles.tableChip, chipStyle]}>
      <Text style={[styles.tableChipText, textStyle]}>{label}</Text>
    </View>
  );
}

export function StickyActionBar({ children, style }) {
  return <View style={[styles.stickyActionBar, style]}>{children}</View>;
}

export function QuickActionCard({ title, subtitle, onPress, tone = "default" }) {
  const toneStyle = tone === "accent" ? styles.quickCardAccent : styles.quickCardDefault;
  const titleTone = tone === "accent" ? styles.quickCardTitleAccent : null;
  const subtitleTone = tone === "accent" ? styles.quickCardSubtitleAccent : null;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, toneStyle, pressed ? styles.quickCardPressed : null]}>
      <Text style={[styles.quickCardTitle, titleTone]}>{title}</Text>
      {!!subtitle && <Text style={[styles.quickCardSubtitle, subtitleTone]}>{subtitle}</Text>}
    </Pressable>
  );
}

export function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <View style={styles.cartRow}>
      <View style={styles.cartMain}>
        <Text style={styles.cartName}>{item.name}</Text>
        <Text style={styles.cartMeta}>Qty {item.qty}</Text>
      </View>
      <View style={styles.cartActions}>
        <Pressable onPress={onDecrease} style={styles.cartActionBtn}>
          <Text style={styles.cartActionTxt}>-</Text>
        </Pressable>
        <Pressable onPress={onIncrease} style={styles.cartActionBtn}>
          <Text style={styles.cartActionTxt}>+</Text>
        </Pressable>
        <Pressable onPress={onRemove} style={styles.cartRemoveBtn}>
          <Text style={styles.cartRemoveTxt}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  pageHeader: {
    marginBottom: spacing.md,
  },
  pageHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  pageHeaderMain: {
    flex: 1,
  },
  pageAction: {
    alignItems: "flex-end",
  },
  pageEyebrow: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  pageTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.text,
  },
  pageSubtitle: {
    marginTop: spacing.xs,
    color: colors.subtext,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card,
  },
  heading: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: colors.text,
  },
  subText: {
    color: colors.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    color: colors.text,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
  },
  button: {
    minHeight: 50,
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  buttonSoft: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  buttonTextPrimary: {
    color: colors.onPrimary,
  },
  buttonTextSoft: {
    color: colors.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  emptyWrap: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyIconText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "800",
    marginBottom: 4,
  },
  emptySubtitle: {
    color: colors.subtext,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 280,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  badgeSuccess: {
    backgroundColor: colors.successBg,
  },
  badgeDanger: {
    backgroundColor: colors.dangerBg,
  },
  badgeWarning: {
    backgroundColor: colors.warningBg,
  },
  badgeNeutral: {
    backgroundColor: colors.neutralBg,
  },
  badgeTextSuccess: {
    color: colors.success,
  },
  badgeTextDanger: {
    color: colors.danger,
  },
  badgeTextWarning: {
    color: colors.warning,
  },
  badgeTextNeutral: {
    color: colors.subtext,
  },
  loadingWrap: {
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.subtext,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.subtext,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionHeaderAction: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },
  statCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 98,
    justifyContent: "space-between",
    ...shadows.card,
  },
  statNeutral: {
    backgroundColor: colors.surface,
  },
  statPrimary: {
    backgroundColor: colors.primarySoft,
  },
  statSuccess: {
    backgroundColor: colors.successBg,
  },
  statWarning: {
    backgroundColor: colors.warningBg,
  },
  statLabel: {
    color: colors.subtext,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  statValue: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    marginTop: 10,
  },
  tableChip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  tableChipText: {
    fontSize: 11,
    fontWeight: "800",
  },
  tableFree: {
    backgroundColor: colors.neutralBg,
  },
  tableOccupied: {
    backgroundColor: colors.warningBg,
  },
  tableBill: {
    backgroundColor: colors.dangerBg,
  },
  tableFreeTxt: {
    color: colors.subtext,
  },
  tableOccupiedTxt: {
    color: colors.warning,
  },
  tableBillTxt: {
    color: colors.danger,
  },
  stickyActionBar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.sm,
    ...shadows.lift,
  },
  quickCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 116,
    justifyContent: "space-between",
    ...shadows.card,
  },
  quickCardDefault: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickCardAccent: {
    backgroundColor: colors.primary,
  },
  quickCardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  quickCardTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  quickCardTitleAccent: {
    color: colors.onPrimary,
  },
  quickCardSubtitle: {
    color: colors.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  quickCardSubtitleAccent: {
    color: "#FDEBDD",
  },
  cartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  cartMain: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  cartName: {
    color: colors.text,
    fontWeight: "800",
  },
  cartMeta: {
    color: colors.subtext,
    marginTop: 2,
  },
  cartActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  cartActionBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cartActionTxt: {
    color: colors.primaryDark,
    fontWeight: "900",
  },
  cartRemoveBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerBg,
  },
  cartRemoveTxt: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "800",
  },
});
