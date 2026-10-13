#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>

using namespace cv;
using namespace std;


void hideText(Mat& image, const string& text) {
    // Adiciona um delimitador especial ao final do texto para sinalizar o fim
    string fullText = text + "###END###";
    
    // Calcula quantos bits são necessários para armazenar o texto
    int totalBits = fullText.length() * 8;
    int totalPixels = image.rows * image.cols * 3; // 3 canais de cor por pixel
    
    if (totalBits > totalPixels) {
        cerr << "Erro: Imagem não tem pixels suficientes para armazenar o texto." << endl;
        cerr << "Necessário: " << totalBits << " bits, Disponível: " << totalPixels << " bits" << endl;
        return;
    }
    
    int bitIndex = 0;
    bool textHidden = false;
    
    for (int row = 0; row < image.rows && !textHidden; ++row) {
        for (int col = 0; col < image.cols && !textHidden; ++col) {
            Vec3b& pixel = image.at<Vec3b>(row, col);
            
            for (int channel = 0; channel < 3 && !textHidden; ++channel) {
                if (bitIndex >= totalBits) {
                    textHidden = true;
                    break;
                }
                
                // Pega o próximo bit do texto
                int charIndex = bitIndex / 8;
                int bitPosition = 7 - (bitIndex % 8);
                char currentChar = fullText[charIndex];
                int bit = (currentChar >> bitPosition) & 1;
                
                // Modifica apenas o bit menos significativo
                pixel[channel] = (pixel[channel] & 0xFE) | bit;
                
                bitIndex++;
            }
        }
    }
    
    cout << "Texto escondido com sucesso usando LSB!" << endl;
    cout << "Texto oculto: " << text.length() << " caracteres" << endl;
    cout << "Imagem salva como: Ada_lovelace_com_texto.png" << endl;
}

string revealText(const Mat& image) {
    string text;
    string currentChar = "";
    int bitCount = 0;
    bool endDetected = false;
    
    for (int row = 0; row < image.rows && !endDetected; ++row) {
        for (int col = 0; col < image.cols && !endDetected; ++col) {
            Vec3b pixel = image.at<Vec3b>(row, col);
            
            for (int channel = 0; channel < 3 && !endDetected; ++channel) {
                // Extrai o bit menos significativo
                int bit = pixel[channel] & 1;
                currentChar += (bit ? '1' : '0');
                bitCount++;
                
                // Quando temos 8 bits, converte para caractere
                if (bitCount == 8) {
                    char c = 0;
                    for (int i = 0; i < 8; ++i) {
                        c = (c << 1) | (currentChar[i] - '0');
                    }
                    
                    // Verifica se encontrou o delimitador de fim
                    if (text.length() >= 7 && text.substr(text.length() - 7) == "###END#") {
                        if (c == '#') {
                            endDetected = true;
                            text = text.substr(0, text.length() - 7); // Remove o delimitador
                            break;
                        }
                    }
                    
                    text += c;
                    currentChar = "";
                    bitCount = 0;
                }
            }
        }
    }
    
    return text;
}


int main() {
    cout << "🎯 O Enigma Lovelace" << endl;
    cout << "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" << endl;
    
    // Verifica se a imagem existe
    const string imagePath = "../../assets/images/Ada_lovelace.png";
    Mat image = imread(imagePath, IMREAD_COLOR); 
    
    if (image.empty()) {
        cerr << "❌ Erro: Não foi possível carregar a imagem '" << imagePath << "'" << endl;
        cerr << "💡 Certifique-se de que:" << endl;
        cerr << "   - A imagem existe na pasta atual" << endl;
        cerr << "   - O nome do arquivo está correto" << endl;
        cerr << "   - A imagem é um arquivo PNG válido" << endl;
        return -1;
    }
    
    cout << "✅ Imagem carregada: " << imagePath << endl;
    cout << "📏 Dimensões: " << image.cols << "x" << image.rows << " pixels" << endl;
    cout << "🎨 Canais: " << image.channels() << " (RGB)" << endl;

    string secretText = "Sou Ada. Vejo que você também enxerga a lógica por trás do caos.\nGuarde este código (ADA-7F2K), ele é a prova de que decifrou meu enigma. Mostre esta mensagem à organização e reivindique seu prêmio. ✨  ###END###";
    
    cout << "🔒 Escondendo texto na imagem..." << endl;
    hideText(image, secretText);

    const string outputPath = "../../build/Ada_lovelace_com_texto.png";
    cout << "💾 Salvando imagem modificada..." << endl;
    
    if (!imwrite(outputPath, image, vector<int>{IMWRITE_PNG_COMPRESSION, 0})) {
        cerr << "❌ Erro ao salvar a imagem com texto escondido." << endl;
        cerr << "💡 Verifique se você tem permissão de escrita na pasta atual." << endl;
        return -1;
    }
    
    cout << "🎉 Processo concluído com sucesso!" << endl;
    cout << "📁 Arquivo gerado: " << outputPath << endl;
    cout << "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" << endl;

    return 0; 
}
