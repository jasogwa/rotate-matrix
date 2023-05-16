"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotateTables = void 0;
const fs = __importStar(require("fs"));
const fastCsv = __importStar(require("fast-csv"));
function rotateMatrix(matrix) {
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
function rotateTable(table) {
    try {
        const data = JSON.parse(table.json);
        if (!Array.isArray(data)) {
            throw new Error('Invalid JSON format');
        }
        const length = data.length;
        const n = Math.floor(Math.sqrt(length));
        if (n * n !== length) {
            throw new Error('Table is not square');
        }
        const matrix = [];
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
    }
    catch (error) {
        return {
            id: table.id,
            json: JSON.stringify([]),
            is_valid: false
        };
    }
}
function rotateTables(inputFile) {
    const outputTables = [];
    const readStream = fs.createReadStream(inputFile);
    const csvStream = fastCsv.parse({ headers: true });
    readStream.pipe(csvStream).on('data', (data) => {
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
            console.log({
                id: table.id,
                json: table.json,
                is_valid: table.is_valid
            });
        }
        csvStream.end();
    });
}
exports.rotateTables = rotateTables;
const inputFile = process.argv[2];
if (!inputFile) {
    console.error('Please provide the path to the input CSV file.');
}
else {
    rotateTables(inputFile);
}
