# Makefile para O Enigma Lovelace - Sistema de Esteganografia
# Compilador e flags
CXX = g++
CXXFLAGS = -std=c++11 -Wall -Wextra -O2
OPENCV_FLAGS = `pkg-config --cflags --libs opencv4`

# Nomes dos executáveis
HIDE_EXEC = esconder_texto
REVEAL_EXEC = revelar_texto

# Arquivos fonte
HIDE_SRC = esconder_texto.cpp
REVEAL_SRC = revelar_texto.cpp

# Regra padrão - compila ambos os programas
all: $(HIDE_EXEC) $(REVEAL_EXEC)

# Compila o programa para esconder texto
$(HIDE_EXEC): $(HIDE_SRC)
	@echo "🔨 Compilando programa para esconder texto..."
	$(CXX) $(CXXFLAGS) -o $(HIDE_EXEC) $(HIDE_SRC) $(OPENCV_FLAGS)
	@echo "✅ Programa $(HIDE_EXEC) compilado com sucesso!"

# Compila o programa para revelar texto
$(REVEAL_EXEC): $(REVEAL_SRC)
	@echo "🔨 Compilando programa para revelar texto..."
	$(CXX) $(CXXFLAGS) -o $(REVEAL_EXEC) $(REVEAL_SRC) $(OPENCV_FLAGS)
	@echo "✅ Programa $(REVEAL_EXEC) compilado com sucesso!"

# Executa o programa para esconder texto
hide: $(HIDE_EXEC)
	@echo "🚀 Executando programa para esconder texto..."
	./$(HIDE_EXEC)

# Executa o programa para revelar texto
reveal: $(REVEAL_EXEC)
	@echo "Revelando texto..."
	./$(REVEAL_EXEC)

# Limpa os arquivos compilados
clean:
	@echo "🧹 Removendo arquivos compilados..."
	rm -f $(HIDE_EXEC) $(REVEAL_EXEC)
	@echo "✅ Limpeza concluída!"

# Instala dependências (Ubuntu/Debian)
install-deps:
	@echo "📦 Instalando dependências..."
	sudo apt update
	sudo apt install -y build-essential libopencv-dev pkg-config
	@echo "✅ Dependências instaladas!"

# Verifica se as dependências estão instaladas
check-deps:
	@echo "🔍 Verificando dependências..."
	@which g++ > /dev/null || (echo "❌ GCC não encontrado. Execute: make install-deps" && exit 1)
	@pkg-config --exists opencv4 || (echo "❌ OpenCV não encontrado. Execute: make install-deps" && exit 1)
	@echo "✅ Todas as dependências estão instaladas!"

# Mostra ajuda
help:
	@echo "🎯 O Enigma Lovelace - Sistema de Esteganografia"
	@echo ""
	@echo "Comandos disponíveis:"
	@echo "  make all          - Compila ambos os programas"
	@echo "  make hide         - Compila e executa o programa para esconder texto"
	@echo "  make reveal       - Compila e executa o programa para revelar texto"
	@echo "  make clean        - Remove arquivos compilados"
	@echo "  make install-deps - Instala dependências (Ubuntu/Debian)"
	@echo "  make check-deps   - Verifica se as dependências estão instaladas"
	@echo "  make help         - Mostra esta ajuda"
	@echo ""
	@echo "📝 Como usar:"
	@echo "  1. Coloque sua imagem PNG na pasta do projeto"
	@echo "  2. Execute: make hide (para esconder texto)"
	@echo "  3. Execute: make reveal (para revelar texto)"

# Marca como phony (não são arquivos)
.PHONY: all hide reveal clean install-deps check-deps help
