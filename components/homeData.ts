
export const modalDemos = [
  {
    title: "Your Family",
    description: "View and manage family members",
    route: "/(tabs)/(home)",
    color: "#4F46E5",
  },
  {
    title: "API Integration Demo",
    description: "Test all backend API endpoints",
    route: "/modal",
    color: "#007AFF",
  },
  {
    title: "Profile",
    description: "View your user profile",
    route: "/(tabs)/profile",
    color: "#10B981",
  },
  {
    title: "Onboarding Flow",
    description: "Language selection and auth options",
    route: "/language",
    color: "#FF6B35",
  },
  {
    title: "Form Sheet",
    description: "Bottom sheet with detents and grabber",
    route: "/formsheet",
    color: "#34C759",
  },
  {
    title: "Transparent Modal",
    description: "Overlay without obscuring background",
    route: "/transparent-modal",
    color: "#FF9500",
  }
];

export type ModalDemo = typeof modalDemos[0];
