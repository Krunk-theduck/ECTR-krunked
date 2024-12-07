/*******************************************************
 * tools.js
 * A collection of utility functions for WASM memory manipulation,
 * game hacking, and general-purpose JavaScript tasks.
 * Includes usage examples and extensive comments.
 *******************************************************/

/*** WASM Memory Manipulation Utilities ***/

/**
 * Creates a typed array hook for WASM memory.
 * @param {string} type - The type of array to create ('Uint32', 'Int32', etc.).
 * @returns {TypedArray} The typed array representing the WASM memory buffer.
 * @example
 * const wasmMemory = hookWasmMemory("Uint32");
 * console.log(wasmMemory[100]); // Access value at index 100.
 */
function hookWasmMemory(type = "Uint32") {
  const typedArrayConstructor = window[`${type}Array`];
  if (!typedArrayConstructor) {
    throw new Error(`Invalid type: ${type}. Use a valid typed array name.`);
  }
  if (!window["wasmMemHook"] || !window["wasmMemHook"].buffer) {
    throw new Error("WASM memory hook not found. Ensure wasmMemHook is globally exposed.");
  }
  return new typedArrayConstructor(window["wasmMemHook"].buffer);
}

// Example Usage
// const wasmMemory = hookWasmMemory("Uint32");
// console.log(wasmMemory[0]); // Logs the first element of WASM memory.

/**
 * Searches for a value in a WASM memory array.
 * @param {number} val - The value to search for.
 * @param {TypedArray} memory - The typed array representing WASM memory.
 * @returns {Array<number>} An array of indexes where the value is found.
 * @example
 * const indexes = memIndexOf(1487, wasmMemory);
 * console.log(indexes); // Logs indexes containing the value 1487.
 */
function memIndexOf(val, memory) {
  const foundIndexes = [];
  for (let i = 0; i < memory.length; i++) {
    if (memory[i] === val) {
      foundIndexes.push(i);
    }
  }
  return foundIndexes;
}

// Example Usage
// const indexes = memIndexOf(1487, wasmMemory);
// console.log(`Found at: ${indexes.join(", ")}`);

/**
 * Compares multiple arrays to find common elements.
 * @param {...Array<number>} lists - Arrays to compare.
 * @returns {Array<number>} An array of common elements.
 * @example
 * const commonIndexes = compareLists([57004, 92559], [57004, 258886]);
 * console.log(commonIndexes); // Logs [57004].
 */
function compareLists(...lists) {
  if (lists.length === 0) return [];
  const commonSet = new Set(lists[0]);
  for (let i = 1; i < lists.length; i++) {
    const currentSet = new Set(lists[i]);
    for (const item of commonSet) {
      if (!currentSet.has(item)) {
        commonSet.delete(item);
      }
    }
  }
  return [...commonSet];
}

// Example Usage
// const list1 = [57004, 92559];
// const list2 = [57004, 258886];
// const common = compareLists(list1, list2);
// console.log(common); // Logs [57004].

/**
 * Updates a value in WASM memory at a specified index.
 * @param {number} index - The index to update.
 * @param {number} value - The new value to set.
 * @param {TypedArray} memory - The typed array representing WASM memory.
 * @example
 * updateMemoryValue(57004, 9999, wasmMemory);
 * console.log(wasmMemory[57004]); // Logs 9999.
 */
function updateMemoryValue(index, value, memory) {
  if (index < 0 || index >= memory.length) {
    throw new Error(`Index ${index} is out of bounds.`);
  }
  memory[index] = value;
}

// Example Usage
// updateMemoryValue(57004, 987654, wasmMemory);
