import { useState } from "react";

function FileUploader() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
  };
  return (
    <div>
      <input type="file" onChange={handleFileChange} />

      {file && (
        <div>
          <p>Selected File: {file.name}</p>
          {file.type.startsWith("image/") && (
            <img src={previewUrl} alt="preview" />
          )}
          <button onClick={handleRemove}>Remove File</button>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
