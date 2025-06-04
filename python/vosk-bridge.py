import asyncio
import websockets
import json
import vosk
import wave
import os
from pathlib import Path
    
here = Path(__file__).resolve().parent

# POC version of a local Vosk server that would:
# Receive chuks of raw PCM audio data (16-bit, 16kHz, mono) through websocket
# Use Vosk to get the transcript out of it
# Send the result back in the socket (partial and final results)
class VoskServer:
  def __init__(self):
    model_dir = here / "model/en"
    if not model_dir.exists():
      print("Please download the model from https://alphacephei.com/vosk/models and put it in the model/en folder")
      exit(1)
          
    self.model = vosk.Model(str(model_dir))
    print("Model loaded successfully")
        
  async def handle_client(self, websocket):
    print("Client connected")
    rec = vosk.KaldiRecognizer(self.model, 16000)
    rec.SetWords(True)  # Get word timestamps
    rec.SetPartialWords(True)  # Get partial word results

    # Debug: Save received audio to file for inspection
    debug_audio = []

    # Don't send to small chunks to Vosk
    audio_buffer = bytearray()
    min_chunk_size = 8000
    total_bytes = 0
        
    async for message in websocket:
      try:
        # Debug logging
        chunk_size = len(message)
        total_bytes += chunk_size
        print(f"Received {chunk_size} bytes, total: {total_bytes}")
        
        # Save audio data for debugging
        debug_audio.extend(message)
        
        # Add to buffer
        audio_buffer.extend(message)
        
        # Process when we have enough data
        while len(audio_buffer) >= min_chunk_size:
          # Take a chunk from buffer
          chunk = bytes(audio_buffer[:min_chunk_size])
          audio_buffer = audio_buffer[min_chunk_size:]
          
          print(f"Processing chunk of {len(chunk)} bytes")
          
          if rec.AcceptWaveform(chunk):
            result = json.loads(rec.Result())
            print(f"Final result: {result}")
            if result.get('text'):
              await websocket.send(json.dumps(result))
          else:
            partial = json.loads(rec.PartialResult())
            print(f"Partial result: {partial}")
            if partial.get('partial'):
              await websocket.send(json.dumps(partial))
                    
      except Exception as e:
        print(f"Error processing audio: {e}")
        import traceback
        traceback.print_exc()
  
    # Save debug audio file when client disconnects
    # Add this back if you want to save the audio record to a file - Useful for debugging audio buffers
    # if debug_audio:
    #   self.save_debug_audio(debug_audio)
    
  def save_debug_audio(self, audio_data):
      """Save received audio as WAV file for debugging"""
      try:
          with wave.open('debug_audio.wav', 'wb') as wav_file:
              wav_file.setnchannels(1)  # mono
              wav_file.setsampwidth(2)  # 16-bit
              wav_file.setframerate(16000)  # 16kHz
              wav_file.writeframes(bytes(audio_data))
          print("Debug audio saved as debug_audio.wav")
      except Exception as e:
          print(f"Error saving debug audio: {e}")

async def main():
  server = VoskServer()
  async with websockets.serve(server.handle_client, "localhost", 2700):
    print("WebSocket server running on ws://localhost:2700")
    try:
      await asyncio.Future()  # run forever
    except asyncio.CancelledError:
      print("🛑 Task cancelled.")
    finally:
      print("✅ Cleanup complete.")

if __name__ == "__main__":
  try:
    asyncio.run(main())
  except KeyboardInterrupt:
    print("\n👋 Keyboard interrupt received. Exiting cleanly.")