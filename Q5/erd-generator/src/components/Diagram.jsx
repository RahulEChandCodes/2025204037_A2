import React, { useMemo } from "react";
import { Card, Typography } from "antd";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import TableNode from "./TableNode";

const { Title } = Typography;

const nodeTypes = {
  table: TableNode,
};

const Diagram = ({ schema }) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!schema || !schema.tables) {
      return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];
    const tablePositions = new Map();

    // Calculate positions for tables in a grid layout
    const tablesPerRow = Math.ceil(Math.sqrt(schema.tables.length));
    const nodeWidth = 250;
    const nodeHeight = 200;
    const horizontalSpacing = 350;
    const verticalSpacing = 300;

    schema.tables.forEach((table, index) => {
      const row = Math.floor(index / tablesPerRow);
      const col = index % tablesPerRow;
      const x = col * horizontalSpacing;
      const y = row * verticalSpacing;

      tablePositions.set(table.name, { x, y });

      nodes.push({
        id: table.name,
        type: "table",
        position: { x, y },
        data: {
          table: table,
        },
        style: {
          width: nodeWidth,
          height: "auto",
        },
      });
    });

    // Create edges for foreign key relationships
    schema.tables.forEach((table) => {
      table.columns.forEach((column) => {
        if (column.fk) {
          const [targetTable, targetColumn] = column.fk.split(".");
          if (targetTable && tablePositions.has(targetTable)) {
            edges.push({
              id: `${table.name}.${column.name}-${targetTable}.${targetColumn}`,
              source: table.name,
              target: targetTable,
              sourceHandle: `${table.name}.${column.name}`,
              targetHandle: `${targetTable}.${targetColumn}`,
              type: "smoothstep",
              style: {
                stroke: "#52c41a",
                strokeWidth: 2,
              },
              markerEnd: {
                type: "arrowclosed",
                color: "#52c41a",
              },
              label: "FK",
              labelStyle: {
                fontSize: "10px",
                fontWeight: "bold",
                fill: "#52c41a",
              },
            });
          }
        }
      });
    });

    return { nodes, edges };
  }, [schema]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  if (!schema || !schema.tables || schema.tables.length === 0) {
    return (
      <Card>
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#8c8c8c",
          }}
        >
          <Title level={4} type="secondary">
            No schema loaded
          </Title>
          <p>Please upload or paste a valid schema to see the ERD</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Entity Relationship Diagram" style={{ marginBottom: "24px" }}>
      <div
        style={{
          height: "600px",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#f5f5f5" gap={20} />
          <Controls />
          <MiniMap
            style={{
              height: 120,
              backgroundColor: "#f5f5f5",
            }}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>

      <div style={{ marginTop: "16px", fontSize: "12px", color: "#8c8c8c" }}>
        <p>
          <strong>Legend:</strong>
          <span style={{ color: "#faad14", marginLeft: "8px" }}>
            🔑 Primary Key
          </span>
          <span style={{ color: "#52c41a", marginLeft: "16px" }}>
            🔗 Foreign Key
          </span>
          <span style={{ marginLeft: "16px" }}>
            Drag nodes to rearrange • Use controls to zoom/pan
          </span>
        </p>
      </div>
    </Card>
  );
};

export default Diagram;
