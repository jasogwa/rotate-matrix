import * as fs from 'fs';
import * as fastCsv from 'fast-csv';

interface Table {
    id: string;
    json: string;
}

interface OutputTable {
    id: string;
    json: string;
    is_valid: boolean;
}

function rotateMatrix(matrix: number[][]) {
    const M = matrix.length;
    const numSquares = Math.floor(M / 2);

    for (let i = 0; i < numSquares; i++) {
        const start = i;
        const end = M - i - 1;

        const topRow = matrix[start].slice(start, end);

        for (let j = start; j < end; j++) {
            matrix[start][j] = matrix[start][j + 1];
        }

        for (let j = start; j < end; j++) {
            matrix[j][end] = matrix[j + 1][end];
        }

        for (let j = end; j > start; j--) {
            matrix[end][j] = matrix[end][j - 1];
        }

        for (let j = end; j > start; j--) {
            matrix[j][start] = matrix[j - 1][start];
        }

        matrix[start + 1][start] = topRow[0];
    }

    return matrix;
}

function rotateTable(table: Table): OutputTable {
    try {
        const data = JSON.parse(table.json) as number[];

        if (!Array.isArray(data)) {
            throw new Error('Invalid JSON format');
        }

        const length = data.length;
        const n = Math.floor(Math.sqrt(length));

        if (n * n !== length) {
            throw new Error('Table is not square');
        }

        const matrix: number[][] = [];
        for (let i = 0; i < n; i++) {
            matrix.push(data.slice(i * n, (i + 1) * n));
        }

        rotateMatrix(matrix);

        const rotatedData = matrix.flat();

        return {
            id: table.id,
            json: JSON.stringify(rotatedData),
            is_valid: true
        };
    } catch (error) {
        return {
            id: table.id,
            json: JSON.stringify([]),
            is_valid: false
        };
    }
}

export function rotateTables(inputFile: string): void {
    const outputTables: OutputTable[] = [];

    const readStream = fs.createReadStream(inputFile);
    const csvStream = fastCsv.parse({ headers: true });

    readStream.pipe(csvStream).on('data', (data: Table) => {
        const outputTable = rotateTable(data);
        outputTables.push(outputTable);
    });

    csvStream.on('end', () => {
        const writeStream = fs.createWriteStream('output.csv');
        const csvStream = fastCsv.format({ headers: true });

        csvStream.pipe(writeStream);

        for (const table of outputTables) {
            csvStream.write({
                id: table.id,
                json: table.json,
                is_valid: table.is_valid
            });
        }

        csvStream.end();
    });
}

const inputFile = process.argv[2];
rotateTables(inputFile);
