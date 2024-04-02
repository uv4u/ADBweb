import React, { useState } from 'react';

const FileForm = () => {
  const [fileDetails, setFileDetails] = useState({ fileName: '', fileExtension: '' });

  const handleFilePathInputChange = (event) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      const fileName = file.name;
      const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
      setFileDetails({ fileName, fileExtension });
      event.target.onchange = null;
    };
    fileInput.click();
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    alert(`Selected file: ${fileDetails.fileName}`);
  };

  return (
    <form className="was-validated" onSubmit={handleFormSubmit}>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          aria-label="file path example"
          id="file-path"
          value={fileDetails.fileName}
          readOnly
          onClick={handleFilePathInputChange}
        />
        <div className="invalid-feedback">Example invalid form file path feedback</div>
      </div>

      <div className="mb-3">
        <button className="btn btn-primary" type="submit" disabled={!fileDetails.fileName}>
          Submit form
        </button>
      </div>
    </form>
  );
};

export default FileForm;