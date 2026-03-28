import ExcelJS from 'exceljs';

import { reportOrder, reportStructure } from './structure';

function toText(field: any, value: any) {
  if (Array.isArray(value)) {
    return value.join(', ');
  } else {
    return value;
  }
}

function getValueByPath(raw: any, path: string) {
  return path.split('.').reduce((acc, key) => acc && acc[key], raw);
}

export function generateExcelWorkbook(data: any) {
  const workbook = new ExcelJS.Workbook();

  reportOrder.forEach((tab: string) => {
    const struct = reportStructure[tab];

    if (tab in data) {
      const sheet = workbook.addWorksheet(struct.label);

      sheet.columns = struct.fields.map((field: any) =>
        Object.assign(field, {
          style: { font: { bold: false, size: 12, name: 'Arial' } },
        })
      );

      sheet.getRow(1).font = { bold: true, size: 12, name: 'Arial' };

      data[tab]?.forEach((raw: any) => {
        const row = struct.fields.map(
          (field: any) => toText(field, getValueByPath(raw, field.key)) ?? ''
        );
        sheet.addRow(row);
      });
    }
  });

  return workbook;
}
