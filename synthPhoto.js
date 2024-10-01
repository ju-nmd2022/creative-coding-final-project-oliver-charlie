let video;

function setup() {
  createCanvas(innerWidth, innerHeight); // Create a canvas that fits the window
  video = createCapture(VIDEO);
  video.size(640, 480); // Set the video size
  video.hide(); // Hide the HTML video element
}

function draw() {
  background(0);
  // Calculate the x and y positions to center the video
  let x = (width - video.width) / 2;
  let y = (height - video.height) / 2;

  image(video, x, y, 640, 480); // Draw the video at the centered position
}
