import { useState } from "react";
import PuzzleCanvas from "./PuzzleCanvas";

function Puzzle() {
  const [fileURL, setFileURL] = useState("");

  const handleFileUploader = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFileURL(URL.createObjectURL(file));
    }
  };
  return (
    <div>
      <input type="file" onChange={handleFileUploader} accept="image/*" />
      <PuzzleCanvas id="puzzle" image={fileURL} />
    </div>
  );
}

export default Puzzle;
