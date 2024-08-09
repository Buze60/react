import { useState } from "react";
import Alert from "./components/Alert";
import Button from "./components/Button";
function App() {
  const [alertVisible, setALertvissible] = useState(false);
  return (
    <div>
      {alertVisible && <Alert onClose={() =>setALertvissible(false)}>my Alert</Alert>}
      <Button color="primary" onClick={() => setALertvissible(true)}>
        MY BUTTON
      </Button>
    </div>
  );
}
export default App;
