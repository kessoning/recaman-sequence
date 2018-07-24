/* recamán sequence */

/*
 ** Based on Recamán Live Stream by Daniel Shiffman
 ** url: https://youtu.be/XXwjcxMOA8s
 **
 ** Copyright by Giovanni Muzio - Kesson
 ** Creative Commons: Attribution Non-Commercial license
 **
 ** mail: kessoning@gmail.com
 ** web: https://www.kesson.io
 **
 ** Have a look at https://kesson.io/recaman
 */

// release date: July 2018

let numbers = [];
let count = 1;
let sequence = [];
let index = 0;

let leftOsc, rightOsc;
let mainAlpha = 255;

let noise;
let noiseEnv;
let noiseFilter, filterFreq, filterWidth;

let leftReverb, rightReverb;

let tick;
let tickAlpha = 0;

let kick;
let kickEnv;

let leftEnv, rightEnv;

let speed = 20;

let font;

function preload() {
  font = loadFont('./assets/Hyperspace.otf');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);

  background(0);

  // Array of numbers, to store the numbers already checked
  numbers[index] = true;
  sequence.push(0);

  // Left oscillator
  leftOsc = new p5.Oscillator();
  leftOsc.setType('sine');
  leftOsc.freq(0);
  leftOsc.pan(-1);
  leftOsc.amp(0);
  leftOsc.start();

  // Right oscillator, a little bit out of phase from the first one, to emulate the stereophonic
  rightOsc = new p5.Oscillator();
  rightOsc.setType('sine');
  rightOsc.freq(0);
  rightOsc.pan(1);
  rightOsc.amp(0);
  rightOsc.start();

  // Bip
  tick = new p5.Oscillator();
  tick.setType('sine');
  tick.freq(12000);
  tick.amp(0);
  tick.start();

  // Reverb for the left oscillator
  leftReverb = new p5.Reverb();
  // sonnects soundFile to reverb with a
  // reverbTime of 6 seconds, decayRate of 0.2%
  leftReverb.process(leftOsc, 4.9, 1);
  leftReverb.amp(1); // turn it up!

  // Reverb for the right oscillator
  rightReverb = new p5.Reverb();
  // sonnects soundFile to reverb with a
  // reverbTime of 6 seconds, decayRate of 0.2%
  rightReverb.process(rightOsc, 4.9, 1);
  rightReverb.amp(1); // turn it up!

  // Envelove for the left oscillator
  leftEnv = new p5.Env();
  // set attackTime, decayTime, sustainRatio, releaseTime
  leftEnv.setADSR(0, 0.1, 0.2, 0.1);
  // set attackLevel, releaseLevel
  leftEnv.setRange(1, 0);

  // Envelope for the right oscillator
  rightEnv = new p5.Env();
  // set attackTime, decayTime, sustainRatio, releaseTime
  rightEnv.setADSR(0, 0.1, 0.2, 0.1);
  // set attackLevel, releaseLevel
  rightEnv.setRange(1, 0);

  // Low frequency oscillator, the "kick"
  kick = new p5.Oscillator();
  kick.setType('sine');
  kick.freq(35);
  kick.amp(0);
  kick.start();

  // Noise and band-pass filter
  noise = new p5.Noise();
  filter = new p5.BandPass();
  noise.disconnect(); // Disconnect soundfile from master output...
  filter.process(noise); // ...and connect to filter so we'll only hear BandPass.
  noise.start();
  filter.set(12000, 10);  // 12000 Hz band pass filter with a "Q" of 10
  
  // ADSR envelope for the kick
  kickEnv = new p5.Env();
  // set attackTime, decayTime, sustainRatio, releaseTime
  kickEnv.setADSR(0, 0.15, 0.2, 0.1);
  // kickEnv.setADSR(0, 0.2, 0.1, 0.1);
  // set attackLevel, releaseLevel
  kickEnv.setRange(1, 0);

  // ADSR envelope for the noise
  noiseEnv = new p5.Env();
  // set attackTime, decayTime, sustainRatio, releaseTime
  noiseEnv.setADSR(0, 0.2, 0.1, 0.1);
  // set attackLevel, releaseLevel
  noiseEnv.setRange(1, 0);

  // Set the font
  textFont(font);
}

function draw() {
  background(0);

  if (frameCount % (speed * 4) == 0) {
    step();
    leftOsc.freq(sequence[sequence.length - 1]);
    leftEnv.play(leftOsc);
    kickEnv.play(kick);
    noiseEnv.play(noise);
    mainAlpha = 255;
  }

  if (frameCount % (speed * 4) == 3) {
    rightOsc.freq(sequence[sequence.length - 1]);
    rightEnv.play(rightOsc);
  }

  if (frameCount % speed == 0) {
    tick.amp(1);
    tickAlpha = 255;
  } else {
    tick.amp(0);
  }

  if (tickAlpha > 0 && mainAlpha === 0) {
    fill(255, tickAlpha);
    textAlign(CENTER, CENTER);
    textSize(width * 0.1);
    text("-", width * 0.5, height * 0.4725);
  }

  if (tickAlpha > 0) tickAlpha -= 25;
  if (tickAlpha < 0) tickAlpha = 0;

  if (mainAlpha > 0) {
    fill(255, mainAlpha);
    textAlign(CENTER, CENTER);
    textSize(width * 0.1);
    text("" + sequence[sequence.length - 1], width * 0.5, height * 0.4725);
    mainAlpha -= 10;
  }

  if (mainAlpha < 0) mainAlpha = 0;
}

function step() {
  let next = index - count;
  if (next < 0 || numbers[next]) {
    next = index + count;
  }
  numbers[next] = true;
  sequence.push(next);
  index = next;
  count++;
}