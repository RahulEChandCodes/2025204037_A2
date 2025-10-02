import React, { useState } from "react";
import { Layout, Typography, Divider } from "antd";
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

  const handleSchemaChange = (schema, errorMsg = null) => {
    setParsedSchema(schema);
    setError(errorMsg);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
