// // Used ChatpGPT to make the button freeze the frame

// let video;
// let captureButton;
// let snapshot = null; // Variable to store the freeze frame

// function setup() {
//   createCanvas(innerWidth, innerHeight); // Create a canvas that fits the window
//   video = createCapture(VIDEO);
//   video.size(640, 480); // Set the video size
//   video.hide(); // Hide the HTML video element

//   // Create a button to take the picture
//   captureButton = createButton('Take Picture');
//   captureButton.position(10, 10);
//   captureButton.mousePressed(takeSnapshot); // Attach the snapshot function
// }

// function draw() {
//   background(0);
  
//   // Calculate the x and y positions to center the video/snapshot
//   let x = (width - video.width) / 2;
//   let y = (height - video.height) / 2;

//   // If snapshot is null, display live video, otherwise display the frozen image
//   if (snapshot) {
//     image(snapshot, x, y, 640, 480); // Draw the frozen image if it exists
//   } else {
//     image(video, x, y, 640, 480); // Draw live video if no snapshot
//   }
// }

// // Function to take a snapshot (freezeframe)
// function takeSnapshot() {
//   snapshot = createImage(video.width, video.height); // Create an empty image with the same dimensions as the video
//   snapshot.copy(video, 0, 0, video.width, video.height, 0, 0, snapshot.width, snapshot.height); // Copy the current video frame into the snapshot
// }


let video;
let captureButton;
let snapshot = null; // Variable to store the freeze frame
let hsbValues = null; // Store HSB values

function setup() {
  createCanvas(innerWidth, innerHeight); // Create a canvas that fits the window
  colorMode(HSB); // Set the color mode to HSB
  
  video = createCapture(VIDEO);
  console.log('Video capture started successfully.');
  video.size(640, 480); // Set the video size
  video.hide(); // Hide the HTML video element

  // Create a button to take the picture
  captureButton = createButton('Take Picture');
  captureButton.position(10, 10);
  captureButton.mousePressed(takeSnapshot); // Attach the snapshot function

  // Detect mouse click on canvas to get HSB values of that pixel
  canvas.mousePressed(getPixelHSB);
}

function draw() {
  background(0);

  // Calculate the x and y positions to center the video/snapshot
  let x = (width - video.width) / 2;
  let y = (height - video.height) / 2;

  // If snapshot is null, display live video, otherwise display the frozen image
  if (snapshot) {
    image(snapshot, x, y, 640, 480); // Draw the frozen image if it exists
  } else {
    image(video, x, y, 640, 480); // Draw live video if no snapshot
  }

  // Display HSB values if available
  if (hsbValues) {
    fill(255);
    textSize(16);
    text(`Hue: ${hsbValues.h}`, 10, 50);
    text(`Saturation: ${hsbValues.s}`, 10, 70);
    text(`Brightness: ${hsbValues.b}`, 10, 90);
  }
}

// Function to take a snapshot (freeze frame)
function takeSnapshot() {
  snapshot = createImage(video.width, video.height); // Create an empty image with the same dimensions as the video
  snapshot.copy(video, 0, 0, video.width, video.height, 0, 0, snapshot.width, snapshot.height); // Copy the current video frame into the snapshot
  snapshot.loadPixels(); // Load pixels to access the pixel array
}

// Function to get the HSB values of the pixel at the mouse click position
function getPixelHSB() {
  if (snapshot) {
    let x = mouseX - (width - snapshot.width) / 2;
    let y = mouseY - (height - snapshot.height) / 2;

    // Check if the click is within the snapshot bounds
    if (x >= 0 && x < snapshot.width && y >= 0 && y < snapshot.height) {
      let pixelColor = snapshot.get(x, y); // Get the color of the pixel at (x, y)
      let h = hue(pixelColor); // Get the hue value
      let s = saturation(pixelColor); // Get the saturation value
      let b = brightness(pixelColor); // Get the brightness value

      // Store the HSB values
      hsbValues = { h: h.toFixed(2), s: s.toFixed(2), b: b.toFixed(2) };
    }
  }
}
