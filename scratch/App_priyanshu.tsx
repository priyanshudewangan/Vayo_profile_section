import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Briefcase,
  MapPin,
  Award,
  Sparkles,
  Users,
  MessageSquare,
  Upload,
  Calendar,
  Clock,
  Bell,
  Settings,
  User,
  LayoutGrid,
  FileText,
  X,
  ChevronRight,
  UserPlus,
  CalendarPlus,
  ZoomIn,
  Share2,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  Zap,
  Check
} from 'lucide-react'

import maximPersona from './assets/maxim_persona.png'
import sarahPersona from './assets/sarah_persona.png'
import danielPersona from './assets/daniel_persona.png'
import elenaPersona from './assets/elena_persona.png'
import vayoLogo from './assets/vayo-logo.png'
import newBg from './assets/new_bg.jpg'

interface PersonaData {
  id: string;
  name: string;
  age: number;
  role: string;
  image: string;
  motivations: string[];
  painPoints: string[];
  userNeeds: string[];
  metrics: {
    stat: string;
    percentage: number;
    description: string;
    color: 'blue' | 'green';
  }[];
  location: string;
  selfieVerified: boolean;
  bizzVerified: boolean;
  socialTags: string[];
  bffTags: string[];
  bizzTags: string[];
  socialBio: string;
  bffBio: string;
  bizzBio: string;
  bizzRole?: string;
  bizzCompany?: string;
  karmaBalance: number;
  karmaTier: string;
  karmaPercentage: number;
  karmaBreakdown: {
    attendedMixers: number;
    momentContributor: number;
    vibeLeader: number;
    hostSupport: number;
  };
  pendingApplications: { name: string; date: string; status: 'Applied' | 'Approved & Ticket Generated' | 'Waitlisted' }[];
  activeTickets: { name: string; date: string; countdown: string; locationPin: string; organizer: string; qrCode: string }[];
  pastTimeline: { name: string; date: string; category: string; friendsMet: number }[];
  bffCrew: { name: string; members: number; type: string; emoji: string; lastActive: string; nextEvent?: string }[];
  connectionsMet: { name: string; role: string; mutualFriends: number; avatar: string; metAt: string }[];
  suggestedConnections: { name: string; role: string; mutualFriends: number; avatar: string; reason: string }[];
  moments: { location: string; date: string; imageColor: string; caption: string; imageUrl?: string }[];
  socialLinks: { instagram?: string; linkedin?: string; twitter?: string; github?: string };
  bizzSkills: string[];
  referral: { code: string; referredCount: number; xpEarned: number; milestone: number };
}

