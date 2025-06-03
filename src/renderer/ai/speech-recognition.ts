/**
 * Record the audio using the native navigator's MediaDevices
 * Sends the audio to a local python server through Websocket (using native WebSocket)
 * on port 2700
 */
class SpeechRecognition {
  private VOSK_BRIDGE_URL = 'ws://localhost:2700';
  private cb: any; // TODO - Type, two args: resultType and content

  private ws: WebSocket | null;
  private audioContext: AudioContext | null;
  private processor: ScriptProcessorNode | null;
  private audioStream: MediaStream | null;

  constructor() {
    this.audioContext = null;
    this.processor = null;
    this.audioStream = null;
    this.ws = null;
  }

  public async start(cb: any) {
    console.log('Speech recognition - start recording');
    this.cb = cb;
    // Create the websocket for this recognition session
    this.ws = new WebSocket(this.VOSK_BRIDGE_URL);
    this.ws.onopen = () => {
      console.log('Connected to the local Vosk bridge');
    };
    this.ws.onclose = () => {
      console.warn('Vosk WebSocket closed');
    };
    this.ws.onerror = (err) => {
      console.error('Vosk WebSocket error:', err);
    };
    this.ws.onmessage = (event) => {
      if (!this.cb) {
        console.error(
          'Speech recognition - cb should be defined at this point.',
        );
        return;
      }
      const data = event.data;
      console.log('Speech recognition result from Vosk:');
      console.log(data.toString());
      try {
        const result = JSON.parse(data.toString());
        if (result.partial) {
          // Send live partial to renderer
          console.log('transcript-partial: ', result.partial);
          this.cb('transcription-interim-result', result.partial);
        } else if (result.text) {
          // Final transcript
          console.log('transcript-final: ', result.text);
          this.cb('transcription-result', result.text);
        }
      } catch (err) {
        console.error('Error parsing message from Vosk:', err);
      }
    };
    try {
      // Get microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
        },
      });

      // Create audio context for processing
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      const source = this.audioContext.createMediaStreamSource(
        this.audioStream,
      );

      // Create ScriptProcessorNode (deprecated but widely supported)
      // or use AudioWorklet for modern approach
      this.processor = this.audioContext.createScriptProcessor(16384, 1, 1);

      this.processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0); // mono channel

        const hasAudio = inputData.some((sample) => Math.abs(sample) > 0.01);
        if (hasAudio) {
          console.log(
            'Audio detected, max amplitude:',
            Math.max(...inputData.map(Math.abs)),
          );
        } else {
          console.warn('No audio detected');
        }

        // Convert Float32Array to Int16Array (PCM 16-bit)
        const pcmData = this.floatTo16BitPCM(inputData);

        // Send raw PCM data to Python server
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(pcmData.buffer);
        }
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  public stop() {
    console.log('Speech recognition - stop recording');
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.cb) {
      this.cb = null;
    }
  }

  floatTo16BitPCM(input) {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    let offset = 0;

    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Int16Array(buffer);
  }
}

console.log('Instantiating SpeechRecognition class');

export const speechRecognition = new SpeechRecognition();
