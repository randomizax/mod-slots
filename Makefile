SCRIPTS = $(wildcard *.user.js *.meta.js)
SRCS = $(wildcard src/*.js src/*.css)

all: $(SCRIPTS)

$(SCRIPTS): $(SRCS) build.py buildsettings.py
	./build.py randomizax
	cp build/randomizax/*.js .

publish: all
	git tag --force latest
	git push
	git push --tags --force

clean:
	rm -rf build
	rm **/*~
