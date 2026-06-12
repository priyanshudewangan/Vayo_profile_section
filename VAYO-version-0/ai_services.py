"""
AI Services 
OpenRouter Integration 

Handles:
1. Profile Sanitization + Enrichment
2. Embedding Generation
3. AI Introduction with Safety Moderation
"""
import json
import logging
import os
import re
from typing import List, Dict, Tuple, Optional

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # 1. Chat Client (Prioritize Groq)
        groq_api_key = os.getenv("GROQ_API_KEY")
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        
        if groq_api_key:
            self.chat_client = OpenAI(
                api_key=groq_api_key,
                base_url="https://api.groq.com/openai/v1"
            )
            self.chat_model = "llama-3.3-70b-versatile"
            logger.info("Chat: Using Groq")
        elif openrouter_api_key:
            self.chat_client = OpenAI(
                api_key=openrouter_api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            self.chat_model = "openai/gpt-oss-120b:free"
            logger.info("Chat: Using OpenRouter")
        else:
            self.chat_client = None
            logger.warning("No Chat API key found")

        # 2. Embedding Client (Must use OpenRouter/OpenAI as Groq lacks embeddings)
        if openrouter_api_key:
            self.embed_client = OpenAI(
                api_key=openrouter_api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            self.embedding_model = "openai/text-embedding-3-small"
            logger.info("Embeddings: Using OpenRouter")
        else:
            self.embed_client = None
            logger.warning("No Embedding API key found (OpenRouter required)")

        self.moderation_model = "openai/omni-moderation-latest"


    def sanitize_and_enrich_profile(
        self,
        bio: str,
        interest_tags: List[str]
    ) -> Tuple[str, List[str], bool]:

        prompt = f"""You are a profile sanitization assistant.

1. Remove any PII (phone numbers, emails, addresses)
2. Clean the bio
3. Extract implied interest tags
4. Return enriched tags

Bio: "{bio}"
Current Tags: {interest_tags}

Respond ONLY in JSON:
{{
    "sanitized_bio": "text",
    "enriched_tags": ["tag1", "tag2"],
    "pii_found": true/false
}}
"""

        try:
            if not self.chat_client:
                return bio, interest_tags, False
            response = self.chat_client.chat.completions.create(
                model=self.chat_model,
                messages=[
                    {"role": "system", "content": "You are a data sanitization expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=300
            )

            content = response.choices[0].message.content.strip()
            result = json.loads(content)

            return (
                result["sanitized_bio"],
                result["enriched_tags"],
                result["pii_found"]
            )

        except Exception:
            # Fallback if model fails
            cleaned = self._basic_pii_removal(bio)
            return cleaned, interest_tags, False

    def _basic_pii_removal(self, text: str) -> str:
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',
                      '[email removed]', text)

        text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
                      '[phone removed]', text)

        return text

    def generate_embedding(self, text: str) -> List[float]:

        if not self.embed_client:
            return [0.0] * 1536 # Fallback zero vector
        response = self.embed_client.embeddings.create(
            model=self.embedding_model,
            input=text
        )

        return response.data[0].embedding

    def create_embedding_payload(self, bio: str, tags: List[str]) -> str:
        tags_text = ", ".join(tags)
        return f"Bio: {bio}\nInterests: {tags_text}"


    def generate_ai_introduction(
        self,
        user_bio: str,
        community_name: str,
        community_description: str,
        active_members: List[Dict]
    ) -> Tuple[str, str, float]:

        mentioned_member = (
            active_members[0]["username"]
            if active_members else None
        )

        prompt = f"""Generate a warm 2-3 sentence welcome message.

Community: {community_name}
Description: {community_description}
New Member Bio: {user_bio}
Mention: @{mentioned_member}

Only return the message text.
"""

        try:
            if not self.chat_client:
                 return f"Welcome to {community_name}!", None, 0.0
            response = self.chat_client.chat.completions.create(
                model=self.chat_model,
                messages=[
                    {"role": "system", "content": "You are a community onboarding assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150
            )

            intro_text = response.choices[0].message.content.strip()

            # Run moderation check
            toxicity_score = self._check_toxicity(intro_text)

            return intro_text, mentioned_member, toxicity_score

        except Exception:
            return (
                f"Welcome to {community_name}! We're excited to have you here.",
                None,
                0.0
            )


    def _check_toxicity(self, text: str) -> float:
        """
        Returns highest moderation score (0.0 - 1.0)
        """

        try:
            # Note: Moderation might still need OpenAI/OpenRouter
            client = self.embed_client or self.chat_client
            if not client: return 0.0
            response = client.moderations.create(
                model=self.moderation_model,
                input=text
            )

            scores = response.results[0].category_scores
            return max(
                scores.hate,
                scores.harassment,
                scores.violence,
                scores.sexual
            )

        except Exception:
            return 0.0




    def generate_social_suggestions(
        self,
        user_profile: Dict,
        context_messages: List[Dict],
        other_party_profile: Optional[Dict] = None,
        is_group: bool = False
    ) -> Dict:
        """
        Generates contextual reply suggestions for introverts.
        """
        history_text = "\n".join([f"{m['role']}: {m['content']}" for m in context_messages])
        
        target_info = ""
        if other_party_profile:
            target_info = f"Recipient Bio: {other_party_profile.get('bio', 'N/A')}\nRecipient Interests: {other_party_profile.get('interest_tags', [])}"
        elif is_group:
            target_info = "Target: Group Conversation"

        prompt = f"""You are the VAYO AI Wingman, a social assistant for introverts.
Analyze the conversation history and provide 3 distinct, high-quality reply suggestions for the user.

User Bio: {user_profile.get('bio', 'N/A')}
User Interests: {user_profile.get('interest_tags', [])}
{target_info}

Conversation History:
{history_text}

Analyze the situation and vibe. Then provide 3 suggestions:
1. 'Casual': A relaxed, easy-going reply.
2. 'Deep Dive': A thoughtful question or comment to deepen the bond.
3. 'Inquisitive': A follow-up question related to the context.

Respond ONLY in JSON:
{{
    "vibe": "summary of the chat mood",
    "analysis": "brief situation analysis",
    "suggestions": [
        {{"label": "Casual", "content": "...", "explanation": "why this works"}},
        {{"label": "Deep Dive", "content": "...", "explanation": "why this works"}},
        {{"label": "Inquisitive", "content": "...", "explanation": "why this works"}}
    ]
}}
"""
        try:
            if not self.chat_client:
                raise ValueError("Chat client not initialized")
            response = self.chat_client.chat.completions.create(
                model=self.chat_model,
                messages=[
                    {"role": "system", "content": "You are a social wingman specialized in helping introverts."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"Wingman suggestion failed: {e}")
            return {
                "vibe": "Neutral",
                "analysis": "Conversation is ongoing.",
                "suggestions": [
                    {"label": "Casual", "content": "That sounds interesting!", "explanation": "Safe fallback"},
                    {"label": "Deep Dive", "content": "I'd love to hear more about that. How did you get into it?", "explanation": "Encourages sharing"},
                    {"label": "Inquisitive", "content": "What do you think about the latest updates?", "explanation": "Contextual question"}
                ]
            }

    def generate_icebreakers(
        self,
        user_interests: List[str],
        target_context: str
    ) -> List[str]:
        """
        Generates 3 icebreakers based on user interests and target context.
        """
        prompt = f"""Generate 3 creative conversation starters for an introvert.
User Interests: {", ".join(user_interests)}
Target Context: {target_context}

The starters should be low-pressure, engaging, and relevant to the context.
Return ONLY a JSON list of strings: ["starter1", "starter2", "starter3"]
"""
        try:
            if not self.chat_client:
                raise ValueError("Chat client not initialized")
            response = self.chat_client.chat.completions.create(
                model=self.chat_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=200
            )
            return json.loads(response.choices[0].message.content.strip())
        except Exception:
            return [
                "Hey! I noticed we share some interests. How's it going?",
                "I'm new here and looking to connect. What do you like most about this group?",
                "That's a great point you made earlier. Could you tell me more?"
            ]

    def generate_chat_summary(self, prompt: str) -> str:
        if not self.chat_client:
            return ""
            
        try:
            response = self.chat_client.chat.completions.create(
                model=self.chat_model,
                messages=[
                    {"role": "system", "content": "You are a helpful community assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Chat summary failed: {e}")
            return ""

# Global instance
ai_service = AIService()
