/* Used ChatGPT to make the button freeze the frame

Used ChatGPT to create the function to log the average Red, Green, and Blue 
of the video on click, and to then divide it into a grid, capture values in each grid box and displaying
each value in each grid box.

Used Garrit's AutomaTone Step Sequencer example as a base and took help from 
ChatGPT to implement it into our previous code. Implemented a simple sound just to
see how the step sequencer works based on the RGB values in the picture. Combined 
the sound being randomized even if the same picture is taken twice.
*/

let video;
let captureButton;
let snapshot = null; // Variable to store the freeze frame
let rgbValuesGrid = []; // Array to store RGB values for each box in the grid
const gridSize = 4; // Number of divisions in width and height
let synth, bassSynth; // Declare both synth and bass synth

// Scale of notes for melody and bass
const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const bassNotes = ["C2", "D2", "E2", "F2", "G2", "A2", "B2", "C3"];

let currentBox = 0; // Track the current box being played
let soundInterval; // Interval for looping sound playback

// Flow field variables made with chatGPT:
let flowField = []; // Array to store flow field vectors
let cols, rows; // Number of columns and rows in the flow field
let noiseScale = 0.1; // Scale for Perlin noise
let timeOffset = 0; // Time offset for animation
let fadeAmount = 0; // Amount to fade the snapshot

function setup() {
  createCanvas(innerWidth, innerHeight); // Create a canvas that fits the window
  colorMode(RGB); // Set the color mode to RGB

  // Start capturing video from the webcam
  video = createCapture(VIDEO);
  video.size(640, 480); // Set the video size
  video.hide(); // Hide the raw video element because we'll draw it on the canvas

  // Create a button to take the picture
  captureButton = createButton("Take Picture and Play Sound");
  captureButton.position(10, 10);
  captureButton.mousePressed(takeSnapshot); // Attach the snapshot function

  // Initialize synthesizers with smooth sounds
  synth = new Tone.PolySynth({
    polyphony: 4, // Allow polyphony of 4 voices
    oscillator: {
      type: "sine", // Use sine wave for smooth sound
    },
    envelope: {
      attack: 0.1, // 100ms attack
      decay: 0.2, // 200ms decay
      sustain: 0.5, // Sustain level at 50%
      release: 0.5, // 500ms release
    },
  }).toDestination(); // Initialize polyphonic synth

  bassSynth = new Tone.MembraneSynth().toDestination(); // Initialize bass synth

  // Start Tone.js context
  Tone.start(); // Ensure the Tone.js context is started
}

function draw() {
  background(0);

  // Check if video is loaded and ready
  if (video.loadedmetadata) {
    // Calculate the x and y positions to center the video/snapshot
    let x = (width - video.width) / 2;
    let y = (height - video.height) / 2;

    // if statement made with ChatGPT to fade out video after snapshot is taken
    // If snapshot is null, display live video, otherwise display the frozen image
    if (snapshot) {
      // Fade out the snapshot
      fadeAmount += 5; // Increase fade amount over time
      tint(255, 255 - fadeAmount); // Apply tint to fade out the image
      image(snapshot, x, y, 640, 480); // Draw the frozen image if it exists
      displayRGBValues(); // Display RGB values on the canvas

      // If the fade amount exceeds 255, reset snapshot
      if (fadeAmount > 255) {
        snapshot = null;
        fadeAmount = 0;
      }
    } else {
      image(video, x, y, 640, 480); // Draw live video if no snapshot
    }
  } else {
    console.log("Video not ready yet");
  }

  // Draw the flow field with organic movement
  drawFlowField();
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

  calculateAverageRGBGrid(); // Calculate and display the average RGB values for the grid
  startSoundLoop(); // Start looping sound playback based on RGB values

  // Initialize the flow field
  setupFlowField();
}

// Function to calculate the average RGB values for a 4x4 grid
function calculateAverageRGBGrid() {
  const boxWidth = snapshot.width / gridSize; // Width of each box
  const boxHeight = snapshot.height / gridSize; // Height of each box

  rgbValuesGrid = []; // Reset the grid values

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let pixelCount = 0;

      for (let x = i * boxWidth; x < (i + 1) * boxWidth; x++) {
        for (let y = j * boxHeight; y < (j + 1) * boxHeight; y++) {
          let pixelColor = snapshot.get(x, y); // Get the color of each pixel
          totalR += red(pixelColor); // Sum the red component
          totalG += green(pixelColor); // Sum the green component
          totalB += blue(pixelColor); // Sum the blue component
          pixelCount++; // Count the pixels
        }
      }

      // Calculate the average RGB values for the current box
      let avgR = totalR / pixelCount;
      let avgG = totalG / pixelCount;
      let avgB = totalB / pixelCount;

      // Store the average RGB values for the box
      rgbValuesGrid.push({
        r: avgR.toFixed(2),
        g: avgG.toFixed(2),
        b: avgB.toFixed(2),
      });
    }
  }
}

