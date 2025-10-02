# ERD Generator

A React single-page application built with Vite that generates Entity Relationship Diagrams (ERD) from JSON or XML schema input.

## Features

- **Dual Input Modes**: Support for both JSON and XML schema formats
- **Flexible Input Methods**: Upload files or paste schema text directly
- **Interactive ERD**: Zoomable, pannable, and draggable diagram using React Flow
- **Data Dictionary**: Comprehensive table showing all tables and columns
- **PDF Export**: Download the ERD and data dictionary as a PDF
- **Error Handling**: Robust parsing with detailed error messages
- **Modern UI**: Clean interface using Ant Design components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:

   ```bash
   cd erd-generator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Input Formats

#### JSON Schema Format

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

#### XML Schema Format

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

### How to Use

1. **Select Input Format**: Choose between JSON or XML using the radio buttons
2. **Choose Input Method**: Select either file upload or text paste
3. **Provide Schema**: Upload a file or paste your schema text
4. **View ERD**: The diagram will automatically generate showing:
   - Tables as nodes with column details
   - Primary keys marked with 🔑
   - Foreign keys marked with 🔗 and connection lines
5. **Review Data Dictionary**: Scroll down to see a detailed table of all schema elements
6. **Export PDF**: Click "Download PDF" to save the ERD and data dictionary

### Schema Requirements

#### Required Fields

- `tables`: Array of table objects
- `table.name`: Table name (string)
- `table.columns`: Array of column objects
- `column.name`: Column name (string)
- `column.type`: Data type (string)

#### Optional Fields

- `column.pk`: Primary key flag (boolean)
- `column.fk`: Foreign key reference (string, format: "table.column")
- `column.description`: Column description (string)

## Project Structure

```
src/
├── components/
│   ├── SchemaInput.jsx      # Input mode toggle and schema input
│   ├── Diagram.jsx          # ERD rendering with React Flow
│   ├── TableNode.jsx        # Custom table node component
│   ├── DataDictionary.jsx   # Table glossary component
│   └── ExportButton.jsx     # PDF export functionality
├── utils/
│   └── schemaParser.js      # JSON/XML parsing logic
├── App.jsx                  # Main application component
├── App.css                  # Application styles
├── index.css                # Global styles
└── main.jsx                 # Application entry point
```

## Technologies Used

- **React**: UI framework
- **Vite**: Build tool and development server
- **Ant Design**: UI component library
- **React Flow**: Interactive diagram rendering
- **xml2js**: XML parsing library
- **html2pdf.js**: PDF generation from HTML

## Key Features Explained

### Input Mode Toggle

- Radio buttons allow switching between JSON and XML modes
- Only one mode can be active at a time
- Input validation is format-specific

### Schema Parsing

- JSON: Uses `JSON.parse()` with comprehensive error handling
- XML: Uses `xml2js.parseStringPromise()` with attribute normalization
- Both formats convert to a unified internal schema structure

### ERD Rendering

- Each table becomes a React Flow node
- Foreign key relationships create edges between nodes
- Interactive features: zoom, pan, drag nodes
- Mini-map for navigation in large diagrams

### PDF Export

- Captures the entire ERD and data dictionary
- Uses html2pdf.js for client-side PDF generation
- Optimized for landscape A4 format
- High-quality output with proper scaling

## Error Handling

The application includes comprehensive error handling for:

- Invalid JSON/XML syntax
- Missing required schema fields
- Invalid foreign key references
- File upload errors
- PDF generation failures

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
