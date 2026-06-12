"""
Pydantic Models — Events & Share Feature
Covers: event creation, event response, RSVP, attendee, share links, stats
"""

import re
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, validator

def generate_slug(title: str, event_id: str) -> str:
    """
    Converts event title + event_id suffix into a URL-safe slug.
    Example: "DJ Night Bangalore!" + "evt_a3f9c1xx" → "dj-night-bangalore-a3f9c1"
    """
    base = re.sub(r"[^a-zA-Z0-9\s]", "", title)       # strip special chars
    base = re.sub(r"\s+", "-", base.strip()).lower()    # spaces → hyphens
    suffix = event_id[4:10] if len(event_id) > 4 else event_id  # take 6 chars after "evt_"
    return f"{base}-{suffix}"


def build_share_links(title: str, slug: str, base_url: str = "https://vayo.app") -> dict:
    """
    Returns platform-specific share links for an event.
    Instagram doesn't support direct share URLs so we return the copy link only.
    """
    event_url = f"{base_url}/events/{slug}"
    text = f"Join me at {title} 🎉 {event_url}"

    return {
        "event_url": event_url,
        "whatsapp": f"https://wa.me/?text={text.replace(' ', '%20')}",
        "snapchat": f"https://www.snapchat.com/scan?attachmentUrl={event_url}",
        "instagram": event_url,   # frontend copies this — Instagram has no direct share URL
        "copy": event_url,
    }


class CreateEventRequest(BaseModel):
    """Payload to create a new event."""

    host_id: str = Field(..., description="Clerk user ID of the host")
    title: str = Field(..., min_length=3, max_length=100, description="Event title")
    description: Optional[str] = Field(None, max_length=1000, description="Event description")

    event_date: datetime = Field(..., description="Event date and time (ISO 8601)")
    city: str = Field(..., description="City where the event is happening")
    venue: Optional[str] = Field(None, max_length=200, description="Venue name e.g. 'Koramangala Social, Bangalore'")

    latitude: Optional[float] = Field(None, ge=-90, le=90, description="GPS latitude for check-in")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="GPS longitude for check-in")

    category: Optional[str] = Field(None, description="Event category e.g. music, tech, sports, food")
    interest_tags: List[str] = Field(default=[], description="Interest tags for matching e.g. ['jazz', 'nightlife']")

    min_karma_required: int = Field(0, ge=0, description="Minimum karma score to RSVP")
    entry_fee: int = Field(0, ge=0, description="Entry fee in INR (0 = free)")
    max_participants: Optional[int] = Field(None, gt=0, description="Max attendees — None means unlimited")

    cover_image_url: Optional[str] = Field(None, description="URL of the event cover image")

    @validator("title")
    def clean_title(cls, v):
        return v.strip()

    @validator("interest_tags")
    def clean_tags(cls, v):
        # lowercase, deduplicate, strip whitespace
        return list(set(tag.strip().lower() for tag in v if tag.strip()))

    @validator("event_date")
    def must_be_future(cls, v):
        if v <= datetime.utcnow():
            raise ValueError("Event date must be in the future")
        return v

    @validator("category")
    def clean_category(cls, v):
        if v:
            return v.strip().lower()
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "host_id": "user_abc123",
                "title": "DJ Night Bangalore",
                "description": "Biggest electronic night of the year",
                "event_date": "2026-08-15T20:00:00",
                "city": "Bangalore",
                "venue": "Koramangala Social, Bangalore",
                "latitude": 12.9352,
                "longitude": 77.6245,
                "category": "music",
                "interest_tags": ["edm", "nightlife", "music"],
                "min_karma_required": 50,
                "entry_fee": 500,
                "max_participants": 200,
                "cover_image_url": "https://cdn.vayo.app/events/dj-night.jpg"
            }
        }


class RSVPRequest(BaseModel):
    """Payload to RSVP to an event."""
    user_id: str = Field(..., description="Clerk user ID of the attendee")


class CheckinRequest(BaseModel):
    """Payload for GPS check-in."""
    user_id: str = Field(..., description="Clerk user ID checking in")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)




class ShareLinks(BaseModel):
    """Platform share links returned after event creation or on event page."""
    event_url: str
    whatsapp: str
    snapchat: str
    instagram: str   # copy link — Instagram has no deep link share URL
    copy: str


class EventResponse(BaseModel):
    """Full event detail returned to frontend."""
    event_id: str
    title: str
    description: Optional[str]
    host_id: str

    event_date: datetime
    city: str
    venue: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]

    category: Optional[str]
    interest_tags: List[str]

    min_karma_required: int
    entry_fee: int
    max_participants: Optional[int]
    cover_image_url: Optional[str]

    shareable_slug: str
    status: str

    # Live counts — populated from event_participants joins
    participant_count: int = 0
    checked_in_count: int = 0

    # Share links — built from slug
    share_links: Optional[ShareLinks] = None

    created_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "event_id": "evt_a3f9c1xx",
                "title": "DJ Night Bangalore",
                "host_id": "user_abc123",
                "event_date": "2026-08-15T20:00:00",
                "city": "Bangalore",
                "venue": "Koramangala Social, Bangalore",
                "category": "music",
                "interest_tags": ["edm", "nightlife"],
                "min_karma_required": 50,
                "entry_fee": 500,
                "max_participants": 200,
                "shareable_slug": "dj-night-bangalore-a3f9c1",
                "status": "active",
                "participant_count": 42,
                "checked_in_count": 0,
                "share_links": {
                    "event_url": "https://vayo.app/events/dj-night-bangalore-a3f9c1",
                    "whatsapp": "https://wa.me/?text=...",
                    "snapchat": "https://www.snapchat.com/scan?attachmentUrl=...",
                    "instagram": "https://vayo.app/events/dj-night-bangalore-a3f9c1",
                    "copy": "https://vayo.app/events/dj-night-bangalore-a3f9c1"
                },
                "created_at": "2026-06-01T10:00:00"
            }
        }


class CreateEventResponse(BaseModel):
    """Returned immediately after event creation."""
    event_id: str
    title: str
    host_id: str
    shareable_slug: str
    share_links: ShareLinks
    message: str


class RSVPResponse(BaseModel):
    """Returned after a successful RSVP."""
    event_id: str
    user_id: str
    payment_status: str           # "paid" for free events, "pending" for paid
    participant_count: int        # live count after this RSVP
    message: str


class CheckinResponse(BaseModel):
    """Returned after a successful GPS check-in."""
    event_id: str
    user_id: str
    distance_meters: int
    checked_in: bool
    message: str


class AttendeeItem(BaseModel):
    """Single attendee in the attendee list."""
    user_id: str
    username: Optional[str]
    payment_status: str
    attendance_status: bool
    rsvp_timestamp: datetime


class EventAttendeesResponse(BaseModel):
    """Attendee list for an event — host/admin only."""
    event_id: str
    total_rsvp: int
    total_checked_in: int
    attendees: List[AttendeeItem]


class EventStatsResponse(BaseModel):
    """Quick stats for admin dashboard."""
    event_id: str
    title: str
    total_rsvp: int
    total_checked_in: int
    total_paid: int
    total_pending_payment: int
    spots_remaining: Optional[int]   # None if unlimited
