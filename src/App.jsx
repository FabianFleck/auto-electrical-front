import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Olá mundo");

  return (
    <div>
      <h1>{message}</h1>
      <button
        onClick={() => {
          setMessage("Clicado");
        }}
      ></button>
    </div>
  );
}

export default App;
