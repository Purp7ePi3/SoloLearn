
#include <Adafruit_GFX.h>
#include <Adafruit_ST7789.h>
#include <SPI.h>

#define TFT_CS    10
#define TFT_RST   9
#define TFT_DC    8

Adafruit_ST7789 tft = Adafruit_ST7789(TFT_CS, TFT_DC, TFT_RST);

void setup() {
  Serial.begin(9600);
  Serial.println("Inizializzazione Display IPS...");
  
  tft.init(240, 240, SPI_MODE2);
  
  tft.setRotation(2);
  
  tft.fillScreen(ST77XX_BLACK);
  
  mostraBenvenuto();
  delay(2000);
  
  demoGrafica();
}

void loop() {
  cicloColori();
  delay(1000);
  
  formeCasuali();
  delay(2000);
  
  demoTesto();
  delay(2000);
}

void mostraBenvenuto() {
  tft.fillScreen(ST77XX_BLACK);
  tft.setTextColor(ST77XX_WHITE);
  tft.setTextSize(2);
  tft.setCursor(30, 100);
  tft.println("Simo's project");
  tft.setCursor(50, 120);
}

void demoGrafica() {
  tft.fillScreen(ST77XX_BLACK);
  
  tft.drawRect(10, 10, 220, 220, ST77XX_RED);
  tft.drawRect(20, 20, 200, 200, ST77XX_GREEN);
  tft.drawRect(30, 30, 180, 180, ST77XX_BLUE);
  
  delay(1000);
  
  tft.fillCircle(120, 120, 80, ST77XX_YELLOW);
  tft.fillCircle(120, 120, 60, ST77XX_MAGENTA);
  tft.fillCircle(120, 120, 40, ST77XX_CYAN);
  
  delay(1000);
}

void cicloColori() {
  uint16_t colori[] = {
    ST77XX_RED, ST77XX_GREEN, ST77XX_BLUE,
    ST77XX_YELLOW, ST77XX_CYAN, ST77XX_MAGENTA,
    ST77XX_WHITE
  };
  
  for (int i = 0; i < 7; i++) {
    tft.fillScreen(colori[i]);
    delay(200);
  }
}

void formeCasuali() {
  tft.fillScreen(ST77XX_BLACK);
  
  for (int i = 0; i < 20; i++) {
    int x = random(240);
    int y = random(240);
    int r = random(10, 40);
    uint16_t colore = random(0xFFFF);
    
    if (i % 2 == 0) {
      tft.fillCircle(x, y, r, colore);
    } else {
      tft.fillRect(x, y, r, r, colore);
    }
  }
}

void demoTesto() {
  tft.fillScreen(ST77XX_BLACK);

  tft.setTextSize(1);
  tft.setTextColor(ST77XX_WHITE);
  tft.setCursor(10, 10);
  tft.println("Dimensione 1: Piccolo");
  
  tft.setTextSize(2);
  tft.setTextColor(ST77XX_GREEN);
  tft.setCursor(10, 30);
  tft.println("Dimensione 2");
  
  tft.setTextSize(3);
  tft.setTextColor(ST77XX_CYAN);
  tft.setCursor(10, 60);
  tft.println("Dim. 3");

  tft.setTextSize(2);
  tft.setTextColor(ST77XX_RED);
  tft.setCursor(10, 120);
  tft.println("Ciao!");
  
  tft.setTextColor(ST77XX_YELLOW);
  tft.setCursor(10, 150);
  tft.print("Valore: ");
  tft.println(123);
}


void scriviTesto(const char* testo, int x, int y, int dimensione, uint16_t colore) {
  tft.setTextSize(dimensione);
  tft.setTextColor(colore);
  tft.setCursor(x, y);
  tft.println(testo);
}

void scriviNumero(int numero, int x, int y, int dimensione, uint16_t colore) {
  tft.setTextSize(dimensione);
  tft.setTextColor(colore);
  tft.setCursor(x, y);
  tft.println(numero);
}

void pulisciSchermo(uint16_t colore) {
  tft.fillScreen(colore);
}