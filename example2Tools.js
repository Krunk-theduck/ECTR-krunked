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
