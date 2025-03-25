from fastapi import Depends
from krutrim_cloud import KrutrimCloud
from groq import Groq
from .config import settings  # Ensure settings is correctly imported

# Dependency function to provide KrutrimCloud client
def get_krutrim_client():
    return KrutrimCloud(api_key=settings.krutrim_api_key)

# Dependency function to provide Groq client
def get_groq_client():
    return Groq(api_key=settings.groq_api_key)
