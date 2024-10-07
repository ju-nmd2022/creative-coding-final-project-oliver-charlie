
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
let hsbValuesGrid = []; // Array to store HSB values for each box in the grid
const gridSize = 4; // Number of divisions in width and height
let synth, bassSynth; // Declare both synth and bass synth

// Scale of notes for melody and bass
const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const bassNotes = ["C2", "D2", "E2", "F2", "G2", "A2", "B2", "C3"];

let currentBox = 0; // Track the current box being played
let soundInterval; // Interval for looping sound playback

function setup() {
  createCanvas(innerWidth, innerHeight); // Create a canvas that fits the window
  colorMode(HSB); // Set the color mode to HSB

  // Start capturing video from the webcam
  video = createCapture(VIDEO);
  video.size(640, 480); // Set the video size
  video.hide(); // Hide the raw video element because we'll draw it on the canvas

  // Create a button to take the picture
  captureButton = createButton("Take Picture and Play Sound");
  captureButton.position(10, 10);
  captureButton.mousePressed(takeSnapshot); // Attach the snapshot function

  // Initialize synthesizers
  synth = new Tone.PolySynth(Tone.Synth).toDestination(); // Initialize polyphonic synth
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
  startSoundLoop(); // Start looping sound playback based on HSB values
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
    if (currentBox < hsbValuesGrid.length) {
      playSoundForBox(currentBox); // Play sound for the current box
      currentBox++; // Move to the next box
    } else {
      currentBox = 0; // Reset to the first box if end is reached
    }
  }, 500); // Set interval time (500 milliseconds)
}

// Function to play sound for a specific box
function playSoundForBox(index) {
  let hsb = hsbValuesGrid[index];

  // Random mapping between HSB and sound parameters for melody synth
  let randomFactor = random(0.8, 1.2); // Small random factor

  let noteIndex, volume, duration;

  // Switch for different mappings of HSB values to sound parameters
  let randomMapping = int(random(3));
  switch (randomMapping) {
    case 0:
      // Hue affects note, Saturation affects volume, Brightness affects duration
      noteIndex = floor(map(hsb.h, 0, 360, 0, notes.length)) % notes.length;
      volume = map(hsb.s * randomFactor, 0, 100, -12, 0);
      duration = map(hsb.b * randomFactor, 0, 100, 0.1, 1);
      break;
    case 1:
      // Saturation affects note, Brightness affects volume, Hue affects duration
      noteIndex = floor(map(hsb.s, 0, 100, 0, notes.length)) % notes.length;
      volume = map(hsb.b * randomFactor, 0, 100, -12, 0);
      duration = map(hsb.h * randomFactor, 0, 360, 0.1, 1);
      break;
    case 2:
      // Brightness affects note, Hue affects volume, Saturation affects duration
      noteIndex = floor(map(hsb.b, 0, 100, 0, notes.length)) % notes.length;
      volume = map(hsb.h * randomFactor, 0, 360, -12, 0);
      duration = map(hsb.s * randomFactor, 0, 100, 0.1, 1);
      break;
  }

  let note = notes[noteIndex];

  // Play melody synth sound with random parameters
  synth.triggerAttackRelease(
    note,
    duration,
    Tone.now(),
    Tone.dbToGain(volume)
  );

  // Random mapping for the bass
  let bassNoteIndex =
    floor(map(hsb.h, 0, 360, 0, bassNotes.length)) % bassNotes.length;
  let bassVolume = map(hsb.b * randomFactor, 0, 100, -24, -12); // Lower volume for bass
  let bassDuration = map(hsb.s * randomFactor, 0, 100, 0.1, 1);

  let bassNote = bassNotes[bassNoteIndex];

  // Play bass sound
  bassSynth.triggerAttackRelease(
    bassNote,
    bassDuration,
    Tone.now(),
    Tone.dbToGain(bassVolume)
  );
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
      fill(0);
      textSize(12);
      text(`H: ${hsb.h}`, x + 5, y + 15);
      text(`S: ${hsb.s}`, x + 5, y + 30);
      text(`B: ${hsb.b}`, x + 5, y + 45);
    }
  }
}

