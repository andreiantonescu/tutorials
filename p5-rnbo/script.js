let w, h, canvas, synth, rate, context
let sketchStarted = false
let mouseMoving = false

async function rnboSetup() {
  context = getAudioContext()

  const outputNode = context.createGain()
  outputNode.connect(context.destination)

  response = await fetch("export/rnbo.filterdelay.json")
  const delayPatcher = await response.json()

  const delayDevice = await RNBO.createDevice({ context, patcher: delayPatcher })
  synth = new p5.MonoSynth()
  synth.connect(delayDevice.node)
  synth.setADSR(0.01, 0.1, 1.0, 0.01)
  // synth.connect(outputNode)
  delayDevice.node.connect(outputNode)
  context.suspend()
}

const rateMin = 6 // every 1/10 of a second
const rateMax = 120 // every 10 seconds

function setup() {
  w = window.innerWidth
  h = window.innerHeight

  canvas = createCanvas(w, h)

  startButton = createButton('Start Sketch')
  startButton.position(w/2, h/2)
  startButton.mousePressed(resumeAudio)

  fill('red')
  noStroke()
  rnboSetup()
}

function resumeAudio() {
  sketchStarted = true
  startButton.style('opacity', '0')

  if (getAudioContext().state !== 'running') {
    context.resume()
  }
}

function mouseMoved() {
  mouseMoving = true
}

function draw() {
  if(synth == undefined) { return }
  background('rgba(255, 255, 255, 0.05)')
  // synth.amp(0, 0.5)
  rate = floor(map(mouseX, 0, w, rateMin, rateMax))
  note = floor(map(mouseY, 0, h, 60, 90))

  if(frameCount % rate == 0 && sketchStarted) {
    // play sound
    // synth.amp(0.5, 0.1)
    synth.play(midiToFreq(note), 90, 0, 0.01)
    ellipse(mouseX, mouseY, rate*5)
  }
  mouseMoving = false
}

function playSound() {
  synth.amp(0.5, 0.1)
  setTimeout(100, () => {
    synth.start()
  })
}