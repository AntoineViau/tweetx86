let commands = {
  nasm: undefined,
  ndisasm: undefined,
  dosbox: undefined
};

$(document).ready(() => {
  $("#base64code").bind("input propertychange", () => {
    $("#base64length").text($("#base64code").val().length);
  });
  let base64code = new URL(window.location.href).searchParams.get("c");
  let cycles = new URL(window.location.href).searchParams.get("s") || 10000;
  $("#cycles-input").val(cycles);
  if (base64code) {
    $("#base64code").val(base64code);
    $("#base64length").text(base64code.length);
    runBase64();
  } else {
    fetch("tube.asm")
      .then(response => response.text())
      .then(asmCode => $("#asmCode").val(asmCode));
  }
});

function assemble() {
  $("#base64code").val("Assembling...");
  let asmCode = $("#asmCode").val();
  return launchCommand("nasm", asmCode).then(
    binCode => {
      let base64code = base64encode(binCode);
      $("#base64code").val(base64code);
      $("#base64length").text(base64code.length);
      return binCode;
    },
    error => {
      $("#base64code").val(error);
    }
  );
}

function disassemble() {
  $("#asmCode").val("Disassembling...");
  let base64 = $("#base64code").val();
  return launchCommand("ndisasm", base64).then(asmCode => {
    $("#asmCode").val(asmCode);
    return asmCode;
  });
}

function runAsm() {
  return assemble().then(binCode => {
    launchDosbox(binCode);
  });
}

function runBase64() {
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
