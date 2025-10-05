export const parseSchema = async (input, mode) => {
  try {
    if (mode === "json") {
      return parseJSONSchema(input);
    } else if (mode === "xml") {
      return parseXMLSchema(input);
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

const parseXMLSchema = (xmlString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Check for parsing errors
    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      throw new Error("Invalid XML format: " + parseError.textContent);
    }

    const databaseElement = xmlDoc.querySelector("database");
    if (!databaseElement) {
      throw new Error(
        "XML must contain a database root element with table children"
      );
    }

    const tableElements = databaseElement.querySelectorAll("table");
    if (tableElements.length === 0) {
      throw new Error("Database must contain at least one table");
    }

    const tablesData = Array.from(tableElements).map((tableElement) => {
      const tableName = tableElement.getAttribute("name");
      if (!tableName) {
        throw new Error("Each table must have a name attribute");
      }

      const columnElements = tableElement.querySelectorAll("column");
      const columns = Array.from(columnElements).map((colElement) => {
        const columnName = colElement.getAttribute("name");
        const columnType = colElement.getAttribute("type");

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
        const pkAttr = colElement.getAttribute("pk");
        if (pkAttr === "true") {
          column.pk = true;
        }

        // Handle foreign key
        const fkAttr = colElement.getAttribute("fk");
        if (fkAttr) {
          column.fk = fkAttr;
        }

        return column;
      });

      return {
        name: tableName,
        columns: columns,
      };
    });

    return { tables: tablesData };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Invalid XML format");
  }
};
