var tube64 =
  "sBPNEGgAoAeMyIDEEI7gMcm6yAOJyO5C0Ph4B+724MHoBu6wAO55CCjI0Oju0OjuictkiB/i2onLAcjTwIjGwP4FEPJkEpf/ANDqZIgX9tdkiBfi4tvj2e6Axwi/BALYRfRXurD/vWD/vvwB30TWiSzfBIkU3wSxAtnD2fvZwtjJ2cTYy97p2cveyt7L3sLZyuLm2cHcyNnB3Mjewdn63vvZ895M/N8c3kz831wBizSNAADgJECw+3QPweYCjQAo4LDweQTR5rDQZAIAAAVHRYH9oAB1k0KD+lB1il6/ABm1ZPOltchOwDwC4vrkYJhID4Vl/7ADzRApAMM8YmF6ZQ==";
var binCode;
var cycles = 3000;
var Module = {
  arguments: ["./asm.com"],
  onRuntimeInitialized: () => {
    binCode = base64decode(tube64);
    FS.writeFile("/asm.com", binCode);
    let dosboxconf = `
    [cpu]
    cycles=${cycles}
    [autoexec]
    @echo TweetX86
    config -get cycles`;
    FS.writeFile("/dosbox.conf", dosboxconf);
  },
  preRun: [],
  postRun: [],
  print: msg => console.log(msg),
  printErr: function(text) {
    if (arguments.length > 1)
      text = Array.prototype.slice.call(arguments).join(" ");
    console.error(text);
  },
  canvas: (function() {
    var canvas = document.getElementById("canvas");
    canvas.addEventListener(
      "webglcontextlost",
      function(e) {
        alert("WebGL context lost. You will need to reload the page.");
        e.preventDefault();
      },
      false
    );
    return canvas;
  })(),
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
  }
};

window.onerror = function(event) {
  // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
};

window.onmessage = function(msg) {
  window.focus();
  if (msg.data) {
    // Why do we use a temp variable (binCode) to store the binary,
    // instead of saving it to the file system ?
    // Because the file system is provided by Emscripten and ready for
    // business when Module.onRuntimeInitialized() has been called.
    binCode = msg.data.binCode;
    cycles = msg.data.cycles;
    let script = document.createElement("script");
    script.src = "dosbox.js";
    document.body.appendChild(script);
  }
};

var ASSERTIONS = 0;
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = "data:application/octet-stream;base64,";
// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  return String.prototype.startsWith
    ? filename.startsWith(dataURIPrefix)
    : filename.indexOf(dataURIPrefix) === 0;
}

var memoryInitializer = "dosbox.html.mem";
memoryInitializer = Module["locateFile"]
  ? Module["locateFile"](memoryInitializer, "")
  : memoryInitializer;
Module["memoryInitializerRequestURL"] = memoryInitializer;
var meminitXHR = (Module["memoryInitializerRequest"] = new XMLHttpRequest());
meminitXHR.open("GET", memoryInitializer, true);
meminitXHR.responseType = "arraybuffer";
meminitXHR.send(null);

window.parent.postMessage({ commandId: "dosbox", ready: true }, "*");
