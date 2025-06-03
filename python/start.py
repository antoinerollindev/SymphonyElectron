import os
import sys
import subprocess
from pathlib import Path
import urllib.request
import zipfile

# Python script to start the vosk-birdge local server
# It will:
# - Create the virtual environment if not there yet (the first time) and install dependencies (in the requirements file)
# - Download the Vosk model from https://alphacephei.com, unzip it and store it in the model/en folder, if not there
# - Run the vosk-bridge server

here = Path(__file__).resolve().parent
venv_dir = here / 'venv'
venv_python = venv_dir / 'bin' / 'python'  # on Windows: Scripts\python.exe

if not venv_python.exists():
  print("🔧 Creating virtual environment...")
  subprocess.check_call([sys.executable, '-m', 'venv', str(venv_dir)])
  print("📦 Installing dependencies...")
  subprocess.check_call([str(venv_python), '-m', 'pip', 'install', '--upgrade', 'pip'])
  subprocess.check_call([str(venv_python), '-m', 'pip', 'install', '-r', str(here / 'requirements.txt')])

model_dir = here / 'model' / 'en'
model_url = 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip'
model_zip = here / 'model.zip'

if not model_dir.exists():
    print("📥 Model not found, downloading...")
    os.makedirs(here / 'model', exist_ok=True)

    urllib.request.urlretrieve(model_url, model_zip)
    print("📦 Unzipping model...")
    with zipfile.ZipFile(model_zip, 'r') as zip_ref:
        zip_ref.extractall(here / 'model')

    # Find extracted folder (e.g., vosk-model-small-en-us-0.15) and rename
    extracted_folder = next((here / 'model').glob('vosk-model-*'), None)
    if extracted_folder:
        extracted_folder.rename(model_dir)
    else:
        print("❌ Failed to find extracted model folder.")
        sys.exit(1)

    # Clean up zip
    model_zip.unlink()
    print("✅ Model ready.")

print("🚀 Starting server...")
os.execv(str(venv_python), [str(venv_python), str(here / 'vosk-bridge.py')])
