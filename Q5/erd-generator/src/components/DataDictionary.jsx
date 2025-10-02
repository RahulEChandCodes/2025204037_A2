import React from "react";
import { Card, Table, Tag, Typography } from "antd";

const { Title } = Typography;

const DataDictionary = ({ schema }) => {
  if (!schema || !schema.tables || schema.tables.length === 0) {
    return null;
  }

  // Prepare data for the table
  const dataSource = [];

  schema.tables.forEach((table) => {
    table.columns.forEach((column, index) => {
      dataSource.push({
        key: `${table.name}-${column.name}`,
        tableName: table.name,
        columnName: column.name,
        dataType: column.type,
        constraints: {
          pk: column.pk,
          fk: column.fk,
        },
        description: column.description || "-",
      });
    });
  });

  const columns = [
    {
      title: "Table Name",
      dataIndex: "tableName",
      key: "tableName",
      width: 150,
      render: (text, record, index) => {
        // Show table name only for the first column of each table
        const prevRecord = dataSource[index - 1];
        if (!prevRecord || prevRecord.tableName !== text) {
          return {
            children: <strong>{text}</strong>,
            props: {
              rowSpan:
                schema.tables.find((t) => t.name === text)?.columns.length || 1,
            },
          };
        }
        return {
          children: null,
          props: {
            rowSpan: 0,
          },
        };
      },
    },
    {
      title: "Column Name",
      dataIndex: "columnName",
      key: "columnName",
      width: 150,
    },
    {
      title: "Data Type",
      dataIndex: "dataType",
      key: "dataType",
      width: 120,
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Constraints",
      dataIndex: "constraints",
      key: "constraints",
      width: 150,
      render: (constraints) => (
        <div>
          {constraints.pk && (
            <Tag color="gold" style={{ marginBottom: "2px" }}>
              🔑 Primary Key
            </Tag>
          )}
          {constraints.fk && (
            <Tag color="green" style={{ marginBottom: "2px" }}>
              🔗 FK → {constraints.fk}
            </Tag>
          )}
          {!constraints.pk && !constraints.fk && (
            <Tag color="default">None</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) =>
        text || <span style={{ color: "#bfbfbf" }}>No description</span>,
    },
  ];

  return (
    <Card title="Data Dictionary" style={{ marginBottom: "24px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Title level={5} style={{ margin: 0, color: "#595959" }}>
          Complete overview of all tables and columns in the schema
        </Title>
      </div>

      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: "max-content" }}
        style={{ marginBottom: "16px" }}
      />

      <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
        <p>
          <strong>Summary:</strong>
          {schema.tables.length} table{schema.tables.length !== 1 ? "s" : ""},{" "}
          {dataSource.length} column{dataSource.length !== 1 ? "s" : ""} total
        </p>
      </div>
    </Card>
  );
};

export default DataDictionary;
