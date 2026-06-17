"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });
import { QRCodeSVG } from 'qrcode.react';
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
  Check,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

const maximPersona = "/assets/maxim_persona.png";
const sarahPersona = "/assets/sarah_persona.png";
const danielPersona = "/assets/daniel_persona.png";
const elenaPersona = "/assets/elena_persona.png";
const vayoLogo = "/assets/vayo-logo.png";
const newBg = "/assets/new_bg.jpg";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

const staticEvents = [
  {
    id: 1,
    title: '"Siempre Son Flores" Musica Cubana Salsa Jazz',
    date: '24, Jan - 2024',
    location: '135 W, 42nd Street, New York',
    image: '/assets/events/something.jpg'
  },
  {
    id: 2,
    title: 'Vayo Beats Holi Colors Festival',
    date: '15, Mar - 2024',
    location: 'Vayo Offline Hub, Bangalore',
    image: '/assets/events/holi.jpg'
  },
  {
    id: 3,
    title: 'Cozy Cafe Board Games Social',
    date: '02, Apr - 2024',
    location: 'The Cozy Cafe, Bangalore',
    image: '/assets/events/cards.jpg'
  }
];

const basePersonas = [
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
      { name: "Cozy Coding & Coffee", date: "June 05, 6:00 PM", countdown: "3 days left", locationPin: "Third Wave Coffee, Koramangala", organizer: "Vikas (Host)", qrCode: "VAYO-TKT-MAX05", lat: 12.9343, lng: 77.6210 }
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
      { name: "Pottery & Mocktails", date: "June 06, 4:00 PM", countdown: "4 days left", locationPin: "Clay Station, HSR Layout", organizer: "Ritu (Host)", qrCode: "VAYO-TKT-SAR06", lat: 12.9100, lng: 77.6380 }
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
      { name: "Beer & Trivia Night", date: "June 09, 8:30 PM", countdown: "7 days left", locationPin: "Toit Brewery, Indiranagar", organizer: "Rohan (Trivia Master)", qrCode: "VAYO-TKT-DAN09", lat: 12.9791, lng: 77.6406 }
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
      { name: "Modern Art Gallery Tour", date: "June 07, 11:00 AM", countdown: "5 days left", locationPin: "NGMA, Palace Road", organizer: "Meera (Art Historian)", qrCode: "VAYO-TKT-ELE07", lat: 12.9904, lng: 77.5885 }
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
];

