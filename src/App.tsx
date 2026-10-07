import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "./chakra-system";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <ChakraProvider value={system}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ChakraProvider>
  );
}
