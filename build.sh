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
cd ..

cd em-dosbox
./autogen.sh
emconfigure ./configure
make
cp src/dosbox.js ../tweetx86
cp src/dosbox.html.mem ../tweetx86
cd ..
