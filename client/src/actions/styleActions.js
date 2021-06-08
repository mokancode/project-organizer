import { IGNORE_NAVBAR_SHORTCUTS, TOGGLE_NEON_THEME } from "./types";

// Toggle neon theme
export function toggleNeonTheme(isNeonThemeOn) {
  // console.log("neon theme ended: ", isNeonThemeOn.animEnded);

  return (dispatch) => {
    dispatch({
      type: TOGGLE_NEON_THEME,
      payload: isNeonThemeOn,
    });
  };
}

export function setIgnoreNavbarShortcuts(ignore) {
  return (dispatch) => {
    dispatch({
      type: IGNORE_NAVBAR_SHORTCUTS,
      payload: ignore,
    });
  };
}
