// Used ChatpGPT to make the button freeze the frame

let video;
let captureButton;
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
  snapshot = createImage(video.width, video.height); // Create an empty image with the same dimensions as the video
  snapshot.copy(video, 0, 0, video.width, video.height, 0, 0, snapshot.width, snapshot.height); // Copy the current video frame into the snapshot
}

