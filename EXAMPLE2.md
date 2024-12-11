# High Stakes: Finding the Vampire's Location in WebAssembly

This guide walks you through locating the vampire's position in the game **High Stakes**, leveraging WebAssembly (Wasm) concepts. **Before diving in**, ensure you've already read and understood the [Extension Hacking Guide](https://github.com/Krunk-theduck/GameExtensionHacking/blob/main/README.md) to familiarize yourself with **HEAP/BUFFER storage** and **variable types in WebAssembly**.

---

## Overview

In **High Stakes**, the vampire's location is stored as an **INT16** inside the Wasm heap, which can be accessed via the `HEAP16` array:  

```javascript
Module["HEAP16"]
```

The vampire's location can be pinpointed using this syntax:
```javascript
Module["HEAP16"][<addressOfLocation>]
```

---

## Steps to Find the Vampire's Location

### 1. **Play Two Rounds**
You’ll need to play **two rounds** (potentially three, but unlikely) and reveal the vampire’s location each time.

### 2. **Understand How the Vampire's Index Works**
- The vampire's position in the game grid is stored **numerically** rather than following typical array indexing.
- Example:  
  ```
  SAFE, SAFE, VAMPIRE
  SAFE, SAFE, SAFE
  SAFE, SAFE, SAFE
  ```
  In this example, the vampire appears at **index 3** (not 2), because the game treats positions literally.  

  **Important Warning**:  
  - **Before revealing the vampire**, the game uses **normal array indexing** (starting at 0).  
  - **After revealing the vampire**, the position switches to **literal numerical indexing**.  

  So, if the vampire is on card 3:
  - Before reveal: Index is **2**.  
  - After reveal: Index is **3**.  

---

### 3. **Use `memIndexOf()` to Locate Potential Addresses**
Run the `memIndexOf()` function to find all heap locations matching the vampire's position:  

```javascript
memIndexOf(<vampireIndex>, Module["HEAP16"])
```

#### Example:
For the above grid, after revealing the vampire:  
```javascript
memIndexOf(3, Module["HEAP16"])
```

### 4. **Repeat for Two Rounds**
Perform the above step twice (once per round) to generate two separate lists of potential addresses for the vampire’s location.

---

### 5. **Compare Address Lists**
Use `compareLists(list1, list2)` to find the common address between the two rounds:  

```javascript
compareLists(list1, list2)
```

This will give you the exact memory address where the vampire’s position is stored.

---

## Example Workflow
1. Play the game and reveal the vampire in the first round.  
2. Use `memIndexOf(<vampireIndex>, Module["HEAP16"])` to generate `list1` of addresses.  
3. Play the second round, reveal the vampire again, and generate `list2` using the same function.  
4. Compare the two lists:  
   ```javascript
   compareLists(list1, list2)
   ```
5. The shared address is where the vampire's location is stored.

---

## Additional Notes
- **Memory Indexing Quirk**: Be mindful of the switch from array indexing to literal indexing after revealing the vampire.  
- **Best Practices**: Save and label your address lists clearly to avoid confusion during comparison.  

Happy hunting!
