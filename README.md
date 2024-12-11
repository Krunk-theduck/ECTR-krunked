# Extension Hacking Guide

## Overview

This guide walks you through hacking a browser game extension, focusing on exposing the WebAssembly (WASM) memory for further exploration. This method is tailored for extensions that load their games on their own pages, as Chrome prevents extensions from accessing each other’s pages for security reasons.

If you're trying to hack a WebAssembly-based game that runs on a regular website, consider using [CETUS](https://github.com/Qwokka/Cetus).

**Disclaimer:** This guide was created while working on the extension "Extreme Car Traffic Racing." Variables, source code structures, and memory locations will differ across extensions. You must have a working knowledge of extension development and WASM to use this effectively.

#### The extension I worked on, after completion, can be found [Here](https://www.mediafire.com/file/8z8lw0lmxclnwjr/ECTRkrunked.zip/file), or [Here](https://file.io/TR9zwSTFVj3W)

---

## Prerequisites

1. **Chrome Extension Source Viewer**  
   Install the Chrome Extension Source Viewer from the [Chrome Web Store](https://chromewebstore.google.com/detail/chrome-extension-source-v/jifpbeccnghkjeaalbbjmodiffmgedin) to download extension source code.

2. **Basic Tools**  
   - A text editor (e.g., VSCode, Sublime Text).  
   - Basic knowledge of JavaScript and WebAssembly.

3. **Important Notes**  
   - This guide uses examples from "Extreme Car Traffic Racing." Adjustments may be necessary for other extensions.
   - Ensure that you are working with a game extension that loads its game on a separate page.  

---

## Step 1: Download the Extension

1. Navigate to the Chrome Web Store and find the game extension you want to hack.  
   Example: [Extreme Car Traffic Racing Extension](https://chromewebstore.google.com/detail/extreme-car-traffic-racin/ghnhfbiidbbolhkiaheaflffnddkmbno).  

2. Use the Chrome Extension Source Viewer to download the extension as a ZIP file.  
   - Click the CRX button on the extension page.  
   - Select **Download as ZIP**.

3. Extract the ZIP file to a folder on your computer.

---

## Step 2: Locate the WebAssembly Loader File

1. Look for a file named something like `<Game_Name>.framework.js` in the extracted files.  
   Common paths include `Game_Source > Build` or similar.

2. Open the WebAssembly loader `.js` file.  
   It is usually a large JavaScript file responsible for initializing the WASM module.

---

## Step 3: Find the WASM Memory Export

1. Search for the function `WebAssembly.instantiateStreaming`.  
   Example:
   ```javascript
   function instantiateAsync() {
       if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" &&
           !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && typeof fetch === "function") {
           return fetch(wasmBinaryFile, { credentials: "same-origin" })
               .then(function(response) {
                   var result = WebAssembly.instantiateStreaming(response, info);
                   return result.then(receiveInstantiationResult, function(reason) {
                       err("wasm streaming compile failed: " + reason);
                       err("falling back to ArrayBuffer instantiation");
                       return instantiateArrayBuffer(receiveInstantiationResult);
                   });
               });
       } else {
           return instantiateArrayBuffer(receiveInstantiationResult);
       }
   }
   This is where the WASM module is instantiated, allowing the game to use it.

2. Look for the **memory export**. This is often defined near the `instantiateStreaming` function.

3. Scroll through the file until you find a function like this:
   ```javascript
   function receiveInstance(instance, module) {
       var exports = instance.exports;
       Module["asm"] = exports;
       wasmMemory = Module["asm"]["yh"];
       updateGlobalBufferAndViews(wasmMemory.buffer);
       wasmTable = Module["asm"]["Wh"];
       addOnInit(Module["asm"]["zh"]);
       removeRunDependency("wasm-instantiate");
   }
   ```
   Here, the variable `wasmMemory` is what we’re looking for.

---

## Step 4: Expose WASM Memory to Global Scope

1. Modify the `receiveInstance` function to expose the `wasmMemory` variable globally.  
   Add the following line:
   ```javascript
   window["wasmMemHook"] = wasmMemory;
   ```
   The updated function will look like this:
   ```javascript
   function receiveInstance(instance, module) {
       var exports = instance.exports;
       Module["asm"] = exports;
       wasmMemory = Module["asm"]["yh"];
       window["wasmMemHook"] = wasmMemory;
       updateGlobalBufferAndViews(wasmMemory.buffer);
       wasmTable = Module["asm"]["Wh"];
       addOnInit(Module["asm"]["zh"]);
       removeRunDependency("wasm-instantiate");
   }
   ```

2. Save your changes and close the file.

---

## Step 5: Load the Modified Extension

1. Open Chrome and navigate to the Extension Manager:  
   `chrome://extensions/`

2. Enable **Developer Mode** (toggle in the top-right corner).

3. Click **Load Unpacked** and select the folder containing your modified extension files.  
   - Ensure the original version of the extension is uninstalled to prevent conflicts.

---

## Step 6: Access the WASM Memory

1. Open the game extension in your browser (e.g., navigate to the extension's game page).

2. Open the browser's Developer Tools (`F12` or `Ctrl+Shift+I`) and go to the **Console** tab.

3. Verify the global memory hook:  
   - Type `window.wasmMemHook` in the console.  
   - If everything is set up correctly, you should see the WASM memory object.

4. You can now use the memory hook to analyze or manipulate the WASM module as needed.





Here’s a neatly formatted and revised version of your guide, optimized for a GitHub `README.md` file. I've corrected grammar, improved clarity, and added explanations where needed for readability and completeness.

---
# Part 2: The game  

## Understanding WASM Variable Types

WASM stores variables in **typed arrays**, similar to how your computer organizes data. Common types include:

- **int8**, **int16**, **int32**, **int64** (signed integers)
- **uint8**, **uint16**, **uint32**, **uint64** (unsigned integers, always positive)
- **float32**, **float64** (floating-point numbers)

For this guide, we'll be working with **unsigned 32-bit integers (uint32)**, but you can adjust the type depending on the variable you’re hacking.

⚠️ **Important:** Games often store variables inconsistently. For example, even if a variable is always positive, it might be stored as an `int32` or `int64`. If you search with the wrong type, you might waste hours debugging, so be mindful of this.

---

## Step 1: Hooking WASM Memory

To access the memory, you need to create a typed array based on your hook from Part 1. Here’s the function to do that for a `uint32` type:

```javascript
function hookWasmMem32() {
  return new Uint32Array(window["wasmMemHook"].buffer);
}
```

- **`Uint32Array`**: Specifies the memory type as unsigned 32-bit integers.
- **`window["wasmMemHook"]`**: Refers to the memory hook exposed in global scope (from Part 1).

Assign this to a variable for convenience:

```javascript
const wasmMemory = hookWasmMem32();
```

---

## Step 2: Searching for the Right Address

### Changing the Variable In-Game

First, change the in-game value of the variable you’re trying to find (e.g., money). For example, let’s say your in-game money is now **1487**.

---

### Searching Memory for a Value

Here’s a function to search through the WASM memory buffer for your value:

```javascript
function memIndexOf(val, memory) {
  let foundIndexes = [];
  for (let i = 0; i < memory.length; i++) {
    if (memory[i] === val) {
      foundIndexes.push(i);
    }
  }

  if (foundIndexes.length > 0) {
    console.log(`Found value ${val} at indexes: ${foundIndexes.join(', ')}`);
  } else {
    console.log(`Value ${val} not found in memory.`);
  }
}
```

Call this function with your value:

```javascript
memIndexOf(1487, wasmMemory);
```

This will return a list of potential memory addresses. For example:

```
Found value 1487 at indexes: 57004, 57501, 92559, 258886, ...
```

Save this list for later comparison.

---

### Narrowing Down the Address

Repeat the process:

1. Change the variable’s value again in the game (e.g., set money to **2816**).
2. Search for the new value:

   ```javascript
   memIndexOf(2816, wasmMemory);
   ```

3. Save the new list of addresses.

---

### Comparing Lists to Find the Correct Address

Now, compare the lists to find addresses common to both searches. Use this helper function:

```javascript
function compareLists(...lists) {
  const commonSet = new Set(lists[0]);
  for (let i = 1; i < lists.length; i++) {
    const currentListSet = new Set(lists[i]);
    for (let item of commonSet) {
      if (!currentListSet.has(item)) {
        commonSet.delete(item);
      }
    }
  }
  return [...commonSet];
}
```

Example usage:

```javascript
const ls1 = [57004, 57501, 92559, 258886]; // Replace with your first list
const ls2 = [284, 292, 57004, 92559];     // Replace with your second list

const common = compareLists(ls1, ls2);
console.log(common);
```

If done correctly, this will narrow down the list of addresses to just one or a few possibilities.

---

## Step 3: Changing the Value

Once you’ve identified the correct address (e.g., **8645128**), modify the variable directly in the console:

```javascript
wasmMemory[8645128] = 987654;
```

Head back to the game, and voilà—your money (or other variable) has changed!

---

## Conclusion

Congratulations! 🎉 You’ve successfully hooked onto WASM, found a variable's location, and modified it in real-time. This guide covered:

1. Understanding WASM types.
2. Hooking into memory.
3. Searching and narrowing down addresses.
4. Modifying the value.

Feel free to experiment with other variable types or values. I hope this guide was helpful and that you’ve learned something valuable. Happy hacking! 👾

---

## Additional Notes

- **Learning Resources**:  
  - [MDN WebAssembly Guide](https://developer.mozilla.org/en-US/docs/WebAssembly)
  - [CETUS GitHub](https://github.com/Qwokka/Cetus)
