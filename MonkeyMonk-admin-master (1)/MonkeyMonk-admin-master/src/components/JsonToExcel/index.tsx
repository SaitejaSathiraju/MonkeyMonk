import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface Props {
  data: any[];
}

const JsonToExcel: React.FC<Props> = ({ data }) => {
  const downloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'data.xlsx');
  };

  return (
    <div>
      <button
        type="button"
        className="text-meta-6 bg-graydark focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-primary-400 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-600 my-2 hover:bg-black"
        onClick={downloadExcel}
      >Download Excel</button>
    </div>
  );
};

export default JsonToExcel;
