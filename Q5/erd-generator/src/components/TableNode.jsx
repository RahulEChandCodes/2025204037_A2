import React from "react";
import { Handle, Position } from "reactflow";

const TableNode = ({ data }) => {
  const { table } = data;

  return (
    <div className="react-flow__node-table">
      <div className="table-header">{table.name}</div>

      <div className="table-columns">
        {table.columns.map((column, index) => (
          <div key={index} className="table-column">
            <Handle
              type="target"
              position={Position.Left}
              id={`${table.name}.${column.name}`}
              style={{
                background: column.pk
                  ? "#faad14"
                  : column.fk
                  ? "#52c41a"
                  : "#d9d9d9",
                width: 8,
                height: 8,
                left: -4,
              }}
            />

            <div className="column-name">
              {column.pk && <span className="primary-key">🔑 </span>}
              {column.fk && <span className="foreign-key">🔗 </span>}
              {column.name}
            </div>

            <div className="column-type">
              {column.type}
              {column.fk && (
                <span style={{ marginLeft: "8px", fontSize: "10px" }}>
                  → {column.fk}
                </span>
              )}
            </div>

            <Handle
              type="source"
              position={Position.Right}
              id={`${table.name}.${column.name}`}
              style={{
                background: column.pk
                  ? "#faad14"
                  : column.fk
                  ? "#52c41a"
                  : "#d9d9d9",
                width: 8,
                height: 8,
                right: -4,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableNode;
