from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    krutrim_api_key: str
    groq_api_key: str
    krutrim_model: str = "DeepSeek-R1"
    groq_model: str = "deepseek-r1-distill-llama-70b"
    
    class Config:
        env_file = ".env"

settings = Settings()