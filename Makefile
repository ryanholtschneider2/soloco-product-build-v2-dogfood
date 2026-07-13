.PHONY: format lint test

format:
	python3 -m compileall -q app.py tests

lint:
	python3 -m compileall -q app.py tests

test:
	python3 -m unittest discover -s tests -v
