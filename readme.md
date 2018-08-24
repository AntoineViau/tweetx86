# TweetX86

Pure client-side combination of Nasm, DosBox and WebAssembly to show off your x86 skills in a tweet (or more).  
You can play with it here : http://www.antoineviau.com/tweetx86

## What ?

Enter your x86 assembly code in the text box on the left, assemble and run.  
When you assemble, the generated binary (a .COM file) is converted to base64 in the text box on the right.  
You can use this base64 string in the URL :

    http://127.0.0.1:8080/?c=sBPNELgAoI7Av6B9uCcnJogFsAC0hrkBALoCAM0VV1Ex/7kAfTHA86tZX0913jDkzRa4AwDNEMM=

The max code size is limited by your browser capabilities (memory) and specifications ([URL length](https://stackoverflow.com/questions/812925/what-is-the-maximum-possible-length-of-a-query-string)).  
But you can code far more than a tweet !

## Technicalities

TweetX86 is based on :

- a port of [Nasm](https://www.nasm.us/) to WebAssembly
- a port of NDisasm to WebAssembly
- [Em-DosBox](https://github.com/dreamlayers/em-dosbox) (compiled to asm.js so far)
- [JQuery](https://github.com/jquery/jquery) and [Bootstrap](https://github.com/twbs/bootstrap) (and [one of the examples](https://getbootstrap.com/docs/4.1/examples/cover/) given on the website)

Nasm, NDisasm and Em-Dosbox are basically treated as shell commands. Each of them is a C program with a `main(int cargs, char *argvs[])`, and seems to be stateful.  
Therefore, to make them stateless, each command is in an IFrame. When TweetX86 needs to call a command, it simply create a DOM node with the corresponding IFrame :

    function launchCommand(commandId, msg) {
        let p = new Promise((resolve, reject) => {
            let command = commands[commandId];
            if (command) {
                command.iframe.parentNode.removeChild(command.iframe);
            }
            command = commands[commandId] = {
                iframe: document.createElement('iframe'),
                msg,
                resolve,
                reject
            }
            command.iframe.src = `${commandId}.html`;
            command.iframe.name = commandId;
            document.getElementById(commandId).appendChild(command.iframe);
        })
        return p;
    }

Nasm and NDisasm have been modified to be an Emscripten compliant WASM able to accept command line arguments :

    let nasm = Module.cwrap('nasm', 'number', ['string']);
    let now = new Date();
    let asmFileName = `/asm${now.getTime()}.asm`;
    let comFileName = `/asm${now.getTime()}.com`;
    let cmdLine = `-fbin ${asmFileName} -o${comFileName}`;
    let retVal = nasm(cmdLine);

## Build

First, install [Emscripten](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html).

Then build Nasm and NDisasm :

    cd nasm
    make clean
    emconfigure ./configure
    emmake make
    mv nasm nasm.bc
    mv ndisasm ndisasm.bc
    emcc nasm.bc -s WASM=1 -o nasm.js -s NO_EXIT_RUNTIME=0 -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["cwrap"]'
    emcc ndisasm.bc -s WASM=1 -o ndisasm.js -s NO_EXIT_RUNTIME=0 -s 'EXTRA_EXPORTED_RUNTIME_METHODS=["cwrap"]'
    cp ./nasm.wasm ../tweetx86
    cp ./nasm.js ../tweetx86
    cp ./ndisasm.wasm ../tweetx86
    cp ./ndisasm.js ../tweetx86

Build Em-Dosbox :

    cd em-dosbox
    ./autogen.sh
    emconfigure ./configure
    make
    cp src/dosbox.js ../tweetx86
    cp src/dosbox.html.mem ../tweetx86

Build and launch TweetX86 :

    cd tweetx86
    npm install
    npm start
