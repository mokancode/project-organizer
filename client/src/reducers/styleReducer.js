import { TOGGLE_NEON_THEME, ANIMATE_CLOUD_ICON, IGNORE_NAVBAR_SHORTCUTS } from "../actions/types";

const initialState = {
  neonTheme: {
    isOn: false,
    animEnded: true,
  },
  animateCloudIcon: false,
  ignoreNavbarShortcuts: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case TOGGLE_NEON_THEME:
      return {
        ...state,
        neonTheme: action.payload,
      };
    case ANIMATE_CLOUD_ICON:
      return {
        ...state,
        animateCloudIcon: action.payload,
      };
    case IGNORE_NAVBAR_SHORTCUTS:
      return {
        ...state,
        ignoreNavbarShortcuts: action.payload,
      };
    default:
      return state;
  }
}
