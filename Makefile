PYTHON ?= python3
PORT ?= 8000
IMAGE ?= assets/images/Ada_lovelace_com_texto.png

.PHONY: help serve reveal check-js test
help:
	@echo "make serve     Serve o jogo em http://localhost:$(PORT)/web/"
	@echo "make reveal    Extrai a mensagem do PNG (requer Pillow)"
	@echo "make check-js  Confere a sintaxe dos scripts (requer Node.js)"
	@echo "make test      Testa o backend de login com serviços simulados"
serve:
	$(PYTHON) -m http.server $(PORT) --bind 127.0.0.1
reveal:
	$(PYTHON) tools/enigma.py reveal "$(IMAGE)"
check-js:
	@for script in web/js/*.js; do node --check "$$script" || exit 1; done

test: check-js
	node tests/auth-server.test.cjs