// Helper to make custom persona mapping
const makeUserPersona = (user, fastApiProfile = null) => {
  let age = 25;
  if (user.birthdate) {
    const today = new Date();
    const birthDate = new Date(user.birthdate);
    age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  const interests = fastApiProfile && Array.isArray(fastApiProfile.interest_tags)
    ? fastApiProfile.interest_tags
    : (Array.isArray(user.interests) ? user.interests : []);
  const tags = interests.map(item => `#${item.replace(/\s+/g, '')}`);
  const socialTags = tags.length > 0 ? tags : ['#Social', '#Explore', '#Vayo'];
  const bffTags = tags.length > 0 ? tags : ['#Hobbies', '#Squad', '#Meetups'];
  const bizzTags = tags.length > 0 ? tags : ['#Networking', '#Founder', '#Collaborate'];

  return {
    id: 'user-profile',
    name: user.name || (fastApiProfile && fastApiProfile.username) || 'Vayo Member',
    age: age,
    role: (fastApiProfile && fastApiProfile.bizz_role) || 'Vayo Member',
    image: user.selfie_url || '/assets/sarah_persona.png',
    motivations: [
      'Meet like-minded people through real-life activities',
      'Discover curated local mixers in Bangalore',
      'Enjoy safe, verified, and platonic-first community spaces'
    ],
    painPoints: [
      'Exhausted from meaningless swiping on social apps',
      'Hard to coordinate details for group get-togethers',
      'Concerned about safety and verification at offline gatherings'
    ],
    userNeeds: [
      'Pre-vetted attendee list and activity prompts',
      'Seamless event ticketing and countdown alerts',
      'A dashboard to track personal reputation (Karma points)'
    ],
    metrics: [
      {
        stat: '100%',
        percentage: 100,
        description: 'Vayo verification status complete with selfie authentication check',
        color: 'blue'
      }
    ],
    location: (fastApiProfile && fastApiProfile.city) || user.city || "Bangalore, India",
    selfieVerified: fastApiProfile ? !!fastApiProfile.selfie_verified : true,
    bizzVerified: fastApiProfile ? !!fastApiProfile.bizz_verified : !!user.instagram,
    socialTags,
    bffTags,
    bizzTags,
    socialBio: user.bio || (fastApiProfile && (fastApiProfile.social_bio || fastApiProfile.bio)) || `Hey, I'm ${user.name || 'Vayo Member'}! Excited to join the Vayo community and meet up.`,
    bffBio: (fastApiProfile && fastApiProfile.bff_bio) || `Looking to form a new squad or connect for weekend activities.`,
    bizzBio: (fastApiProfile && fastApiProfile.bizz_bio) || `Professional details. Hit me up for discussions on shared interests or collaborations.`,
    bizzRole: (fastApiProfile && fastApiProfile.bizz_role) || "Vayo Builder",
    bizzCompany: (fastApiProfile && fastApiProfile.bizz_company) || "Community Member",
    karmaBalance: (fastApiProfile && fastApiProfile.karma_score) ?? 350,
    karmaTier: fastApiProfile && fastApiProfile.tier_level === 4 ? "Conqueror" : fastApiProfile && fastApiProfile.tier_level === 3 ? "Explorer" : fastApiProfile && fastApiProfile.tier_level === 2 ? "Pathfinder" : "Beginner",
    karmaPercentage: (fastApiProfile && fastApiProfile.karma_score) ? Math.min(100, Math.round((fastApiProfile.karma_score / 1000) * 100)) : 60,
    karmaBreakdown: {
      attendedMixers: 150,
      momentContributor: 80,
      vibeLeader: 70,
      hostSupport: 50
    },
    pendingApplications: [
      { 
        name: "Membership Onboarding", 
        date: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : "Joined Today", 
        status: (user.status === "Joined" || user.status === "Approved" || user.status === "Sent") ? "Approved" : "Under Review"
      }
    ],
    activeTickets: [],
    pastTimeline: [],
    bffCrew: [
      { name: "Vayo Explorers Crew", members: 124, type: "Community Group", emoji: "🌐", lastActive: "1 day ago", nextEvent: "Soon" }
    ],
    connectionsMet: [
      { name: "Sarah", role: "Product Designer", mutualFriends: 1, avatar: "/assets/sarah_persona.png", metAt: "Vayo Hub" },
      { name: "Aditya", role: "Software Developer", mutualFriends: 2, avatar: "/assets/maxim_persona.png", metAt: "Vayo Hub" }
    ],
    suggestedConnections: [
      { name: "Sarah", role: "Product Designer", mutualFriends: 1, avatar: "/assets/sarah_persona.png", reason: "Waitlist member" },
      { name: "Aditya", role: "Software Developer", mutualFriends: 2, avatar: "/assets/maxim_persona.png", reason: "Waitlist member" }
    ],
    moments: [
      { location: "Vayo Indiranagar", date: "Just now", imageColor: "from-sky-400 to-blue-500", caption: "Joined VAYO Commune waitlist! 🎉" }
    ],
    socialLinks: {
      instagram: user.instagram || '',
      linkedin: '',
      twitter: '',
      github: ''
    },
    bizzSkills: (fastApiProfile && fastApiProfile.bizz_skills) || ['Onboarding', 'Community Build'],
    referral: { code: 'VAYO-WAIT-LIST', referredCount: 0, xpEarned: 0, milestone: 5 }
  };
};


function SegmentedProgress({ percentage, color, showMilestones = false }) {
  const totalSegments = 20;
  const activeSegments = Math.round((percentage / 100) * totalSegments);
  return (
    <div className="w-full">
      <div className="flex gap-[3.5px] items-end h-[16px] w-full my-3">
        {Array.from({ length: totalSegments }).map((_, i) => {
          const isActive = i < activeSegments;
          let activeBg = '', inactiveBg = '';
          if (color === 'blue') { activeBg = 'bg-[#0ea5e9]'; inactiveBg = 'bg-[#f0f9ff]' }
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

// Live Countdown Hook
function useCountdown(dateStr) {
  const [timeLeft, setTimeLeft] = useState('Soon');
  useEffect(() => {
    let target;
    try {
      // Try parsing directly first
      target = new Date(dateStr);
      
      // If invalid (likely missing year), attempt custom parse
      if (isNaN(target.getTime())) {
        const parts = dateStr.split(',').map(s => s.trim());
        const currentYear = new Date().getFullYear();
        // Assuming parts[0] is Month Day and parts[1] is Time
        target = new Date(`${parts[0]} ${currentYear} ${parts[1] || ''}`);
      }

      // If still invalid, try to handle other formats like "24, Jan - 2024"
      if (isNaN(target.getTime())) {
        const cleaned = dateStr.replace(/-/g, ' ').replace(/,/g, ' ');
        target = new Date(cleaned);
      }

      if (isNaN(target.getTime())) return;
    } catch {
      return;
    }
    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Starting now!'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [dateStr]);
  return timeLeft;
}

// Ticket countdown component (each ticket needs its own hook instance)
function TicketCountdown({ date }) {
  const t = useCountdown(date);
  return (
    <span className="inline-flex items-center gap-1.5 text-[9.5px] font-bold px-2.5 py-1 rounded-lg bg-neutral-900 text-emerald-400 font-mono tabular-nums">
      <Clock className="w-2.5 h-2.5" />
      {t}
    </span>
  );
}

// Helper functions
const getBadgeLockProgress = (personaId, badgeName) => {
  const map = {
    maxim: { 'Social Catalyst': 65, 'Vayo Pathfinder': 60, 'Mega Mixer Hero': 20 },
    sarah: { 'Super Connector': 40, 'Community Host': 30, 'Karma Master': 85 },
    daniel: { 'Cozy Host': 10, 'Global Voyager': 29 },
    elena: { 'Quiet Hub Host': 45, 'Profile Guardian': 30 }
  };
  return map[personaId]?.[badgeName] ?? 25;
};

const getNextTierInfo = (tier, balance) => {
  if (tier === 'Explorer') return { nextTier: 'Pathfinder', needed: Math.max(0, 300 - balance), icon: '🧭', perks: ['Priority ticket booking', 'Host support badge', 'Special venue perks'] };
  if (tier === 'Pathfinder') return { nextTier: 'Voyager', needed: Math.max(0, 600 - balance), icon: '🚀', perks: ['VIP mixer access', 'Private dining', 'Community voting rights'] };
  return { nextTier: 'Legend', needed: Math.max(0, 1000 - balance), icon: '🌟', perks: ['Founding member badge', 'Free event hosting', 'National hub access'] };
};

const getTierIcon = (tier) => ({ Explorer: '🔭', Pathfinder: '🧭', Voyager: '🚀' }[tier] ?? '🌟');

const getStepperIdx = (status) => {
  const s = (status || "").toLowerCase();
  if (s === 'joined' || s === 'approved' || s === 'sent') return 2;
  if (s === 'waitlisted') return 1;
  return 0; // Applied / Under Review
};

function ProfileContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [personas, setPersonas] = useState(basePersonas);
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeMode, setActiveMode] = useState('social');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [customMoments, setCustomMoments] = useState({});
  const [showToast, setShowToast] = useState(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState('profile');
  const [lightboxMoment, setLightboxMoment] = useState(null);
  const [deletedMomentIdxs, setDeletedMomentIdxs] = useState({});
  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({ bio: '', instagram: '', linkedin: '', twitter: '', github: '', bizzSkills: [], newSkill: '' });
  const [personaOverrides, setPersonaOverrides] = useState({});
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);
  const [userTickets, setUserTickets] = useState([]);
  const [isMomentsLoading, setIsMomentsLoading] = useState(false);
  const [dbMoments, setDbMoments] = useState([]);

  const fetchUserTickets = async (email) => {
    if (!email) return;
    setIsTicketsLoading(true);
    try {
      const res = await fetch(`/api/rsvp?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setUserTickets(data.rsvps || []);
        
        // Update persona state to show these tickets
        setPersonaOverrides(prev => ({
          ...prev,
          [currentPersona.id]: {
            ...prev[currentPersona.id],
            activeTickets: (data.rsvps || []).map(t => ({
              id: t.event_id,
              name: t.event_title,
              date: t.event_date,
              locationPin: t.event_location,
              organizer: "VAYO Host",
              qrCode: `VAYO-TKT-${t.event_id.toString().slice(-4).toUpperCase()}`,
              lat: t.lat,
              lng: t.lng
            }))
          }
        }));
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setIsTicketsLoading(false);
    }
  };

  const fetchUserMoments = async (email) => {
    if (!email) return;
    setIsMomentsLoading(true);
    try {
      const res = await fetch(`/api/moments?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setDbMoments(data.moments || []);
      }
    } catch (err) {
      console.error("Error fetching moments:", err);
    } finally {
      setIsMomentsLoading(false);
    }
  };

  const currentPersona = personas[activeIdx] || basePersonas[0];
  const _ov = personaOverrides[currentPersona.id];
  const displayPersona = _ov ? {
    ...currentPersona,
    ...(_ov.socialBio !== undefined && { socialBio: _ov.socialBio }),
    ...(_ov.bffBio !== undefined && { bffBio: _ov.bffBio }),
    ...(_ov.bizzBio !== undefined && { bizzBio: _ov.bizzBio }),
    socialLinks: { ...currentPersona.socialLinks, ..._ov.socialLinks },
    bizzSkills: _ov.bizzSkills ?? currentPersona.bizzSkills,
    activeTickets: _ov.activeTickets ?? currentPersona.activeTickets,
    pendingApplications: _ov.pendingApplications ?? currentPersona.pendingApplications
  } : currentPersona;

  const allMoments = displayPersona.id === 'user-profile' 
    ? dbMoments 
    : [...(customMoments[displayPersona.id] || []), ...(displayPersona.moments || [])];
  
  const personaMoments = allMoments.filter((_, i) => !(deletedMomentIdxs[displayPersona.id] || []).includes(i));

  const completenessItems = [
    { label: 'Profile photo', done: true },
    { label: 'Selfie verified', done: currentPersona.selfieVerified },
    { label: 'Bio written', done: !!(activeMode === 'social' ? currentPersona.socialBio : activeMode === 'bff' ? currentPersona.bffBio : currentPersona.bizzBio) },
    { label: 'Tags added', done: currentPersona.socialTags.length > 0 },
    { label: 'Location set', done: !!currentPersona.location },
    { label: 'Moments shared', done: personaMoments.length > 0 },
    { label: 'Social links', done: Object.keys(currentPersona.socialLinks || {}).length > 0 },
  ];
  const completenessScore = Math.round((completenessItems.filter(i => i.done).length / completenessItems.length) * 100);

  const formatTimeAgo = (dateStr) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const displayNotifications = currentPersona.id === 'user-profile'
    ? liveNotifications.map(n => {
        let icon = '🔔';
        if (n.type === 'MESSAGE_RECEIVED') icon = '💬';
        else if (n.type === 'EVENT_MATCH') icon = '📅';
        else if (n.type === 'EVENT_REMINDER') icon = '⏰';

        return {
          id: n.id,
          icon,
          msg: n.body || n.title,
          time: formatTimeAgo(n.created_at),
          unread: !n.is_read,
          type: n.type,
          reference_id: n.reference_id,
          actor_id: n.actor_id
        };
      })
    : (activeMode === 'bff' ? [
        { id: 1, icon: '💚', msg: `Your BFF profile is now live!`, time: '1h ago', unread: true },
        { id: 2, icon: '📸', msg: `New memory added to your shared gallery from last weekend`, time: '4h ago', unread: true },
        { id: 4, icon: '👋', msg: `Someone viewed your BFF profile`, time: '2d ago', unread: false },
      ] : activeMode === 'bizz' ? [
        { id: 2, icon: '⚡', msg: `Your Bizz profile got 8 new views this week`, time: '6h ago', unread: true },
        { id: 4, icon: '📅', msg: `${currentPersona.activeTickets[0]?.name ?? 'An upcoming event'} is relevant to your skills`, time: '2d ago', unread: false },
      ] : [
        { id: 3, icon: '📅', msg: `Reminder: ${currentPersona.activeTickets[0]?.name ?? 'Your next event'} is coming up soon`, time: '1d ago', unread: false },
        { id: 4, icon: '👋', msg: `Someone viewed your profile`, time: '2d ago', unread: false },
      ]);

  const unreadCount = displayNotifications.filter(n => n.unread).length;

  const handleRSVP = async (event) => {
    if (!event) return;
    
    const sessionEmail = localStorage.getItem("vayo_user_email");
    const email = emailParam || sessionEmail;
    
    if (!email) {
      triggerToast('Please log in to RSVP.');
      return;
    }

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location
        })
      });

      if (response.ok) {
        triggerToast('Registration confirmed! Check your tickets.');
        setSelectedEvent(null);
        // Refresh tickets
        fetchUserTickets(email);
      } else {
        const data = await response.json();
        triggerToast(data.error || 'RSVP failed. Try again.');
      }
    } catch (err) {
      console.error("RSVP Error:", err);
      triggerToast('Network error during RSVP.');
    }
  };

  const handleCancelRSVP = async (eventId) => {
    const sessionEmail = localStorage.getItem("vayo_user_email");
    const email = emailParam || sessionEmail;

    if (!email || !eventId) return;

    try {
      const response = await fetch(`/api/rsvp?email=${encodeURIComponent(email)}&eventId=${encodeURIComponent(eventId)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        triggerToast("RSVP cancelled successfully.");
        // Refresh the tickets list
        fetchUserTickets(email);
      } else {
        const data = await response.json();
        triggerToast(data.error || "Failed to cancel RSVP.");
      }
    } catch (err) {
      console.error("Error cancelling RSVP:", err);
      triggerToast("Network error while cancelling RSVP.");
    }
  };

  const handleUpdatePassword = async () => {
    if (!pwdForm.current || !pwdForm.next || pwdForm.next !== pwdForm.confirm) return;
    
    const sessionEmail = localStorage.getItem("vayo_user_email");
    const email = emailParam || sessionEmail;
    
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          currentPassword: pwdForm.current,
          newPassword: pwdForm.next
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPwdForm({ current: '', next: '', confirm: '' });
        setShowChangePwd(false);
        triggerToast('Password updated successfully!');
      } else {
        triggerToast(data.error || 'Failed to update password.');
      }
    } catch (err) {
      console.error("Error updating password:", err);
      triggerToast('Network error while updating password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vayo_user_email");
    localStorage.removeItem("vayo_jwt_token");
    triggerToast("Logging out...");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  // Close lightbox on ESC
  const getAvatarByEmail = (email) => {
    if (email === "sarah@vayo.com") return "/assets/sarah_persona.png";
    if (email === "elena@vayo.com") return "/assets/elena_persona.png";
    if (email === "david@vayo.com" || email === "daniel@vayo.com") return "/assets/daniel_persona.png";
    if (email === "alex@vayo.com" || email === "maxim@vayo.com") return "/assets/maxim_persona.png";
    if (email === "riya@vayo.com") return "https://picsum.photos/seed/sc4/100/100";
    return "/assets/sarah_persona.png";
  };

  const fetchNotifications = async () => {
    const sessionEmail = localStorage.getItem("vayo_user_email");
    const email = emailParam || sessionEmail;
    const token = localStorage.getItem("vayo_jwt_token");
    if (!email || !token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/notifications/${encodeURIComponent(email)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLiveNotifications(data.notifications || []);
      }
    } catch (err) {
      console.warn("Failed to fetch live notifications:", err);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    const token = localStorage.getItem("vayo_jwt_token");
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/notifications/${encodeURIComponent(notificationId)}/read`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    const sessionEmail = localStorage.getItem("vayo_user_email");
    const email = emailParam || sessionEmail;
    const token = localStorage.getItem("vayo_jwt_token");
    if (!email || !token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/notifications/user/${encodeURIComponent(email)}/read-all`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
        triggerToast("All notifications marked as read.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isUserLoaded) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [isUserLoaded]);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setLightboxMoment(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const startEdit = () => {
    const ov = personaOverrides[currentPersona.id];
    const bio = activeMode === 'social' ? (ov?.socialBio ?? currentPersona.socialBio)
      : activeMode === 'bff' ? (ov?.bffBio ?? currentPersona.bffBio)
        : (ov?.bizzBio ?? currentPersona.bizzBio);
    const links = { ...currentPersona.socialLinks, ...ov?.socialLinks };
    setEditDraft({
      bio,
      instagram: links.instagram ?? '',
      linkedin: links.linkedin ?? '',
      twitter: links.twitter ?? '',
      github: links.github ?? '',
      bizzSkills: [...(ov?.bizzSkills ?? currentPersona.bizzSkills ?? [])],
      bizzRole: ov?.bizzRole ?? currentPersona.bizzRole ?? '',
      bizzCompany: ov?.bizzCompany ?? currentPersona.bizzCompany ?? '',
      newSkill: ''
    });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    const sessionEmail = localStorage.getItem("vayo_user_email");
    const email = emailParam || sessionEmail;

    const bioKey = activeMode === 'social' ? 'socialBio' : activeMode === 'bff' ? 'bffBio' : 'bizzBio';
    
    // 1. Update local state for immediate feedback
    setPersonaOverrides(prev => ({
      ...prev,
      [currentPersona.id]: {
        ...prev[currentPersona.id],
        [bioKey]: editDraft.bio,
        socialLinks: {
          instagram: editDraft.instagram || undefined,
          linkedin: editDraft.linkedin || undefined,
          twitter: editDraft.twitter || undefined,
          github: editDraft.github || undefined
        },
        bizzSkills: editDraft.bizzSkills,
        bizzRole: editDraft.bizzRole,
        bizzCompany: editDraft.bizzCompany
      }
    }));

    // 2. Persist to Supabase via our new API
    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          bio: editDraft.bio,
          instagram: editDraft.instagram,
          linkedin: editDraft.linkedin,
          twitter: editDraft.twitter,
          github: editDraft.github,
          bizzSkills: editDraft.bizzSkills,
          bizzRole: editDraft.bizzRole,
          bizzCompany: editDraft.bizzCompany
        })
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Supabase Update Error:", err);
      }
    } catch (err) {
      console.error("Network error while updating profile:", err);
    }

    // 3. Keep legacy FastAPI calls as fallback (if any)
    const token = localStorage.getItem("vayo_jwt_token");
    if (token) {
      try {
        await fetch(`${BACKEND_URL}/api/v1/users/me/bio/${activeMode}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ bio: editDraft.bio })
        });
      } catch (err) {
        console.warn("FastAPI backend is offline. skipping FastAPI update.");
      }
    }

    setIsEditing(false);
    triggerToast('Profile updated!');
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleMomentUpload = async (fileName) => {
    const sessionEmail = localStorage.getItem("vayo_user_email");
    const email = emailParam || sessionEmail;
    if (!email) return;

    if (uploading) return;
    setUploading(true); setUploadProgress(0);

    // Simulate progress while saving to DB
    const interval = setInterval(() => {
      setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
    }, 100);

    try {
      // 1. Prepare new moment (Using picsum for now since no storage bucket)
      const randomId = Math.floor(Math.random() * 1000);
      const newMoment = {
        email: email,
        imageUrl: `https://picsum.photos/seed/vayo-${randomId}/800/500`,
        caption: `Memories from ${fileName.split('.')[0]} \ud83d\udcf8`,
        location: currentPersona.location.split(',')[0],
        imageColor: getRandomGradient()
      };

      // 2. Save to Supabase
      const response = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMoment)
      });

      if (response.ok) {
        setUploadProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          fetchUserMoments(email); // Refresh the grid
          triggerToast('Moment saved to your profile!');
        }, 500);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setUploading(false);
      clearInterval(interval);
      triggerToast('Upload failed.');
    }
  };

  const handleMomentDelete = async (momentId) => {
    const sessionEmail = localStorage.getItem("vayo_user_email");
    const email = emailParam || sessionEmail;
    if (!email || !momentId) return;

    try {
      const response = await fetch(`/api/moments?id=${encodeURIComponent(momentId)}&email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        triggerToast("Memory removed.");
        fetchUserMoments(email);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleMomentUpload(e.dataTransfer.files[0].name);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) handleMomentUpload(e.target.files[0].name);
  };

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const getRandomGradient = () => {
    const g = ['from-violet-500 to-purple-600', 'from-amber-400 to-orange-500', 'from-teal-400 to-emerald-600', 'from-pink-500 to-rose-600', 'from-sky-400 to-blue-500'];
    return g[Math.floor(Math.random() * g.length)];
  };

  const modeColors = {
    social: {
      accent: '#0ea5e9', bgAccent: 'bg-[#0ea5e9]', textAccent: 'text-[#0ea5e9]',
      borderAccent: 'border-sky-500/40', ringAccent: 'ring-[#0ea5e9]/20',
      gradient: 'from-sky-500 to-sky-700',
      badgeBg: 'bg-sky-500/10 text-sky-800 border-sky-500/20 backdrop-blur-sm',
      tabActive: 'bg-[#0ea5e9] text-white shadow-sm', tabInactive: 'text-sky-800 hover:bg-sky-500/10',
      progressColor: 'blue', hoverBg: 'hover:bg-sky-500/10',
      cardBg: 'bg-sky-50/50', cardBorder: 'border-sky-100', panelHeader: 'bg-sky-50/40'
    },
    bff: {
      accent: '#84cc16', bgAccent: 'bg-[#84cc16]', textAccent: 'text-[#84cc16]',
      borderAccent: 'border-lime-500/40', ringAccent: 'ring-[#84cc16]/20',
      gradient: 'from-lime-500 to-green-600',
      badgeBg: 'bg-lime-500/10 text-lime-800 border-lime-500/20 backdrop-blur-sm',
      tabActive: 'bg-[#84cc16] text-white shadow-sm', tabInactive: 'text-lime-850 hover:bg-lime-500/10',
      progressColor: 'green', hoverBg: 'hover:bg-lime-500/10',
      cardBg: 'bg-lime-50/50', cardBorder: 'border-lime-100', panelHeader: 'bg-lime-50/40'
    },
    bizz: {
      accent: '#0d9488', bgAccent: 'bg-[#0d9488]', textAccent: 'text-[#0d9488]',
      borderAccent: 'border-teal-500/40', ringAccent: 'ring-[#0d9488]/20',
      gradient: 'from-teal-600 to-emerald-700',
      badgeBg: 'bg-teal-500/10 text-teal-800 border-teal-500/20 backdrop-blur-sm',
      tabActive: 'bg-[#0d9488] text-white shadow-sm', tabInactive: 'text-teal-850 hover:bg-teal-500/10',
      progressColor: 'teal', hoverBg: 'hover:bg-teal-500/10',
      cardBg: 'bg-teal-50/50', cardBorder: 'border-teal-100', panelHeader: 'bg-teal-50/40'
    }
  };

  const getBadgesForPersona = (personaId) => {
    switch (personaId) {
      case 'user-profile':
        return [
          { name: 'Selfie Verified', desc: 'Successfully verified by Vayo safety team', icon: '🛡️', status: 'unlocked' },
          { name: 'Launch Pioneer', desc: 'Joined during pre-launch access window', icon: '✨', status: 'unlocked' },
          { name: 'First Mixer RSVP', desc: 'Complete registration onboarding', icon: '🎟️', status: 'unlocked' },
          { name: 'Social Catalyst', desc: 'Contribute +100 vibe points', icon: '⚡', status: 'locked' },
          { name: 'Vayo Pathfinder', desc: 'Reach Pathfinder level status', icon: '👑', status: 'locked' },
          { name: 'Community Host', desc: 'Support hosting a neighborhood meet', icon: '🏠', status: 'locked' }
        ];
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      const sessionEmail = localStorage.getItem("vayo_user_email");
      if (sessionEmail) {
        setIsLoadingUser(true);
      }
      setIsMounted(true);

      // Security check: Deny direct URL traversal to other accounts
      if (emailParam && emailParam.includes("@") && sessionEmail !== emailParam) {
        alert("Unauthorized profile access. Please log in first.");
        window.location.href = "/";
        return;
      }

      const email = emailParam || sessionEmail;
      if (!email) {
        setIsUserLoaded(false);
        return;
      }

      setIsLoadingUser(true);
      try {
        const res = await fetch(`/api/check-status?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "approved" && data.user) {
            
            // Attempt to load user profile from FastAPI backend
            const token = localStorage.getItem("vayo_jwt_token");
            let fastApiProfile = null;
            if (token) {
              try {
                const fastApiRes = await fetch(`${BACKEND_URL}/api/v1/users/${encodeURIComponent(data.user.email)}/profile`, {
                  headers: {
                    "Authorization": `Bearer ${token}`
                  }
                });
                if (fastApiRes.ok) {
                  fastApiProfile = await fastApiRes.json();
                }
              } catch (err) {
                console.warn("FastAPI backend is offline or unreachable. Using Supabase fallback.", err);
              }
            }

            const userPersonaObj = makeUserPersona(data.user, fastApiProfile);
            setPersonas([userPersonaObj, ...basePersonas]);
            
            setActiveIdx(0);
            setIsUserLoaded(true);
            fetchUserTickets(sessionEmail);
            fetchUserMoments(sessionEmail);
            triggerToast(`Logged in as ${data.user.name || 'Vayo Member'}`);
          } else {
            setIsUserLoaded(false);
          }
        } else {
          setIsUserLoaded(false);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        setIsUserLoaded(false);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, [emailParam]);

  const fetchEvents = async () => {
    setIsEventsLoading(true);
    try {
      // 1. Try unified Next.js API first (Supabase / Local persistent file)
      const sbRes = await fetch("/api/events");
      if (sbRes.ok) {
        const data = await sbRes.json();
        if (data.events && Array.isArray(data.events)) {
          setUpcomingEvents(formatEventData(data.events));
          setIsEventsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log("Supabase fetch failed, trying local Python backend...");
    }

    try {
      // 2. Fallback to local Python backend (if running)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const localRes = await fetch(`${BACKEND_URL}/api/v1/events?limit=20`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (localRes.ok) {
        const data = await localRes.json();
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          setUpcomingEvents(formatEventData(data.events));
          setIsEventsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Local backend offline, showing demo events.");
      setUpcomingEvents(staticEvents);
      setIsEventsLoading(false);
      return;
    }

    setIsEventsLoading(false);
  };

  const formatEventData = (events) => {
    return events.map((evt) => {
      let formattedDate = evt.event_date;
      try {
        const d = new Date(evt.event_date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        formattedDate = `${d.getDate()}, ${months[d.getMonth()]} - ${d.getFullYear()}`;
      } catch (_) {}

      return {
        id: evt.event_id || evt.id,
        title: evt.title,
        date: formattedDate,
        location: evt.venue ? `${evt.venue}, ${evt.city}` : (evt.location || evt.city || 'Bangalore'),
        image: evt.cover_image_url || evt.image || '/assets/events/something.jpg',
        min_karma_required: evt.min_karma_required || 0,
        entry_fee: evt.entry_fee || 0,
        category: evt.category || 'social',
        max_participants: evt.max_participants || 0
      };
    });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (currentPersona && currentPersona.id === 'user-profile') {
      const sessionEmail = localStorage.getItem("vayo_user_email");
      const email = emailParam || sessionEmail;
      fetchUserTickets(email);
    }
  }, [activeIdx, isUserLoaded]);

  const theme = modeColors[activeMode] || modeColors.social;

  return (
    <div className="min-h-screen relative overflow-hidden text-[#1f2937] font-sans antialiased pt-12 pb-28 md:py-12 px-4 md:px-8 lg:px-12 selection:bg-sky-100">
      
      {/* Universal Loading Shield to prevent Demo Flash */}
      {isMounted && isLoadingUser && (
        <div className="fixed inset-0 z-[1000] bg-[#f8f9fa] flex items-center justify-center">
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-neutral-100 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-sky-500/10 rounded-full blur-xl animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <img src="/assets/vayo-logo.png" alt="VAYO" className="h-6 w-auto mx-auto opacity-40" />
              <p className="text-[10px] font-bold tracking-[4px] uppercase text-neutral-400 animate-pulse">Verifying Identity</p>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>

      {/* Background Video */}
      <video
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/assets/bg_water_blue.mp4" type="video/mp4" />
      </video>
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
                  if (currentPersona.id === 'user-profile' && lightboxMoment.id) {
                    handleMomentDelete(lightboxMoment.id);
                  } else {
                    setDeletedMomentIdxs(prev => ({ ...prev, [currentPersona.id]: [...(prev[currentPersona.id] || []), lightboxMoment.idx] }));
                    triggerToast('Moment deleted');
                  }
                  setLightboxMoment(null);
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
      {showToast && (() => {
        const isError = showToast.toLowerCase().includes('fail') || 
                        showToast.toLowerCase().includes('error') || 
                        showToast.toLowerCase().includes('not enough') || 
                        showToast.toLowerCase().includes('already');
        return (
          <div className="fixed bottom-6 right-6 z-50 bg-[#18181b]/95 backdrop-blur-md text-white text-xs font-bold px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
            <div className={`w-1.5 h-1.5 ${isError ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'} rounded-full`} />
            <span>{showToast}</span>
          </div>
        );
      })()}

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
                  <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Profile Status</div>
                  <div className={`text-sm font-extrabold ${theme.textAccent}`}>{completenessScore}% Complete</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(currentPersona.socialTags || []).slice(0, 2).map(tag => (
                    <span key={tag} className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold ${theme.cardBg} ${theme.cardBorder}`}>
                <span className="text-neutral-500">vayo.community/</span>
                <span className={theme.textAccent}>{currentPersona.name.toLowerCase().replace(/\s+/g, '')}</span>
              </div>

              {/* Verified Badge */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${theme.cardBg} ${theme.cardBorder}`}>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className={`w-4 h-4 ${theme.textAccent}`} />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-neutral-800">Verified Member</div>
                  <div className="text-[8px] text-neutral-400 font-medium">Authenticity checks completed</div>
                </div>
              </div>

              <button onClick={() => { navigator.clipboard.writeText(`vayo.community/${currentPersona.name.toLowerCase().replace(/\s+/g, '')}`); triggerToast('Profile link copied!'); setShowShareCard(false) }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold text-white ${theme.bgAccent} hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2`}>
                <Share2 className="w-3.5 h-3.5" /> Copy Profile Link
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1140px] mx-auto relative z-10">

        {/* Banner for Demo Mode or loading */}
        {isLoadingUser && (
          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-4 mb-6 text-center text-xs font-bold flex items-center justify-center gap-2.5">
            <span className="w-3.5 h-3.5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span>Verifying registration details...</span>
          </div>
        )}

        {!isLoadingUser && !isUserLoaded && (
          <div className="bg-sky-500/10 backdrop-blur-md border border-sky-500/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-800 text-xs font-semibold">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse shrink-0" />
              <span>Viewing in **Demo Mode** (Previewing profiles). Connect an approved waitlist email to view your personal dashboard.</span>
            </div>
            <Link href="/" className="px-4 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-bold rounded-xl transition-all shadow-sm">
              Sign In / Apply ↗
            </Link>
          </div>
        )}

        {/* ═══ HEADER ═══ */}
        <header className="flex items-center justify-between border border-white/50 bg-white/30 backdrop-blur-md rounded-3xl py-3 px-4 md:px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] mb-6 gap-2 md:gap-4 relative z-20">
          <div className="flex items-center gap-3">
            <div className="text-neutral-800 flex items-center">
              <img src="/assets/vayo-logo.png" className="h-7 w-auto select-none" alt="VAYO" />
              <span className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full inline-block ml-1 animate-pulse" />
            </div>
            <span className="text-[8.5px] text-neutral-400 font-bold uppercase tracking-wider hidden sm:block border-l border-neutral-300 pl-3 leading-none h-3 flex items-center mt-1">Community Hub</span>
          </div>

          <div className="hidden md:flex bg-white/25 backdrop-blur-sm p-1 rounded-full border border-white/30 shadow-sm gap-1">
            {['social'].map(mode => {
              const isActive = activeMode === mode;
              const modeTheme = modeColors[mode];
              return (
                <button key={mode} onClick={async () => {
                  setActiveMode(mode);
                  setIsEditing(false);
                  const allowedTabs = {
                    social: ['profile', 'karma', 'circle', 'mixers', 'moments', 'security'],
                    bff: ['profile', 'circle', 'moments', 'security'],
                    bizz: ['profile', 'circle', 'security'],
                  }[mode];
                  if (!allowedTabs.includes(activeSidebarTab)) {
                    setActiveSidebarTab('profile');
                  }
                  triggerToast(`Switched to ${mode === 'bizz' ? 'Bizz' : mode === 'bff' ? 'BFF' : 'Social'} Mode!`);
                  
                  const token = localStorage.getItem("vayo_jwt_token");
                  if (token) {
                    try {
                      await fetch(`${BACKEND_URL}/api/v1/users/me/mode`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ mode })
                      });
                    } catch (err) {
                      console.warn("FastAPI backend is offline. Mode update not persisted.", err);
                    }
                  }
                }}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-full transition-all duration-300 cursor-pointer ${isActive ? `${modeTheme.bgAccent} text-white shadow-sm scale-[1.02]` : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/40'}`}>
                  {mode === 'bizz' ? 'Bizz (Work)' : mode === 'bff' ? 'BFF (Hobbies)' : 'Social (Vibe)'}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-3 w-auto">
            <div className="flex items-center gap-2 relative">
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

              {/* Notification dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute top-full right-0 mt-2 z-50 w-80 rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">Notifications</span>
                        {unreadCount > 0 && currentPersona.id === 'user-profile' && (
                          <button onClick={markAllNotificationsAsRead} className="text-[9px] text-blue-600 hover:underline font-bold cursor-pointer">Mark all read</button>
                        )}
                        <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                          {activeMode === 'social' ? '🌐 Social' : activeMode === 'bff' ? '💚 BFF' : '💼 Bizz'}
                        </span>
                      </div>
                      <button onClick={() => setShowNotifications(false)} className="text-neutral-400 hover:text-neutral-600 cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                      {displayNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => { if (n.unread && currentPersona.id === 'user-profile') markNotificationAsRead(n.id); }}
                          className={`flex flex-col gap-2 px-4 py-3 ${n.unread ? 'bg-blue-50/40' : ''}`}>
                          <div className="flex items-start gap-3">
                            <span className="text-lg shrink-0 mt-0.5">{n.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold leading-snug text-neutral-700">{n.msg}</p>
                              <p className="text-[9.5px] text-neutral-400 font-medium mt-0.5">{n.time}</p>
                            </div>
                            {n.unread && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                          </div>
                          {n.type === 'CONNECT_REQUEST' && n.unread && currentPersona.id === 'user-profile' && (
                            <div className="flex gap-2 pl-8">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await acceptRequest(n.reference_id, n.msg.split(' ')[0] || 'Member');
                                  await markNotificationAsRead(n.id);
                                }}
                                className="text-[9px] font-bold px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer">
                                Accept
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await declineRequest(n.reference_id, n.msg.split(' ')[0] || 'Member');
                                  await markNotificationAsRead(n.id);
                                }}
                                className="text-[9px] font-bold px-3 py-1 rounded bg-neutral-100 text-neutral-650 hover:bg-neutral-200 border border-neutral-200 transition-colors shadow-sm cursor-pointer">
                                Ignore
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {displayNotifications.length === 0 && (
                        <div className="text-center py-6 text-xs text-neutral-400 font-medium">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ═══ MAIN CARD ═══ */}
        <div className="bg-white/30 backdrop-blur-md rounded-[32px] border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] overflow-hidden mb-12">

          {/* Card Header */}
          <div className="px-6 py-4 flex items-center justify-center border-b border-white/30 bg-white/10">
            <h2 className="text-sm font-extrabold text-neutral-800 tracking-wider uppercase font-sans">Profile Dashboard</h2>
          </div>

          {/* Two-Column Layout */}
          <div className="grid md:grid-cols-[240px_1fr] gap-4 md:gap-6 p-4 md:p-6 min-w-0 w-full">

            {/* ── SIDEBAR ── */}
            <aside className="hidden md:block w-full min-w-0 overflow-hidden md:space-y-2">
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 p-2 md:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1.5 md:gap-1 scrollbar-none whitespace-nowrap w-full">
                {[
                  { key: 'profile', label: 'Vibe Profile', icon: <User className="w-4 h-4" /> },
                  { key: 'mixers', label: 'Event Stage', icon: <Calendar className="w-4 h-4" /> },
                  { key: 'security', label: 'Account & Security', icon: <Lock className="w-4 h-4" /> },
                ].map(item => {
                    const isActive = activeSidebarTab === item.key;
                    return (
                      <button key={item.key} onClick={() => setActiveSidebarTab(item.key)}
                        className={`flex items-center gap-2 md:gap-3 px-3.5 md:px-4 py-2 md:py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 w-auto md:w-full ${isActive ? 'bg-white/80 text-neutral-800 shadow-sm border border-neutral-100/50' : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/25'}`}>
                        <span className={isActive ? theme.textAccent : 'text-neutral-400'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                <div className="hidden md:block border-t border-white/20 my-2" />
                <div className="md:hidden w-px h-6 bg-white/20 self-center mx-1 shrink-0" />
                <button onClick={handleLogout} className="flex items-center gap-2 md:gap-3 px-3.5 md:px-4 py-2 md:py-3 rounded-xl text-xs font-bold text-rose-500/80 hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer shrink-0 w-auto md:w-full">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
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
                    {activeSidebarTab === 'mixers' && <Calendar className="w-4 h-4" />}
                    {activeSidebarTab === 'security' && <Lock className="w-4 h-4" />}
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight font-sans">
                    {activeSidebarTab === 'profile' && 'Profile Details'}
                    {activeSidebarTab === 'mixers' && 'Event Stage'}
                    {activeSidebarTab === 'security' && 'Account & Security'}
                  </h3>
                </div>
                {isEditing && activeSidebarTab === 'profile' ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsEditing(false)} className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 cursor-pointer transition-colors">Cancel</button>
                    <button onClick={saveEdit} className="text-[11px] font-bold px-3 py-1.5 rounded-xl text-white cursor-pointer transition-opacity hover:opacity-90" style={{ background: theme.accent }}>Save</button>
                  </div>
                ) : activeSidebarTab === 'profile' ? (
                  <button onClick={startEdit}
                    className="flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all hover:bg-neutral-50 cursor-pointer">
                    <svg className="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" /></svg>
                    <span>Edit</span>
                  </button>
                ) : null}
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

                      <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
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
                          <div>+91 9845{currentPersona.id === 'maxim' ? '0 1202' : currentPersona.id === 'sarah' ? '1 3495' : currentPersona.id === 'daniel' ? '2 8593' : currentPersona.id === 'user-profile' ? '4 8392' : '3 9204'}</div>
                          <div className="text-blue-600 font-semibold hover:underline cursor-pointer">{currentPersona.name.toLowerCase()}@vayo.community</div>
                          <div className="flex items-center justify-center sm:justify-start gap-1 text-neutral-400">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{currentPersona.location}</span>
                          </div>
                          {isEditing ? (
                            <div className="space-y-1.5 pt-1 max-w-sm">
                              <div className="grid grid-cols-2 gap-1.5">
                                {[['instagram', 'ig'], ['linkedin', 'li'], ['twitter', 'tw'], ['github', 'gh']].map(([key, short]) => (
                                  <div key={key} className="flex items-center gap-1 border rounded-lg px-2 py-1 bg-white" style={{ borderColor: `${theme.accent}30` }}>
                                    <span className="text-[8.5px] font-extrabold uppercase text-neutral-400 w-5">{short}</span>
                                    <input value={editDraft[key]}
                                      onChange={e => setEditDraft(p => ({ ...p, [key]: e.target.value }))}
                                      className="text-[10.5px] flex-1 outline-none bg-transparent min-w-0" placeholder={`@handle`} />
                                  </div>
                                ))}
                              </div>
                              {activeMode === 'bizz' && (
                                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                  <div className="flex items-center gap-1 border rounded-lg px-2 py-1 bg-white" style={{ borderColor: `${theme.accent}30` }}>
                                    <span className="text-[8.5px] font-extrabold uppercase text-neutral-400 w-10">Role</span>
                                    <input value={editDraft.bizzRole}
                                      onChange={e => setEditDraft(p => ({ ...p, bizzRole: e.target.value }))}
                                      className="text-[10.5px] flex-1 outline-none bg-transparent min-w-0" placeholder={`Job Role`} />
                                  </div>
                                  <div className="flex items-center gap-1 border rounded-lg px-2 py-1 bg-white" style={{ borderColor: `${theme.accent}30` }}>
                                    <span className="text-[8.5px] font-extrabold uppercase text-neutral-400 w-12">Company</span>
                                    <input value={editDraft.bizzCompany}
                                      onChange={e => setEditDraft(p => ({ ...p, bizzCompany: e.target.value }))}
                                      className="text-[10.5px] flex-1 outline-none bg-transparent min-w-0" placeholder={`Company`} />
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : Object.keys(displayPersona.socialLinks || {}).length > 0 && (
                            <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                              {displayPersona.socialLinks.instagram && (
                                <a 
                                  href={`https://instagram.com/${displayPersona.socialLinks.instagram.replace('@', '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  title={`@${displayPersona.socialLinks.instagram}`}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                                  </svg>
                                </a>
                              )}
                              {displayPersona.socialLinks.linkedin && (
                                <a 
                                  href={`https://linkedin.com/in/${displayPersona.socialLinks.linkedin}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  title={displayPersona.socialLinks.linkedin}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" />
                                  </svg>
                                </a>
                              )}
                              {displayPersona.socialLinks.twitter && (
                                <a 
                                  href={`https://twitter.com/${displayPersona.socialLinks.twitter.replace('@', '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  title={`@${displayPersona.socialLinks.twitter}`}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                  </svg>
                                </a>
                              )}
                              {displayPersona.socialLinks.github && (
                                <a 
                                  href={`https://github.com/${displayPersona.socialLinks.github}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  title={displayPersona.socialLinks.github}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
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
                            &ldquo;{activeMode === 'social' ? displayPersona.socialBio : activeMode === 'bff' ? displayPersona.bffBio : displayPersona.bizzBio}&rdquo;
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
                        { label: 'BFF Squads', value: displayPersona.bffCrew ? displayPersona.bffCrew.length : 0 },
                        { label: 'Memories', value: personaMoments.length },
                        { label: 'Close Friends', value: displayPersona.connectionsMet ? displayPersona.connectionsMet.length : 0 },
                      ] : activeMode === 'bizz' ? [
                        { label: 'Connections', value: displayPersona.connectionsMet ? displayPersona.connectionsMet.length : 0 },
                        { label: 'Skills', value: displayPersona.bizzSkills ? displayPersona.bizzSkills.length : 0 },
                        { label: 'Events', value: displayPersona.pastTimeline ? displayPersona.pastTimeline.length : 0 },
                      ] : [
                        { label: 'Mixers', value: displayPersona.activeTickets ? displayPersona.activeTickets.length : 0 },
                        { label: 'Connections', value: displayPersona.connectionsMet ? displayPersona.connectionsMet.length : 0 },
                        { label: 'Profile Vibe', value: `${completenessScore}%` },
                      ]).map((s, i, arr) => (
                        <div key={i} className={`flex-1 py-3 text-center ${i < arr.length - 1 ? 'border-r border-neutral-200/50' : ''}`}>
                          <div className={`text-lg font-black tracking-tight ${theme.textAccent}`}>{s.value}</div>
                          <div className="text-[9px] text-neutral-450 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Internal Info */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Internal Status</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 text-center sm:text-left">
                        <div>
                          <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">User Type</div>
                          <div className="text-xs font-bold text-neutral-700 mt-0.5">
                            {activeMode === 'bizz' ? 'Founder / Builder' : activeMode === 'bff' ? 'Hobbyist Mixer' : 'Social Connector'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Association</div>
                          <div className="text-xs font-bold text-neutral-700 mt-0.5">Vayo Offline Hub (Bangalore)</div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Source / Verification</div>
                          <div className="text-xs font-bold text-neutral-700 mt-0.5 flex items-center gap-1 justify-center sm:justify-start">
                            {currentPersona.selfieVerified && <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline shrink-0" />}
                            <span>{currentPersona.selfieVerified ? 'Selfie Verified' : 'Standard'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Upcoming Events Carousel */}
                    {(() => {
                      const event = upcomingEvents[currentEventIdx];
                      
                      if (isEventsLoading) {
                        return (
                          <div className="space-y-4">
                            <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest">Upcoming Events</h5>
                            <div className="relative w-full h-[220px] sm:h-[280px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-lg border border-neutral-100 bg-neutral-900 flex flex-col items-center justify-center gap-3">
                              <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider animate-pulse">Syncing mixers…</span>
                            </div>
                          </div>
                        );
                      }

                      if (!event) {
                        return (
                          <div className="space-y-4">
                            <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest">Upcoming Events</h5>
                            <div className="relative w-full h-[220px] sm:h-[280px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-lg border-2 border-dashed border-neutral-100 bg-neutral-50 flex flex-col items-center justify-center gap-2 text-center px-6">
                              <Calendar className="w-8 h-8 text-neutral-200" />
                              <div className="text-xs font-bold text-neutral-400">No Events Scheduled</div>
                              <p className="text-[10px] text-neutral-300 max-w-[180px]">Check back later or follow us on social media for event updates.</p>
                            </div>
                          </div>
                        );
                      }

                      const handlePrev = () => {
                        setCurrentEventIdx(prev => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
                      };
                      const handleNext = () => {
                        setCurrentEventIdx(prev => (prev + 1) % upcomingEvents.length);
                      };
                      return (
                        <div className="space-y-4">
                          <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest">Upcoming Events</h5>
                          <div className="relative w-full h-[220px] sm:h-[280px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-lg border border-neutral-100 bg-neutral-900 group">
                            {/* Interactive clickable overlay */}
                            <div 
                              onClick={() => {
                                setSelectedEvent(event);
                                setActiveSidebarTab('mixers');
                                triggerToast(`Opening registration for: ${event.title}`);
                              }}
                              className="absolute inset-0 w-full h-full cursor-pointer z-10"
                            >
                              {/* Slide image */}
                              <div className="absolute inset-0 w-full h-full">
                                <img
                                  src={event.image}
                                  alt={event.title}
                                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                              </div>
                              
                              {/* Dark gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                              {/* "Upcoming Event" Badge */}
                              <span className="absolute top-4 left-4 z-20 bg-blue-600 text-white text-[9px] sm:text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                                Upcoming Event
                              </span>

                              {/* Event details container */}
                              <div className="absolute bottom-6 left-5 right-5 z-20 flex flex-col gap-2.5 text-left max-w-[calc(100%-40px)] md:max-w-[70%]">
                                {/* Date pill */}
                                <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] text-white font-bold tracking-wide w-fit">
                                  <Calendar className="w-3.5 h-3.5 text-white" />
                                  <span>{event.date}</span>
                                </div>

                                {/* Title */}
                                <h4 className="text-sm sm:text-base md:text-lg font-bold text-white leading-snug tracking-tight drop-shadow-md">
                                  {event.title}
                                </h4>

                                {/* Location */}
                                <div className="flex items-center gap-1 text-[10px] text-neutral-300">
                                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              </div>
                            </div>

                            {/* Notch with Arrow Buttons */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-12 z-20 flex items-center justify-center">
                              <svg className="absolute inset-0 w-full h-full drop-shadow-[0_-2px_4px_rgba(0,0,0,0.06)]" viewBox="0 0 176 48" fill="none" preserveAspectRatio="none">
                                <path
                                  d="M 0 48 C 20 48, 20 0, 40 0 L 136 0 C 156 0, 156 48, 176 48 Z"
                                  fill="#ffffff"
                                />
                                <path
                                  d="M 0 48 C 20 48, 20 0, 40 0 L 136 0 C 156 0, 156 48, 176 48"
                                  stroke="rgba(228, 228, 231, 0.8)"
                                  strokeWidth="1"
                                />
                              </svg>

                              <div className="relative z-10 flex gap-4 items-center justify-center pb-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                  className="w-8 h-8 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all duration-200 cursor-pointer"
                                  aria-label="Previous event"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5 text-neutral-600" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                  className="w-8 h-8 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all duration-200 cursor-pointer"
                                  aria-label="Next event"
                                >
                                  <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <hr className="border-neutral-100" />

                    {/* Vibe Profile Tags Section */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Vibe Profile Tags</h5>
                      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                        {(activeMode === 'social' ? currentPersona.socialTags : activeMode === 'bff' ? currentPersona.bffTags : currentPersona.bizzTags).map((tag, i) => (
                          <span key={i} className={`text-[10.5px] font-bold px-2.5 py-1 rounded-xl border ${theme.badgeBg}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bizz Skills block */}
                    {activeMode === 'bizz' && (
                      <>
                        <hr className="border-neutral-100" />
                        <div>
                          <h5 className="text-[11px] font-bold text-teal-650 uppercase tracking-widest mb-3">Skills & Expertise</h5>
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
                              <div className="flex gap-2 max-w-sm">
                                <input value={editDraft.newSkill} onChange={e => setEditDraft(p => ({ ...p, newSkill: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter' && editDraft.newSkill.trim()) { setEditDraft(p => ({ ...p, bizzSkills: [...p.bizzSkills, p.newSkill.trim()], newSkill: '' })); } }}
                                  className={`flex-1 text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 bg-white ${theme.cardBorder}`} placeholder="Add a skill… (Enter to add)" />
                                <button onClick={() => { if (editDraft.newSkill.trim()) setEditDraft(p => ({ ...p, bizzSkills: [...p.bizzSkills, p.newSkill.trim()], newSkill: '' })); }}
                                  className="px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: theme.accent }}>Add</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {(displayPersona.bizzSkills || []).map((skill, i) => (
                                <span key={i} className={`flex items-center gap-1.5 text-[10.5px] font-bold px-3 py-1.5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                                  <Zap className={`w-3 h-3`} style={{ color: theme.accent }} />{skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                  </div>
                )}

                {/* ════════════════════ EVENT STAGE TAB ════════════════════ */}
                {activeSidebarTab === 'mixers' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Event Registration Panel */}
                    {selectedEvent && (
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 shadow-sm space-y-4 relative animate-fade-in">
                        <button 
                          onClick={() => setSelectedEvent(null)}
                          className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          {/* Image Thumbnail */}
                          <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm border border-white/20">
                            <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="space-y-1 min-w-0 flex-1">
                            <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-blue-600">Apply for RSVP</span>
                            <h4 className="text-sm font-extrabold text-neutral-800 leading-snug truncate">{selectedEvent.title}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-neutral-500 font-medium">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-neutral-400" />{selectedEvent.date}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-neutral-400" />{selectedEvent.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* CTA button or state */}
                        {(() => {
                          const isAlreadyApplied = (displayPersona.pendingApplications || []).some(
                            app => app.name === selectedEvent.title
                          ) || (displayPersona.activeTickets || []).some(
                            tkt => tkt.name === selectedEvent.title
                          );

                          if (isAlreadyApplied) {
                            return (
                              <div className="space-y-3">
                                <div className="flex items-center justify-center gap-2 py-2 w-full rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold">
                                  <Check className="w-4 h-4" />
                                  <span>Applied / Ticket Approved ✓</span>
                                </div>
                                <button
                                  onClick={() => handleCancelRSVP(selectedEvent.id)}
                                  className="w-full py-2 rounded-xl text-[10px] font-bold text-rose-600 border border-rose-100 bg-rose-50/50 hover:bg-rose-50 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Cancel My RSVP</span>
                                </button>
                              </div>
                            );
                          }

                          return (
                            <button
                              onClick={() => handleRSVP(selectedEvent)}
                              className="w-full py-2.5 rounded-xl text-xs font-extrabold text-white cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-sm"
                              style={{ background: theme.accent }}
                            >
                              <CalendarPlus className="w-4 h-4" />
                              <span>Confirm Registration & Get Ticket</span>
                            </button>
                          );
                        })()}
                      </div>
                    )}

                    {/* ── Top row: Next-up card (left) + glassmorphic calendar (right) ── */}
                    {(() => {
                      const now = new Date();
                      const year = now.getFullYear(); const month = now.getMonth();
                      const monthName = now.toLocaleString('default', { month: 'long' });
                      const firstDay = new Date(year, month, 1).getDay();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      const parseDay = (dateStr) => { const m = dateStr.match(/(\d+)(?:,|$|\s·)/); return m ? parseInt(m[1]) : null; };
                      const eventDays = new Map();
                      const allEvents = [...(displayPersona.activeTickets || []).map(t => ({ name: t.name, date: t.date })), ...(displayPersona.pastTimeline || []).map(t => ({ name: t.name, date: t.date }))];
                      allEvents.forEach(e => { const d = parseDay(e.date); if (d && d <= daysInMonth) { if (!eventDays.has(d)) eventDays.set(d, []); eventDays.get(d).push(e.name); } });
                      const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
                      while (cells.length % 7 !== 0) cells.push(null);
                      const today = now.getDate();
                      const nextTkt = displayPersona.activeTickets ? displayPersona.activeTickets[0] : null;
                      return (
                        <div className="flex flex-col sm:flex-row items-stretch gap-3">
                          {/* Left: section label + next-up card */}
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            <h5 className={`text-[11px] font-bold uppercase tracking-widest ${theme.textAccent} font-sans`}>Event Stage</h5>
                            {nextTkt ? (
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
                            ) : (
                              <div className="flex-1 rounded-xl p-3 border border-neutral-100 bg-white/70 shadow-sm flex items-center justify-center text-xs text-neutral-400">
                                No upcoming tickets
                              </div>
                            )}
                          </div>
                          {/* Right: glassmorphic mini-calendar */}
                          <div className="w-full sm:w-[160px] shrink-0 rounded-xl relative self-stretch"
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
                                  <span className="text-[9.5px] font-extrabold text-neutral-700">{monthName.slice(0, 3)} &apos;{String(year).slice(2)}</span>
                                </div>
                                <span className="text-[7.5px] font-bold px-1.5 py-[2px] rounded-full"
                                  style={{ background: `${theme.accent}20`, color: theme.accent }}>
                                  {eventDays.size} ev
                                </span>
                              </div>
                              <div className="grid grid-cols-7 mb-[3px]">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                  <div key={i} className="text-center text-[7px] font-extrabold text-neutral-400 leading-none pb-[2px]">{d}</div>
                                ))}
                              </div>
                              <div className="grid grid-cols-7 flex-1">
                                {cells.map((day, i) => {
                                  const events = day ? eventDays.get(day) : null;
                                  const isToday = day === today;
                                  const col = i % 7;
                                  const tipAnchor = col <= 2 ? 'left-0' : col >= 5 ? 'right-0' : 'left-1/2 -translate-x-1/2';
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
                                            ? <span className="w-[3px] h-[3px] rounded-full mt-0.5" style={{ background: theme.accent }} />
                                            : <span className="w-[3px] h-[3px] opacity-0 mt-0.5" />}
                                          {events && (
                                            <div className={`absolute bottom-full mb-1 z-50 hidden group-hover:block w-28 pointer-events-none ${tipAnchor}`}>
                                              <div className="rounded-lg px-2 py-1.5 text-[8px] font-semibold text-white shadow-xl"
                                                style={{ background: `linear-gradient(135deg, ${theme.accent}f0, ${theme.accent}c0)`, backdropFilter: 'blur(8px)' }}>
                                                {events.map((ev, j) => <div key={j} className="truncate">• {ev}</div>)}
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
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-sans">
                        Live Tickets <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      </h5>
                      <div className="space-y-4">
                        {displayPersona.activeTickets && displayPersona.activeTickets.length > 0 ? (
                          displayPersona.activeTickets.map((tkt, i) => (
                            <div key={i} className="space-y-3">
                              <div className="border border-neutral-200 rounded-2xl overflow-hidden flex flex-col md:flex-row bg-neutral-50/50 shadow-sm">
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
                                    <QRCodeSVG 
                                      value={tkt.qrCode || `VAYO-TKT-${tkt.id}`} 
                                      size={64}
                                      level="M"
                                      includeMargin={false}
                                    />
                                  </div>
                                  <span className="text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mt-2">{tkt.qrCode}</span>
                                  <button onClick={() => triggerToast('Showing full-screen ticket for verification!')} className={`mt-1.5 text-[9px] font-bold ${theme.textAccent} hover:underline cursor-pointer`}>Show Full QR</button>
                                </div>
                              </div>
                              {tkt.lat && tkt.lng && (
                                <LocationMap lat={tkt.lat} lng={tkt.lng} venue={tkt.locationPin} />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="py-10 border-2 border-dashed border-neutral-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-neutral-50/30">
                            <Zap className="w-8 h-8 text-neutral-200" />
                            <div className="text-xs font-bold text-neutral-400">No Active Tickets</div>
                            <p className="text-[10px] text-neutral-300 max-w-[200px]">Once you RSVP to an event and it's approved, your live ticket will appear here.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Event Journey Stepper */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 font-sans">Event Journey</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {userTickets.length > 0 ? (
                          userTickets.slice(0, 2).map((tkt, i) => {
                            const eventStatus = tkt.status || 'Registered';
                            const steps = ['Registered', 'Processing', 'Confirmed'];
                            
                            // Map status to step index
                            let stepIdx = 0;
                            const s = eventStatus.toLowerCase();
                            if (s === 'confirmed' || s === 'completed') stepIdx = 2;
                            else if (s === 'processing' || s === 'payment_pending') stepIdx = 1;
                            
                            const isConfirmed = s === 'confirmed';
                            const accentColor = isConfirmed ? '#10b981' : '#6366f1';

                            return (
                              <div key={i} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-extrabold text-neutral-800 truncate max-w-[150px]">{tkt.event_title}</span>
                                  <span className="text-[9.5px] text-neutral-400 font-medium">Progress</span>
                                </div>

                                {/* Stepper display */}
                                <div className="flex items-center justify-between relative px-2 pt-1">
                                  <div className="absolute top-[13px] left-8 right-8 h-0.5 bg-neutral-100 z-0">
                                    <div className="h-full transition-all duration-500"
                                      style={{
                                        width: stepIdx === 2 ? '100%' : stepIdx === 1 ? '50%' : '0%',
                                        backgroundColor: accentColor
                                      }} />
                                  </div>

                                  {steps.map((label, step) => {
                                    const isCurrent = step === stepIdx;
                                    const isDone = step <= stepIdx;
                                    return (
                                      <div key={step} className="flex flex-col items-center relative z-10">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition-all duration-300 bg-white ${isDone ? '' : 'border-neutral-200 text-neutral-400'}`}
                                          style={isDone ? { borderColor: accentColor, backgroundColor: accentColor, color: '#fff' } : isCurrent ? { borderColor: accentColor, color: accentColor } : {}}>
                                          {isDone ? '✓' : step + 1}
                                        </div>
                                        <span className={`text-[7.5px] font-extrabold uppercase tracking-wider mt-1.5 transition-colors duration-300 ${isDone ? 'text-neutral-700' : 'text-neutral-400'}`}>{label}</span>
                                      </div>
                                    )
                                  })}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                  <span className="text-[9px] text-neutral-400 font-medium">Latest Status</span>
                                  <span className="text-[9.5px] font-black uppercase" style={{ color: accentColor }}>{eventStatus}</span>
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <div className="col-span-full py-8 border-2 border-dashed border-neutral-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                             <Calendar className="w-8 h-8 text-neutral-200" />
                             <div className="text-xs font-bold text-neutral-400">No Active Event Journey</div>
                             <p className="text-[10px] text-neutral-300 max-w-[200px]">RSVP to an upcoming mixer to track your ticket status here.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Past Timeline */}
                    <div>
                      <h5 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3 font-sans">Past Timeline</h5>
                      <div className="relative border-l border-neutral-100/80 ml-2 pl-4 space-y-4 pt-1">
                        {(currentPersona.pastTimeline || []).map((past, i) => (
                          <div key={i} className="relative">
                            <span className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ background: theme.accent }} />
                            <div className="leading-tight">
                              <span className="text-[9.5px] text-neutral-400 font-medium">{past.date}</span>
                              <div className="text-xs font-extrabold text-neutral-800 mt-0.5">{past.name}</div>
                              <div className="flex gap-2 text-[9.5px] text-neutral-400 font-semibold mt-0.5">
                                <span>{past.category}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* ════════════════════ SECURITY TAB ════════════════════ */}
                {activeSidebarTab === 'security' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Change Password Form */}
                    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
                      <div className={`px-4 py-3 border-b border-neutral-100 ${theme.panelHeader} flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <Lock className={`w-3.5 h-3.5 ${theme.textAccent}`} />
                          <span className="text-[11px] font-extrabold text-neutral-700 uppercase tracking-wider">Change Password</span>
                        </div>
                        <button onClick={() => setShowChangePwd(p => !p)} className={`text-[10px] font-bold ${theme.textAccent} hover:underline cursor-pointer`}>
                          {showChangePwd ? 'Hide' : 'Show'}
                        </button>
                      </div>

                      <div className={`p-4 space-y-3 transition-all ${showChangePwd ? 'block' : 'hidden'}`}>
                        {[
                          { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                          { key: 'next', label: 'New Password', placeholder: 'Minimum 8 characters' },
                          { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
                        ].map((field) => (
                          <div key={field.key} className="space-y-1">
                            <label className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider">{field.label}</label>
                            <div className="relative flex items-center">
                              <input
                                type={showPwd[field.key] ? 'text' : 'password'}
                                value={pwdForm[field.key]}
                                onChange={e => setPwdForm(p => ({ ...p, [field.key]: e.target.value }))}
                                className={`w-full text-xs border rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 bg-white ${theme.cardBorder}`}
                                placeholder={field.placeholder}
                              />
                              <button
                                onClick={() => setShowPwd(p => ({ ...p, [field.key]: !p[field.key] }))}
                                className="absolute right-3 text-neutral-400 hover:text-neutral-600 cursor-pointer">
                                {showPwd[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        {pwdForm.next && pwdForm.confirm && pwdForm.next !== pwdForm.confirm && (
                          <p className="text-[10.5px] text-red-500 font-semibold">Passwords do not match</p>
                        )}
                        <button
                          onClick={handleUpdatePassword}
                          disabled={!pwdForm.current || !pwdForm.next || pwdForm.next !== pwdForm.confirm}
                          className="w-full py-2.5 rounded-xl text-xs font-extrabold text-white disabled:opacity-40 cursor-pointer mt-1"
                          style={{ background: theme.accent }}>
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Security Settings Switches */}
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

        {/* ═══ MOBILE BOTTOM NAVIGATION ═══ */}
        <div className="md:hidden fixed bottom-5 left-4 right-4 z-40 bg-white/80 backdrop-blur-lg border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl px-3 py-2 flex items-center justify-around">
          {[
            { key: 'profile', label: 'Vibe Profile', icon: <User className="w-5 h-5" /> },
            { key: 'mixers', label: 'Event Stage', icon: <Calendar className="w-5 h-5" /> },
            { key: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
          ].map(item => {
            const isActive = activeSidebarTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSidebarTab(item.key)}
                className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-[10px] font-extrabold transition-all duration-200 active:scale-95 cursor-pointer text-neutral-500 hover:text-neutral-800"
              >
                <span className={isActive ? theme.textAccent : 'text-neutral-400'}>{item.icon}</span>
                <span className={isActive ? 'text-neutral-800 font-extrabold' : 'text-neutral-400 font-bold'}>{item.label}</span>
              </button>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-[10px] font-extrabold text-rose-500/80 active:scale-95 cursor-pointer transition-all duration-200"
          >
            <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            <span className="text-rose-400 font-bold">Log out</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">Loading Profile Hub...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
