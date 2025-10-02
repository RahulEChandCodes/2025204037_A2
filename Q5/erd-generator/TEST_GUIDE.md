# ERD Generator Test Guide

## Quick Start Instructions

1. **Open the application**: Navigate to http://localhost:5173/ in your browser

2. **Choose Input Format**: Select either JSON or XML using the radio buttons

3. **Select Input Method**: Choose between "Upload File" or "Paste Text"

## Test with Sample Data

### Option 1: Using Sample Files

- Use the provided sample files in `public/samples/`:
  - `ecommerce-schema.json` - JSON format
  - `ecommerce-schema.xml` - XML format

### Option 2: Paste Sample JSON Schema

```json
{
  "tables": [
    {
      "name": "users",
      "columns": [
        { "name": "id", "type": "int", "pk": true },
        { "name": "email", "type": "varchar" },
        { "name": "name", "type": "varchar" }
      ]
    },
    {
      "name": "orders",
      "columns": [
        { "name": "id", "type": "int", "pk": true },
        { "name": "user_id", "type": "int", "fk": "users.id" },
        { "name": "total", "type": "decimal" }
      ]
    }
  ]
}
```

### Option 3: Paste Sample XML Schema

```xml
<database>
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
</database>
```

## What to Expect

1. **ERD Visualization**: Interactive diagram with draggable table nodes
2. **Primary Keys**: Marked with 🔑 icon and golden color
3. **Foreign Keys**: Marked with 🔗 icon, green color, and connecting lines
4. **Data Dictionary**: Comprehensive table below the diagram
5. **PDF Export**: Download button to save the entire ERD as PDF

## Features to Test

- [x] Input mode switching (JSON/XML)
- [x] File upload vs text paste
- [x] Error handling for invalid schemas
- [x] Interactive diagram (zoom, pan, drag)
- [x] Foreign key relationship visualization
- [x] Data dictionary generation
- [x] PDF export functionality

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Ensure schema follows the required format
3. Try the provided sample schemas first
4. Refresh the page and try again
