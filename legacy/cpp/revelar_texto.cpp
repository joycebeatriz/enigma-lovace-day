#include <iostream>
#include <opencv2/opencv.hpp>

using namespace std;
using namespace cv;

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
    const string imagePath = "../../build/Ada_lovelace_com_texto.png";
    Mat loadedImage = imread(imagePath, IMREAD_COLOR);
    
    if (loadedImage.empty()) {
        cerr << "Erro: Imagem não encontrada." << endl;
        return -1;
    }

    string recoveredText = revealText(loadedImage);
    
    if (recoveredText.empty()) {
        cout << "Nenhum texto encontrado na imagem." << endl;
    } else {
        cout << recoveredText << endl;
    }
    
    return 0;
}

