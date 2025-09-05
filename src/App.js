import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hovedside from "./components/Hovedside";
import ForHyttegjester from "./Infoside/ForHyttegjester";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hovedside />} />
        <Route path="/trulsrudkollen" element={<ForHyttegjester />} />
      </Routes>
    </Router>
  );
}

export default App;