const personas: PersonaData[] = [
  {
    id: 'maxim',
    name: 'Aditya',
    age: 29,
    role: 'Tech Introvert',
    image: maximPersona,
    motivations: [
      'Find small-group gatherings with structured activities',
      'Meet people with shared niche interests (board games, coding)',
      'Gradually build social confidence in low-pressure settings'
    ],
    painPoints: [
      'Large, unstructured parties feel overwhelming and exhausting',
      'Hard to start conversations with complete strangers without prompts',
      'Fear of feeling left out or standing alone in a crowd'
    ],
    userNeeds: [
      'Icebreakers or host-led introductions at events',
      'Clear details on event size and attendee profiles beforehand',
      'Events hosted in quieter, cozy venues rather than loud clubs'
    ],
    metrics: [
      { stat: '72%', percentage: 72, description: 'Unstructured large-crowd events trigger social fatigue within the first 30 minutes', color: 'blue' },
      { stat: '64%', percentage: 64, description: 'Individuals struggle to strike up conversations without a shared activity or icebreaker', color: 'green' },
      { stat: '58%', percentage: 58, description: 'Lack of pre-event attendee clarity prevents hesitant users from RSVPing', color: 'blue' }
    ],
    location: "Koramangala, Bangalore",
    selfieVerified: true,
    bizzVerified: false,
    socialTags: ['#BoardGames', '#Coding', '#QuietCafes', '#IndieMusic'],
    bffTags: ['#BoardGames', '#Hackathons', '#NightWalks', '#SciFi'],
    bizzTags: ['#ReactJS', '#UIUX', '#OpenSource', '#TypeScript'],
    socialBio: "Quiet coder by day, board game strategist by night. Looking for low-pressure gatherings around cozy cafes.",
    bffBio: "Looking for a small squad to play board games, build side projects, or go on night walks in Koramangala.",
    bizzBio: "Frontend Developer building interactive web apps. Interested in UI design, open source, and React compiler optimization.",
    bizzRole: "Software Engineer",
    bizzCompany: "SaaS Startups",
    karmaBalance: 340,
    karmaTier: "Pathfinder",
    karmaPercentage: 60,
    karmaBreakdown: { attendedMixers: 120, momentContributor: 60, vibeLeader: 80, hostSupport: 80 },
    pendingApplications: [
      { name: "Cozy Coding & Coffee", date: "June 05, 6:00 PM", status: "Approved & Ticket Generated" },
      { name: "Friday Board Game Night", date: "June 08, 7:00 PM", status: "Applied" }
    ],
    activeTickets: [
      { name: "Cozy Coding & Coffee", date: "June 05, 6:00 PM", countdown: "3 days left", locationPin: "Third Wave Coffee, Koramangala", organizer: "Vikas (Host)", qrCode: "VAYO-TKT-MAX05" }
    ],
    pastTimeline: [
      { name: "Lofi Beats Study Session", date: "May 28, 2026", category: "Social Mixer", friendsMet: 3 },
      { name: "Indie Game Show-and-Tell", date: "May 15, 2026", category: "BFF Squad Meetup", friendsMet: 2 }
    ],
    bffCrew: [
      { name: "Friday Boardgamers", members: 12, type: "BFF Squad", emoji: "🎲", lastActive: "2 days ago", nextEvent: "This Saturday" },
      { name: "Koramangala Coders", members: 28, type: "BFF Squad", emoji: "💻", lastActive: "Yesterday", nextEvent: "Next Tuesday" },
    ],
    connectionsMet: [
      { name: "Sarah", role: "Product Designer", mutualFriends: 3, avatar: sarahPersona, metAt: "Lofi × Code Night" },
      { name: "Daniel", role: "DevOps Engineer", mutualFriends: 5, avatar: danielPersona, metAt: "Bangalore Tech Summit" },
    ],
    suggestedConnections: [
      { name: "Priya R.", role: "Full Stack Dev", mutualFriends: 4, avatar: "https://picsum.photos/seed/sc1/100/100", reason: "In Koramangala Coders" },
      { name: "Aryan K.", role: "ML Engineer", mutualFriends: 2, avatar: "https://picsum.photos/seed/sc2/100/100", reason: "Attended same mixer" },
      { name: "Nisha P.", role: "UX Designer", mutualFriends: 3, avatar: "https://picsum.photos/seed/sc3/100/100", reason: "Friday Boardgamers" },
    ],
    moments: [
      { location: "Third Wave Coffee", date: "May 28", imageColor: "from-blue-500 to-indigo-600", caption: "Deep focus during the Lofi session 💻", imageUrl: "https://picsum.photos/seed/vayo1/800/500" },
      { location: "Dialogues Cafe", date: "May 15", imageColor: "from-pink-500 to-rose-600", caption: "Boardgame night got intense! 🎲", imageUrl: "https://picsum.photos/seed/vayo2/800/500" },
      { location: "Bangalore Tech Summit", date: "May 10", imageColor: "from-cyan-500 to-blue-600", caption: "Met so many builders at the hackathon! 🚀", imageUrl: "https://picsum.photos/seed/vayo3/800/500" },
      { location: "Koramangala Park", date: "Apr 30", imageColor: "from-green-400 to-teal-600", caption: "Sunday mornings hit different outdoors 🌿", imageUrl: "https://picsum.photos/seed/vayo4/800/500" },
    ],
    socialLinks: { github: 'aditya-dev', twitter: 'adityacodes', linkedin: 'aditya-koramangala' },
    bizzSkills: ['React', 'TypeScript', 'UI/UX', 'Open Source', 'Node.js'],
    referral: { code: 'VAYO-ADI-X4K2', referredCount: 3, xpEarned: 150, milestone: 5 }
  },
  {
    id: 'sarah',
    name: 'Sarah',
    age: 31,
    role: 'New City Resident',
    image: sarahPersona,
    motivations: [
      'Establish a local friend circle after relocating',
      'Discover weekend social events that welcome solo attendees',
      'Find neighborhood-based community meetups'
    ],
    painPoints: [
      'Traditional meetups feel cliquey and hard to break into',
      'Attending events alone feels awkward and visible',
      'Most social apps focus on dating rather than platonic friendships'
    ],
    userNeeds: [
      "Designated 'solo hosts' whose job is to welcome single arrivals",
      'Platonic-first community guidelines and filters',
      'Follow-up groups to keep in touch with people met at events'
    ],
    metrics: [
      { stat: '81%', percentage: 81, description: 'Relocated individuals find it difficult to make new friends outside of work environments', color: 'blue' },
      { stat: '55%', percentage: 55, description: 'Solo attendees abandon social gatherings early due to feeling visible or out of place', color: 'green' },
      { stat: '68%', percentage: 68, description: 'Users prefer platforms that explicitly guarantee platonic, friendship-focused spaces', color: 'blue' }
    ],
    location: "Indiranagar, Bangalore",
    selfieVerified: true,
    bizzVerified: true,
    socialTags: ['#AcousticGigs', '#Pottery', '#StreetFood', '#ArtWorkshops'],
    bffTags: ['#WeekendTrips', '#SundayBrunch', '#NandiHills', '#CafeHopping'],
    bizzTags: ['#ProductDesign', '#CoFounderHunt', '#UserResearch', '#DesignSystems'],
    socialBio: "Recently moved from Mumbai! Explorer at heart. You'll find me at pottery workshops, live acoustic music gigs, and trying local street food.",
    bffBio: "Looking for weekend explorer buddies! Let's check out cafes, go to Nandi Hills for sunrise, or plan sunday brunches.",
    bizzBio: "Product Designer focusing on mobile-first apps. Excited about user research, micro-interactions, and finding a co-founder for a local discovery app.",
    bizzRole: "Product Designer",
    bizzCompany: "Freelance Design",
    karmaBalance: 480,
    karmaTier: "Voyager",
    karmaPercentage: 85,
    karmaBreakdown: { attendedMixers: 200, momentContributor: 120, vibeLeader: 110, hostSupport: 50 },
    pendingApplications: [
      { name: "Pottery & Mocktails", date: "June 06, 4:00 PM", status: "Approved & Ticket Generated" }
    ],
    activeTickets: [
      { name: "Pottery & Mocktails", date: "June 06, 4:00 PM", countdown: "4 days left", locationPin: "Clay Station, HSR Layout", organizer: "Ritu (Host)", qrCode: "VAYO-TKT-SAR06" }
    ],
    pastTimeline: [
      { name: "Indiranagar Cafe Crawl", date: "May 29, 2026", category: "Social Mixer", friendsMet: 5 },
      { name: "Rooftop Acoustic Session", date: "May 22, 2026", category: "Acoustic Nights", friendsMet: 4 }
    ],
    bffCrew: [
      { name: "Pottery Enthusiasts", members: 8, type: "BFF Squad", emoji: "🏺", lastActive: "3 days ago", nextEvent: "This Sunday" },
      { name: "Weekend Explorers", members: 34, type: "BFF Squad", emoji: "🌄", lastActive: "5 days ago" },
    ],
    connectionsMet: [
      { name: "Elena", role: "Creative Freelancer", mutualFriends: 4, avatar: elenaPersona, metAt: "Pottery Workshop" },
      { name: "Maxim", role: "Frontend Developer", mutualFriends: 3, avatar: maximPersona, metAt: "Acoustic Night" },
    ],
    suggestedConnections: [
      { name: "Kavya M.", role: "Brand Designer", mutualFriends: 5, avatar: "https://picsum.photos/seed/sc4/100/100", reason: "Weekend Explorers" },
      { name: "Rohit S.", role: "Startup Founder", mutualFriends: 2, avatar: "https://picsum.photos/seed/sc5/100/100", reason: "Attended same mixer" },
      { name: "Anjali T.", role: "Art Director", mutualFriends: 4, avatar: "https://picsum.photos/seed/sc6/100/100", reason: "Pottery Enthusiasts" },
    ],
    moments: [
      { location: "Clay Station", date: "May 29", imageColor: "from-amber-400 to-orange-600", caption: "Made my first imperfect vase 🏺", imageUrl: "https://picsum.photos/seed/vayo5/800/500" },
      { location: "Indiranagar Bistro", date: "May 22", imageColor: "from-teal-400 to-emerald-600", caption: "Acoustic night vibe was unreal 🎵", imageUrl: "https://picsum.photos/seed/vayo6/800/500" },
      { location: "National Gallery", date: "May 14", imageColor: "from-purple-400 to-indigo-500", caption: "Inspo from the new contemporary exhibit 🖼️", imageUrl: "https://picsum.photos/seed/vayo7/800/500" },
      { location: "Koramangala Rooftop", date: "May 5", imageColor: "from-pink-400 to-rose-500", caption: "Design meetup golden hour vibes ✨", imageUrl: "https://picsum.photos/seed/vayo8/800/500" },
    ],
    socialLinks: { instagram: 'sarah.designs', linkedin: 'sarah-product', twitter: 'sarahux' },
    bizzSkills: ['Product Design', 'User Research', 'Figma', 'Design Systems', 'Prototyping'],
    referral: { code: 'VAYO-SAR-M7P9', referredCount: 5, xpEarned: 250, milestone: 10 }
  },
  {
    id: 'daniel',
    name: 'Daniel',
    age: 26,
    role: 'Remote Developer',
    image: danielPersona,
    motivations: [
      'Break the isolation of working from home five days a week',
      'Separate leisure time from screen time through physical meetups',
      'Find casual weekday evening activities like dinners or trivia'
    ],
    painPoints: [
      'Spending all day online reduces energy for offline organizing',
      'Dread of making small talk about work after hours',
      'Lack of spontaneous social interactions in remote work life'
    ],
    userNeeds: [
      'Express RSVP with minimal planning required',
      'Activity-focused meetups (trivia, running, cooking classes)',
      'Casual evening events within a 15-minute commute'
    ],
    metrics: [
      { stat: '78%', percentage: 78, description: 'Remote workers experience feelings of isolation that impact their mental well-being weekly', color: 'blue' },
      { stat: '70%', percentage: 70, description: 'Weekday event attendance drops when the sign-up or planning process takes more than 3 steps', color: 'green' },
      { stat: '45%', percentage: 45, description: 'Working professionals crave casual meetups where talking about work is actively discouraged', color: 'blue' }
    ],
    location: "HSR Layout, Bangalore",
    selfieVerified: true,
    bizzVerified: true,
    socialTags: ['#MidweekTrivia', '#Badminton', '#Burgers', '#LofiHacks'],
    bffTags: ['#RunningSquad', '#BadmintonCrew', '#ActiveWeekends', '#CraftBeer'],
    bizzTags: ['#DevOps', '#Kubernetes', '#AWS', '#Consulting'],
    socialBio: "WFH software engineer seeking a cure for screen fatigue. Up for midweek trivia nights, badminton double matches, and burger crawls.",
    bffBio: "Let's form a weekly badminton club or find people for evening run squads around HSR Layout.",
    bizzBio: "DevOps Engineer specializing in Kubernetes, AWS and CI/CD pipelines. Looking to consult or join pre-seed tech ventures.",
    bizzRole: "DevOps Engineer",
    bizzCompany: "Remote Tech Inc.",
    karmaBalance: 290,
    karmaTier: "Explorer",
    karmaPercentage: 45,
    karmaBreakdown: { attendedMixers: 100, momentContributor: 40, vibeLeader: 50, hostSupport: 100 },
    pendingApplications: [
      { name: "HSR Badminton Doubles", date: "June 04, 8:00 PM", status: "Waitlisted" },
      { name: "Beer & Trivia Night", date: "June 09, 8:30 PM", status: "Approved & Ticket Generated" }
    ],
    activeTickets: [
      { name: "Beer & Trivia Night", date: "June 09, 8:30 PM", countdown: "7 days left", locationPin: "Toit Brewery, Indiranagar", organizer: "Rohan (Trivia Master)", qrCode: "VAYO-TKT-DAN09" }
    ],
    pastTimeline: [
      { name: "Sunset Run at Agara Lake", date: "May 30, 2026", category: "Active Mixer", friendsMet: 6 },
      { name: "Tech Founders Dinner", date: "May 20, 2026", category: "Bizz Mixer", friendsMet: 2 }
    ],
    bffCrew: [
      { name: "Agara Lake Runners", members: 42, type: "BFF Squad", emoji: "🏃", lastActive: "Yesterday", nextEvent: "Tomorrow 6 AM" },
      { name: "HSR Badminton Club", members: 15, type: "BFF Squad", emoji: "🏸", lastActive: "4 days ago", nextEvent: "Friday Evening" },
    ],
    connectionsMet: [
      { name: "Maxim", role: "Frontend Dev", mutualFriends: 5, avatar: maximPersona, metAt: "Agara Lake Run" },
      { name: "Sarah", role: "Product Designer", mutualFriends: 5, avatar: sarahPersona, metAt: "HSR Fitness Meetup" },
    ],
    suggestedConnections: [
      { name: "Vikram J.", role: "DevOps Lead", mutualFriends: 6, avatar: "https://picsum.photos/seed/sc7/100/100", reason: "Agara Lake Runners" },
      { name: "Meera K.", role: "Cloud Architect", mutualFriends: 3, avatar: "https://picsum.photos/seed/sc8/100/100", reason: "Attended same mixer" },
      { name: "Sid L.", role: "Backend Dev", mutualFriends: 4, avatar: "https://picsum.photos/seed/sc9/100/100", reason: "HSR Badminton Club" },
    ],
    moments: [
      { location: "Agara Lake HSR", date: "May 30", imageColor: "from-sky-400 to-blue-600", caption: "Crushed my 5k run record! 🏃‍♂️", imageUrl: "https://picsum.photos/seed/vayo9/800/500" },
      { location: "Cult Fit HSR", date: "May 20", imageColor: "from-violet-500 to-purple-600", caption: "Midweek stress relief 🏸", imageUrl: "https://picsum.photos/seed/vayo10/800/500" },
      { location: "Cubbon Park", date: "May 12", imageColor: "from-emerald-400 to-green-600", caption: "Early morning cycling crew 🚴", imageUrl: "https://picsum.photos/seed/vayo11/800/500" },
      { location: "Koramangala Turf", date: "May 3", imageColor: "from-orange-400 to-red-500", caption: "Weekend football match — we won! ⚽", imageUrl: "https://picsum.photos/seed/vayo12/800/500" },
    ],
    socialLinks: { github: 'daniel-devops', linkedin: 'daniel-hsr' },
    bizzSkills: ['DevOps', 'AWS', 'Docker', 'CI/CD', 'Linux', 'Python'],
    referral: { code: 'VAYO-DAN-Q2R5', referredCount: 1, xpEarned: 50, milestone: 5 }
  },
  {
    id: 'elena',
    name: 'Elena',
    age: 34,
    role: 'Creative Freelancer',
    image: elenaPersona,
    motivations: [
      'Re-establish a social life after a long period of focus on career',
      'Find mature, respectful spaces for deep conversations',
      'Participate in weekend cultural gatherings and art workshops'
    ],
    painPoints: [
      'Many social events cater to younger crowds or heavy drinking culture',
      'Hard to find people who value deep, intellectual connections',
      'Exhaustion from superficial dating app dynamics'
    ],
    userNeeds: [
      'Curated age-diverse or hobby-centric gatherings',
      'Alcohol-free or low-intensity event alternatives',
      'Shared creative spaces (art classes, writing cafes)'
    ],
    metrics: [
      { stat: '85%', percentage: 85, description: 'Mature attendees feel alienated by nightlife-focused community events', color: 'blue' },
      { stat: '60%', percentage: 60, description: 'Superficial conversations at standard meetups fail to create lasting bonds', color: 'green' },
      { stat: '50%', percentage: 50, description: 'Users are willing to pay for premium, hosted events that guarantee safety and comfort', color: 'blue' }
    ],
    location: "Jayanagar, Bangalore",
    selfieVerified: true,
    bizzVerified: true,
    socialTags: ['#BookReading', '#ArtTours', '#CreativeWriting', '#Mocktails'],
    bffTags: ['#MuseumRuns', '#PoetrySlams', '#WritingCafes', '#VinylRecords'],
    bizzTags: ['#ArtCurator', '#ArtTech', '#Publishing', '#Exhibitions'],
    socialBio: "Writer and art curator. Looking for quiet alcohol-free social spaces, deep conversations, book reading circles, and weekend art gallery tours.",
    bffBio: "Hoping to find people for Sunday museum runs, poetry slams, and quiet writing cafe sessions.",
    bizzBio: "Curating indie art exhibitions and connecting creators with galleries. Let's talk about art tech, NFTs, and independent publishing projects.",
    bizzRole: "Independent Art Director",
    bizzCompany: "Creative Studio",
    karmaBalance: 610,
    karmaTier: "Voyager",
    karmaPercentage: 95,
    karmaBreakdown: { attendedMixers: 220, momentContributor: 150, vibeLeader: 140, hostSupport: 100 },
    pendingApplications: [
      { name: "Modern Art Gallery Tour", date: "June 07, 11:00 AM", status: "Approved & Ticket Generated" }
    ],
    activeTickets: [
      { name: "Modern Art Gallery Tour", date: "June 07, 11:00 AM", countdown: "5 days left", locationPin: "NGMA, Palace Road", organizer: "Meera (Art Historian)", qrCode: "VAYO-TKT-ELE07" }
    ],
    pastTimeline: [
      { name: "Creative Writing Circle", date: "May 27, 2026", category: "Writing Workshop", friendsMet: 4 },
      { name: "Independent Book Exchange", date: "May 18, 2026", category: "Book Club", friendsMet: 5 }
    ],
    bffCrew: [
      { name: "Jayanagar Book Club", members: 18, type: "BFF Squad", emoji: "📚", lastActive: "1 week ago", nextEvent: "Next Weekend" },
      { name: "Indie Art Collaborators", members: 22, type: "BFF Squad", emoji: "🎨", lastActive: "2 days ago", nextEvent: "This Thursday" },
    ],
    connectionsMet: [
      { name: "Sarah", role: "Product Designer", mutualFriends: 4, avatar: sarahPersona, metAt: "Indie Art Show" },
      { name: "Daniel", role: "DevOps Engineer", mutualFriends: 2, avatar: danielPersona, metAt: "Writer's Open Mic" },
    ],
    suggestedConnections: [
      { name: "Riya A.", role: "Illustrator", mutualFriends: 5, avatar: "https://picsum.photos/seed/sc10/100/100", reason: "Indie Art Collaborators" },
      { name: "Nikhil V.", role: "Poet & Writer", mutualFriends: 3, avatar: "https://picsum.photos/seed/sc11/100/100", reason: "Jayanagar Book Club" },
      { name: "Shreya B.", role: "Gallery Curator", mutualFriends: 4, avatar: "https://picsum.photos/seed/sc12/100/100", reason: "Attended same mixer" },
    ],
    moments: [
      { location: "NGMA Palace Road", date: "May 27", imageColor: "from-yellow-400 to-amber-500", caption: "Sunday inspiration at the gallery 🎨", imageUrl: "https://picsum.photos/seed/vayo13/800/500" },
      { location: "Writer's Cafe", date: "May 18", imageColor: "from-red-400 to-pink-600", caption: "Spontaneous poetry writing session ✍️", imageUrl: "https://picsum.photos/seed/vayo14/800/500" },
      { location: "Indiranagar Art Walk", date: "May 9", imageColor: "from-violet-400 to-purple-600", caption: "Street art never ceases to inspire 🎭", imageUrl: "https://picsum.photos/seed/vayo15/800/500" },
      { location: "Kitsch Mandi", date: "Apr 28", imageColor: "from-pink-400 to-red-500", caption: "Found the most unique handmade pieces 🪆", imageUrl: "https://picsum.photos/seed/vayo16/800/500" },
    ],
    socialLinks: { instagram: 'elena.art', twitter: 'elena_curates', linkedin: 'elena-art' },
    bizzSkills: ['Art Curation', 'Exhibition Design', 'Art Direction', 'Publishing', 'Brand Identity'],
    referral: { code: 'VAYO-ELE-W8J3', referredCount: 7, xpEarned: 350, milestone: 10 }
  }
]

// ─── Segmented Progress (with optional milestone labels) ─────────────────────
interface SegmentedProgressProps {
  percentage: number;
  color: 'blue' | 'green' | 'teal';
  showMilestones?: boolean;
}

