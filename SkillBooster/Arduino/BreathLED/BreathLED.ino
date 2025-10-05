#define led3 3
#define pin5 5
#define led11 11

bool lastPress = 0;
bool led = 0;
unsigned long lastDebounceTime = 0;
const long debounceDelay = 100;

int brightness = 0;
int fadeAmount = 1;
unsigned long previousMillis = 0;
const long fadeInterval = 10;

void setup() {
  Serial.begin(9600);
  pinMode(led3, OUTPUT);
  pinMode(pin5, INPUT_PULLUP);
  pinMode(led11, OUTPUT);
}

void loop() {
  int val = digitalRead(pin5);
  
  if (!val && lastPress && (millis() - lastDebounceTime > debounceDelay)) {
    led = !led;
    Serial.println(String("Button pressed ") + val);
    digitalWrite(led3, led);
    lastPress = 0;
    lastDebounceTime = millis();
  }
  
  if (val && !lastPress) { 
    Serial.println(String("Button released ") + val);
    lastPress = 1;
  }
  
  unsigned long currentMillis = millis();
  
  if (currentMillis - previousMillis >= fadeInterval) {
    previousMillis = currentMillis;
    
    analogWrite(led11, brightness);
    
    brightness += fadeAmount;
    
    if (brightness <= 0 || brightness >= 255) {
      fadeAmount = -fadeAmount;
    }
  }
}