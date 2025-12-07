import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

def get_api_key(key_name="GEMINI_API_KEY"):
   
    key = os.getenv(key_name)
    if not key:
        raise Exception(f"API key '{key_name}' not found in .env file")
    return key
