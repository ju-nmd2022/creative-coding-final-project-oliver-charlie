// Used ChatGPT to make the button freeze the frame

/* Used ChatGPT to create the function to log the average Hue, Saturation, and Brightness 
of the video on click, and to then divide it into a grid, capture values in each grid box and displaying
each value in each grid box.
*/
let video;
let captureButton;
let snapshot = null; // Variable to store the freeze frame
let hsbValuesGrid = []; // Array to store HSB values for each box in the grid
const gridSize = 4; // Number of divisions in width and height

function setup() {
  createCanvas(innerWidth, innerHeight); // Create a canvas that fits the window
  colorMode(HSB); // Set the color mode to HSB

  // Start capturing video from the webcam
  video = createCapture(VIDEO);
  video.size(640, 480); // Set the video size
  video.hide(); // Hide the raw video element because we'll draw it on the canvas

  // Create a button to take the picture
  captureButton = createButton("Take Picture");
  captureButton.position(10, 10);
  captureButton.mousePressed(takeSnapshot); // Attach the snapshot function
}

function draw() {
  background(0);

  // Check if video is loaded and ready
  if (video.loadedmetadata) {
    // Calculate the x and y positions to center the video/snapshot
    let x = (width - video.width) / 2;
    let y = (height - video.height) / 2;

    // If snapshot is null, display live video, otherwise display the frozen image
    if (snapshot) {
      image(snapshot, x, y, 640, 480); // Draw the frozen image if it exists
      displayHSBValues(); // Display HSB values on the canvas
    } else {
      image(video, x, y, 640, 480); // Draw live video if no snapshot
    }
  } else {
    console.log("Video not ready yet");
  }
}

// Function to take a snapshot (freeze frame)
function takeSnapshot() {
  snapshot = createImage(video.width, video.height); // Create an empty image with the same dimensions as the video
  snapshot.copy(
    video,
    0,
    0,
    video.width,
    video.height,
    0,
    0,
    snapshot.width,
    snapshot.height
  ); // Copy the current video frame into the snapshot
  snapshot.loadPixels(); // Load pixels to access the pixel array

  calculateAverageHSBGrid(); // Calculate and display the average HSB values for the grid
}

// Function to calculate the average HSB values for a 4x4 grid
function calculateAverageHSBGrid() {
  const boxWidth = snapshot.width / gridSize; // Width of each box
  const boxHeight = snapshot.height / gridSize; // Height of each box

  hsbValuesGrid = []; // Reset the grid values

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let totalHue = 0;
      let totalSaturation = 0;
      let totalBrightness = 0;
      let pixelCount = 0;

      for (let x = i * boxWidth; x < (i + 1) * boxWidth; x++) {
        for (let y = j * boxHeight; y < (j + 1) * boxHeight; y++) {
          let pixelColor = snapshot.get(x, y); // Get the color of each pixel
          totalHue += hue(pixelColor); // Sum the hue
          totalSaturation += saturation(pixelColor); // Sum the saturation
          totalBrightness += brightness(pixelColor); // Sum the brightness
          pixelCount++; // Count the pixels
        }
      }

      // Calculate the average HSB values for the current box
      let avgHue = totalHue / pixelCount;
      let avgSaturation = totalSaturation / pixelCount;
      let avgBrightness = totalBrightness / pixelCount;

      // Store the average HSB values for the box
      hsbValuesGrid.push({
        h: avgHue.toFixed(2),
        s: avgSaturation.toFixed(2),
        b: avgBrightness.toFixed(2),
      });

      // Log the HSB values for the current box to the console
      console.log(
        `Box [${i + 1}, ${j + 1}] - Average HSB Values: Hue - ${avgHue.toFixed(
          2
        )}, Saturation - ${avgSaturation.toFixed(
          2
        )}, Brightness - ${avgBrightness.toFixed(2)}`
      );
    }
  }
}

// Function to display HSB values in each box of the grid
function displayHSBValues() {
  const boxWidth = snapshot.width / gridSize; // Width of each box
  const boxHeight = snapshot.height / gridSize; // Height of each box

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let hsb = hsbValuesGrid[i * gridSize + j]; // Get the HSB values for the current box

      // Set the position for the textbox
      let x = (width - video.width) / 2 + i * boxWidth;
      let y = (height - video.height) / 2 + j * boxHeight;

      // Draw a rectangle for background
      fill(0, 0, 0, 0); // transparent box
      rect(x, y, boxWidth, boxHeight);

      // Set text color and display the HSB values
      fill(255);
      textSize(12);
      text(`H: ${hsb.h}`, x + 5, y + 15);
      text(`S: ${hsb.s}`, x + 5, y + 30);
      text(`B: ${hsb.b}`, x + 5, y + 45);
    }
  }
}
