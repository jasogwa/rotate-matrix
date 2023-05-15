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
const fs = __importStar(require("fs"));
const fastCsv = __importStar(require("fast-csv"));
const chai_1 = require("chai");
const cli_1 = require("../src/cli");
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
    after(() => { });
    it('should rotate the tables and generate the output CSV file', () => {
        return new Promise((resolve, reject) => {
            (0, cli_1.rotateTables)(inputFile);
            const outputData = [];
            fs.createReadStream('output.csv')
                .pipe(fastCsv.parse({ headers: true }))
                .on('data', (data) => {
                outputData.push(data);
            })
                .on('end', () => {
                const table1 = outputData.find((table) => table.id === '1');
                (0, chai_1.expect)(table1.json).to.equal('[2,3,6,1,5,9,4,7,8]');
                (0, chai_1.expect)(table1.is_valid).to.equal('true');
                const table2 = outputData.find((table) => table.id === '2');
                (0, chai_1.expect)(table2.json).to.equal('[20,10,40,90]');
                (0, chai_1.expect)(table2.is_valid).to.equal('true');
                const table3 = outputData.find((table) => table.id === '3');
                (0, chai_1.expect)(table3.json).to.equal('[-5]');
                (0, chai_1.expect)(table3.is_valid).to.equal('true');
                const table9 = outputData.find((table) => table.id === '9');
                (0, chai_1.expect)(table9.json).to.equal('[]');
                (0, chai_1.expect)(table9.is_valid).to.equal('false');
                const table5 = outputData.find((table) => table.id === '5');
                (0, chai_1.expect)(table5.json).to.equal('[]');
                (0, chai_1.expect)(table5.is_valid).to.equal('false');
                const table8 = outputData.find((table) => table.id === '8');
                (0, chai_1.expect)(table8.json).to.equal('[]');
                (0, chai_1.expect)(table8.is_valid).to.equal('false');
                resolve();
            })
                .on('error', (err) => {
                reject(err);
            });
        });
    });
});
