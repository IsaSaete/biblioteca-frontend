import { Provider } from "react-redux";
import { RouterProvider } from "react-router/dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { router } from "./router/router";
import { store } from "./store/store";
import theme from "./theme/theme";

const App = () => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </Provider>
);

export default App;
