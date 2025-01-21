import {chunk} from 'lodash-es'
export function add(a, b){
  console.log("add")
  return a+b;
}

export function sub(a, b){
  console.log("sub")
  return a-b;
}

export function myChunk() {
  console.log("chunk")
  return chunk([1,2,3,4,5,6,7,8], 2)
}