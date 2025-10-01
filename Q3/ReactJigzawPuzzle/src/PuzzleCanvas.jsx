import { Canvas, painters } from "headbreaker";
import { useEffect } from "react";

function PuzzleCanvas({ id }) {
  useEffect(() => {
    const puzzle = document.getElementById(`${id}`);
    const canvas = new Canvas(puzzle.id, {
      width: 800,
      height: 650,
      pieceSize: 100,
      proximity: 20,
      borderFill: 10,
      strokeWidth: 2,
      lineSoftness: 0.18,
      painter: new painters.Konva(), // <-- this is important. See https://github.com/flbulgarelli/headbreaker/issues/51
    });

    canvas.autogenerate({
      horizontalPiecesCount: 2,
      verticalPiecesCount: 2,
      metadata: [
        { color: "#B83361" },
        { color: "#B87D32" },
        { color: "#A4C234" },
        { color: "#37AB8C" },
      ],
    });

    canvas.draw();
  }, []);
  return <div id={id}></div>;
}

export default PuzzleCanvas;
