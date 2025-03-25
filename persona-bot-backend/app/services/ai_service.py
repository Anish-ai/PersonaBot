import re
import json
import logging
from typing import Dict, Any, Tuple, List
from concurrent.futures import ThreadPoolExecutor

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, krutrim_client, groq_client):
        self.krutrim = krutrim_client
        self.groq = groq_client
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.initial_personas = [
            "age", "big five scores", "current mood and emotions",
            "stress level", "sleep quality and patterns", "self-care practices",
            "social support", "personal history", "lifestyle and experiences",
            "education level", "employment status & industry",
            "marital status & family structure", "household language & cultural background",
            "financial status & income", "mental health history",
            "coping strategies", "interests & hobbies", "physical activity & nutrition habits"
        ]
        self.min_data_for_analysis = 5  # Minimum data points before generating analysis
        self.context_window = 4  # Number of previous messages to consider as context

    async def process_message(self, message: str, history: List[Dict[str, Any]], extracted_data: Dict[str, Any]) -> Tuple[str, Dict[str, Any], Dict[str, Any]]:
        """
        Process incoming message through the full AI pipeline:
        1. Generate a counselor response
        2. Extract relevant data
        3. Generate analysis if enough data exists
        """
        try:
            # Generate response first to maintain conversation flow
            response = await self._generate_response(message, history, extracted_data)
            
            # Extract data in parallel with response generation
            extracted_task = self.executor.submit(
                self._extract_data, message, history, extracted_data
            )
            extracted = extracted_task.result()
            
            # Generate analysis if we have sufficient data
            analysis = {}
            if len(extracted) >= self.min_data_for_analysis:
                analysis_task = self.executor.submit(
                    self._generate_analysis, extracted
                )
                analysis = analysis_task.result()
            
            return response, extracted, analysis
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            # Return a safe default response
            return (
                "I'm having some technical difficulties. Could you please repeat that?",
                extracted_data,
                {}
            )

    async def _generate_response(self, message: str, history: List[Dict[str, Any]], extracted_data: Dict[str, Any]) -> str:
        """
        Generate a natural counseling response using Groq's model
        """
        try:
            # Determine current topics to focus on
            remaining_personas = [p for p in self.initial_personas if p not in extracted_data]
            current_personas = remaining_personas[:3] if remaining_personas else ["general wellbeing"]
            
            # Build context from recent messages
            recent_context = history[-self.context_window:] if history else []
            context_str = "\n".join(
                f"{msg['role']}: {msg['content']}" for msg in recent_context
            )
            
            # Prepare the prompt
            prompt = (
                f"Client message: {message}\n\n"
                f"Conversation context:\n{context_str}\n\n"
                f"Current focus areas: {', '.join(current_personas)}\n\n"
                "Generate a brief, empathetic counselor response (1-2 sentences) "
                "that naturally explores these topics without direct questioning."
            )
            
            # Call Groq API
            response = self.groq.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an experienced mental health counselor. "
                            "Use active listening and open-ended questions. "
                            "Keep responses concise and natural."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1024,
                top_p=0.9
            )
            
            # Clean and return the response
            return self._clean_response(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return "I appreciate you sharing that. Could you tell me more about how you're feeling?"

    def _extract_data(self, message: str, history: List[Dict[str, Any]], data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract relevant information from the conversation
        """
        try:
            # Prepare context
            recent_context = history[-self.context_window:] if history else []
            context_str = "\n".join(
                f"{msg['role']}: {msg['content']}" for msg in recent_context
            )
            
            # Determine which personas we're missing data for
            missing_personas = [p for p in self.initial_personas if p not in data]
            
            if not missing_personas:
                return data  # No new data to extract
                
            # Create extraction prompt
            prompt = (
                f"Extract the following information from this conversation:\n"
                f"Topics: {', '.join(missing_personas)}\n\n"
                f"Recent conversation:\n{context_str}\n\n"
                f"Latest message:\n{message}\n\n"
                "Return ONLY a JSON object with the extracted information. "
                "If no information is available for a topic, omit it."
            )
            
            # Call Groq API for extraction
            response = self.groq.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an information extraction expert. "
                            "Identify and extract specific details from the conversation. "
                            "Return only valid JSON."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=512,
                response_format={"type": "json_object"}
            )
            
            # Parse and merge the extracted data
            extracted = json.loads(response.choices[0].message.content)
            return {**data, **extracted}
            
        except Exception as e:
            logger.error(f"Error extracting data: {str(e)}")
            return data  # Return original data if extraction fails

    def _generate_analysis(self, data: Dict[str, Any]) -> Dict[str, str]:
        """
        Generate comprehensive mental health analysis using Krutrim's model
        """
        try:
            # Prepare analysis prompt
            prompt = (
                f"Analyze this mental health data:\n{json.dumps(data, indent=2)}\n\n"
                "Provide a professional analysis with these sections:\n"
                "1. Mental Health Profile (overall assessment)\n"
                "2. Key Traits (personality characteristics)\n"
                "3. Support Strategies (recommended approaches)\n"
                "4. Information Gaps (missing data points)\n"
                "5. Summary (concise overview)\n\n"
                "Use clear, professional language suitable for a counselor."
            )
            
            # Call Krutrim API
            response = self.krutrim.chat.completions.create(
                model="DeepSeek-R1",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a clinical psychologist analyzing client data. "
                            "Provide thorough but concise analysis with clear sections."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1024
            )
            
            # Parse the structured analysis
            return self._parse_analysis(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error generating analysis: {str(e)}")
            return {}

    def _clean_response(self, text: str) -> str:
        """
        Clean the AI response by removing unwanted artifacts
        """
        # Remove any thinking/explanation tags
        text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
        # Remove any citations or references
        text = re.sub(r'\([^)]*\)', '', text)
        # Remove any remaining HTML-like tags
        text = re.sub(r'<.*?>', '', text)
        # Collapse multiple spaces and trim
        return ' '.join(text.split()).strip()

    def _parse_analysis(self, text: str) -> Dict[str, str]:
        """
        Parse the analysis text into structured sections
        """
        sections = [
            "Mental Health Profile",
            "Key Traits",
            "Support Strategies",
            "Information Gaps",
            "Summary"
        ]
        result = {}
        current_section = None
        
        for line in text.split('\n'):
            line = line.strip()
            # Check if this line starts a new section
            for section in sections:
                if line.startswith(section):
                    current_section = section
                    result[current_section] = []
                    break
            # Add content to current section
                elif current_section and line:
                    result[current_section].append(line)
        
        # Join lines for each section and filter out empty sections
        return {
            k: ' '.join(v).strip()
            for k, v in result.items()
            if v and k in sections
        }