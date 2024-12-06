function hookWasmMem32() {
  return new Int32Array(window["wasmMemHook"].buffer);
}

const memBuffer = window["wasmMemHook"].buffer;

// Creates a new view to "read" wasm buffer
const uint8View = new Uint8Array(memBuffer);
const int32View = hookWasmMem32();

const searchValue = 746;
let foundIndex = -1;

// Loop through the memory to find 
for (let i = 0; i < int32View.length; i++) {
  if (int32View[i] === searchValue) {
    foundIndex = i;
    break;
  }
}

// Check if the value was found and log the result
if (foundIndex !== -1) {
  console.log(`Found value ${searchValue} at index ${foundIndex}`);
} else {
  console.log(`Value ${searchValue} not found in memory`);
}
