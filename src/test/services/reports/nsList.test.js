import fetch from 'node-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import ExcelJS from 'exceljs';

describe('Generate Namespace Reports', function () {
  const server = setupServer(
    rest.get('http://hello', (req, res, ctx) => {
      return res(
        ctx.json({
          message: 'hello',
        })
      );
    })
  );

  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  describe('output namespace list', function () {
    it('it should generate report', async function () {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Namespaces', {
        // properties: { tabColor: { argb: 'FFC0000' } },
      });
      workbook.addWorksheet('Gateway Services');
      workbook.addWorksheet('Namespace Access');
      workbook.addWorksheet('Service Accounts');
      workbook.addWorksheet('Consumers');
      workbook.addWorksheet('Consumer Controls');
      // alignment = { vertical: 'top', horizontal: 'left', wrapText: true }

      sheet.columns = [
        {
          header: 'Id',
          key: 'id',
          width: 10,
          style: { font: { bold: false, size: 12, name: 'Arial' } },
        },
        {
          header: 'Name',
          key: 'name',
          width: 32,
          style: { font: { bold: false, size: 12, name: 'Arial' } },
        },
        {
          header: 'D.O.B.',
          key: 'dob',
          width: 15,
          outlineLevel: 1,
          style: {
            font: { size: 12, name: 'Arial' },
            numFmt: 'dd/mm/yyyy',
          },
        },
      ];
      sheet.getRow(1).font = { bold: true, size: 15, name: 'Arial' };
      // sheet.getRow(2).font = {
      //   name: 'Comic Sans MS',
      //   family: 4,
      //   size: 16,
      //   underline: 'double',
      //   bold: true,
      // };

      sheet.addRow([3, 'joe', new Date(1992, 1, 1)]);
      sheet.addRow([3, 'joe2', new Date(1992, 1, 1)]);
      sheet.addRow([3, 'joe3', new Date(1992, 1, 1)]);
      sheet.addRow([3, 'joe4', new Date(1992, 1, 1)]);
      sheet.addRow([3, 'joe', new Date(1992, 1, 1)]);
      sheet.addRow({ id: 2, name: 'John Doe', dob: new Date(1970, 1, 1) });

      // await sheet.commit();
      // const rows = [
      //   [5,'Bob',new Date()], // row by array
      //   {id:6, name: 'Barbara', dob: new Date()}
      // ];
      // // add new rows and return them as array of row objects
      // const newRows = worksheet.addRows(rows);
      //await workbook.xlsx.writeFile('test.xlsx');
    });
  });
});
