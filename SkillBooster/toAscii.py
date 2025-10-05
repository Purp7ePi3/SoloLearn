import cv2
import numpy as np
import os
import time
from PIL import Image, ImageDraw, ImageFont
import argparse
import pygame
import threading
from moviepy.editor import VideoFileClip

class VideoToASCII:
    def __init__(self, width=80, height=60):

        self.width = width
        self.height = height
        # Caratteri ASCII ordinati per densità
        self.ascii_chars = "@%#*+=-:. "
        
    def frame_to_ascii(self, frame):

        frame = cv2.resize(frame, (self.width, self.height))
        
        if len(frame.shape) == 3:
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        else:
            gray_frame = frame
            
        ascii_frame = ""
        for row in gray_frame:
            for pixel in row:
                # Mappo il valore in pixel
                char_index = int(pixel / 255 * (len(self.ascii_chars) - 1))
                ascii_frame += self.ascii_chars[char_index]
            ascii_frame += "\n"
            
        return ascii_frame
            
    def extract_audio(self, video_path, temp_audio_path="temp_audio.wav"):

        try:
            video = VideoFileClip(video_path)
            audio = video.audio
            if audio is not None:
                audio.write_audiofile(temp_audio_path, verbose=False, logger=None)
                video.close()
                return temp_audio_path
            else:
                print("Attenzione: Il video non contiene audio")
                video.close()
                return None
        except Exception as e:
            print(f"Errore nell'estrazione audio: {e}")
            return None
    
    def play_audio(self, audio_path, start_time=0):

        try:
            pygame.mixer.init()
            pygame.mixer.music.load(audio_path)
            
            # Se c'è un tempo di inizio, lo impostiamo
            if start_time > 0:
                pygame.mixer.music.set_pos(start_time)
            
            pygame.mixer.music.play()
            
        except Exception as e:
            print(f"Errore nella riproduzione audio: {e}")
    
    def stop_audio(self):
        try:
            pygame.mixer.music.stop()
            pygame.mixer.quit()
        except:
            pass
    
    def play_video_ascii(self, video_path, fps_delay=None, with_audio=True):

        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"Errore: Impossibile aprire il video {video_path}")
            return
            
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if fps_delay is None:
            fps_delay = 1.0 / fps
            
        print(f"Video: {video_path}")
        print(f"FPS: {fps}, Frame totali: {frame_count}")
        print(f"Risoluzione ASCII: {self.width}x{self.height}")
        print("Premi Ctrl+C per fermare la riproduzione\n")

        audio_thread = None
        temp_audio_path = None
        
        if with_audio:
            temp_audio_path = self.extract_audio(video_path)
            if temp_audio_path:
                audio_thread = threading.Thread(target=self.play_audio, args=(temp_audio_path,))
                audio_thread.daemon = True
                audio_thread.start()
        
        frame_num = 0
        
        try:
            while True:
                ret, frame = cap.read()
                
                if not ret:
                    print("\nFine del video!")
                    break
                
                os.system('cls' if os.name == 'nt' else 'clear')
                
                # Converte e mostra il frame ASCII
                ascii_frame = self.frame_to_ascii(frame)
                print(f"Frame {frame_num + 1}/{frame_count}")
                print(ascii_frame)
                
                frame_num += 1
                time.sleep(fps_delay)
                
        except KeyboardInterrupt:
            print("\nRiproduzione interrotta dall'utente.")
        finally:
            cap.release()
            self.stop_audio()
            if temp_audio_path and os.path.exists(temp_audio_path):
                try:
                    os.remove(temp_audio_path)
                except:
                    pass
    
    def save_video_ascii(self, video_path, output_path):
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"Errore: Impossibile aprire il video {video_path}")
            return
            
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        with open(output_path, 'w', encoding='utf-8') as f:
            frame_num = 0
            
            while True:
                ret, frame = cap.read()
                
                if not ret:
                    break
                    
                ascii_frame = self.frame_to_ascii(frame)
                f.write(f"=== FRAME {frame_num + 1} ===\n")
                f.write(ascii_frame)
                f.write("\n" + "="*50 + "\n\n")
                
                frame_num += 1

                progress = (frame_num / frame_count) * 100
                print(f"\rProgresso: {progress:.1f}% ({frame_num}/{frame_count})", end='')
        
        print(f"\nVideo ASCII salvato in: {output_path}")
        cap.release()
    
    def create_ascii_gif(self, video_path, output_path, max_frames=100):
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"Errore: Impossibile aprire il video {video_path}")
            return
            
        frames = []
        frame_count = 0
        
        try:
            font = ImageFont.truetype("arial.ttf", 12)
        except:
            font = ImageFont.load_default()
        
        while frame_count < max_frames:
            ret, frame = cap.read()
            
            if not ret:
                break
                
            ascii_frame = self.frame_to_ascii(frame)
            
            # Crea immagine PIL dal testo ASCII
            img = Image.new('RGB', (800, 600), color='black')
            draw = ImageDraw.Draw(img)
            draw.text((10, 10), ascii_frame, fill='white', font=font)
            
            frames.append(img)
            frame_count += 1
            
            print(f"\rProcessando frame: {frame_count}", end='')

        if frames:
            frames[0].save(
                output_path,
                save_all=True,
                append_images=frames[1:],
                duration=100,
                loop=0
            )
            print(f"\nGIF ASCII creata: {output_path}")
        
        cap.release()