function SegmentedProgress({ percentage, color, showMilestones = false }: SegmentedProgressProps) {
  const totalSegments = 20
  const activeSegments = Math.round((percentage / 100) * totalSegments)
  return (
    <div className="w-full">
      <div className="flex gap-[3.5px] items-end h-[16px] w-full my-3">
        {Array.from({ length: totalSegments }).map((_, i) => {
          const isActive = i < activeSegments
          let activeBg = '', inactiveBg = ''
          if (color === 'blue') { activeBg = 'bg-[#2563eb]'; inactiveBg = 'bg-[#eef2ff]' }
          else if (color === 'green') { activeBg = 'bg-[#84cc16]'; inactiveBg = 'bg-[#f4fbe9]' }
          else { activeBg = 'bg-[#0d9488]'; inactiveBg = 'bg-teal-50' }
          return (
            <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${isActive ? activeBg : inactiveBg}`} />
          )
        })}
      </div>
      {showMilestones && (
        <div className="flex justify-between text-[8px] font-bold text-neutral-400 uppercase tracking-wider px-0.5 -mt-1">
          <span>🔭 Explorer</span>
          <span>🧭 Pathfinder</span>
          <span>🚀 Voyager</span>
        </div>
      )}
    </div>
  )
}

// ─── Live Countdown Hook ─────────────────────────────────────────────────────
function useCountdown(dateStr: string) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    let target: Date
    try {
      const parts = dateStr.split(',').map(s => s.trim())
      target = new Date(`${parts[0]} 2026 ${parts[1] || ''}`)
      if (isNaN(target.getTime())) throw new Error()
    } catch {
      setTimeLeft('Soon'); return
    }
    const update = () => {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Starting now!'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [dateStr])
  return timeLeft
}

// Ticket countdown component (each ticket needs its own hook instance)
function TicketCountdown({ date }: { date: string }) {
  const t = useCountdown(date)
  return (
    <span className="inline-flex items-center gap-1.5 text-[9.5px] font-bold px-2.5 py-1 rounded-lg bg-neutral-900 text-emerald-400 font-mono tabular-nums">
      <Clock className="w-2.5 h-2.5" />
      {t}
    </span>
  )
}

// ─── Helper functions ────────────────────────────────────────────────────────
const getBadgeLockProgress = (personaId: string, badgeName: string): number => {
  const map: Record<string, Record<string, number>> = {
    maxim: { 'Social Catalyst': 65, 'Vayo Pathfinder': 60, 'Mega Mixer Hero': 20 },
    sarah: { 'Super Connector': 40, 'Community Host': 30, 'Karma Master': 85 },
    daniel: { 'Cozy Host': 10, 'Global Voyager': 29 },
    elena: { 'Quiet Hub Host': 45, 'Profile Guardian': 30 }
  }
  return map[personaId]?.[badgeName] ?? 25
}

const getNextTierInfo = (tier: string, balance: number) => {
  if (tier === 'Explorer') return { nextTier: 'Pathfinder', needed: Math.max(0, 300 - balance), icon: '🧭', perks: ['Priority ticket booking', 'Host support badge', 'Special venue perks'] }
  if (tier === 'Pathfinder') return { nextTier: 'Voyager', needed: Math.max(0, 600 - balance), icon: '🚀', perks: ['VIP mixer access', 'Private dining', 'Community voting rights'] }
  return { nextTier: 'Legend', needed: Math.max(0, 1000 - balance), icon: '🌟', perks: ['Founding member badge', 'Free event hosting', 'National hub access'] }
}

const getTierIcon = (tier: string) => ({ Explorer: '🔭', Pathfinder: '🧭', Voyager: '🚀' }[tier] ?? '🌟')

const getStepperIdx = (status: string) => status.includes('Approved') ? 2 : status === 'Waitlisted' ? 1 : 0

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [activeMode, setActiveMode] = useState<'social' | 'bff' | 'bizz'>('social')
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [customMoments, setCustomMoments] = useState<Record<string, { location: string; date: string; imageColor: string; caption: string }[]>>({})
  const [activeTabCircle, setActiveTabCircle] = useState<'squads' | 'connections'>('squads')
  const [showToast, setShowToast] = useState<string | null>(null)
  const [activeSidebarTab, setActiveSidebarTab] = useState<'profile' | 'karma' | 'circle' | 'mixers' | 'moments' | 'security'>('profile')
  const [lightboxMoment, setLightboxMoment] = useState<{ location: string; date: string; imageColor: string; caption: string; imageUrl?: string; idx: number } | null>(null)
  const [deletedMomentIdxs, setDeletedMomentIdxs] = useState<Record<string, number[]>>({})
  const [animatedXP, setAnimatedXP] = useState(0)
  const [hoveredBadgeIdx, setHoveredBadgeIdx] = useState<number | null>(null)
  const [referralCopied, setReferralCopied] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const [showChangePwd, setShowChangePwd] = useState(false)
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false })
  const [isEditing, setIsEditing] = useState(false)
  const [editDraft, setEditDraft] = useState({ bio: '', instagram: '', linkedin: '', twitter: '', github: '', bizzSkills: [] as string[], newSkill: '' })
  const [personaOverrides, setPersonaOverrides] = useState<Record<string, { socialBio?: string; bffBio?: string; bizzBio?: string; socialLinks?: PersonaData['socialLinks']; bizzSkills?: string[] }>>({})

  const currentPersona = personas[activeIdx]
  const _ov = personaOverrides[currentPersona.id]
  const displayPersona = _ov ? { ...currentPersona, ...(_ov.socialBio !== undefined && { socialBio: _ov.socialBio }), ...(_ov.bffBio !== undefined && { bffBio: _ov.bffBio }), ...(_ov.bizzBio !== undefined && { bizzBio: _ov.bizzBio }), socialLinks: { ...currentPersona.socialLinks, ..._ov.socialLinks }, bizzSkills: _ov.bizzSkills ?? currentPersona.bizzSkills } : currentPersona

  const allMoments = [...(customMoments[currentPersona.id] || []), ...currentPersona.moments]
  const personaMoments = allMoments.filter((_, i) => !(deletedMomentIdxs[currentPersona.id] || []).includes(i))

  const completenessItems = [
    { label: 'Profile photo', done: true },
    { label: 'Selfie verified', done: currentPersona.selfieVerified },
    { label: 'Bio written', done: !!(activeMode === 'social' ? currentPersona.socialBio : activeMode === 'bff' ? currentPersona.bffBio : currentPersona.bizzBio) },
    { label: 'Tags added', done: currentPersona.socialTags.length > 0 },
    { label: 'Location set', done: !!currentPersona.location },
    { label: 'Moments shared', done: personaMoments.length > 0 },
    { label: 'Circle connected', done: currentPersona.connectionsMet.length > 0 },
    { label: 'Social links', done: Object.keys(currentPersona.socialLinks).length > 0 },
  ]
  const completenessScore = Math.round((completenessItems.filter(i => i.done).length / completenessItems.length) * 100)

  const notifications = activeMode === 'bff' ? [
    { id: 1, icon: '💚', msg: `${currentPersona.connectionsMet[0]?.name ?? 'A friend'} added you to their BFF Crew!`, time: '1h ago', unread: true },
    { id: 2, icon: '📸', msg: `New memory added to your shared gallery from last weekend`, time: '4h ago', unread: true },
    { id: 3, icon: '👥', msg: `${currentPersona.bffCrew[0]?.name ?? 'Your crew'} has a new member — say hi!`, time: '1d ago', unread: false },
    { id: 4, icon: '👋', msg: `${currentPersona.connectionsMet[0]?.name ?? 'Someone'} viewed your BFF profile`, time: '2d ago', unread: false },
  ] : activeMode === 'bizz' ? [
    { id: 1, icon: '💼', msg: `${currentPersona.connectionsMet[0]?.name ?? 'A contact'} wants to collaborate with you`, time: '2h ago', unread: true },
    { id: 2, icon: '⚡', msg: `Your Bizz profile got ${Math.floor(Math.random() * 10) + 5} new views this week`, time: '6h ago', unread: true },
    { id: 3, icon: '🤝', msg: `New connection request from someone in your field`, time: '1d ago', unread: false },
    { id: 4, icon: '📅', msg: `${currentPersona.activeTickets[0]?.name ?? 'An upcoming event'} is relevant to your skills`, time: '2d ago', unread: false },
  ] : [
    { id: 1, icon: '🎉', msg: `A friend joined Vayo using your referral link!`, time: '2h ago', unread: true },
    { id: 2, icon: '⚡', msg: `Your karma is growing — keep attending events for bonus XP`, time: '5h ago', unread: true },
    { id: 3, icon: '📅', msg: `Reminder: ${currentPersona.activeTickets[0]?.name ?? 'Your next event'} is coming up soon`, time: '1d ago', unread: false },
    { id: 4, icon: '👋', msg: `${currentPersona.connectionsMet[0]?.name ?? 'Someone'} viewed your profile`, time: '2d ago', unread: false },
  ]
  const unreadCount = notifications.filter(n => n.unread).length

  // Animate XP counter when karma tab opens
  useEffect(() => {
    if (activeSidebarTab === 'karma') {
      setAnimatedXP(0)
      const target = currentPersona.karmaBalance
      const steps = 30
      let cur = 0
      const id = setInterval(() => {
        cur += target / steps
        if (cur >= target) { setAnimatedXP(target); clearInterval(id) }
        else setAnimatedXP(Math.floor(cur))
      }, 40)
      return () => clearInterval(id)
    }
  }, [activeSidebarTab, currentPersona.id, currentPersona.karmaBalance])

  // Close lightbox on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxMoment(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Auto-redirect to profile when switching modes if current tab isn't available
  const tabsByMode: Record<string, string[]> = {
    social: ['profile', 'karma', 'circle', 'mixers', 'moments', 'security'],
    bff:    ['profile', 'circle', 'moments', 'security'],
    bizz:   ['profile', 'circle', 'security'],
  }
  useEffect(() => {
    if (!tabsByMode[activeMode].includes(activeSidebarTab)) {
      setActiveSidebarTab('profile')
    }
  }, [activeMode])

  useEffect(() => { setIsEditing(false) }, [currentPersona.id, activeMode])

  const startEdit = () => {
    const ov = personaOverrides[currentPersona.id]
    const bio = activeMode === 'social' ? (ov?.socialBio ?? currentPersona.socialBio)
      : activeMode === 'bff' ? (ov?.bffBio ?? currentPersona.bffBio)
      : (ov?.bizzBio ?? currentPersona.bizzBio)
    const links = { ...currentPersona.socialLinks, ...ov?.socialLinks }
    setEditDraft({ bio, instagram: links.instagram ?? '', linkedin: links.linkedin ?? '', twitter: links.twitter ?? '', github: links.github ?? '', bizzSkills: [...(ov?.bizzSkills ?? currentPersona.bizzSkills)], newSkill: '' })
    setIsEditing(true)
  }

  const saveEdit = () => {
    const bioKey = activeMode === 'social' ? 'socialBio' : activeMode === 'bff' ? 'bffBio' : 'bizzBio'
    setPersonaOverrides(prev => ({ ...prev, [currentPersona.id]: { ...prev[currentPersona.id], [bioKey]: editDraft.bio, socialLinks: { instagram: editDraft.instagram || undefined, linkedin: editDraft.linkedin || undefined, twitter: editDraft.twitter || undefined, github: editDraft.github || undefined }, bizzSkills: editDraft.bizzSkills } }))
    setIsEditing(false)
    triggerToast('Profile updated!')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const simulateUpload = (fileName: string) => {
    if (uploading) return
    setUploading(true); setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setUploading(false)
            const newMoment = { location: currentPersona.location.split(',')[0], date: 'Just now', imageColor: getRandomGradient(), caption: `Uploaded: ${fileName || 'New Event Moment'} 📸` }
            setCustomMoments(p => ({ ...p, [currentPersona.id]: [newMoment, ...(p[currentPersona.id] || [])] }))
            triggerToast('Moment uploaded successfully!')
          }, 300)
          return 100
        }
        return prev + 10
      })
    }, 150)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false)
    if (e.dataTransfer.files?.[0]) simulateUpload(e.dataTransfer.files[0].name)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) simulateUpload(e.target.files[0].name)
  }

  const triggerToast = (msg: string) => {
    setShowToast(msg)
    setTimeout(() => setShowToast(null), 3000)
  }

  const getRandomGradient = () => {
    const g = ['from-violet-500 to-purple-600', 'from-amber-400 to-orange-500', 'from-teal-400 to-emerald-600', 'from-pink-500 to-rose-600', 'from-sky-400 to-blue-500']
    return g[Math.floor(Math.random() * g.length)]
  }

  const modeColors = {
    social: {
      accent: '#2563eb', bgAccent: 'bg-[#2563eb]', textAccent: 'text-[#2563eb]',
      borderAccent: 'border-blue-500/40', ringAccent: 'ring-[#2563eb]/20',
      gradient: 'from-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-500/10 text-blue-800 border-blue-500/20 backdrop-blur-sm',
      tabActive: 'bg-[#2563eb] text-white shadow-sm', tabInactive: 'text-blue-700 hover:bg-blue-500/10',
      progressColor: 'blue' as const, hoverBg: 'hover:bg-blue-500/10',
      cardBg: 'bg-blue-50/50', cardBorder: 'border-blue-100', panelHeader: 'bg-blue-50/40'
    },
    bff: {
      accent: '#84cc16', bgAccent: 'bg-[#84cc16]', textAccent: 'text-[#84cc16]',
      borderAccent: 'border-lime-500/40', ringAccent: 'ring-[#84cc16]/20',
      gradient: 'from-lime-500 to-green-600',
      badgeBg: 'bg-lime-500/10 text-lime-800 border-lime-500/20 backdrop-blur-sm',
      tabActive: 'bg-[#84cc16] text-white shadow-sm', tabInactive: 'text-lime-800 hover:bg-lime-500/10',
      progressColor: 'green' as const, hoverBg: 'hover:bg-lime-500/10',
      cardBg: 'bg-lime-50/50', cardBorder: 'border-lime-100', panelHeader: 'bg-lime-50/40'
    },
    bizz: {
      accent: '#0d9488', bgAccent: 'bg-[#0d9488]', textAccent: 'text-[#0d9488]',
      borderAccent: 'border-teal-500/40', ringAccent: 'ring-[#0d9488]/20',
      gradient: 'from-teal-600 to-emerald-700',
      badgeBg: 'bg-teal-500/10 text-teal-800 border-teal-500/20 backdrop-blur-sm',
      tabActive: 'bg-[#0d9488] text-white shadow-sm', tabInactive: 'text-teal-800 hover:bg-teal-500/10',
      progressColor: 'teal' as const, hoverBg: 'hover:bg-teal-500/10',
      cardBg: 'bg-teal-50/50', cardBorder: 'border-teal-100', panelHeader: 'bg-teal-50/40'
    }
  }

  const getBadgesForPersona = (personaId: string) => {
    switch (personaId) {
      case 'maxim': return [
        { name: 'Cozy Connector', desc: 'Attended 5 cozy venue mixers', icon: '☕', status: 'unlocked' },
        { name: 'Board Game Guild', desc: 'Host of 3 board game meetups', icon: '🎲', status: 'unlocked' },
        { name: 'First Mixer RSVP', desc: 'Completed first event checkout', icon: '🎟️', status: 'unlocked' },
        { name: 'Social Catalyst', desc: 'Contributed +100 vibe points', icon: '⚡', status: 'locked' },
        { name: 'Vayo Pathfinder', desc: 'Reach Pathfinder level status', icon: '🛡️', status: 'locked' },
        { name: 'Mega Mixer Hero', desc: 'Attend a large community gala', icon: '🎉', status: 'locked' }
      ]
      case 'sarah': return [
        { name: 'Design Pioneer', desc: 'Hosted 3 creative workshops', icon: '🎨', status: 'unlocked' },
        { name: 'Social Butterfly', desc: 'Connected 10+ mutual friends', icon: '🦋', status: 'unlocked' },
        { name: 'Nomad Cafe Club', desc: 'Regular Indiranagar hub visitor', icon: '🥐', status: 'unlocked' },
        { name: 'Super Connector', desc: 'Connect 3 founders together', icon: '⚡', status: 'locked' },
        { name: 'Community Host', desc: 'Host a design review panel', icon: '📣', status: 'locked' },
        { name: 'Karma Master', desc: 'Reach Voyager karma tier', icon: '🏆', status: 'locked' }
      ]
      case 'daniel': return [
        { name: 'Speed Runner', desc: 'Completed 10 morning runs', icon: '🏃‍♂️', status: 'unlocked' },
        { name: 'Shuttle Ace', desc: 'Winner of HSR Badminton club', icon: '🏸', status: 'unlocked' },
        { name: 'Trivia Champion', desc: 'Weekly beer & trivia winner', icon: '🍺', status: 'unlocked' },
        { name: 'Cozy Host', desc: 'Host 5 offline hub mixers', icon: '🏠', status: 'locked' },
        { name: 'Elite Pathfinder', desc: 'Earned pathfinder badge', icon: '🛡️', status: 'unlocked' },
        { name: 'Global Voyager', desc: 'Earn 1000+ Karma XP balance', icon: '🌍', status: 'locked' }
      ]
      case 'elena': return [
        { name: 'Art Curator', desc: 'Hosted modern art gallery tour', icon: '🖼️', status: 'unlocked' },
        { name: 'Poetry Slammer', desc: 'Contributed 5 poetry readings', icon: '✍️', status: 'unlocked' },
        { name: 'Literature Guild', desc: 'Jayanagar Book Club lead', icon: '📚', status: 'unlocked' },
        { name: 'Quiet Hub Host', desc: 'Set up low-intensity cafe event', icon: '☕', status: 'locked' },
        { name: 'Profile Guardian', desc: 'Helped verify 10 offline profiles', icon: '🛡️', status: 'locked' },
        { name: 'Voyager VIP', desc: 'VIP mixer access level', icon: '✨', status: 'unlocked' }
      ]
      default: return []
    }
  }

  const theme = modeColors[activeMode]

  return (
    <div className="min-h-screen relative overflow-hidden text-[#1f2937] font-sans antialiased py-12 px-4 md:px-8 lg:px-12 selection:bg-blue-100">

      {/* Background */}
      <img src={newBg} alt="Background" className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none" />
      <div className="fixed inset-0 bg-[#f8f9fa]/20 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* ── Lightbox ── */}
      {lightboxMoment && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightboxMoment(null)}>
          <div className="relative max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            {lightboxMoment.imageUrl ? (
              <img src={lightboxMoment.imageUrl} alt={lightboxMoment.caption} className="w-full aspect-video object-cover" />
            ) : (
              <div className={`w-full aspect-video bg-gradient-to-br ${lightboxMoment.imageColor} flex flex-col items-center justify-center`}>
                <svg className="w-16 h-16 opacity-20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-white/40 text-sm font-bold mt-2">{lightboxMoment.date}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-10">
              <div className="flex items-center gap-1.5 text-white/60 text-[11px] font-semibold mb-1.5">
                <MapPin className="w-3 h-3" />{lightboxMoment.location}
              </div>
              <p className="text-white font-bold text-sm leading-snug">{lightboxMoment.caption}</p>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => {
                  setDeletedMomentIdxs(prev => ({ ...prev, [currentPersona.id]: [...(prev[currentPersona.id] || []), lightboxMoment.idx] }))
                  setLightboxMoment(null)
                  triggerToast('Moment deleted')
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/80 text-white text-[10px] font-bold transition-colors cursor-pointer border border-white/10">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button onClick={() => setLightboxMoment(null)} className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors border border-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181b]/95 backdrop-blur-md text-white text-xs font-bold px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span>{showToast}</span>
        </div>
      )}



      {/* ── Share Profile Card ── */}
      {showShareCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowShareCard(false)}>
          <div className="w-80 rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative h-28 bg-neutral-950 flex items-end px-5 pb-4">
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 20% 120%, ${theme.accent}50 0%, transparent 60%)` }} />
              <div className="relative flex items-end gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                  <img src={currentPersona.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="pb-0.5">
                  <div className="text-white font-extrabold text-sm">{currentPersona.name}, {currentPersona.age}</div>
                  <div className="text-white/50 text-[9px] font-bold uppercase tracking-wider">{currentPersona.role}</div>
                </div>
              </div>
              <button onClick={() => setShowShareCard(false)} className="absolute top-3 right-3 text-white/50 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Karma Tier</div>
                  <div className={`text-sm font-extrabold ${theme.textAccent}`}>{currentPersona.karmaTier} · {currentPersona.karmaBalance} XP</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentPersona.socialTags.slice(0, 2).map(tag => (
                    <span key={tag} className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold ${theme.cardBg} ${theme.cardBorder}`}>
                <span className="text-neutral-500">vayo.community/</span>
                <span className={theme.textAccent}>{currentPersona.name.toLowerCase()}</span>
              </div>

              {/* Referral code */}
              <div className="space-y-2">
                <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Referral Code</div>
                <div className={`flex items-center justify-between p-3 rounded-xl border ${theme.cardBg} ${theme.cardBorder}`}>
                  <span className={`text-[13px] font-extrabold tracking-widest ${theme.textAccent}`}>{currentPersona.referral.code}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(currentPersona.referral.code); triggerToast('Referral code copied!') }}
                    className="text-[9.5px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-opacity hover:opacity-80"
                    style={{ color: theme.accent, borderColor: `${theme.accent}40`, background: `${theme.accent}12` }}>
                    Copy
                  </button>
                </div>
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[9.5px] text-neutral-400 font-medium">{currentPersona.referral.referredCount} friends referred</span>
                  <span className="text-[9.5px] font-bold text-emerald-600">+{currentPersona.referral.xpEarned} XP earned</span>
                </div>
              </div>

              <button onClick={() => { navigator.clipboard.writeText(`vayo.community/${currentPersona.name.toLowerCase()}`); triggerToast('Profile link copied!'); setShowShareCard(false) }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white ${theme.bgAccent} hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2`}>
                <Share2 className="w-3.5 h-3.5" /> Copy Profile Link
              </button>
            </div>
          </div>
        </div>
      )}



      <div className="max-w-[1140px] mx-auto relative z-10">

        {/* ═══ HEADER ═══ */}
        <header className="flex items-center justify-between border border-white/50 bg-white/30 backdrop-blur-md rounded-3xl py-3 px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] mb-6 gap-4 relative z-20">
          <div className="flex items-center gap-3">
            <div className="text-neutral-800 flex items-center">
              <img src={vayoLogo} className="h-7 w-auto select-none" alt="VAYO" />
              <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full inline-block ml-1" />
            </div>
            <span className="text-[8.5px] text-neutral-400 font-bold uppercase tracking-wider hidden sm:block border-l border-neutral-300 pl-3 leading-none h-3 flex items-center mt-1">Community Hub</span>
          </div>

          <div className="flex bg-white/25 backdrop-blur-sm p-1 rounded-full border border-white/30 shadow-sm gap-1">
            {(['social', 'bff', 'bizz'] as const).map(mode => {
              const isActive = activeMode === mode
              return (
                <button key={mode} onClick={() => { setActiveMode(mode); triggerToast(`Switched to ${mode === 'bizz' ? 'Bizz' : mode === 'bff' ? 'BFF' : 'Social'} Mode!`) }}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-full transition-all duration-300 cursor-pointer ${isActive ? `${theme.bgAccent} text-white shadow-sm scale-[1.02]` : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/40'}`}>
                  {mode === 'bizz' ? 'Bizz' : mode === 'bff' ? 'BFF' : 'Social'}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5 relative">
            <div className={`w-9 h-9 rounded-full overflow-hidden border-2 bg-neutral-900 shadow-sm`} style={{ borderColor: theme.accent }}>
              <img src={currentPersona.image} alt={currentPersona.name} className="w-full h-full object-cover" />
            </div>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <button onClick={() => setShowNotifications(v => !v)} className="p-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/40 text-neutral-600 hover:text-neutral-800 transition-colors shadow-sm relative cursor-pointer" title="Notifications">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center">{unreadCount}</span>}
            </button>
            <button onClick={() => setShowShareCard(true)} className="p-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/40 text-neutral-600 hover:text-neutral-800 transition-colors shadow-sm cursor-pointer" title="Share profile">
              <Share2 className="w-4 h-4" />
            </button>

            {/* Notification dropdown — anchored right below this group */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute top-full right-0 mt-2 z-50 w-80 rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">Notifications</span>
                      <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                        {activeMode === 'social' ? '🌐 Social' : activeMode === 'bff' ? '💚 BFF' : '💼 Bizz'}
                      </span>
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="text-neutral-400 hover:text-neutral-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {notifications.map(n => (
                      <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.unread ? 'bg-blue-50/40' : ''}`}>
                        <span className="text-lg shrink-0 mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold leading-snug text-neutral-700">{n.msg}</p>
                          <p className="text-[9.5px] text-neutral-400 font-medium mt-0.5">{n.time}</p>
                        </div>
                        {n.unread && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ═══ MAIN CARD ═══ */}
        <div className="bg-white/30 backdrop-blur-md rounded-[32px] border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] overflow-hidden mb-12">

          {/* Card Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/30 bg-white/10">
            <div className="w-6 h-6 rounded bg-white/30 flex items-center justify-center text-neutral-600/70 border border-white/20"><LayoutGrid className="w-3.5 h-3.5" /></div>
            <h2 className="text-sm font-extrabold text-neutral-800 tracking-wider uppercase">Profile</h2>
            <div className="w-6 h-6 rounded bg-white/30 flex items-center justify-center text-neutral-600/70 border border-white/20"><FileText className="w-3.5 h-3.5" /></div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid md:grid-cols-[240px_1fr] gap-6 p-6">

            {/* ── SIDEBAR (sticky) ── */}
            <aside className="space-y-2 sticky top-6 self-start">
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-1">
                {([
                  { key: 'profile', labels: { social: 'Vibe Profile', bff: 'Personal Profile', bizz: 'Professional Profile' }, icon: <User className="w-4 h-4" />, modes: ['social','bff','bizz'] },
                  { key: 'karma',   labels: { social: 'Karma & Rewards', bff: 'Karma & Rewards', bizz: 'Karma & Rewards' }, icon: <Award className="w-4 h-4" />, modes: ['social'] },
                  { key: 'circle',  labels: { social: 'My Circle', bff: 'BFF Crew Hub', bizz: 'Work Connections' }, icon: <Users className="w-4 h-4" />, modes: ['social','bff','bizz'] },
                  { key: 'mixers',  labels: { social: 'Event Stage', bff: 'Event Stage', bizz: 'Event Stage' }, icon: <Calendar className="w-4 h-4" />, modes: ['social'] },
                  { key: 'moments',  labels: { social: 'Gallery', bff: 'Memories', bizz: 'Memories' }, icon: <Sparkles className="w-4 h-4" />, modes: ['social','bff'] },
                  { key: 'security', labels: { social: 'Account & Security', bff: 'Account & Security', bizz: 'Account & Security' }, icon: <Lock className="w-4 h-4" />, modes: ['social','bff','bizz'] },
                ] as { key: typeof activeSidebarTab; labels: Record<string,string>; icon: React.ReactNode; modes: string[] }[])
                  .filter(item => item.modes.includes(activeMode))
                  .map(item => {
                  const isActive = activeSidebarTab === item.key
                  return (
                    <button key={item.key} onClick={() => setActiveSidebarTab(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isActive ? 'bg-white/80 text-neutral-800 shadow-sm border border-neutral-100/50' : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/25'}`}>
                      <span className={isActive ? theme.textAccent : 'text-neutral-400'}>{item.icon}</span>
                      <span>{item.labels[activeMode]}</span>
                    </button>
                  )
                })}
                <div className="border-t border-white/20 my-2" />
                <button onClick={() => triggerToast('Logout simulated successfully!')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-500/80 hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer">
                  <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                  <span>Log out</span>
                </button>
              </div>
            </aside>

            {/* ── MAIN PANEL ── */}
            <main className="bg-white border border-white/40 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col min-h-[500px]">

              {/* Panel Header */}
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-600">
                    {activeSidebarTab === 'profile' && <User className="w-4 h-4" />}
                    {activeSidebarTab === 'karma' && <Award className="w-4 h-4" />}
                    {activeSidebarTab === 'circle' && <Users className="w-4 h-4" />}
                    {activeSidebarTab === 'mixers' && <Calendar className="w-4 h-4" />}
                    {activeSidebarTab === 'moments' && <Sparkles className="w-4 h-4" />}
                    {activeSidebarTab === 'security' && <Lock className="w-4 h-4" />}
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight">
                    {activeSidebarTab === 'profile' && (activeMode === 'bizz' ? 'Professional Profile' : activeMode === 'bff' ? 'Personal Profile' : 'Profile Details')}
                    {activeSidebarTab === 'karma' && 'Karma & Rewards Progression'}
                    {activeSidebarTab === 'circle' && (activeMode === 'bizz' ? 'Work Connections' : activeMode === 'bff' ? 'BFF Crew Hub' : 'My Circle Connections')}
                    {activeSidebarTab === 'mixers' && 'Event Stage'}
                    {activeSidebarTab === 'moments' && (activeMode === 'bff' ? 'Memory Gallery' : 'Photo Gallery')}
                    {activeSidebarTab === 'security' && 'Account & Security'}
                  </h3>
                </div>
                {isEditing && activeSidebarTab === 'profile' ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsEditing(false)} className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 cursor-pointer transition-colors">Cancel</button>
                    <button onClick={saveEdit} className="text-[11px] font-bold px-3 py-1.5 rounded-xl text-white cursor-pointer transition-opacity hover:opacity-90" style={{ background: theme.accent }}>Save</button>
                  </div>
                ) : (
                  <button onClick={() => activeSidebarTab === 'profile' ? startEdit() : triggerToast('Switch to Profile tab to edit')}
                    className="flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all hover:bg-neutral-50 cursor-pointer">
                    <svg className="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" /></svg>
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Panel Body */}
              <div className="p-6 flex-1">

                {/* ════════════════════ PROFILE TAB ════════════════════ */}
                {activeSidebarTab === 'profile' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Avatar + Info */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      {/* GRADIENT RING AVATAR */}
                      <div className="relative shrink-0">
                        <div className={`w-28 h-28 rounded-full p-[3px] bg-gradient-to-br ${theme.gradient} shadow-xl`}>
                          <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 border-2 border-white/80">
                            <img src={currentPersona.image} alt={currentPersona.name} className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="absolute inset-[-4px] rounded-full border-2 opacity-25 transition-colors duration-500" style={{ borderColor: theme.accent }} />
                      </div>

                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <div className="flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start">
                          <h4 className="text-xl font-extrabold text-neutral-800 tracking-tight">{currentPersona.name}, {currentPersona.age}</h4>
                          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            Active
                          </span>
                          <span className={`flex items-center gap-1 text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                            {activeMode === 'social' ? '🌐' : activeMode === 'bff' ? '💚' : '💼'}
                            {activeMode === 'social' ? 'Social' : activeMode === 'bff' ? 'BFF' : 'Bizz'}
                          </span>
                        </div>

                        <div className="text-xs text-neutral-500 space-y-1">
                          <div>+91 9845{currentPersona.id === 'maxim' ? '0 1202' : currentPersona.id === 'sarah' ? '1 3495' : currentPersona.id === 'daniel' ? '2 8593' : '3 9204'}</div>
                          <div className="text-blue-600 font-semibold hover:underline cursor-pointer">{currentPersona.name.toLowerCase()}@vayo.community</div>
                          <div className="flex items-center justify-center sm:justify-start gap-1 text-neutral-400">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{currentPersona.location}, India</span>
                          </div>
                          {isEditing ? (
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              {([['instagram','ig'], ['linkedin','li'], ['twitter','tw'], ['github','gh']] as const).map(([key, short]) => (
                                <div key={key} className="flex items-center gap-1 border rounded-lg px-2 py-1 bg-white" style={{ borderColor: `${theme.accent}30` }}>
                                  <span className="text-[8.5px] font-extrabold uppercase text-neutral-400 w-5">{short}</span>
                                  <input value={editDraft[key as 'instagram'|'linkedin'|'twitter'|'github']}
                                    onChange={e => setEditDraft(p => ({ ...p, [key]: e.target.value }))}
                                    className="text-[10.5px] flex-1 outline-none bg-transparent min-w-0" placeholder={`@handle`} />
                                </div>
                              ))}
                            </div>
                          ) : Object.keys(displayPersona.socialLinks).length > 0 && (
                            <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                              {displayPersona.socialLinks.instagram && (
                                <a href="#" onClick={e => e.preventDefault()} title={`@${displayPersona.socialLinks.instagram}`}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                                  </svg>
                                </a>
                              )}
                              {displayPersona.socialLinks.linkedin && (
                                <a href="#" onClick={e => e.preventDefault()} title={displayPersona.socialLinks.linkedin}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
                                  </svg>
                                </a>
                              )}
                              {displayPersona.socialLinks.twitter && (
                                <a href="#" onClick={e => e.preventDefault()} title={`@${displayPersona.socialLinks.twitter}`}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                  </svg>
                                </a>
                              )}
                              {displayPersona.socialLinks.github && (
                                <a href="#" onClick={e => e.preventDefault()} title={displayPersona.socialLinks.github}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <textarea value={editDraft.bio} onChange={e => setEditDraft(p => ({ ...p, bio: e.target.value }))} rows={3}
                            className={`w-full text-xs border rounded-xl px-3 py-2 mt-1 resize-none focus:outline-none focus:ring-2 bg-white ${theme.cardBorder}`}
                            placeholder="Write your bio…" />
                        ) : (
                          <p className="text-xs text-neutral-600 italic font-medium pt-1 max-w-xl">
                            "{activeMode === 'social' ? displayPersona.socialBio : activeMode === 'bff' ? displayPersona.bffBio : displayPersona.bizzBio}"
                          </p>
                        )}
                      </div>

                      {/* Profile completeness donut */}
                      <div className="shrink-0 flex flex-col items-center gap-1.5 self-center sm:self-start sm:pt-1">
                        <div className="relative w-14 h-14 group cursor-default">
                          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r="22" fill="none" stroke="#e5e7eb" strokeWidth="4.5" />
                            <circle cx="28" cy="28" r="22" fill="none" stroke={theme.accent} strokeWidth="4.5"
                              strokeDasharray={`${2 * Math.PI * 22}`}
                              strokeDashoffset={`${2 * Math.PI * 22 * (1 - completenessScore / 100)}`}
                              strokeLinecap="round" className="transition-all duration-700" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-[12px] font-extrabold ${theme.textAccent}`}>{completenessScore}%</span>
                          </div>
                          <div className="absolute top-0 right-full mr-3 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            <div className={`text-[9px] font-extrabold uppercase tracking-wider mb-2 ${theme.textAccent}`}>Profile Checklist</div>
                            <div className="space-y-1">
                              {completenessItems.map(item => (
                                <div key={item.label} className="flex items-center gap-1.5">
                                  {item.done ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> : <span className="w-3 h-3 rounded-full border border-neutral-300 shrink-0 inline-block" />}
                                  <span className={`text-[10px] font-medium ${item.done ? 'text-neutral-700' : 'text-neutral-400'}`}>{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Complete</span>
                      </div>
                    </div>

                    {/* Stats bar — per mode */}
                    <div className={`flex items-center rounded-2xl border ${theme.cardBorder} ${theme.cardBg} overflow-hidden`}>
                      {(activeMode === 'bff' ? [
                        { label: 'BFF Squads', value: currentPersona.bffCrew.length },
                        { label: 'Memories', value: personaMoments.length },
                        { label: 'Close Friends', value: currentPersona.connectionsMet.length },
                      ] : activeMode === 'bizz' ? [
                        { label: 'Connections', value: currentPersona.connectionsMet.length },
                        { label: 'Skills', value: currentPersona.bizzSkills.length },
                        { label: 'Events', value: currentPersona.pastTimeline.length },
                      ] : [
                        { label: 'Mixers', value: currentPersona.pastTimeline.length },
                        { label: 'Connections', value: currentPersona.connectionsMet.length },
                        { label: 'Karma XP', value: currentPersona.karmaBalance >= 1000 ? `${(currentPersona.karmaBalance / 1000).toFixed(1)}k` : currentPersona.karmaBalance },
                      ]).map((s, i, arr) => (
                        <div key={s.label} className={`flex-1 flex flex-col items-center py-3 gap-0.5 ${i < arr.length - 1 ? `border-r ${theme.cardBorder}` : ''}`}>
                          <div className={`text-base font-extrabold ${theme.textAccent}`}>{s.value}</div>
                          <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Internal Info */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Internal</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">User Type</div>
                          <div className="text-xs font-bold text-neutral-700 mt-0.5">{activeMode === 'bizz' ? 'Founder / Builder' : activeMode === 'bff' ? 'Hobbyist Mixer' : 'Social Connector'}</div>
                        </div>
                        <div>
                          <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Association</div>
                          <div className="text-xs font-bold text-neutral-700 mt-0.5">Vayo Offline Hub (Bangalore)</div>
                        </div>
                        <div>
                          <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Source / Verification</div>
                          <div className="text-xs font-bold text-neutral-700 mt-0.5 flex items-center gap-1 justify-center sm:justify-start">
                            {currentPersona.selfieVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-600 inline shrink-0" />}
                            <span>{currentPersona.selfieVerified ? 'Selfie Verified' : 'Standard'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── RECENT ACTIVITY STRIP ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50/70 border border-neutral-100">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${theme.badgeBg}`}>
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Last Mixer</div>
                          <div className="text-xs font-bold text-neutral-700 truncate max-w-[160px]">{currentPersona.pastTimeline[0]?.name || 'None yet'}</div>
                          <div className="text-[9.5px] text-neutral-400">{currentPersona.pastTimeline[0]?.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50/70 border border-neutral-100">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/10">
                          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        </div>
                        <div>
                          <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Next Event</div>
                          <div className="text-xs font-bold text-neutral-700 truncate max-w-[160px]">{currentPersona.activeTickets[0]?.name || 'No upcoming events'}</div>
                          <div className="text-[9.5px] text-emerald-600 font-bold">{currentPersona.activeTickets[0]?.countdown || ''}</div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* ── BADGES (enhanced) ── */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-4">Community Badges & Milestones</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {getBadgesForPersona(currentPersona.id).map((badge, idx) => {
                          const isUnlocked = badge.status === 'unlocked'
                          const lockProgress = isUnlocked ? 100 : getBadgeLockProgress(currentPersona.id, badge.name)
                          const isHovered = hoveredBadgeIdx === idx
                          return (
                            <div
                              key={idx}
                              onMouseEnter={() => setHoveredBadgeIdx(idx)}
                              onMouseLeave={() => setHoveredBadgeIdx(null)}
                              onClick={() => isUnlocked ? triggerToast(`Badge Unlocked: ${badge.name}! "${badge.desc}"`) : triggerToast(`${lockProgress}% complete — keep going to unlock this!`)}
                              className={`relative p-3.5 rounded-2xl border transition-all duration-300 flex flex-col gap-2 cursor-pointer select-none overflow-hidden
                                ${isUnlocked
                                  ? 'bg-neutral-50/70 border-neutral-200/60 hover:bg-white hover:border-neutral-300 hover:shadow-md hover:-translate-y-0.5'
                                  : 'bg-neutral-50/20 border-neutral-100/50 hover:border-neutral-200 hover:-translate-y-0.5'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-xl shadow-sm shrink-0 transition-all ${!isUnlocked ? 'grayscale opacity-50' : ''}`}>
                                  {badge.icon}
                                </div>
                                <div className="leading-tight flex-1 min-w-0">
                                  <div className={`text-xs font-bold flex items-center gap-1.5 ${isUnlocked ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                    <span className="truncate">{badge.name}</span>
                                    {isUnlocked ? (
                                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[8px] font-extrabold border border-emerald-500/20 shrink-0">✓</span>
                                    ) : (
                                      <svg className="w-3.5 h-3.5 text-neutral-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                      </svg>
                                    )}
                                  </div>
                                  <p className={`text-[10px] font-medium mt-0.5 leading-normal truncate ${isUnlocked ? 'text-neutral-400' : 'text-neutral-300'}`} title={badge.desc}>{badge.desc}</p>
                                </div>
                              </div>

                              {/* Progress bar for locked badges */}
                              {!isUnlocked && (
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-[8.5px] text-neutral-400 font-bold">Progress</span>
                                    <span className="text-[8.5px] font-extrabold text-neutral-500">{lockProgress}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${theme.bgAccent} transition-all duration-700`} style={{ width: `${lockProgress}%` }} />
                                  </div>
                                </div>
                              )}

                              {/* Hover tooltip for unlocked */}
                              {isUnlocked && isHovered && (
                                <div className="absolute inset-x-0 bottom-0 bg-neutral-900/90 backdrop-blur-sm text-white text-[9px] font-bold px-3 py-2 rounded-b-2xl text-center">
                                  ✨ Earned · Click to share this badge
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* ── KARMA TEASER WIDGET ── */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${theme.badgeBg}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getTierIcon(currentPersona.karmaTier)}</span>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Karma Balance</div>
                          <div className={`text-xl font-extrabold ${theme.textAccent}`}>{currentPersona.karmaBalance} XP</div>
                          <div className="text-[10px] font-bold opacity-60">{currentPersona.karmaTier} Tier</div>
                        </div>
                      </div>
                      <button onClick={() => setActiveSidebarTab('karma')} className={`flex items-center gap-1.5 text-[10.5px] font-bold ${theme.textAccent} hover:underline cursor-pointer shrink-0`}>
                        View Full Karma <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Professional (bizz mode) */}
                    {activeMode === 'bizz' && currentPersona.bizzRole && (
                      <>
                        <hr className="border-neutral-100" />
                        <div>
                          <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Professional Connection Details</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Professional Role</div>
                              <div className="text-xs font-bold text-neutral-700 mt-0.5">{currentPersona.bizzRole}</div>
                            </div>
                            <div>
                              <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Company</div>
                              <div className="text-xs font-bold text-neutral-700 mt-0.5">{currentPersona.bizzCompany}</div>
                            </div>
                            <div>
                              <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Collaboration Match</div>
                              <div className="text-xs font-bold text-teal-600 mt-0.5 flex items-center gap-1 justify-center sm:justify-start">
                                <Briefcase className="w-3.5 h-3.5" /><span>High Match</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <hr className="border-neutral-100" />

                    {/* Vibe Tags */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Vibe Profile Tags</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {(activeMode === 'social' ? currentPersona.socialTags : activeMode === 'bff' ? currentPersona.bffTags : currentPersona.bizzTags).map((tag, i) => (
                          <span key={i} className={`text-[10.5px] font-bold px-2.5 py-1 rounded-xl border ${theme.badgeBg}`}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Bizz Skills */}
                    {(activeMode === 'bizz' || isEditing) && (
                      <>
                        <hr className="border-neutral-100" />
                        <div>
                          <h5 className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-3">Skills & Expertise</h5>
                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                {editDraft.bizzSkills.map((skill, i) => (
                                  <span key={i} className={`flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                                    <Zap className="w-3 h-3" style={{ color: theme.accent }} />{skill}
                                    <button onClick={() => setEditDraft(p => ({ ...p, bizzSkills: p.bizzSkills.filter((_, j) => j !== i) }))} className="ml-0.5 text-neutral-400 hover:text-red-500 cursor-pointer">×</button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input value={editDraft.newSkill} onChange={e => setEditDraft(p => ({ ...p, newSkill: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter' && editDraft.newSkill.trim()) { setEditDraft(p => ({ ...p, bizzSkills: [...p.bizzSkills, p.newSkill.trim()], newSkill: '' })) } }}
                                  className={`flex-1 text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 bg-white ${theme.cardBorder}`} placeholder="Add a skill… (Enter to add)" />
                                <button onClick={() => { if (editDraft.newSkill.trim()) setEditDraft(p => ({ ...p, bizzSkills: [...p.bizzSkills, p.newSkill.trim()], newSkill: '' })) }}
                                  className="px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: theme.accent }}>Add</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {displayPersona.bizzSkills.map((skill, i) => (
                                <span key={i} className={`flex items-center gap-1.5 text-[10.5px] font-bold px-3 py-1.5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                                  <Zap className={`w-3 h-3`} style={{ color: theme.accent }} />{skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <hr className="border-neutral-100" />

                    {/* Account & Security */}
                    <div>
                    </div>

                  </div>
                )}

                {/* ════════════════════ KARMA TAB ════════════════════ */}
                {activeSidebarTab === 'karma' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Tier Hero Card */}
                    {(() => {
                      const lb = currentPersona.karmaBalance >= 600 ? { rank: 'Top 5%', cls: 'text-amber-600 bg-amber-50 border-amber-200' }
                        : currentPersona.karmaBalance >= 400 ? { rank: 'Top 15%', cls: 'text-blue-600 bg-blue-50 border-blue-100' }
                        : currentPersona.karmaBalance >= 250 ? { rank: 'Top 35%', cls: 'text-violet-600 bg-violet-50 border-violet-100' }
                        : { rank: 'Top 60%', cls: 'text-neutral-500 bg-neutral-50 border-neutral-200' }
                      return (
                        <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-r from-neutral-50 to-neutral-100/60 border border-neutral-100">
                          <span className="text-5xl">{getTierIcon(currentPersona.karmaTier)}</span>
                          <div className="flex-1">
                            <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">Current Tier</div>
                            <div className="text-2xl font-extrabold text-neutral-800">{currentPersona.karmaTier}</div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-neutral-400 font-medium">Vayo Community Member</span>
                              <span className={`flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${lb.cls}`}>
                                🏆 {lb.rank} in {currentPersona.location.split(',')[0]}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">Total XP</div>
                            <div className={`text-4xl font-extrabold tabular-nums ${theme.textAccent}`}>{animatedXP}</div>
                          </div>
                        </div>
                      )
                    })()}

                    <hr className="border-neutral-100" />

                    {/* Tier progression with milestones */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1">Tier Progression</h5>
                      <SegmentedProgress percentage={currentPersona.karmaPercentage} color={theme.progressColor} showMilestones={true} />
                      <p className="text-xs text-neutral-500 leading-relaxed font-normal mt-3 max-w-xl">
                        {currentPersona.karmaTier === 'Explorer' && 'Explorer Tier: Unlocks basic direct messaging, group chat RSVP capabilities, and offline community entry.'}
                        {currentPersona.karmaTier === 'Pathfinder' && 'Pathfinder Tier: Unlocks 24-hour priority ticket booking window for hot mixers, special venue perks, and host support badge status.'}
                        {currentPersona.karmaTier === 'Voyager' && 'Voyager Tier: Unlocks invite-only premium VIP mixers, private dining access, voting rights on community mixers, and VIP support.'}
                      </p>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Activity Breakdown — 2×2 grid */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Karma Activity Breakdown</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Attended Events', hint: '+10 XP', value: currentPersona.karmaBreakdown.attendedMixers, icon: '🎉' },
                          { label: 'Moment Contributor', hint: '+15 XP', value: currentPersona.karmaBreakdown.momentContributor, icon: '📸' },
                          { label: 'Vibe Leader', hint: '+20 XP', value: currentPersona.karmaBreakdown.vibeLeader, icon: '⚡' },
                          { label: 'Host Support', hint: '+50 XP', value: currentPersona.karmaBreakdown.hostSupport, icon: '🙌' },
                        ].map((item, i) => {
                          const maxVal = Math.max(currentPersona.karmaBreakdown.attendedMixers, currentPersona.karmaBreakdown.momentContributor, currentPersona.karmaBreakdown.vibeLeader, currentPersona.karmaBreakdown.hostSupport)
                          const pct = (item.value / maxVal) * 100
                          return (
                            <div key={i} className="p-3 rounded-xl bg-neutral-50/60 border border-neutral-100 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-base leading-none">{item.icon}</span>
                                <span className="text-[10px] font-extrabold" style={{ color: theme.accent }}>+{item.value}</span>
                              </div>
                              <div>
                                <div className="text-[9.5px] font-bold text-neutral-700 leading-tight">{item.label}</div>
                                <div className="text-[8.5px] text-neutral-400 font-medium">{item.hint}</div>
                              </div>
                              <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${theme.bgAccent} transition-all duration-700`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Next Tier Preview Card */}
                    {(() => {
                      const next = getNextTierInfo(currentPersona.karmaTier, currentPersona.karmaBalance)
                      return (
                        <div className={`p-4 rounded-2xl border ${theme.badgeBg}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Next Milestone</div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{next.icon}</span>
                                <span className={`text-base font-extrabold ${theme.textAccent}`}>{next.nextTier}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">XP Needed</div>
                              <div className={`text-2xl font-extrabold ${theme.textAccent}`}>+{next.needed}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-2">Unlocks</div>
                            <div className="flex flex-wrap gap-1.5">
                              {next.perks.map((perk, i) => (
                                <span key={i} className="text-[9.5px] font-bold px-2.5 py-1 rounded-full bg-white/60 border border-white/80">✦ {perk}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    <hr className="border-neutral-100" />

                    {/* Refer & Earn */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Refer &amp; Earn</h5>
                        <span className={`text-[9.5px] font-extrabold px-2.5 py-1 rounded-full border ${theme.badgeBg}`}>+50 XP per friend</span>
                      </div>
                      <div className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} overflow-hidden`}>
                        {/* Stats strip */}
                        <div className="px-4 py-3 border-b border-neutral-100/80 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Friends Joined</div>
                            <div className="flex items-baseline gap-1.5">
                              <span className={`text-2xl font-extrabold ${theme.textAccent}`}>{currentPersona.referral.referredCount}</span>
                              <span className="text-[10px] text-neutral-400 font-medium">of {currentPersona.referral.milestone} for next reward</span>
                            </div>
                          </div>
                          <div className="text-right space-y-0.5">
                            <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">XP Earned</div>
                            <div className={`text-lg font-extrabold ${theme.textAccent}`}>+{currentPersona.referral.xpEarned}</div>
                          </div>
                        </div>
                        {/* Milestone bar */}
                        <div className="px-4 py-2.5 border-b border-neutral-100/80">
                          <div className="flex items-center justify-between text-[9px] text-neutral-400 font-medium mb-1.5">
                            <span>{currentPersona.referral.referredCount} joined</span>
                            <span>{currentPersona.referral.milestone} milestone</span>
                          </div>
                          <div className="w-full bg-neutral-200/60 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${Math.min((currentPersona.referral.referredCount / currentPersona.referral.milestone) * 100, 100)}%`, background: theme.accent }} />
                          </div>
                        </div>
                        {/* Code + share */}
                        <div className="p-4 space-y-3">
                          <div>
                            <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mb-1.5">Your Referral Code</div>
                            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2.5">
                              <span className="flex-1 text-sm font-extrabold text-neutral-800 tracking-widest">{currentPersona.referral.code}</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText(currentPersona.referral.code); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000) }}
                                className={`text-[9.5px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${referralCopied ? 'bg-emerald-500 text-white' : `${theme.badgeBg} border`}`}>
                                {referralCopied ? '✓ Copied' : 'Copy'}
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => triggerToast(`Referral link copied! Share vayo.community/join?ref=${currentPersona.referral.code}`)}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white ${theme.bgAccent} hover:opacity-90 transition-opacity cursor-pointer`}>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                            </svg>
                            Share Invite Link
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* ════════════════════ MY CIRCLE TAB ════════════════════ */}
                {activeSidebarTab === 'circle' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-3">
                      {(activeMode === 'bizz' ? [
                        { label: 'Connections', value: currentPersona.connectionsMet.length, icon: '🤝' },
                        { label: 'Work Squads', value: currentPersona.bffCrew.length, icon: '💼' },
                        { label: 'Mutual Events', value: currentPersona.connectionsMet.reduce((s, c) => s + c.mutualFriends, 0), icon: '📅' },
                      ] : activeMode === 'bff' ? [
                        { label: 'Close Friends', value: currentPersona.connectionsMet.length, icon: '💚' },
                        { label: 'Crews', value: currentPersona.bffCrew.length, icon: '👥' },
                        { label: 'Squad Members', value: currentPersona.bffCrew.reduce((s, c) => s + c.members, 0), icon: '🏘️' },
                      ] : [
                        { label: 'People Met', value: currentPersona.connectionsMet.length, icon: '👋' },
                        { label: 'Squads', value: currentPersona.bffCrew.length, icon: '👥' },
                        { label: 'Mutual Friends', value: currentPersona.connectionsMet.reduce((s, c) => s + c.mutualFriends, 0), icon: '🔗' },
                      ]).map((s, i) => (
                        <div key={i} className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} p-3 text-center`}>
                          <div className="text-xl mb-1">{s.icon}</div>
                          <div className={`text-lg font-extrabold ${theme.textAccent}`}>{s.value}</div>
                          <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider leading-tight mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tab toggle */}
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <h5 className={`text-[11px] font-bold uppercase tracking-widest ${theme.textAccent}`}>
                        {activeMode === 'bff' ? 'BFF Crew Hub' : activeMode === 'bizz' ? 'Work Connections' : 'My Circle Hub'}
                      </h5>
                      {activeMode !== 'bizz' && (
                        <div className="flex bg-neutral-100 p-0.5 rounded-lg text-[10.5px] font-bold border border-neutral-200">
                          <button onClick={() => setActiveTabCircle('squads')} className={`px-3 py-1 rounded-md cursor-pointer transition-all ${activeTabCircle === 'squads' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                            {activeMode === 'bff' ? 'Crews' : 'Squads'}
                          </button>
                          <button onClick={() => setActiveTabCircle('connections')} className={`px-3 py-1 rounded-md cursor-pointer transition-all ${activeTabCircle === 'connections' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                            {activeMode === 'bff' ? 'Friends Met' : 'Offline Met'}
                          </button>
                        </div>
                      )}
                    </div>

                    {activeMode !== 'bizz' && activeTabCircle === 'squads' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentPersona.bffCrew.map((squad, i) => {
                          const avatarColors = ['bg-blue-400', 'bg-emerald-400', 'bg-violet-400', 'bg-amber-400', 'bg-rose-400']
                          return (
                            <div key={i} className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                              {/* Card header strip */}
                              <div className={`px-4 pt-4 pb-3 flex items-start justify-between bg-gradient-to-br ${theme.gradient} bg-opacity-10`} style={{ background: `linear-gradient(135deg, ${theme.accent}18, ${theme.accent}08)` }}>
                                <div className="flex items-center gap-2.5">
                                  <div className="w-10 h-10 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center text-xl shadow-sm border border-white/60">
                                    {squad.emoji}
                                  </div>
                                  <div>
                                    <div className="text-[12px] font-extrabold text-neutral-800 leading-tight">{squad.name}</div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: theme.accent }}>{squad.type}</div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-neutral-600 bg-white border border-neutral-200 px-2.5 py-1 rounded-full shadow-sm shrink-0">{squad.members} members</span>
                              </div>

                              <div className="px-4 py-3 space-y-3">
                                {/* Avatar stack */}
                                <div className="flex -space-x-1.5">
                                  {Array.from({ length: Math.min(5, squad.members) }).map((_, j) => (
                                    <div key={j} className={`w-7 h-7 rounded-full ${avatarColors[(i * 5 + j) % avatarColors.length]} border-2 border-white flex items-center justify-center text-[8px] font-extrabold text-white shadow-sm`}>
                                      {String.fromCharCode(65 + (i * 7 + j * 3) % 26)}
                                    </div>
                                  ))}
                                  {squad.members > 5 && (
                                    <div className="w-7 h-7 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-neutral-500 shadow-sm">+{squad.members - 5}</div>
                                  )}
                                </div>

                                {/* Activity & next event */}
                                <div className="flex items-center justify-between text-[9.5px]">
                                  <span className="text-neutral-400 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                                    Active {squad.lastActive}
                                  </span>
                                  {squad.nextEvent && (
                                    <span className="font-bold px-2 py-0.5 rounded-full" style={{ color: theme.accent, background: `${theme.accent}15` }}>
                                      📅 {squad.nextEvent}
                                    </span>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-0.5">
                                  <button onClick={() => triggerToast(`Viewing ${squad.name}…`)}
                                    className="flex-1 py-1.5 rounded-xl border border-neutral-200 text-[10px] font-bold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer">
                                    View Squad
                                  </button>
                                  <button onClick={() => triggerToast(`Invite sent to join ${squad.name}!`)}
                                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-1"
                                    style={{ background: theme.accent }}>
                                    <UserPlus className="w-3 h-3" /> Invite
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {/* Create squad CTA */}
                        <button onClick={() => triggerToast('Squad creation coming soon!')}
                          className="rounded-2xl border-2 border-dashed border-neutral-200 hover:border-neutral-300 bg-neutral-50/40 hover:bg-neutral-50 transition-all p-4 flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[160px]">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-xl">➕</div>
                          <div className="text-[11px] font-bold text-neutral-500">Create a Squad</div>
                          <div className="text-[9.5px] text-neutral-400 text-center">Start a group around a shared interest</div>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentPersona.connectionsMet.map((conn, i) => (
                          <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <img src={conn.avatar} alt={conn.name} className="w-11 h-11 rounded-full object-cover border border-neutral-200 shadow-sm" />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                              </div>
                              <div className="leading-tight space-y-0.5">
                                <div className="text-xs font-bold text-neutral-800">{conn.name}</div>
                                <div className="text-[9.5px] text-neutral-400 font-medium">{conn.role}</div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[9px] font-bold text-neutral-400 flex items-center gap-0.5">
                                    <MapPin className="w-2.5 h-2.5" />Met at <span className="font-extrabold" style={{ color: theme.accent }}>{conn.metAt}</span>
                                  </span>
                                  <span className="text-[9px] text-blue-600 font-bold flex items-center gap-0.5">
                                    <Users className="w-2.5 h-2.5" />{conn.mutualFriends} mutual
                                  </span>
                                  {activeMode === 'bizz' && (
                                    <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                      {currentPersona.bizzSkills.slice(0, 2).join(' · ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => triggerToast(`Opened DM with ${conn.name}!`)} className="p-2 rounded-xl border border-neutral-200 text-neutral-500 bg-white hover:text-neutral-800 hover:bg-neutral-50 cursor-pointer shadow-sm transition-colors" title="Message">
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => triggerToast(`Meetup request sent to ${conn.name}!`)} className={`p-2 rounded-xl border cursor-pointer shadow-sm transition-colors ${theme.badgeBg}`} title="Plan a Meetup">
                                <CalendarPlus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Suggested connections */}
                        <div className="pt-2">
                          <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-3">People you may know</div>
                          <div className="space-y-2">
                            {currentPersona.suggestedConnections.map((s, i) => (
                              <div key={i} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-50/60 border border-neutral-100">
                                <div className="flex items-center gap-2.5">
                                  <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-neutral-200" />
                                  <div>
                                    <div className="text-[11px] font-bold text-neutral-700">{s.name}</div>
                                    <div className="text-[9px] text-neutral-400 font-medium">{s.role} · {s.reason}</div>
                                  </div>
                                </div>
                                <button onClick={() => triggerToast(`Connection request sent to ${s.name}!`)}
                                  className="text-[9.5px] font-bold px-3 py-1 rounded-full border cursor-pointer transition-colors hover:opacity-80"
                                  style={{ color: theme.accent, borderColor: theme.accent, background: `${theme.accent}10` }}>
                                  + Connect
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* ════════════════════ EVENT STAGE TAB ════════════════════ */}
                {activeSidebarTab === 'mixers' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* ── Top row: Next-up card (left) + glassmorphic calendar (right) ── */}
                    {(() => {
                      const now = new Date(2026, 5, 1)
                      const year = now.getFullYear(); const month = now.getMonth()
                      const monthName = now.toLocaleString('default', { month: 'long' })
                      const firstDay = new Date(year, month, 1).getDay()
                      const daysInMonth = new Date(year, month + 1, 0).getDate()
                      const parseDay = (dateStr: string) => { const m = dateStr.match(/(\d+)(?:,|$|\s·)/); return m ? parseInt(m[1]) : null }
                      const eventDays = new Map<number, string[]>()
                      const allEvents = [...currentPersona.activeTickets.map(t => ({ name: t.name, date: t.date })), ...currentPersona.pastTimeline.map(t => ({ name: t.name, date: t.date }))]
                      allEvents.forEach(e => { const d = parseDay(e.date); if (d && d <= daysInMonth) { if (!eventDays.has(d)) eventDays.set(d, []); eventDays.get(d)!.push(e.name) } })
                      const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
                      while (cells.length % 7 !== 0) cells.push(null)
                      const today = 11
                      const nextTkt = currentPersona.activeTickets[0]
                      return (
                        <div className="flex items-stretch gap-3">
                          {/* Left: section label + next-up card */}
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            <h5 className={`text-[11px] font-bold uppercase tracking-widest ${theme.textAccent}`}>Event Stage</h5>
                            {nextTkt && (
                              <div className="flex-1 rounded-xl p-3 border border-neutral-100 bg-white/70 shadow-sm space-y-2" style={{ backdropFilter: 'blur(8px)' }}>
                                <span className="text-[8px] font-extrabold uppercase tracking-widest text-neutral-400">Next Up</span>
                                <div className="text-[12.5px] font-extrabold text-neutral-800 leading-tight">{nextTkt.name}</div>
                                <div className="flex items-center gap-1 text-[9.5px] text-neutral-500 font-medium">
                                  <Clock className="w-3 h-3 shrink-0" style={{ color: theme.accent }} />
                                  {nextTkt.date.split(',')[0]}
                                  {nextTkt.date.split(',')[1] && <span className="text-neutral-400">{nextTkt.date.split(',')[1]}</span>}
                                </div>
                                <div className="flex items-center gap-1 text-[9.5px] text-neutral-500 font-medium">
                                  <MapPin className="w-3 h-3 shrink-0" style={{ color: theme.accent }} />
                                  <span className="truncate">{nextTkt.locationPin}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-emerald-600 pt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  {nextTkt.organizer}
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Right: glassmorphic mini-calendar */}
                          <div className="w-[160px] shrink-0 rounded-xl relative self-stretch"
                            style={{
                              background: `linear-gradient(145deg, ${theme.accent}28 0%, ${theme.accent}0a 100%)`,
                              border: `1px solid rgba(255,255,255,0.6)`,
                              boxShadow: `0 4px 24px ${theme.accent}1a, 0 1px 3px rgba(0,0,0,0.05)`
                            }}>
                            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.10) 100%)' }} />
                            <div className="relative z-10 p-2.5 h-full flex flex-col" style={{ backdropFilter: 'blur(14px)' }}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" style={{ color: theme.accent }} />
                                  <span className="text-[9.5px] font-extrabold text-neutral-700">{monthName.slice(0,3)} '{String(year).slice(2)}</span>
                                </div>
                                <span className="text-[7.5px] font-bold px-1.5 py-[2px] rounded-full"
                                  style={{ background: `${theme.accent}20`, color: theme.accent }}>
                                  {eventDays.size} ev
                                </span>
                              </div>
                              <div className="grid grid-cols-7 mb-[3px]">
                                {['S','M','T','W','T','F','S'].map((d, i) => (
                                  <div key={i} className="text-center text-[7px] font-extrabold text-neutral-400 leading-none pb-[2px]">{d}</div>
                                ))}
                              </div>
                              <div className="grid grid-cols-7 flex-1">
                                {cells.map((day, i) => {
                                  const events = day ? eventDays.get(day) : null
                                  const isToday = day === today
                                  const col = i % 7
                                  const tipAnchor = col <= 2 ? 'left-0' : col >= 5 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                                  return (
                                    <div key={i} className="relative flex flex-col items-center justify-start py-[1px] group">
                                      {day && (
                                        <>
                                          <span className="text-[8px] font-bold w-[17px] h-[17px] flex items-center justify-center rounded-full leading-none"
                                            style={isToday ? { background: theme.accent, color: '#fff', boxShadow: `0 0 0 2px ${theme.accent}35` }
                                              : events ? { background: `${theme.accent}22`, color: theme.accent }
                                              : { color: '#b0b8c8' }}>
                                            {day}
                                          </span>
                                          {events
                                            ? <span className="w-[3px] h-[3px] rounded-full" style={{ background: theme.accent }} />
                                            : <span className="w-[3px] h-[3px] opacity-0" />}
                                          {events && (
                                            <div className={`absolute bottom-full mb-1 z-50 hidden group-hover:block w-28 pointer-events-none ${tipAnchor}`}>
                                              <div className="rounded-lg px-2 py-1.5 text-[8px] font-semibold text-white shadow-xl"
                                                style={{ background: `linear-gradient(135deg, ${theme.accent}f0, ${theme.accent}c0)`, backdropFilter: 'blur(8px)' }}>
                                                {events.map((ev, j) => <div key={j} className="truncate">· {ev}</div>)}
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* ── Live Tickets ── */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        Live Tickets <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      </h5>
                      <div className="space-y-4">
                        {currentPersona.activeTickets.map((tkt, i) => (
                          <div key={i} className="border border-neutral-200 rounded-2xl overflow-hidden flex flex-col md:flex-row bg-neutral-50/50 shadow-sm">
                            {/* Left Stub */}
                            <div className="flex-1 p-5 space-y-4 border-r border-dashed border-neutral-200 relative">
                              <div className="absolute right-[-6px] top-[-6px] w-3 h-3 rounded-full bg-white border border-neutral-200 hidden md:block" />
                              <div className="absolute right-[-6px] bottom-[-6px] w-3 h-3 rounded-full bg-white border border-neutral-200 hidden md:block" />
                              <div className="space-y-0.5">
                                <div className={`text-[9px] font-extrabold uppercase tracking-wider ${theme.textAccent}`}>Upcoming Event Ticket</div>
                                <h4 className="text-sm font-extrabold text-neutral-800 leading-snug">{tkt.name}</h4>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="space-y-0.5">
                                  <span className="text-neutral-400 font-bold block text-[9px] uppercase tracking-wider">Date & Time</span>
                                  <span className="font-bold text-neutral-700 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-neutral-400" />{tkt.date.split(',')[0]}</span>
                                  <span className="text-[10px] text-neutral-400 block pl-5">{tkt.date.split(',')[1]}</span>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-neutral-400 font-bold block text-[9px] uppercase tracking-wider">Venue Location</span>
                                  <span className="font-bold text-neutral-700 flex items-center gap-1 max-w-[170px] truncate" title={tkt.locationPin}><MapPin className="w-3.5 h-3.5 text-neutral-400" />{tkt.locationPin}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs pt-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-[9px] font-bold text-neutral-600 uppercase">{tkt.organizer.charAt(0)}</div>
                                  <div className="leading-tight">
                                    <span className="text-[8.5px] text-neutral-400 block">Host Organizer</span>
                                    <span className="font-bold text-neutral-700">{tkt.organizer}</span>
                                  </div>
                                </div>
                                {/* LIVE COUNTDOWN */}
                                <TicketCountdown date={tkt.date} />
                              </div>
                            </div>
                            {/* Right QR Stub */}
                            <div className="w-full md:w-[130px] p-4 flex flex-col items-center justify-center bg-white shrink-0 border-l border-neutral-100">
                              <div className="p-1 border border-neutral-200 rounded-lg shadow-sm bg-neutral-50/50">
                                <svg className="w-16 h-16 text-neutral-800" viewBox="0 0 100 100">
                                  <rect width="100" height="100" fill="none" />
                                  <rect x="0" y="0" width="30" height="30" fill="currentColor" /><rect x="5" y="5" width="20" height="20" fill="white" /><rect x="10" y="10" width="10" height="10" fill="currentColor" />
                                  <rect x="70" y="0" width="30" height="30" fill="currentColor" /><rect x="75" y="5" width="20" height="20" fill="white" /><rect x="80" y="10" width="10" height="10" fill="currentColor" />
                                  <rect x="0" y="70" width="30" height="30" fill="currentColor" /><rect x="5" y="75" width="20" height="20" fill="white" /><rect x="10" y="80" width="10" height="10" fill="currentColor" />
                                  <rect x="40" y="10" width="10" height="25" fill="currentColor" /><rect x="50" y="5" width="10" height="10" fill="currentColor" />
                                  <rect x="45" y="45" width="15" height="15" fill="currentColor" /><rect x="15" y="45" width="15" height="15" fill="currentColor" />
                                  <rect x="70" y="45" width="20" height="15" fill="currentColor" /><rect x="45" y="75" width="15" height="15" fill="currentColor" /><rect x="75" y="75" width="15" height="15" fill="currentColor" />
                                </svg>
                              </div>
                              <span className="text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mt-2">{tkt.qrCode}</span>
                              <button onClick={() => triggerToast('Showing full-screen ticket for verification!')} className={`mt-1.5 text-[9px] font-bold ${theme.textAccent} hover:underline cursor-pointer`}>Show Full QR</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Application Stepper */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Application Pipeline</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {currentPersona.pendingApplications.map((app, i) => {
                          const stepIdx = getStepperIdx(app.status)
                          const steps = ['Applied', 'Under Review', 'Approved']
                          const isApproved = app.status.includes('Approved')
                          const isWaitlisted = app.status === 'Waitlisted'
                          const accentColor = isApproved ? '#10b981' : isWaitlisted ? '#94a3b8' : theme.accent
                          return (
                            <div key={i} className="rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm">
                              {/* Top row: name + status badge */}
                              <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
                                <div className="min-w-0">
                                  <div className="text-[11px] font-extrabold text-neutral-800 truncate">{app.name}</div>
                                  <div className="text-[9px] text-neutral-400 font-medium mt-0.5">{app.date.split(',')[0]}</div>
                                </div>
                                <span className={`shrink-0 text-[9px] font-extrabold px-2.5 py-1 rounded-full border
                                  ${isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isWaitlisted ? 'bg-neutral-100 text-neutral-500 border-neutral-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {isApproved ? '✓ Approved' : isWaitlisted ? 'Waitlisted' : 'Applied'}
                                </span>
                              </div>
                              {/* Progress track */}
                              <div className="px-4 pb-3">
                                <div className="flex items-center">
                                  {steps.map((step, j) => (
                                    <div key={j} className="flex items-center flex-1 last:flex-none">
                                      <div className="flex flex-col items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${j <= stepIdx ? 'scale-125' : 'bg-neutral-200'}`}
                                          style={j <= stepIdx ? { backgroundColor: accentColor } : {}} />
                                        <span className={`text-[8px] font-semibold whitespace-nowrap ${j <= stepIdx ? 'text-neutral-600' : 'text-neutral-300'}`}>{step}</span>
                                      </div>
                                      {j < steps.length - 1 && (
                                        <div className="flex-1 h-[1.5px] mx-1 mb-3 rounded-full overflow-hidden bg-neutral-100">
                                          <div className="h-full rounded-full transition-all duration-500"
                                            style={{ width: j < stepIdx ? '100%' : '0%', backgroundColor: accentColor }} />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Past Timeline (enhanced) */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Event History</h5>
                      <div className="relative border-l border-neutral-200 ml-2 pl-4 space-y-4">
                        {currentPersona.pastTimeline.map((past, i) => (
                          <div key={i} className="relative">
                            <span className={`absolute left-[-21px] top-3 w-2.5 h-2.5 rounded-full border-2 border-white ${theme.bgAccent} shadow-sm`} />
                            <div className="p-3.5 rounded-xl bg-neutral-50/60 border border-neutral-100 space-y-1.5">
                              <span className="text-[9px] font-bold text-neutral-400 block">{past.date}</span>
                              <div className="text-xs font-extrabold text-neutral-800">{past.name}</div>
                              <div className="flex items-center gap-2 text-[9.5px]">
                                <span className={`px-1.5 py-0.5 rounded font-bold ${theme.badgeBg}`}>{past.category}</span>
                                <span className="text-neutral-300">·</span>
                                <span className="flex items-center gap-1 text-blue-600 font-bold">
                                  <Users className="w-3 h-3" /> Met {past.friendsMet} connections
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Browse Mixers CTA */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${theme.badgeBg}`}>
                      <div>
                        <div className="text-xs font-extrabold text-neutral-800">Discover New Events</div>
                        <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Find events near {currentPersona.location.split(',')[0]}</div>
                      </div>
                      <button onClick={() => triggerToast('Opening Event Discovery Board...')}
                        className={`flex items-center gap-1.5 text-[10.5px] font-bold ${theme.bgAccent} text-white px-4 py-2 rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm shrink-0`}>
                        Explore Events <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                )}

                {/* ════════════════════ GALLERY TAB ════════════════════ */}
                {activeSidebarTab === 'moments' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Photo Stream */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">{activeMode === 'bff' ? 'Memory Gallery' : 'Photo Gallery'}</h5>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>{personaMoments.length} photos</span>
                      </div>
                      {personaMoments.length === 0 ? (
                        <div className="text-center py-10 text-neutral-400 text-xs font-bold">No photos yet — add to your gallery below!</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {personaMoments.map((mom, i) => (
                            <div key={i}
                              onClick={() => setLightboxMoment({ ...mom, idx: i })}
                              className="relative aspect-video rounded-2xl overflow-hidden border border-neutral-200 group shadow-sm bg-neutral-900 cursor-zoom-in">
                              {mom.imageUrl ? (
                                <img src={mom.imageUrl} alt={mom.caption} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className={`absolute inset-0 bg-gradient-to-br ${mom.imageColor} opacity-90 group-hover:scale-105 transition-transform duration-500 flex flex-col justify-center items-center`}>
                                  <svg className="w-7 h-7 opacity-25" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                  </svg>
                                  <span className="text-[8.5px] font-bold tracking-wider uppercase mt-1 text-white/40">{mom.date}</span>
                                </div>
                              )}
                              <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md text-white text-[8px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 border border-white/10 z-10">
                                <MapPin className="w-2.5 h-2.5" />{mom.location}
                              </div>
                              <div className="absolute top-2 right-2 w-5 h-5 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-10">
                                <ZoomIn className="w-3 h-3 text-white" />
                              </div>
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300 z-10">
                                <p className="text-white text-[9.5px] font-semibold leading-snug drop-shadow-sm line-clamp-2">{mom.caption}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Upload Zone (enhanced) */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Add to Gallery</h5>
                      <div
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 relative ${dragActive ? 'bg-neutral-50/60' : 'border-neutral-200 bg-neutral-50/30 hover:border-neutral-300 hover:bg-neutral-50/50'}`}
                        style={dragActive ? { borderColor: theme.accent } : {}}
                        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                      >
                        <input type="file" id="moment-file-upload" className="hidden" accept="image/*" onChange={handleFileChange} onClick={(e) => { (e.currentTarget as HTMLInputElement).value = '' }} disabled={uploading} />
                        <label htmlFor="moment-file-upload" className="cursor-pointer block space-y-2.5">
                          {uploading ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-bold text-neutral-600">Uploading moment image...</span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
                                <div className={`h-full ${theme.bgAccent} rounded-full transition-all duration-150`} style={{ width: `${uploadProgress}%` }} />
                              </div>
                              <span className="text-[9px] text-neutral-400 block font-bold">{uploadProgress}% uploaded</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.badgeBg} transition-transform ${dragActive ? 'animate-bounce scale-110' : ''}`}>
                                  <Upload className="w-5 h-5" />
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-neutral-700">Drag & drop hangout photos here</div>
                                <div className="text-[9.5px] text-neutral-400">or click to browse from device (max 5MB)</div>
                              </div>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                  </div>
                )}

                {/* ════════════════════ SECURITY TAB ════════════════════ */}
                {activeSidebarTab === 'security' && (
                  <div className="space-y-5 animate-fade-in">

                    {/* Account Info */}
                    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
                      <div className={`px-4 py-3 border-b border-neutral-100 ${theme.panelHeader} flex items-center gap-2`}>
                        <User className={`w-3.5 h-3.5 ${theme.textAccent}`} />
                        <span className="text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider">Account Info</span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Username</div>
                            <div className="text-sm font-bold text-neutral-800">@{currentPersona.name.toLowerCase().replace(' ', '_')}</div>
                          </div>
                          <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
                        </div>
                        <hr className="border-neutral-100" />
                        <div>
                          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Email</div>
                          <div className="text-sm font-bold text-neutral-800">{currentPersona.name.toLowerCase().replace(' ', '.')}@vayo.community</div>
                        </div>
                        <hr className="border-neutral-100" />
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Member Since</div>
                            <div className="text-sm font-bold text-neutral-800">January 2024</div>
                          </div>
                          <div className="flex items-center gap-1 text-[9.5px] font-bold text-neutral-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />Verified
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Change Password */}
                    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
                      <div className={`px-4 py-3 border-b border-neutral-100 ${theme.panelHeader} flex items-center gap-2`}>
                        <Lock className={`w-3.5 h-3.5 ${theme.textAccent}`} />
                        <span className="text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider">Change Password</span>
                      </div>
                      <div className="p-4 space-y-3">
                        {(['current', 'next', 'confirm'] as const).map(field => {
                          const labels = { current: 'Current Password', next: 'New Password', confirm: 'Confirm New Password' }
                          return (
                            <div key={field}>
                              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">{labels[field]}</label>
                              <div className="relative">
                                <input
                                  type={showPwd[field] ? 'text' : 'password'}
                                  value={pwdForm[field]}
                                  onChange={e => setPwdForm(prev => ({ ...prev, [field]: e.target.value }))}
                                  placeholder="••••••••"
                                  className={`w-full text-sm border rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 bg-white ${theme.cardBorder}`}
                                />
                                <button type="button" onClick={() => setShowPwd(prev => ({ ...prev, [field]: !prev[field] }))}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                                  {showPwd[field] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                        {pwdForm.next && pwdForm.confirm && pwdForm.next !== pwdForm.confirm && (
                          <p className="text-[10.5px] text-red-500 font-semibold">Passwords do not match</p>
                        )}
                        <button
                          onClick={() => {
                            if (!pwdForm.current || !pwdForm.next || pwdForm.next !== pwdForm.confirm) return
                            setPwdForm({ current: '', next: '', confirm: '' })
                            triggerToast('Password updated successfully!')
                          }}
                          disabled={!pwdForm.current || !pwdForm.next || pwdForm.next !== pwdForm.confirm}
                          className="w-full py-2.5 rounded-xl text-xs font-extrabold text-white disabled:opacity-40 cursor-pointer mt-1"
                          style={{ background: theme.accent }}>
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
                      <div className={`px-4 py-3 border-b border-neutral-100 ${theme.panelHeader} flex items-center gap-2`}>
                        <ShieldCheck className={`w-3.5 h-3.5 ${theme.textAccent}`} />
                        <span className="text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider">Security Settings</span>
                      </div>
                      <div className="divide-y divide-neutral-100">
                        {[
                          { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', enabled: false },
                          { label: 'Login Notifications', desc: 'Get notified whenever a new sign-in occurs', enabled: true },
                          { label: 'Remember Trusted Devices', desc: 'Stay logged in for 30 days on this device', enabled: true },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3.5">
                            <div className="flex-1 mr-4">
                              <div className="text-[11.5px] font-bold text-neutral-700">{item.label}</div>
                              <div className="text-[9.5px] text-neutral-400 font-medium mt-0.5">{item.desc}</div>
                            </div>
                            <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-not-allowed ${item.enabled ? theme.bgAccent : 'bg-neutral-200'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-2xl border border-red-100 bg-white shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-red-100 bg-red-50/50 flex items-center gap-2">
                        <X className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[11px] font-extrabold text-red-500 uppercase tracking-wider">Danger Zone</span>
                      </div>
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[11.5px] font-bold text-neutral-700">Deactivate Account</div>
                          <div className="text-[9.5px] text-neutral-400 font-medium mt-0.5">Temporarily hide your profile from the community</div>
                        </div>
                        <button
                          onClick={() => triggerToast('Account deactivation is disabled in demo mode')}
                          className="shrink-0 text-[10px] font-bold px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                          Deactivate
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </main>

          </div>
        </div>

        <div className="border-t border-white/30 w-full pt-4 mb-16" />

      </div>
    </div>
  )
}

export default App
