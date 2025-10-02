import { parseStringPromise } from "xml2js";

export const parseSchema = async (input, mode) => {
  try {
    if (mode === "json") {
      return parseJSONSchema(input);
    } else if (mode === "xml") {
      return await parseXMLSchema(input);
    } else {
      throw new Error("Invalid input mode");
    }
  } catch (error) {
    throw new Error(
      `Failed to parse ${mode.toUpperCase()} schema: ${error.message}`
    );
  }
};

const parseJSONSchema = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate the structure
    if (!parsed.tables || !Array.isArray(parsed.tables)) {
      throw new Error('Schema must contain a "tables" array');
    }

    // Validate each table
    parsed.tables.forEach((table, index) => {
      if (!table.name) {
        throw new Error(`Table at index ${index} must have a "name" property`);
      }
      if (!table.columns || !Array.isArray(table.columns)) {
        throw new Error(`Table "${table.name}" must have a "columns" array`);
      }

      // Validate each column
      table.columns.forEach((column, colIndex) => {
        if (!column.name) {
          throw new Error(
            `Column at index ${colIndex} in table "${table.name}" must have a "name" property`
          );
        }
        if (!column.type) {
          throw new Error(
            `Column "${column.name}" in table "${table.name}" must have a "type" property`
          );
        }
      });
    });

    return parsed;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Invalid JSON format");
  }
};

const parseXMLSchema = async (xmlString) => {
  try {
    const options = {
      explicitArray: false,
      mergeAttrs: true,
      ignoreAttrs: false,
      attrkey: "@",
    };

    const result = await parseStringPromise(xmlString, options);

    // Handle different XML structures
    let tablesData = [];

    if (result.database && result.database.table) {
      const tables = Array.isArray(result.database.table)
        ? result.database.table
        : [result.database.table];

      tablesData = tables.map((table) => {
        const tableName = table["@name"] || table.name;
        if (!tableName) {
          throw new Error("Each table must have a name attribute");
        }

        let columns = [];
        if (table.column) {
          const columnArray = Array.isArray(table.column)
            ? table.column
            : [table.column];
          columns = columnArray.map((col) => {
            const columnName = col["@name"] || col.name;
            const columnType = col["@type"] || col.type;

            if (!columnName || !columnType) {
              throw new Error(
                `Column in table "${tableName}" must have name and type attributes`
              );
            }

            const column = {
              name: columnName,
              type: columnType,
            };

            // Handle primary key
            if (col["@pk"] === "true" || col.pk === "true" || col.pk === true) {
              column.pk = true;
            }

            // Handle foreign key
            if (col["@fk"] || col.fk) {
              column.fk = col["@fk"] || col.fk;
            }

            return column;
          });
        }

        return {
          name: tableName,
          columns: columns,
        };
      });
    } else {
      throw new Error(
        "XML must contain a database root element with table children"
      );
    }

    return { tables: tablesData };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Invalid XML format");
  }
};
