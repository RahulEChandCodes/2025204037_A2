import React, { useState } from "react";
import {
  Card,
  Radio,
  Upload,
  Input,
  Button,
  Alert,
  Space,
  Typography,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { parseSchema } from "../utils/schemaParser";

const { TextArea } = Input;
const { Title } = Typography;
const { Dragger } = Upload;

const SchemaInput = ({ onSchemaChange, error }) => {
  const [inputMode, setInputMode] = useState("json");
  const [inputMethod, setInputMethod] = useState("upload");
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleModeChange = (e) => {
    setInputMode(e.target.value);
    setTextInput("");
    onSchemaChange(null);
  };

  const handleMethodChange = (e) => {
    setInputMethod(e.target.value);
    setTextInput("");
    onSchemaChange(null);
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      const text = await file.text();
      const schema = await parseSchema(text, inputMode);
      onSchemaChange(schema);
    } catch (err) {
      onSchemaChange(null, err.message);
    } finally {
      setLoading(false);
    }
    return false; // Prevent default upload behavior
  };

  const handleTextParse = async () => {
    if (!textInput.trim()) {
      onSchemaChange(null, "Please enter schema text");
      return;
    }

    setLoading(true);
    try {
      const schema = await parseSchema(textInput, inputMode);
      onSchemaChange(schema);
    } catch (err) {
      onSchemaChange(null, err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: inputMode === "json" ? ".json" : ".xml",
    beforeUpload: handleFileUpload,
    showUploadList: false,
  };

  return (
    <Card title="Schema Input" style={{ marginBottom: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Input Mode Toggle */}
        <div>
          <Title level={5}>Select Input Format:</Title>
          <Radio.Group value={inputMode} onChange={handleModeChange}>
            <Radio.Button value="json">JSON</Radio.Button>
            <Radio.Button value="xml">XML</Radio.Button>
          </Radio.Group>
        </div>

        {/* Input Method Toggle */}
        <div>
          <Title level={5}>Choose Input Method:</Title>
          <Radio.Group value={inputMethod} onChange={handleMethodChange}>
            <Radio.Button value="upload">Upload File</Radio.Button>
            <Radio.Button value="paste">Paste Text</Radio.Button>
          </Radio.Group>
        </div>

        {/* File Upload */}
        {inputMethod === "upload" && (
          <Dragger {...uploadProps} disabled={loading}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag {inputMode.toUpperCase()} file to this area to
              upload
            </p>
            <p className="ant-upload-hint">
              Support for a single {inputMode.toUpperCase()} file upload. File
              will be parsed automatically.
            </p>
          </Dragger>
        )}

        {/* Text Input */}
        {inputMethod === "paste" && (
          <div>
            <TextArea
              placeholder={`Paste your ${inputMode.toUpperCase()} schema here...`}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={10}
              style={{ fontFamily: "monospace" }}
            />
            <div style={{ marginTop: "12px", textAlign: "right" }}>
              <Button
                type="primary"
                onClick={handleTextParse}
                loading={loading}
                disabled={!textInput.trim()}
              >
                Parse Schema
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert
            message="Schema Parsing Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => onSchemaChange(null)}
          />
        )}

        {/* Example Schema */}
        <Card size="small" title={`Example ${inputMode.toUpperCase()} Schema:`}>
          <pre style={{ fontSize: "12px", margin: 0, whiteSpace: "pre-wrap" }}>
            {inputMode === "json"
              ? JSON.stringify(
                  {
                    tables: [
                      {
                        name: "users",
                        columns: [
                          { name: "id", type: "int", pk: true },
                          { name: "email", type: "varchar" },
                          { name: "name", type: "varchar" },
                        ],
                      },
                      {
                        name: "orders",
                        columns: [
                          { name: "id", type: "int", pk: true },
                          { name: "user_id", type: "int", fk: "users.id" },
                          { name: "total", type: "decimal" },
                        ],
                      },
                    ],
                  },
                  null,
                  2
                )
              : `<database>
  <table name="users">
    <column name="id" type="int" pk="true" />
    <column name="email" type="varchar" />
    <column name="name" type="varchar" />
  </table>
  <table name="orders">
    <column name="id" type="int" pk="true" />
    <column name="user_id" type="int" fk="users.id" />
    <column name="total" type="decimal" />
  </table>
</database>`}
          </pre>
        </Card>
      </Space>
    </Card>
  );
};

export default SchemaInput;
