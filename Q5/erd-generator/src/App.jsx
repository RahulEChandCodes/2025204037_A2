import React, { useState, useEffect } from "react";
import { Layout, Typography, Divider, notification } from "antd";
import SchemaInput from "./components/SchemaInput";
import Diagram from "./components/Diagram";
import DataDictionary from "./components/DataDictionary";
import ExportButton from "./components/ExportButton";
import "antd/dist/reset.css";
import "./App.css";

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [parsedSchema, setParsedSchema] = useState(null);
  const [error, setError] = useState(null);
  const [api, contextHolder] = notification.useNotification();

  const handleSchemaChange = (schema, errorMsg = null) => {
    setParsedSchema(schema);
    setError(errorMsg);

    // Show success notification and scroll to diagram if schema is valid
    if (schema && !errorMsg) {
      api.success({
        message: "Schema Converted Successfully!",
        description:
          "Your schema has been converted into a diagram and data dictionary.",
        placement: "bottomLeft",
        duration: 4,
      });

      // Scroll to diagram after a brief delay to allow rendering
      setTimeout(() => {
        const diagramElement = document.getElementById("erd-content");
        if (diagramElement) {
          diagramElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {contextHolder}
      <Header style={{ background: "#001529", padding: "0 24px" }}>
        <Title level={2} style={{ color: "white", margin: "16px 0" }}>
          ERD Generator
        </Title>
      </Header>

      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Schema Input Section */}
          <SchemaInput onSchemaChange={handleSchemaChange} error={error} />

          <Divider />

          {/* Diagram Section */}
          {parsedSchema && (
            <>
              <div id="erd-content">
                <Diagram schema={parsedSchema} />
                <Divider />
                <DataDictionary schema={parsedSchema} />
              </div>

              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <ExportButton />
              </div>
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default App;
