B_PUB_DIR=./lib/client
B_NAME=main
B_SRC=$(B_PUB_DIR)/$(B_NAME).js
B_BUNDLE=$(B_PUB_DIR)/$(B_NAME).bundle.js

all:
	mkdir -p ./lib
	cp -R ./src/client ./lib/client
	find ./lib -name "*.coffee" -exec rm {} \;
	coffee -o lib -c src
	browserify $(B_SRC) -o $(B_BUNDLE)

release:
	closure-compiler --js $(B_BUNDLE) --js_output_file $(B_PUB_DIR)/$(B_NAME).min.js


clean:
	rm -rf lib

