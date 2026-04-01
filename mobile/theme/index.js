export const colors = {
  bg: "#F3EFE7",
  bgStrong: "#E7DFD3",
  surface: "#FFFDF9",
  surfaceSoft: "#F8F3EC",
  surfaceMuted: "#EFE7DA",
  text: "#1F1B18",
  subtext: "#786E62",
  primary: "#C96A2B",
  onPrimary: "#FFF9F3",
  primaryDark: "#9E4E19",
  primarySoft: "#F6E3D1",
  success: "#2E7D5A",
  successBg: "#DFF2E7",
  warning: "#AE6A1D",
  warningBg: "#F6E4C9",
  danger: "#B4442A",
  dangerBg: "#F6DAD3",
  neutralBg: "#ECE4D7",
  available: "#2E7D5A",
  border: "#E3D8C8",
  borderStrong: "#CDBDA8",
  inputBg: "#FFF9F3",
  shadow: "#26180E",
};

export const customerColors = {
  primary: "#FF6B2B",
  onPrimary: "#FFFFFF",
  bg: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#1A1A1A",
  subtext: "#888888",
  border: "#EEEEEE",
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  xxxl: 40,
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  lift: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
};

export const ACTIVE_STATUSES = ["pending", "preparing", "ready"];
