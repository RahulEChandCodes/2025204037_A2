import { Canvas, painters, PuzzleValidator } from "headbreaker";
import headbreaker from "headbreaker";
import { useEffect } from "react";

function PuzzleCanvas({ id, image }) {
  useEffect(() => {
    const puzzle = document.getElementById(`${id}`);
    const img = new window.Image();
    img.src = image;
    img.onload = () => {
      const canvas = new Canvas(puzzle.id, {
        width: 400,
        height: 400,
        outline: new headbreaker.outline.Rounded(),
        painter: new painters.Konva(),
        image: img,
        pieceSize: 100,
        proximity: 20,
        borderFill: 10,
        preventOffstageDrag: true,
      });
      canvas.adjustImagesToPuzzleHeight();
      canvas.autogenerate({
        horizontalPiecesCount: 2,
        verticalPiecesCount: 2,
      });
      canvas.shuffle();
      canvas.draw();
      canvas.onConnect((_piece, figure, _target, targetFigure) => {
        // paint borders on click
        // of conecting and conected figures
        figure.shape.stroke("yellow");
        targetFigure.shape.stroke("yellow");
        canvas.redraw();

        setTimeout(() => {
          // restore border colors
          // later
          figure.shape.stroke("black");
          targetFigure.shape.stroke("black");
          canvas.redraw();
        }, 200);
      });
    };
  }, [image]);
  return <div id={id}></div>;
}

export default PuzzleCanvas;
