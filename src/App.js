import "./App.css";
import r4 from "./images/r4.png";
import r5 from "./images/r5.png";
import r7 from "./images/r7.png";
import r31 from "./images/r31.png";
import r44 from "./images/r44.png";
import r45 from "./images/r45.png";
import r46 from "./images/r46.png";
import dexis from "./images/Dexis.png";
import { OpenCvProvider } from "opencv-react";
import { ImageControlsV5 } from "./imageControls/ImageControlsV5";

function App() {
  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "3em",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "2em",
      }}
    >
      <h style={{ fontSize: "30px" }}>Image Controls Prototype</h>
      <OpenCvProvider>
        {/* <ImageControlsV5 image={dexis} name={"dexis example"}/> */}

        <ImageControlsV5 image={r4} name={"r4"} />

        <ImageControlsV5 image={r5} name={"r5"} />

        <ImageControlsV5 image={r7} name={"r7"} />

        <ImageControlsV5 image={r31} name={"r31"} />

        <ImageControlsV5 image={r44} name={"r44"} />

        <ImageControlsV5 image={r45} name={"r45"} />

        <ImageControlsV5 image={r46} name={"r46"} />
      </OpenCvProvider>
    </div>
  );
}

export default App;