def main():
    parser = argparse.ArgumentParser(description='Convertitore Video to ASCII Art')
    parser.add_argument('video', help='Percorso del file video')
    parser.add_argument('--width', '-w', type=int, default=80, help='Larghezza ASCII (default: 80)')
    parser.add_argument('--height', type=int, default=60, help='Altezza ASCII (default: 60)')
    parser.add_argument('--mode', '-m', choices=['play', 'save', 'gif'], default='play',
                       help='Modalità: play (riproduce), save (salva su file), gif (crea GIF)')
    parser.add_argument('--output', '-o', help='File di output (per save e gif)')
    parser.add_argument('--fps', '-f', type=float, help='FPS personalizzato')
    parser.add_argument('--no-audio', action='store_true', help='Disabilita la riproduzione audio')
    
    args = parser.parse_args()
    
    # Crea il convertitore
    converter = VideoToASCII(width=args.width, height=args.height)
    
    if args.mode == 'play':
        with_audio = not args.no_audio
        converter.play_video_ascii(args.video, args.fps, with_audio)
    elif args.mode == 'save':
        if not args.output:
            args.output = args.video.rsplit('.', 1)[0] + '_ascii.txt'
        converter.save_video_ascii(args.video, args.output)
    elif args.mode == 'gif':
        if not args.output:
            args.output = args.video.rsplit('.', 1)[0] + '_ascii.gif'
        converter.create_ascii_gif(args.video, args.output)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) == 1:
        print("Esempio di utilizzo:")
        print("python video_to_ascii.py video.mp4 --mode play")
        print("python video_to_ascii.py video.mp4 --mode save --output output.txt")
        print("python video_to_ascii.py video.mp4 --mode gif --output output.gif")
        print("\nAvvio modalità demo...")
        
        converter = VideoToASCII(width=60, height=40)
        print("Prova con webcam (premi Ctrl+C per fermare):")
        
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            try:
                while True:
                    ret, frame = cap.read()
                    if ret:
                        os.system('cls' if os.name == 'nt' else 'clear')
                        ascii_frame = converter.frame_to_ascii(frame)
                        print("WEBCAM ASCII (Ctrl+C per fermare)")
                        print(ascii_frame)
                        time.sleep(0.1)
            except KeyboardInterrupt:
                print("\nDemo terminata.")
            finally:
                cap.release()
        else:
            print("Webcam non disponibile. Specifica un file video come argomento.")
    else:
        main()