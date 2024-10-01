// let video;

// function setup() {
//   createCanvas(innerWidth, innerHeight); // Create a canvas that fits the window
//   video = createCapture(VIDEO);
//   video.size(640, 480); // Set the video size
//   video.hide(); // Hide the HTML video element
// }

// function draw() {
//   background(0);
//   // Calculate the x and y positions to center the video
//   let x = (width - video.width) / 2;
//   let y = (height - video.height) / 2;

//   image(video, x, y, 640, 480); // Draw the video at the centered position
// }


let video;
let captureButton;
let resetButton;
let snapshot = null; // Variable to store the freeze frame

function setup() {
  createCanvas(innerWidth, innerHeight); // Create a canvas that fits the window
  video = createCapture(VIDEO);
  video.size(640, 480); // Set the video size
  video.hide(); // Hide the HTML video element

  // Create a button to take the picture
  captureButton = createButton('Take Picture');
  captureButton.position(10, 10);
  captureButton.mousePressed(takeSnapshot); // Attach the snapshot function

  // Create a reset button to clear the picture
  resetButton = createButton('Reset');
  resetButton.position(120, 10);
  resetButton.mousePressed(resetSnapshot); // Attach the reset function
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
}

// Function to take a snapshot (freezeframe)
function takeSnapshot() {
  snapshot = video.get(); // Capture the current frame from the video
}

// Function to reset the snapshot (return to live video)
function resetSnapshot() {
  snapshot = null; // Clear the snapshot and return to live video
}
