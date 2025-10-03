import { useState } from "react";
import {
  Typography,
  Upload,
  Select,
  Button,
  Alert,
  Card,
  Row,
  Col,
  Space,
} from "antd";
import { UploadOutlined, PlayCircleOutlined } from "@ant-design/icons";
import PuzzleCanvas from "./PuzzleCanvas";

const { Title, Paragraph } = Typography;
const { Option } = Select;

function Puzzle() {
  const [fileURL, setFileURL] = useState("");
  const [difficulty, setDifficulty] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [canStartPuzzle, setCanStartPuzzle] = useState(false);

  const handleFileUploader = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (allowedTypes.includes(file.type)) {
        setFileURL(URL.createObjectURL(file));
        setFileName(file.name);
        setShowAlert(false);
        checkCanStart(true, difficulty);
      } else {
        setAlertMessage(
          "The puzzle works only with PNG, JPEG, or JPG image formats. Please select a valid image file."
        );
        setShowAlert(true);
        setFileURL("");
        setFileName("");
        setCanStartPuzzle(false);
      }
    }
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    checkCanStart(!!fileURL, value);
  };

  const checkCanStart = (hasFile, difficultyLevel) => {
    setCanStartPuzzle(hasFile && difficultyLevel !== null);
  };

  const difficultyOptions = [
    { value: 5, label: "Beginner (5 pieces)" },
    { value: 20, label: "Easy (20 pieces)" },
    { value: 40, label: "Medium (40 pieces)" },
    { value: 80, label: "Hard (80 pieces)" },
    { value: 100, label: "Expert (100 pieces)" },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>
              🧩 Jigsaw Puzzle Game
            </Title>
            <Paragraph style={{ textAlign: "center", fontSize: "16px" }}>
              Welcome! Create your own jigsaw puzzle by uploading an image and
              selecting your difficulty level.
            </Paragraph>
          </Col>

          <Col span={24}>
            {showAlert && (
              <Alert
                message="Invalid File Type"
                description={alertMessage}
                type="error"
                showIcon
                closable
                onClose={() => setShowAlert(false)}
                style={{ marginBottom: "16px" }}
              />
            )}
          </Col>

          <Col span={24}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={4}>Step 1: Upload Your Image</Title>
                <div
                  style={{
                    border: "2px dashed #d9d9d9",
                    padding: "20px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <UploadOutlined
                    style={{
                      fontSize: "24px",
                      color: "#1890ff",
                      marginBottom: "8px",
                    }}
                  />
                  <div style={{ marginBottom: "16px" }}>
                    <Paragraph>
                      Choose a PNG, JPEG, or JPG image to create your puzzle
                    </Paragraph>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileUploader}
                    accept=".png,.jpg,.jpeg"
                    style={{
                      display: "block",
                      margin: "0 auto",
                      padding: "8px",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  />
                  {fileName && (
                    <Paragraph style={{ marginTop: "8px", color: "#52c41a" }}>
                      ✓ Selected: {fileName}
                    </Paragraph>
                  )}
                </div>
              </div>

              <div>
                <Title level={4}>Step 2: Choose Difficulty Level</Title>
                <Select
                  placeholder="Select puzzle difficulty"
                  style={{ width: "100%" }}
                  size="large"
                  value={difficulty}
                  onChange={handleDifficultyChange}
                  disabled={!fileURL}
                >
                  {difficultyOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlayCircleOutlined />}
                  disabled={!canStartPuzzle}
                  onClick={() => {
                    /* Puzzle will render automatically */
                  }}
                >
                  Start Puzzle
                </Button>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {canStartPuzzle && (
        <div style={{ marginTop: "24px" }}>
          <PuzzleCanvas id="puzzle" image={fileURL} difficulty={difficulty} />
        </div>
      )}
    </div>
  );
}

export default Puzzle;