/* Got help from ChatGPT to make the sound loop after the 16th sound.
It changed the function to startSoundLoop instead and moved the other code to the function
playSoundForBox instead.
*/
function startSoundLoop() {
  currentBox = 0; // Reset current box index
  clearInterval(soundInterval); // Clear any existing interval

  soundInterval = setInterval(() => {
    if (currentBox < rgbValuesGrid.length) {
      playSoundForBox(currentBox); // Play sound for the current box
      currentBox++; // Move to the next box
    } else {
      currentBox = 0; // Reset to the first box if end is reached
    }
  }, 500); // Set interval time (500 milliseconds)
}

// Function to play sound for a specific box
function playSoundForBox(index) {
  let rgb = rgbValuesGrid[index];

  // Random mapping between RGB and sound parameters for melody synth
  let randomFactor = random(0.8, 1.2); // Small random factor

  let noteIndex, volume, duration;

  // Switch for different mappings of RGB values to sound parameters
  let randomMapping = int(random(3));
  switch (randomMapping) {
    case 0:
      // Red affects note, Green affects volume, Blue affects duration
      noteIndex = floor(map(rgb.r, 0, 255, 0, notes.length)) % notes.length;
      volume = map(rgb.g * randomFactor, 0, 255, -12, 0);
      duration = map(rgb.b * randomFactor, 0, 255, 0.1, 1);
      break;
    case 1:
      // Green affects note, Blue affects volume, Red affects duration
      noteIndex = floor(map(rgb.g, 0, 255, 0, notes.length)) % notes.length;
      volume = map(rgb.b * randomFactor, 0, 255, -12, 0);
      duration = map(rgb.r * randomFactor, 0, 255, 0.1, 1);
      break;
    case 2:
      // Blue affects note, Red affects volume, Green affects duration
      noteIndex = floor(map(rgb.b, 0, 255, 0, notes.length)) % notes.length;
      volume = map(rgb.r * randomFactor, 0, 255, -12, 0);
      duration = map(rgb.g * randomFactor, 0, 255, 0.1, 1);
      break;
  }

  // Play the note with mapped parameters
  synth.triggerAttackRelease(notes[noteIndex], duration, undefined, volume);

  // Bass sound with lower notes, using RGB value from the same box
  let bassNoteIndex = floor(map(rgb.r + rgb.g + rgb.b, 0, 765, 0, bassNotes.length)) % bassNotes.length;
  let bassDuration = map(rgb.r * randomFactor, 0, 255, 0.1, 1);
  bassSynth.triggerAttackRelease(bassNotes[bassNoteIndex], bassDuration);
}

// Function to display RGB values on the canvas
function displayRGBValues() {
  const boxWidth = video.width / gridSize; // Width of each box
  const boxHeight = video.height / gridSize; // Height of each box

  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let index = i * gridSize + j;
      let rgb = rgbValuesGrid[index];

      let x = i * boxWidth + (width - video.width) / 2;
      let y = j * boxHeight + (height - video.height) / 2;

      // Display the RGB values in each box
      text(`R:${rgb.r} G:${rgb.g} B:${rgb.b}`, x + boxWidth / 2, y + boxHeight / 2);
    }
  }
}

// Function to set up the flow field for organic movement
function setupFlowField() {
  cols = gridSize;
  rows = gridSize;
  flowField = [];
  for (let i = 0; i < cols; i++) {
    flowField[i] = [];
    for (let j = 0; j < rows; j++) {
      let angle = noise(i * noiseScale, j * noiseScale) * TWO_PI;
      flowField[i][j] = p5.Vector.fromAngle(angle);
    }
  }
}

// Function to draw the flow field with organic movement
function drawFlowField() {
  let fieldWidth = video.width / gridSize;
  let fieldHeight = video.height / gridSize;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let vector = flowField[i][j];
      let x = i * fieldWidth + (width - video.width) / 2;
      let y = j * fieldHeight + (height - video.height) / 2;

      stroke(255);
      push();
      translate(x + fieldWidth / 2, y + fieldHeight / 2);
      rotate(vector.heading());
      line(0, 0, fieldWidth * 0.5, 0);
      pop();
    }
  }

  timeOffset += 0.01;
}
