import { MantineProvider } from "@mantine/core";
import "./App.css";
import { SocketProvider } from "./context/SocketContext";

function App() {
  <MantineProvider>
    <SocketProvider>
      <div className="App">
        <header className="App-header">
          <h1>CodeNames</h1>
        </header>
      </div>
    </SocketProvider>
  </MantineProvider>;
}

export default App;
