import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [env, setEnv] = useState(null);
  useEffect(() => {
    (async () => {
      const response = await axios.get("http://k3s/api");
      setEnv(response.data);
    })();
  }, []);
  return <h1>{env ? env.HOSTNAME : null}</h1>;
}

export default App;
