/* Used ChatGPT to make the button freeze the frame

Used ChatGPT to create the function to log the average Hue, Saturation, and Brightness 
of the video on click, and to then divide it into a grid, capture values in each grid box and displaying
each value in each grid box.


 Used Garrit's AutomaTone Step Sequencer example as a base and took help from 
ChatGPT to implement it into our previous code. Implemented a simple sound just to
see how the step sequencer works based on the HSB values in the picture. Combined 
the sound being randomized even if the same picture is taken twice.
*/

let video;
let captureButton;
let snapshot = null; // Variable to store the freeze frame
let rgbValuesGrid = []; // Array to store RGB values for each box in the grid
const gridSize = 4; // Number of divisions in width and height
let synth; // Declare synth synth

// Scale of notes for melody
const notes = [
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
  "G3",
  "A3",
  "D5",
  "E5",
  "Bb4",
];
//const notes = ["C4"];

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

  // Initialize the main synth with a retro synthwave sound
  synth = new Tone.PolySynth({
    polyphony: 4, // Allow polyphony of 4 voices
    oscillator: {
      type: "sawtooth", // Sawtooth wave for that retro synthwave feel
    },
    envelope: {
      attack: 1.0, // Slightly faster attack for punchy sound
      decay: 0.8, // Longer decay for a sustained sound
      sustain: 1.5, // Sustain level for that "pad" like sound
      release: 10.2, // Longer release to let the notes fade out
    },
  }).toDestination();

  //Using ChaatGPT to try and implement Reverb to the sound to make it less
  // Add reverb to create a synthwave atmospheric sound
  let reverb = new Tone.Reverb({
    decay: 3, // Long reverb for atmosphere
    wet: 0.4, // 40% wet signal to mix in spacey feel
  }).toDestination();

  // Add chorus effect to enhance the retro sound
  let chorus = new Tone.Chorus(4, 2.5, 0.5).start(); // Slow rate for 80s shimmer

  // Connect the synth to the chorus and reverb
  synth.chain(chorus, reverb);

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
      let totalRed = 0;
      let totalGreen = 0;
      let totalBlue = 0;
      let pixelCount = 0;

      for (let x = i * boxWidth; x < (i + 1) * boxWidth; x++) {
        for (let y = j * boxHeight; y < (j + 1) * boxHeight; y++) {
          let pixelColor = snapshot.get(x, y); // Get the color of each pixel
          totalRed += red(pixelColor); // Sum the red
          totalGreen += green(pixelColor); // Sum the green
          totalBlue += blue(pixelColor); // Sum the blue
          pixelCount++; // Count the pixels
        }
      }

      // Calculate the average RGB values for the current box
      let avgRed = totalRed / pixelCount;
      let avgGreen = totalGreen / pixelCount;
      let avgBlue = totalBlue / pixelCount;

      // Store the average RGB values for the box
      rgbValuesGrid.push({
        r: avgRed.toFixed(2),
        g: avgGreen.toFixed(2),
        b: avgBlue.toFixed(2),
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

  let randomFactor = random(0.8, 1.2); // Slight randomization for variety

  let noteIndex, volume, duration;

  // Switch for different mappings of RGB values to sound parameters
  let randomMapping = int(random(3));
  switch (randomMapping) {
    case 0:
      // Red affects note, Green affects volume, Blue affects duration
      noteIndex = floor(map(rgb.r, 0, 255, 0, notes.length)) % notes.length;
      volume = map(rgb.g * randomFactor, 0, 255, -12, 0); // Softer volume range
      duration = map(rgb.b * randomFactor, 0, 255, 0.5, 1.5); // Synthwave-style duration
      break;
    case 1:
      // Green affects note, Blue affects volume, Red affects duration
      noteIndex = floor(map(rgb.g, 0, 255, 0, notes.length)) % notes.length;
      volume = map(rgb.b * randomFactor, 0, 255, -12, 0); // Softer volume
      duration = map(rgb.r * randomFactor, 0, 255, 0.5, 1.5); // Smooth duration
      break;
    case 2:
      // Blue affects note, Red affects volume, Green affects duration
      noteIndex = floor(map(rgb.b, 0, 255, 0, notes.length)) % notes.length;
      volume = map(rgb.r * randomFactor, 0, 255, -12, 0); // Volume mapped to red
      duration = map(rgb.g * randomFactor, 0, 255, 0.5, 1.5); // Green controls duration
      break;
  }

  let note = notes[noteIndex];

  // Trigger the main synth sound with a synthwave feel
  synth.triggerAttackRelease(
    note,
    duration, // Long note duration for synthwave
    undefined,
    Tone.dbToGain(volume) // Converted volume to decibels
  );
}

// Flow field setup and drawing, same as before
function setupFlowField() {
  cols = width / 20;
  rows = height / 20;

  flowField = new Array(cols * rows);
}

// Used ChatGPT to change the color in the flowfield to RGB based on the picture
function drawFlowField() {
  strokeWeight(20);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * 20;
      let y = j * 20;

      // Calculate the index of the corresponding grid cell
      let gridIndex = (j * gridSize + i) % rgbValuesGrid.length; // Wrap around if flow field is larger than the grid

      // Get the RGB values for the current grid cell
      let rgb = rgbValuesGrid[gridIndex];

      // Calculate stroke opacity based on time
      let strokeOpacity = 255; // Default full opacity
      /*Took help from ChatGPT to get the time function to work
      Tried to use millis() it but didn't work so got the suggestion
      to use hour() instead and that worked.
      */
      const currentHour = hour(); // saving the current time
      // Compare current elapsed time to the target time
      if (currentHour >= 14) {
        strokeOpacity = 128; // Set opacity to half after 14:00
      } else {
        strokeOpacity = 255; // Full opacity before 14:00
      }

      // Set the stroke color using the RGB values
      stroke(rgb.r, rgb.g, rgb.b, strokeOpacity); // Alpha value changing depending on time of the day

      let angle =
        noise(i * noiseScale, j * noiseScale, timeOffset) * TWO_PI * 2;
      let v = p5.Vector.fromAngle(angle);
      flowField[i + j * cols] = v;

      //Took help from ChatGPT to get the visuals more organic
      let nextX = (i + 1) * 20;
      let nextY = (j + 1) * 20;

      push();
      translate(x, y);
      let nextAngle =
        noise((i + 1) * noiseScale, (j + 1) * noiseScale, timeOffset) *
        TWO_PI *
        2;
      let nextV = p5.Vector.fromAngle(nextAngle);

      // Connect the current point to the next point in the flow field
      line(v.x * 10, v.y * 10, nextV.x * 12, nextV.y * 12);
      pop();
    }
  }

  timeOffset += 0.002; // Move the noise field over time for animation
}
