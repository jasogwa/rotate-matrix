# rotate-matrix

The aim of this task is to rotate a matrix in a counter clockwise direction around a fixed center.
for example, given a matrix [1,2,3,4,5,6,7,8,9], this program will rotate it around the center 
which is five. so it will display [2,3,6,1,5,9,4,7,8]. 

The steps it takes is first to convert a given array say [1,2,3,4,5,6,7,8,9] to a square matrix
then rotate it around the center and finally converts it back to an array.

## Set-up
`npm install`

## Build
`npm run build`

## RUN
`node build/src/cli.js input.csv > output.csv`

## Test
`npm test`