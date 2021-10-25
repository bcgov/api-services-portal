import ExcelJS from 'exceljs';

import { reportOrder, reportStructure } from './structure';

function toText(field: any, value: any) {
  if (Array.isArray(value)) {
    return value.join(', ');
  } else {
    return value;
  }
}

export function generateExcelWorkbook(data: any) {
  const workbook = new ExcelJS.Workbook();

  reportOrder.forEach((tab: string) => {
    const struct = reportStructure[tab];
    const sheet = workbook.addWorksheet(struct.label);

    sheet.columns = struct.fields.map((field: any) =>
      Object.assign(field, {
        style: { font: { bold: false, size: 12, name: 'Arial' } },
      })
    );

    sheet.getRow(1).font = { bold: true, size: 12, name: 'Arial' };

    if (tab in data) {
      data[tab].forEach((raw: any) => {
        const row = struct.fields.map((field: any) =>
          field.key in raw ? toText(field, raw[field.key]) : ''
        );
        sheet.addRow(row);
      });
    }
  });

  return workbook;
}

// alignment = { vertical: 'top', horizontal: 'left', wrapText: true }

// sheet.getRow(2).font = {
//   name: 'Comic Sans MS',
//   family: 4,
//   size: 16,
//   underline: 'double',
//   bold: true,
// };
