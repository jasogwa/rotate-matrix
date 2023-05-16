import * as fs from 'fs';
import * as fastCsv from 'fast-csv';
import { expect } from 'chai';

import { rotateTables } from './cli';

describe('Rotate Tables', () => {
    const inputFile = 'input.csv';

    before(() => {
        // Create a test input file
        const csvData = [
            { id: '1', json: '[1, 2, 3, 4, 5, 6, 7, 8, 9]' },
            { id: '2', json: '[40, 20, 90, 10]' },
            { id: '3', json: '[-5]' },
            { id: '9', json: '[2, -0]' },
            { id: '5', json: '[2, -5, -5]' },
            { id: '8', json: '[1, 1, 1, 1, 1]' }
        ];

        const csvStream = fastCsv.format({ headers: true });
        const writeStream = fs.createWriteStream(inputFile);

        csvStream.pipe(writeStream);

        for (const row of csvData) {
            csvStream.write(row);
        }

        csvStream.end();
    });

    after(() => {});

    it('should rotate the tables and generate the output CSV file', () => {
        return new Promise<void>((resolve, reject) => {
            rotateTables(inputFile);

            const outputData: any[] = [];

            fs.createReadStream('output.csv')
                .pipe(fastCsv.parse({ headers: true }))
                .on('data', (data) => {
                    outputData.push(data);
                })
                .on('end', () => {
                    const table1 = outputData.find((table) => table.id === '1');
                    expect(table1.json).to.equal('[2,3,6,1,5,9,4,7,8]');
                    expect(table1.is_valid).to.equal('true');

                    const table2 = outputData.find((table) => table.id === '2');
                    expect(table2.json).to.equal('[20,10,40,90]');
                    expect(table2.is_valid).to.equal('true');

                    const table3 = outputData.find((table) => table.id === '3');
                    expect(table3.json).to.equal('[-5]');
                    expect(table3.is_valid).to.equal('true');

                    const table9 = outputData.find((table) => table.id === '9');
                    expect(table9.json).to.equal('[]');
                    expect(table9.is_valid).to.equal('false');

                    const table5 = outputData.find((table) => table.id === '5');
                    expect(table5.json).to.equal('[]');
                    expect(table5.is_valid).to.equal('false');

                    const table8 = outputData.find((table) => table.id === '8');
                    expect(table8.json).to.equal('[]');
                    expect(table8.is_valid).to.equal('false');

                    resolve();
                })
                .on('error', (err) => {
                    reject(err);
                });
        });
    });
});
