import { createRoot } from "react-dom/client";
import Home from "./pages/Home.jsx"
import "./styles/style.css"

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
    <Home />
)
