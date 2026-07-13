.PHONY: format lint test

format:
	python3 -m compileall -q app.py tests

lint:
	python3 -m compileall -q app.py tests
	node --check assets/proofbook.js
	node --check assets/proofbook-core.mjs

test:
	python3 -m unittest discover -s tests -v
	node --test tests/proofbook-core.test.mjs
