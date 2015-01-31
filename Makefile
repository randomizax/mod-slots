SCRIPTS = $(wildcard *.user.js *.meta.js)
SRCS = $(wildcard src/*.js src/*.css)

all: $(SCRIPTS)

$(SCRIPTS): $(SRCS) build.py buildsettings.py
	./build.py randomizax
	cp build/randomizax/*.js .
