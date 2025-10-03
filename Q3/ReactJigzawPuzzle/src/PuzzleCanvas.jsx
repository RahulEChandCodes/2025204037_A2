import { Canvas, painters, PuzzleValidator } from "headbreaker";
import headbreaker from "headbreaker";
import { useEffect } from "react";
import { Card, Typography, Spin } from "antd";

const { Title } = Typography;

function PuzzleCanvas({ id, image, difficulty }) {
  // Calculate puzzle dimensions based on difficulty
  const getPuzzleConfig = (totalPieces) => {
    let horizontalCount, verticalCount, canvasSize, pieceSize;

    switch (totalPieces) {
      case 5:
        // 2x2 + 1 piece arrangement (approximately 5 pieces)
        horizontalCount = 2;
        verticalCount = 2;
        canvasSize = 300;
        pieceSize = 150;
        break;
      case 20:
        // 4x5 = 20 pieces
        horizontalCount = 4;
        verticalCount = 5;
        canvasSize = 400;
        pieceSize = 100;
        break;
      case 40:
        // 5x8 = 40 pieces
        horizontalCount = 5;
        verticalCount = 8;
        canvasSize = 500;
        pieceSize = 100;
        break;
      case 80:
        // 8x10 = 80 pieces
        horizontalCount = 8;
        verticalCount = 10;
        canvasSize = 600;
        pieceSize = 75;
        break;
      case 100:
        // 10x10 = 100 pieces
        horizontalCount = 10;
        verticalCount = 10;
        canvasSize = 700;
        pieceSize = 70;
        break;
      default:
        horizontalCount = 2;
        verticalCount = 2;
        canvasSize = 300;
        pieceSize = 150;
    }

    return { horizontalCount, verticalCount, canvasSize, pieceSize };
  };

  useEffect(() => {
    if (!image || !difficulty) return;

    const puzzle = document.getElementById(`${id}`);
    if (!puzzle) return;

    // Clear any existing canvas
    puzzle.innerHTML = "";

    const img = new window.Image();
    img.src = image;
    img.onload = () => {
      const config = getPuzzleConfig(difficulty);

      const canvas = new Canvas(puzzle.id, {
        width: config.canvasSize,
        height: config.canvasSize,
        outline: new headbreaker.outline.Rounded(),
        painter: new painters.Konva(),
        image: img,
        pieceSize: config.pieceSize,
        proximity: 20,
        borderFill: 10,
        preventOffstageDrag: true,
      });

      canvas.adjustImagesToPuzzleHeight();
      canvas.autogenerate({
        horizontalPiecesCount: config.horizontalCount,
        verticalPiecesCount: config.verticalCount,
      });
      canvas.shuffle();
      canvas.draw();

      canvas.onConnect((_piece, figure, _target, targetFigure) => {
        // paint borders on click
        // of connecting and connected figures
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

      // Check if puzzle is complete
      canvas.onValid(() => {
        setTimeout(() => {
          alert("🎉 Congratulations! You've completed the puzzle!");
        }, 500);
      });
    };
  }, [image, difficulty, id]);

  if (!image || !difficulty) {
    return null;
  }

  const config = getPuzzleConfig(difficulty);

  return (
    <Card>
      <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>
        Puzzle - {difficulty} pieces ({config.horizontalCount}×
        {config.verticalCount})
      </Title>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          id={id}
          style={{
            border: "2px solid #d9d9d9",
            borderRadius: "8px",
            padding: "10px",
            backgroundColor: "#fafafa",
          }}
        ></div>
      </div>
    </Card>
  );
}

export default PuzzleCanvas;
