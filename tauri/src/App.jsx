import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "./components/Logo.jsx";
import SearchForm from "./components/SearchForm.jsx";
import { Box, Container } from "@mui/material";

function App() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{ padding: { xs: 4, lg: 12, height: "100vh", width: "full" } }}
        >
          <Logo />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            rtl={false}
            draggable
            pauseOnHover
            theme="light"
            limit={3}
          />
          <SearchForm />
        </Box>
      </Box>
    </Container>
  );
}

export default App;
