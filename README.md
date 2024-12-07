# Extension Hacking Guide

## Overview

This guide walks you through hacking a browser game extension, focusing on exposing the WebAssembly (WASM) memory for further exploration. This method is tailored for extensions that load their games on their own pages, as Chrome prevents extensions from accessing each other’s pages for security reasons.

If you're trying to hack a WebAssembly-based game that runs on a regular website, consider using [CETUS](https://github.com/Qwokka/Cetus).

**Disclaimer:** This guide was created while working on the extension "Extreme Car Traffic Racing." Variables, source code structures, and memory locations will differ across extensions. You must have a working knowledge of extension development and WASM to use this effectively.

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

---

## Additional Notes

- **Troubleshooting**:  
  If the memory hook doesn’t appear, double-check your modifications and ensure the extension is loaded correctly.

- **Exploration Tools**:  
  Use tools like the browser's debugger or libraries such as [WebAssembly Studio](https://webassembly.studio/) to inspect and manipulate the memory.

- **Learning Resources**:  
  - [MDN WebAssembly Guide](https://developer.mozilla.org/en-US/docs/WebAssembly)
  - [CETUS GitHub](https://github.com/Qwokka/Cetus)

---

Happy hacking! 🚀
```
