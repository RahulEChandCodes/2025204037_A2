import { Button, Row, Space, Col, Card, Typography, Tag, Divider } from "antd";
import { useState } from "react";
import { CarOutlined, StopOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Nash = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  const makeMove = (choice) => {
    const computerMove = Math.random() < 0.5 ? "Go" : "Stop";
    setPlayerChoice(choice);
    setComputerChoice(computerMove);

    // Determine the result
    let result = "";
    if (choice === "Go" && computerMove === "Go") {
      result = "Accident! 💥 Both players lose big (-10, -10)";
    } else if (choice === "Go" && computerMove === "Stop") {
      result = "You win! 🎉 You get the best outcome (4, -1)";
    } else if (choice === "Stop" && computerMove === "Go") {
      result = "Computer wins! 🤖 Computer gets the best outcome (-1, 4)";
    } else {
      result = "Traffic jam! 😴 Both players wait (-3, -3)";
    }

    setGameResult(result);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setGameResult(null);
  };

  const getCardStyle = (playerMove, computerMove) => {
    const isCurrentResult =
      playerChoice === playerMove && computerChoice === computerMove;
    const isNashEquilibrium =
      (playerMove === "Go" && computerMove === "Stop") ||
      (playerMove === "Stop" && computerMove === "Go");

    let backgroundColor = "#f5f5f5";
    let borderColor = "#d9d9d9";

    if (isCurrentResult) {
      backgroundColor = "#fff7e6";
      borderColor = "#ffa940";
    } else if (isNashEquilibrium) {
      backgroundColor = "#f6ffed";
      borderColor = "#52c41a";
    } else if (playerMove === "Go" && computerMove === "Go") {
      backgroundColor = "#fff2f0";
      borderColor = "#ff7875";
    }

    return {
      backgroundColor,
      borderColor,
      borderWidth: isCurrentResult ? "2px" : "1px",
      borderStyle: "solid",
      height: "120px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    };
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>
        🚗 Nash Equilibrium Traffic Game 🚦
      </Title>

      <Card style={{ marginBottom: "24px", textAlign: "center" }}>
        <Title level={4}>You are Player 1 (Human) 👤</Title>
        <Text>Choose your action at the intersection:</Text>
        <br />
        <br />
        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<CarOutlined />}
            onClick={() => makeMove("Go")}
            disabled={playerChoice !== null}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            🚗 Go
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<StopOutlined />}
            onClick={() => makeMove("Stop")}
            disabled={playerChoice !== null}
            style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
          >
            🛑 Stop
          </Button>
        </Space>

        {playerChoice && (
          <div style={{ marginTop: "16px" }}>
            <Button onClick={resetGame}>🔄 Play Again</Button>
          </div>
        )}
      </Card>

      <Card title="🎯 Game Matrix" style={{ marginBottom: "16px" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <Text strong>Computer (Player 2) 🤖</Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col
            span={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text strong style={{ transform: "rotate(-90deg)" }}>
              You (Player 1) 👤
            </Text>
          </Col>
          <Col span={9} style={{ textAlign: "center" }}>
            <Tag color="green" style={{ fontSize: "14px", padding: "4px 8px" }}>
              🚗 Go
            </Tag>
          </Col>
          <Col span={9} style={{ textAlign: "center" }}>
            <Tag color="red" style={{ fontSize: "14px", padding: "4px 8px" }}>
              🛑 Stop
            </Tag>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col
            span={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Tag color="green" style={{ fontSize: "14px", padding: "4px 8px" }}>
              🚗 Go
            </Tag>
          </Col>
          <Col span={9}>
            <Card size="small" style={getCardStyle("Go", "Go")}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>💥</div>
                <Text strong style={{ color: "#ff4d4f" }}>
                  Accident!
                </Text>
                <br />
                <Text>(-10, -10)</Text>
              </div>
            </Card>
          </Col>
          <Col span={9}>
            <Card size="small" style={getCardStyle("Go", "Stop")}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>🎉</div>
                <Text strong style={{ color: "#52c41a" }}>
                  You Win!
                </Text>
                <br />
                <Text>(4, -1)</Text>
                {((playerChoice === "Go" && computerChoice === "Stop") ||
                  !playerChoice) && (
                  <div>
                    <Tag color="gold" size="small">
                      Nash*
                    </Tag>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col
            span={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Tag color="red" style={{ fontSize: "14px", padding: "4px 8px" }}>
              🛑 Stop
            </Tag>
          </Col>
          <Col span={9}>
            <Card size="small" style={getCardStyle("Stop", "Go")}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>🤖</div>
                <Text strong style={{ color: "#1890ff" }}>
                  Computer Wins!
                </Text>
                <br />
                <Text>(-1, 4)</Text>
                {((playerChoice === "Stop" && computerChoice === "Go") ||
                  !playerChoice) && (
                  <div>
                    <Tag color="gold" size="small">
                      Nash*
                    </Tag>
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col span={9}>
            <Card size="small" style={getCardStyle("Stop", "Stop")}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>😴</div>
                <Text strong style={{ color: "#faad14" }}>
                  Traffic Jam!
                </Text>
                <br />
                <Text>(-3, -3)</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {gameResult && (
        <Card
          style={{
            textAlign: "center",
            backgroundColor: "#f0f9ff",
            borderColor: "#1890ff",
          }}
        >
          <Title level={4}>🎮 Game Result</Title>
          <Text style={{ fontSize: "16px" }}>{gameResult}</Text>
          <Divider />
          <Space>
            <Text>
              Your choice:{" "}
              <Tag color={playerChoice === "Go" ? "green" : "red"}>
                {playerChoice === "Go" ? "🚗" : "🛑"} {playerChoice}
              </Tag>
            </Text>
            <Text>
              Computer choice:{" "}
              <Tag color={computerChoice === "Go" ? "green" : "red"}>
                {computerChoice === "Go" ? "🚗" : "🛑"} {computerChoice}
              </Tag>
            </Text>
          </Space>
        </Card>
      )}

      <Card style={{ marginTop: "16px", backgroundColor: "#f6ffed" }}>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          💡 <strong>Nash Equilibria:</strong> The scenarios marked with "Nash*"
          are equilibrium points where neither player would benefit from
          changing their strategy unilaterally.
        </Text>
      </Card>
    </div>
  );
};

export default Nash;
