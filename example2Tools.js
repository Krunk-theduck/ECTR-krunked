/* Actual Tools */

var _lists_ = [];
var _fists_ = [];

function memIndexOf(val, memory) {
  const foundIndexes = [];
  for (let i = 0; i < memory.length; i++) {
    if (memory[i] === val) {
      foundIndexes.push(i);
    }
  }
  return foundIndexes;
}

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

function findCursor(i) {
  _lists_.push(memIndexOf(i, Module["HEAP16"])); // Stored as int16
      let guess = compareLists(..._lists_);

    if (guess.length === 1) {
      console.log("Found address (access below): "+guess);
      console.log(`Module["HEAP16"][${guess}]`);
    } else {
      console.log("Keep going, still finding that index.");
    }
}

function findFlip(i) { // parameter should be 1 or 0
  _fists_.push(memIndexOf(i, Module["HEAP8"])); // Stored as int8 i assume
      let guess = compareLists(..._fists_);

    if (guess.length === 1) {
      console.log("Found address (access below): "+guess);
      console.log(`Module["HEAP8"][${guess}]`);
    } else {
      console.log("Keep going, still finding that index.");
    }
}

/* Just saving this for more work in the futuer */

function createBlueBoxOverlay(canvas, index) {
    // Canvas dimensions
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;

    // Card layout parameters
    const cardWidth = (canvasWidth - 300) / 3; // 150px margin on each side
    const cardHeight = (canvasHeight - 250) / 3; // 100px top margin, 150px bottom margin
    const horizontalSpacing = cardWidth / 6; // Example spacing
    const verticalSpacing = cardHeight / 6;

    // Calculate column and row from index
    const column = index % 3;
    const row = Math.floor(index / 3);

    // Calculate card position
    const cardX = 150 + column * (cardWidth + horizontalSpacing);
    const cardY = 100 + row * (cardHeight + verticalSpacing);

    // Create the blue box element
    const blueBox = document.createElement('div');
    blueBox.style.position = 'absolute';
    blueBox.style.width = `${cardWidth}px`;
    blueBox.style.height = `${cardHeight}px`;
    blueBox.style.left = `${canvas.offsetLeft + cardX}px`;
    blueBox.style.top = `${canvas.offsetTop + cardY}px`;
    blueBox.style.backgroundColor = 'blue';
    blueBox.style.zIndex = '9999'; // Ensure highest priority

    // Add to the document body
    document.body.appendChild(blueBox);
}

// Example usage
let __canvas = document.getElementById('canvas');
createBlueBoxOverlay(__canvas, 4); // Overlay on the 5th card (index 4)
