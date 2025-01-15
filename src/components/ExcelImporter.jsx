import { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { validateEmail, validatePhone, validateGender, validateName } from '../utils/validators';

const ExcelImporter = () => {
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [summary, setSummary] = useState(null);

  const validateRow = (row, rowIndex) => {
    const errors = [];
    
    if (!validateName(row.Name)) {
      errors.push(`Name is required and must be a valid string`);
    }
    
    if (!validateEmail(row.Email)) {
      errors.push(`Email is invalid or missing`);
    }
    
    if (!validatePhone(row.Phone)) {
      errors.push(`Phone number is invalid or missing`);
    }
    
    if (!validateGender(row.Gender)) {
      errors.push(`Gender must be either 'M' or 'F'`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      rowData: row,
      rowIndex: rowIndex + 2 // Adding 2 because Excel starts at 1 and we have header row
    };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const validatedRows = jsonData.map((row, index) => validateRow(row, index));
      const valid = validatedRows.filter(row => row.isValid);
      const invalid = validatedRows.filter(row => !row.isValid);

      setValidRows(valid);
      setInvalidRows(invalid);
      setSummary({
        total: jsonData.length,
        valid: valid.length,
        invalid: invalid.length
      });
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadFailedRows = () => {
    const worksheet = XLSX.utils.json_to_sheet(invalidRows.map(row => ({
      ...row.rowData,
      Errors: row.errors.join('; ')
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Failed Rows');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, 'failed_rows.xlsx');
  };

  const downloadValidRows = () => {
    const worksheet = XLSX.utils.json_to_sheet(validRows.map(row => row.rowData));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Valid Rows');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, 'valid_rows.xlsx');
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="mb-4 p-2 border rounded"
        />
      </div>

      {summary && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-bold mb-2">Import Summary</h2>
          <p>Total Rows: {summary.total}</p>
          <p>Successfully Validated: {summary.valid}</p>
          <p>Failed Validation: {summary.invalid}</p>
          <div className="flex gap-2 mt-2">
            {summary.invalid > 0 && (
              <button
                onClick={downloadFailedRows}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Download Failed Rows
              </button>
            )}
            {summary.valid > 0 && (
              <button
                onClick={downloadValidRows}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Download Valid Rows
              </button>
            )}
          </div>
        </div>
      )}

      {validRows.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Successfully Validated Rows</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border p-2">Row</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Phone</th>
                  <th className="border p-2">Gender</th>
                </tr>
              </thead>
              <tbody>
                {validRows.map((row) => (
                  <tr key={row.rowIndex}>
                    <td className="border p-2">{row.rowIndex}</td>
                    <td className="border p-2">{row.rowData.Name}</td>
                    <td className="border p-2">{row.rowData.Email}</td>
                    <td className="border p-2">{row.rowData.Phone}</td>
                    <td className="border p-2">{row.rowData.Gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {invalidRows.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Validation Errors</h3>
          <div className="space-y-2">
            {invalidRows.map((row, index) => (
              <div key={index} className="p-3 bg-red-100 rounded">
                <p className="font-bold">Row {row.rowIndex}:</p>
                <ul className="list-disc ml-6">
                  {row.errors.map((error, errorIndex) => (
                    <li key={errorIndex}>{error}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelImporter;