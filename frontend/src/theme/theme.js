import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
    secondary: { main: "#00e676" },
    error: { main: "#ff1744" },
    background: {
      default: "#0f172a",
      paper: "#1e293b"
    }
  },
  typography: {
    fontFamily: "Poppins, sans-serif"
  }
});

export default theme;