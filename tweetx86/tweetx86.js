let commands = {
  nasm: undefined,
  ndisasm: undefined,
  dosbox: undefined
};

$(document).ready(() => {
  $("#base64code").bind("input propertychange", () => {
    $("#base64length").text($("#base64code").val().length);
  });
  let base64codeQueryStr = new URL(window.location.href).searchParams.get("c");
  let base64code = base64codeQueryStr
    ? decodeURIComponent(base64codeQueryStr)
    : "";
  let cycles = new URL(window.location.href).searchParams.get("s") || 10000;
  $("#cycles-input").val(cycles);
  if (base64code) {
    $("#base64code").val(base64code);
    $("#base64length").text(base64code.length);
    runBase64();
  } else {
    //loadSample("snake.asm");
  }
});

function loadSample(filename) {
  return fetch(filename)
    .then(response => response.text())
    .then(asmCode => $("#asmCode").val(asmCode));
}

function assemble() {
  $("#base64code").val("Assembling...");
  let asmCode = $("#asmCode").val();
  return launchCommand("nasm", asmCode).then(
    binCode => {
      let base64code = base64encode(binCode);
      $("#base64code").val(base64code);
      let base64codeQueryStr = encodeURIComponent(base64code);
      $("#base64length").text(base64codeQueryStr.length);
      $("#link").val(
        `http://${document.location.host}?c=${base64codeQueryStr}`
      );
      $("#link-group").show();
      return binCode;
    },
    error => {
      $("#base64code").val(error);
    }
  );
}

function copyLinkToClipboard() {
  $("#link").select();
  document.execCommand("copy");
  $("#copy-button").text("Copied !");
  setTimeout(() => $("#copy-button").text("Copy link"), 2000);
}

function createTweet() {
  let base64code = $("#base64code").val();
  let url = $("#link").val();
  let showOffText = "Checkout this TweetX86! " + url + " " + base64code;
  $("#link").val(showOffText);
  copyLinkToClipboard();
  $("#link").val(url);
}

function disassemble() {
  $("#asmCode").val("Disassembling...");
  let base64 = $("#base64code").val();
  return launchCommand("ndisasm", base64).then(asmCode => {
    $("#asmCode").val(asmCode);
    return asmCode;
  });
}

function getCyclesInSource() {
  let code = $("#asmCode").val();
  let res = /cycles=\d+/.exec(code);
  let cycles = res ? res[0].substr("cycles=".length) : $("#cycles-input").val();
  $("#cycles-input").val(cycles);
  console.log($("#cycles-input").val());
}

function runAsm() {
  getCyclesInSource();
  $("#run").show();
  return assemble().then(binCode => {
    launchDosbox(binCode);
  });
}

function runBase64() {
  $("#run").show();
  let base64code = $("#base64code").val();
  let binCode = base64decode(base64code);
  return launchDosbox(binCode);
}

function launchDosbox(binCode) {
  return launchCommand("dosbox", {
    binCode,
    cycles: $("#cycles-input").val()
  });
}

function launchCommand(commandId, msg) {
  let p = new Promise((resolve, reject) => {
    let command = commands[commandId];
    if (command) {
      command.iframe.parentNode.removeChild(command.iframe);
    }
    command = commands[commandId] = {
      iframe: document.createElement("iframe"),
      msg,
      resolve,
      reject
    };
    command.iframe.src = `${commandId}.html`;
    command.iframe.name = commandId;
    document.getElementById(commandId).appendChild(command.iframe);
  });
  return p;
}

window.onmessage = msg => {
  let command = commands[msg.data.commandId];
  if (msg.data.ready) {
    command.iframe.contentWindow.postMessage(command.msg, "*");
    return;
  }
  if (msg.data.errorMessage) {
    command.reject(msg.data.errorMessage);
    return;
  }
  if (msg.data.commandId === "nasm") {
    command.resolve(msg.data.binCode);
    return;
  }
  if (msg.data.commandId === "ndisasm") {
    command.resolve(msg.data.asmCode);
    return;
  }
};
