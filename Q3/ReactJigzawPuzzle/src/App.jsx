import Puzzle from "./Puzzle";
import "./App.css";

function App() {
  ["click", "route"].forEach((eType) => {
    window.addEventListener(eType, (event) => {
      console.log({
        Timestamp_of_event: event.timeStamp,
        type_of_event: event.type,
        event_Object: event.target,
      });
    });
  });
  return (
    <>
      <Puzzle />
    </>
  );
}

export default App;
