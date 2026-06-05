"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  FileText
} from "lucide-react";

// Inline Instagram icon SVG component
const InstagramIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const basePersonas = [
  {
    id: 'maxim',
    name: 'Aditya',
    age: 29,
    role: 'Tech Introvert',
    image: "/assets/maxim_persona.png",
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
      {
        stat: '72%',
        percentage: 72,
        description: 'Unstructured large-crowd events trigger social fatigue within the first 30 minutes',
        color: 'blue'
      },
      {
        stat: '64%',
        percentage: 64,
        description: 'Individuals struggle to strike up conversations without a shared activity or icebreaker',
        color: 'green'
      },
      {
        stat: '58%',
        percentage: 58,
        description: 'Lack of pre-event attendee clarity prevents hesitant users from RSVPing',
        color: 'blue'
      }
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
    karmaBreakdown: {
      attendedMixers: 120,
      momentContributor: 60,
      vibeLeader: 80,
      hostSupport: 80
    },
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
      { name: "Friday Boardgamers", members: 12, type: "BFF Squad" },
      { name: "Koramangala Coders", members: 28, type: "BFF Squad" }
    ],
    connectionsMet: [
      { name: "Sarah", role: "Product Designer", mutualFriends: 3, avatar: "/assets/sarah_persona.png" },
      { name: "Daniel", role: "DevOps Engineer", mutualFriends: 5, avatar: "/assets/daniel_persona.png" }
    ],
    moments: [
      { location: "Third Wave Coffee", date: "May 28", imageColor: "from-blue-500 to-indigo-600", caption: "Deep focus during the Lofi session 💻" },
      { location: "Dialogues Cafe", date: "May 15", imageColor: "from-pink-500 to-rose-600", caption: "Boardgame night got intense! 🎲" }
    ]
  },
  {
    id: 'sarah',
    name: 'Sarah',
    age: 31,
    role: 'New City Resident',
    image: "/assets/sarah_persona.png",
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
      {
        stat: '81%',
        percentage: 81,
        description: 'Relocated individuals find it difficult to make new friends outside of work environments',
        color: 'blue'
      },
      {
        stat: '55%',
        percentage: 55,
        description: 'Solo attendees abandon social gatherings early due to feeling visible or out of place',
        color: 'green'
      },
      {
        stat: '68%',
        percentage: 68,
        description: 'Users prefer platforms that explicitly guarantee platonic, friendship-focused spaces',
        color: 'blue'
      }
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
    karmaBreakdown: {
      attendedMixers: 200,
      momentContributor: 120,
      vibeLeader: 110,
      hostSupport: 50
    },
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
      { name: "Pottery Enthusiasts", members: 8, type: "BFF Squad" },
      { name: "Weekend Explorers", members: 34, type: "BFF Squad" }
    ],
    connectionsMet: [
      { name: "Elena", role: "Creative Freelancer", mutualFriends: 4, avatar: "/assets/elena_persona.png" },
      { name: "Maxim", role: "Frontend Developer", mutualFriends: 3, avatar: "/assets/maxim_persona.png" }
    ],
    moments: [
      { location: "Clay Station", date: "May 29", imageColor: "from-amber-400 to-orange-600", caption: "Made my first imperfect vase 🏺" },
      { location: "Indiranagar Bistro", date: "May 22", imageColor: "from-teal-400 to-emerald-600", caption: "Acoustic night vibe was unreal 🎵" }
    ]
  },
  {
    id: 'daniel',
    name: 'Daniel',
    age: 26,
    role: 'Remote Developer',
    image: "/assets/daniel_persona.png",
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
      {
        stat: '78%',
        percentage: 78,
        description: 'Remote workers experience feelings of isolation that impact their mental well-being weekly',
        color: 'blue'
      },
      {
        stat: '70%',
        percentage: 70,
        description: 'Weekday event attendance drops when the sign-up or planning process takes more than 3 steps',
        color: 'green'
      },
      {
        stat: '45%',
        percentage: 45,
        description: 'Working professionals crave casual meetups where talking about work is actively discouraged',
        color: 'blue'
      }
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
    karmaBreakdown: {
      attendedMixers: 100,
      momentContributor: 40,
      vibeLeader: 50,
      hostSupport: 100
    },
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
      { name: "Agara Lake Runners", members: 42, type: "BFF Squad" },
      { name: "HSR Badminton Club", members: 15, type: "BFF Squad" }
    ],
    connectionsMet: [
      { name: "Maxim", role: "Frontend Dev", mutualFriends: 5, avatar: "/assets/maxim_persona.png" },
      { name: "Sarah", role: "Product Designer", mutualFriends: 5, avatar: "/assets/sarah_persona.png" }
    ],
    moments: [
      { location: "Agara Lake HSR", date: "May 30", imageColor: "from-sky-400 to-blue-600", caption: "Crushed my 5k run record! 🏃‍♂️" },
      { location: "Cult Fit HSR", date: "May 20", imageColor: "from-violet-500 to-purple-600", caption: "Midweek stress relief 🏸" }
    ]
  },
  {
    id: 'elena',
    name: 'Elena',
    age: 34,
    role: 'Creative Freelancer',
    image: "/assets/elena_persona.png",
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
      {
        stat: '85%',
        percentage: 85,
        description: 'Mature attendees feel alienated by nightlife-focused community events',
        color: 'blue'
      },
      {
        stat: '60%',
        percentage: 60,
        description: 'Superficial conversations at standard meetups fail to create lasting bonds',
        color: 'green'
      },
      {
        stat: '50%',
        percentage: 50,
        description: 'Users are willing to pay for premium, hosted events that guarantee safety and comfort',
        color: 'blue'
      }
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
    karmaBreakdown: {
      attendedMixers: 220,
      momentContributor: 150,
      vibeLeader: 140,
      hostSupport: 100
    },
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
      { name: "Jayanagar Book Club", members: 18, type: "BFF Squad" },
      { name: "Indie Art Collaborators", members: 22, type: "BFF Squad" }
    ],
    connectionsMet: [
      { name: "Sarah", role: "Product Designer", mutualFriends: 4, avatar: "/assets/sarah_persona.png" },
      { name: "Daniel", role: "DevOps Engineer", mutualFriends: 2, avatar: "/assets/daniel_persona.png" }
    ],
    moments: [
      { location: "NGMA Palace Road", date: "May 27", imageColor: "from-yellow-400 to-amber-500", caption: "Sunday inspiration at the gallery 🎨" },
      { location: "Writer's Cafe", date: "May 18", imageColor: "from-red-400 to-pink-600", caption: "Spontaneous poetry writing session ✍️" }
    ]
  }
];

// Helper to make custom persona mapping
const makeUserPersona = (user) => {
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

  const interests = Array.isArray(user.interests) ? user.interests : [];
  const tags = interests.map(item => `#${item.replace(/\s+/g, '')}`);
  const socialTags = tags.length > 0 ? tags : ['#Social', '#Explore', '#Vayo'];
  const bffTags = tags.length > 0 ? tags : ['#Hobbies', '#Squad', '#Meetups'];
  const bizzTags = tags.length > 0 ? tags : ['#Networking', '#Founder', '#Collaborate'];

  return {
    id: 'user-profile',
    name: user.name || 'Vayo Member',
    age: age,
    role: 'Vayo Member',
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
    location: "Bangalore, India",
    selfieVerified: true,
    bizzVerified: !!user.instagram,
    socialTags,
    bffTags,
    bizzTags,
    socialBio: `Hey, I'm ${user.name || 'Vayo Member'}! Excited to join the Vayo community and meet up for ${interests.join(', ') || 'mixers'}.`,
    bffBio: `Looking to form a new squad or connect for ${interests.slice(0, 3).join(', ') || 'weekend activities'}.`,
    bizzBio: `Professional details. Hit me up for discussions on shared interests or collaborations. Instagram: @${user.instagram || 'vayo'}`,
    bizzRole: "Vayo Builder",
    bizzCompany: "Community Member",
    karmaBalance: 350,
    karmaTier: "Pathfinder",
    karmaPercentage: 60,
    karmaBreakdown: {
      attendedMixers: 150,
      momentContributor: 80,
      vibeLeader: 70,
      hostSupport: 50
    },
    pendingApplications: [
      { name: "Vayo Welcome Social Mixer", date: "Coming Soon", status: "Approved & Ticket Generated" }
    ],
    activeTickets: [
      { name: "Vayo Welcome Social Mixer", date: "Coming Soon, 7:00 PM", countdown: "Soon", locationPin: "Vayo Hub, Indiranagar", organizer: "Vayo Host", qrCode: `VAYO-TKT-${(user.name || 'MEMBER').slice(0, 3).toUpperCase()}99` }
    ],
    pastTimeline: [
      { name: "Selfie Verification Completed", date: "Approved Today", category: "Milestone", friendsMet: 0 }
    ],
    bffCrew: [
      { name: "Vayo Explorers Crew", members: 124, type: "Community Group" }
    ],
    connectionsMet: [
      { name: "Sarah", role: "Product Designer", mutualFriends: 1, avatar: "/assets/sarah_persona.png" },
      { name: "Aditya", role: "Software Developer", mutualFriends: 2, avatar: "/assets/maxim_persona.png" }
    ],
    moments: [
      { location: "Vayo Indiranagar", date: "Just now", imageColor: "from-sky-400 to-blue-500", caption: "Joined VAYO Commune waitlist! 🎉" }
    ]
  };
};

function SegmentedProgress({ percentage, color }) {
  const totalSegments = 20;
  const activeSegments = Math.round((percentage / 100) * totalSegments);

  return (
    <div className="flex gap-[3.5px] items-end h-[16px] w-full my-3">
      {Array.from({ length: totalSegments }).map((_, i) => {
        const isActive = i < activeSegments;
        let activeBgClass = '';
        let inactiveBgClass = '';

        if (color === 'blue') {
          activeBgClass = 'bg-[#0ea5e9]';
          inactiveBgClass = 'bg-[#f0f9ff]';
        } else if (color === 'green') {
          activeBgClass = 'bg-[#84cc16]';
          inactiveBgClass = 'bg-[#f4fbe9]';
        } else {
          activeBgClass = 'bg-[#0d9488]';
          inactiveBgClass = 'bg-teal-50';
        }

        return (
          <div
            key={i}
            className={`h-full flex-1 rounded-full transition-colors duration-300 ${isActive ? activeBgClass : inactiveBgClass}`}
          />
        );
      })}
    </div>
  );
}

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
  const [activeTabCircle, setActiveTabCircle] = useState('squads');
  const [showToast, setShowToast] = useState(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState('profile');
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const currentPersona = personas[activeIdx] || basePersonas[0];

  const personaMoments = [
    ...(customMoments[currentPersona.id] || []),
    ...(currentPersona.moments || [])
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateUpload = (fileName) => {
    if (uploading) return;
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            const newMoment = {
              location: currentPersona.location.split(',')[0],
              date: "Just now",
              imageColor: getRandomGradient(),
              caption: `Uploaded: ${fileName || "New Event Moment"} 📸`
            };
            setCustomMoments(prev => ({
              ...prev,
              [currentPersona.id]: [newMoment, ...(prev[currentPersona.id] || [])]
            }));
            triggerToast("Moment uploaded successfully!");
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0].name);
    }
  };

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast(null);
    }, 3000);
  };

  const getRandomGradient = () => {
    const gradients = [
      "from-violet-500 to-purple-600",
      "from-amber-400 to-orange-500",
      "from-teal-400 to-emerald-600",
      "from-pink-500 to-rose-600",
      "from-sky-400 to-blue-500"
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const modeColors = {
    social: {
      accent: '#0ea5e9',
      bgAccent: 'bg-[#0ea5e9]',
      textAccent: 'text-[#0ea5e9]',
      borderAccent: 'border-sky-500/40',
      ringAccent: 'ring-[#0ea5e9]/20',
      gradient: 'from-sky-500 to-sky-700',
      badgeBg: 'bg-sky-500/10 text-sky-800 border-sky-500/20 backdrop-blur-sm',
      tabActive: 'bg-[#0ea5e9] text-white shadow-sm',
      tabInactive: 'text-sky-800 hover:bg-sky-500/10',
      progressColor: 'blue',
      hoverBg: 'hover:bg-sky-500/10'
    },
    bff: {
      accent: '#84cc16',
      bgAccent: 'bg-[#84cc16]',
      textAccent: 'text-[#84cc16]',
      borderAccent: 'border-lime-500/40',
      ringAccent: 'ring-[#84cc16]/20',
      gradient: 'from-lime-500 to-green-600',
      badgeBg: 'bg-lime-500/10 text-lime-800 border-lime-500/20 backdrop-blur-sm',
      tabActive: 'bg-[#84cc16] text-white shadow-sm',
      tabInactive: 'text-lime-800 hover:bg-lime-500/10',
      progressColor: 'green',
      hoverBg: 'hover:bg-lime-500/10'
    },
    bizz: {
      accent: '#0d9488',
      bgAccent: 'bg-[#0d9488]',
      textAccent: 'text-[#0d9488]',
      borderAccent: 'border-teal-500/40',
      ringAccent: 'ring-[#0d9488]/20',
      gradient: 'from-teal-600 to-emerald-700',
      badgeBg: 'bg-teal-500/10 text-teal-800 border-teal-500/20 backdrop-blur-sm',
      tabActive: 'bg-[#0d9488] text-white shadow-sm',
      tabInactive: 'text-teal-800 hover:bg-teal-500/10',
      progressColor: 'teal',
      hoverBg: 'hover:bg-teal-500/10'
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
      case 'maxim':
        return [
          { name: 'Cozy Connector', desc: 'Attended 5 cozy venue mixers', icon: '☕', status: 'unlocked' },
          { name: 'Board Game Guild', desc: 'Host of 3 board game meetups', icon: '🎲', status: 'unlocked' },
          { name: 'First Mixer RSVP', desc: 'Completed first event checkout', icon: '🎟️', status: 'unlocked' },
          { name: 'Social Catalyst', desc: 'Contributed +100 vibe points', icon: '⚡', status: 'locked' },
          { name: 'Vayo Pathfinder', desc: 'Reach Pathfinder level status', icon: '🛡️', status: 'locked' },
          { name: 'Mega Mixer Hero', desc: 'Attend a large community gala', icon: '🎉', status: 'locked' }
        ];
      case 'sarah':
        return [
          { name: 'Design Pioneer', desc: 'Hosted 3 creative workshops', icon: '🎨', status: 'unlocked' },
          { name: 'Social Butterfly', desc: 'Connected 10+ mutual friends', icon: '🦋', status: 'unlocked' },
          { name: 'Nomad Cafe Club', desc: 'Regular Indiranagar hub visitor', icon: '🥐', status: 'unlocked' },
          { name: 'Super Connector', desc: 'Connect 3 founders together', icon: '⚡', status: 'locked' },
          { name: 'Community Host', desc: 'Host a design review panel', icon: '📣', status: 'locked' },
          { name: 'Karma Master', desc: 'Reach Voyager karma tier', icon: '🏆', status: 'locked' }
        ];
      case 'daniel':
        return [
          { name: 'Speed Runner', desc: 'Completed 10 morning runs', icon: '🏃‍♂️', status: 'unlocked' },
          { name: 'Shuttle Ace', desc: 'Winner of HSR Badminton club', icon: '🏸', status: 'unlocked' },
          { name: 'Trivia Champion', desc: 'Weekly beer & trivia winner', icon: '🍺', status: 'unlocked' },
          { name: 'Cozy Host', desc: 'Host 5 offline hub mixers', icon: '🏠', status: 'locked' },
          { name: 'Elite Pathfinder', desc: 'Earned pathfinder badge', icon: '🛡️', status: 'unlocked' },
          { name: 'Global Voyager', desc: 'Earn 1000+ Karma XP balance', icon: '🌍', status: 'locked' }
        ];
      case 'elena':
        return [
          { name: 'Art Curator', desc: 'Hosted modern art gallery tour', icon: '🖼️', status: 'unlocked' },
          { name: 'Poetry Slammer', desc: 'Contributed 5 poetry readings', icon: '✍️', status: 'unlocked' },
          { name: 'Literature Guild', desc: 'Jayanagar Book Club lead', icon: '📚', status: 'unlocked' },
          { name: 'Quiet Hub Host', desc: 'Set up low-intensity cafe event', icon: '☕', status: 'locked' },
          { name: 'Profile Guardian', desc: 'Helped verify 10 offline profiles', icon: '🛡️', status: 'locked' },
          { name: 'Voyager VIP', desc: 'VIP mixer access level', icon: '✨', status: 'unlocked' }
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const sessionEmail = localStorage.getItem("vayo_user_email");

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
            const userPersonaObj = makeUserPersona(data.user);
            setPersonas([userPersonaObj, ...basePersonas]);
            setActiveIdx(0);
            setIsUserLoaded(true);
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

  const theme = modeColors[activeMode] || modeColors.social;

  return (
    <div className="min-h-screen relative overflow-hidden text-[#1f2937] font-sans antialiased py-12 px-4 md:px-8 lg:px-12 selection:bg-sky-100">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>

      {/* Background Image */}
      <img
        src="/assets/new_bg.jpg"
        alt="Background"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Overlay Sheet for readability & depth */}
      <div className="fixed inset-0 bg-[#f8f9fa]/20 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181b]/95 backdrop-blur-md text-white text-xs font-bold px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          <span>{showToast}</span>
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
            <a href="/" className="px-4 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-bold rounded-xl transition-all shadow-sm">
              Sign In / Apply ↗
            </a>
          </div>
        )}

        {/* ================= HEADER BAR ================= */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border border-white/50 bg-white/30 backdrop-blur-md rounded-3xl py-3 px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] mb-6 gap-4">

          {/* Left Side: Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="text-neutral-800 flex items-center">
              <img src="/assets/vayo-logo.png" className="h-7 w-auto select-none" alt="VAYO" />
              <span className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full inline-block animate-pulse ml-1" />
            </div>
            <span className="text-[8.5px] text-neutral-400 font-bold uppercase tracking-wider hidden sm:block border-l border-neutral-300 pl-3 leading-none h-3 flex items-center mt-1">
              Community Hub
            </span>
          </div>

          {/* Center Side: Mode Switcher */}
          <div className="flex bg-white/25 backdrop-blur-sm p-1 rounded-full border border-white/30 shadow-sm gap-1 self-center">
            {(['social', 'bff', 'bizz']).map(mode => {
              const isActive = activeMode === mode;
              const modeTheme = modeColors[mode];
              return (
                <button
                  key={mode}
                  onClick={() => {
                    setActiveMode(mode);
                    triggerToast(`Switched to ${mode === 'bizz' ? 'Bizz' : mode === 'bff' ? 'BFF' : 'Social'} Mode!`);
                  }}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-full transition-all duration-300 cursor-pointer ${isActive
                    ? `${modeTheme.bgAccent} text-white shadow-sm scale-[1.02]`
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/40'
                    }`}
                >
                  {mode === 'bizz' ? 'Bizz (Work)' : mode === 'bff' ? 'BFF (Hobbies)' : 'Social (Vibe)'}
                </button>
              );
            })}
          </div>

          {/* Right Side: Icons + Persona Switcher */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <button
                onClick={() => triggerToast("You have 0 new notifications")}
                className="p-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/40 text-neutral-600 hover:text-neutral-800 transition-colors shadow-sm relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              </button>

              {/* Settings Gear */}
              <button
                onClick={() => triggerToast("App settings opened!")}
                className="p-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/40 text-neutral-600 hover:text-neutral-800 transition-colors shadow-sm cursor-pointer"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Persona Switchers */}
            <div className="flex items-center gap-1.5 border-l border-white/30 pl-3">
              {personas.map((p, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveIdx(idx);
                      triggerToast(`Switched profile to ${p.name}!`);
                    }}
                    className={`relative w-8 h-8 rounded-full overflow-hidden transition-all duration-300 border bg-neutral-900 cursor-pointer ${isActive
                      ? 'border-[#0ea5e9] ring-2 ring-[#0ea5e9]/20 scale-105 shadow-sm'
                      : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
                      }`}
                    title={p.name}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className={`w-full h-full object-cover ${!isActive && 'grayscale brightness-90'}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* ================= MAIN CONTAINER CARD WITH SUB-HEADER ================= */}
        <div className="bg-white/30 backdrop-blur-md rounded-[32px] border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] overflow-hidden mb-12">

          {/* Card Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/30 bg-white/10">
            {/* Top Left Icon */}
            <div className="w-6 h-6 rounded bg-white/30 flex items-center justify-center text-neutral-600/70 border border-white/20">
              <LayoutGrid className="w-3.5 h-3.5" />
            </div>

            {/* Subheader Title */}
            <h2 className="text-sm font-extrabold text-neutral-800 tracking-wider uppercase">Profile</h2>

            {/* Top Right Icon */}
            <div className="w-6 h-6 rounded bg-white/30 flex items-center justify-center text-neutral-600/70 border border-white/20">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Two-Column Grid Layout */}
          <div className="grid md:grid-cols-[240px_1fr] gap-6 p-6">

            {/* ================= LEFT SIDEBAR NAVIGATION ================= */}
            <aside className="space-y-2">
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-1">

                {/* Menu: Vibe Profile */}
                <button
                  onClick={() => setActiveSidebarTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${activeSidebarTab === 'profile'
                    ? 'bg-white/80 text-neutral-800 shadow-sm border border-neutral-100/50'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/25'
                    }`}
                >
                  <User className={`w-4 h-4 ${activeSidebarTab === 'profile' ? theme.textAccent : 'text-neutral-400'}`} />
                  <span>Vibe Profile</span>
                </button>

                {/* Menu: Karma & Rewards */}
                <button
                  onClick={() => setActiveSidebarTab('karma')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${activeSidebarTab === 'karma'
                    ? 'bg-white/80 text-neutral-800 shadow-sm border border-neutral-100/50'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/25'
                    }`}
                >
                  <Award className={`w-4 h-4 ${activeSidebarTab === 'karma' ? theme.textAccent : 'text-neutral-400'}`} />
                  <span>Karma & Rewards</span>
                </button>

                {/* Menu: My Circle */}
                <button
                  onClick={() => setActiveSidebarTab('circle')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${activeSidebarTab === 'circle'
                    ? 'bg-white/80 text-neutral-800 shadow-sm border border-neutral-100/50'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/25'
                    }`}
                >
                  <Users className={`w-4 h-4 ${activeSidebarTab === 'circle' ? theme.textAccent : 'text-neutral-400'}`} />
                  <span>My Circle</span>
                </button>

                {/* Menu: Mixer Center */}
                <button
                  onClick={() => setActiveSidebarTab('mixers')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${activeSidebarTab === 'mixers'
                    ? 'bg-white/80 text-neutral-800 shadow-sm border border-neutral-100/50'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/25'
                    }`}
                >
                  <Calendar className={`w-4 h-4 ${activeSidebarTab === 'mixers' ? theme.textAccent : 'text-neutral-400'}`} />
                  <span>Mixer Center</span>
                </button>

                {/* Menu: Captured Moments */}
                <button
                  onClick={() => setActiveSidebarTab('moments')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${activeSidebarTab === 'moments'
                    ? 'bg-white/80 text-neutral-800 shadow-sm border border-neutral-100/50'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/25'
                    }`}
                >
                  <Sparkles className={`w-4 h-4 ${activeSidebarTab === 'moments' ? theme.textAccent : 'text-neutral-400'}`} />
                  <span>Captured Moments</span>
                </button>

                {/* Divider */}
                <div className="border-t border-white/20 my-2" />

                {/* Logout Button */}
                <button
                  onClick={() => {
                    localStorage.removeItem("vayo_user_email");
                    triggerToast("Logged out successfully");
                    setTimeout(() => {
                      window.location.href = "/";
                    }, 500);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-500/80 hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  <span>Log out</span>
                </button>

              </div>
            </aside>

            {/* ================= RIGHT MAIN CONTENT PANEL ================= */}
            <main className="bg-white border border-white/40 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col min-h-[500px]">

              {/* Main Panel Header */}
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-600">
                    {activeSidebarTab === 'profile' && <User className="w-4 h-4" />}
                    {activeSidebarTab === 'karma' && <Award className="w-4 h-4" />}
                    {activeSidebarTab === 'circle' && <Users className="w-4 h-4" />}
                    {activeSidebarTab === 'mixers' && <Calendar className="w-4 h-4" />}
                    {activeSidebarTab === 'moments' && <Sparkles className="w-4 h-4" />}
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight">
                    {activeSidebarTab === 'profile' && 'Profile Details'}
                    {activeSidebarTab === 'karma' && 'Karma & Rewards Progression'}
                    {activeSidebarTab === 'circle' && 'My Circle Connections'}
                    {activeSidebarTab === 'mixers' && 'Mixer Center & Tickets'}
                    {activeSidebarTab === 'moments' && 'Event Captured Moments'}
                  </h3>
                </div>

                <button
                  onClick={() => triggerToast(`Edit Mode is disabled for demo/waitlist profiles`)}
                  className="flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all hover:bg-neutral-50 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                  <span>Edit</span>
                </button>
              </div>

              {/* Main Panel Body */}
              <div className="p-6 flex-1">

                {/* ----------------- VIEW: PROFILE DETAILS ----------------- */}
                {activeSidebarTab === 'profile' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* About section: avatar left, details right */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      {/* Left side circular avatar */}
                      <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-neutral-100 bg-neutral-900 shadow-md shrink-0">
                        <img src={currentPersona.image} alt={currentPersona.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Right side info details */}
                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <div className="flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start">
                          <h4 className="text-xl font-extrabold text-neutral-800 tracking-tight">
                            {currentPersona.name}, {currentPersona.age}
                          </h4>
                          <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Active
                          </span>
                        </div>

                        {/* Sub details */}
                        <div className="text-xs text-neutral-500 space-y-1">
                          <div>+91 9845{(currentPersona.id === 'user-profile' ? '5 5283' : currentPersona.id === 'maxim' ? '0 1202' : currentPersona.id === 'sarah' ? '1 3495' : currentPersona.id === 'daniel' ? '2 8593' : '3 9204')}</div>
                          <div className="text-sky-600 font-semibold hover:underline cursor-pointer">{currentPersona.name.toLowerCase().replace(/\s+/g, '')}@vayo.community</div>
                          <div className="flex items-center justify-center sm:justify-start gap-1 text-neutral-400">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{currentPersona.location}</span>
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-xs text-neutral-600 italic font-medium pt-1 max-w-xl">
                          &ldquo;{activeMode === 'social' ? currentPersona.socialBio : activeMode === 'bff' ? currentPersona.bffBio : currentPersona.bizzBio}&rdquo;
                        </p>
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Internal Info (3 column Grid) */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Internal Status</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
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

                        <div>
                          <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Source / Verification</div>
                          <div className="text-xs font-bold text-neutral-700 mt-0.5 flex items-center gap-1 justify-center sm:justify-start">
                            {currentPersona.selfieVerified && <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline shrink-0" />}
                            <span>{currentPersona.selfieVerified ? 'Selfie Verified' : 'Standard'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Community Badges Matrix */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-4">Community Badges & Milestones</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getBadgesForPersona(currentPersona.id).map((badge, idx) => {
                          const isUnlocked = badge.status === 'unlocked';
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                if (isUnlocked) {
                                  triggerToast(`Badge Unlocked: ${badge.name}! "${badge.desc}"`);
                                } else {
                                  triggerToast(`Badge Locked: Complete requirements to unlock this milestone!`);
                                }
                              }}
                              className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 cursor-pointer hover:-translate-y-0.5 select-none ${isUnlocked
                                  ? 'bg-neutral-50/70 border-neutral-200/60 hover:bg-neutral-50 hover:border-neutral-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]'
                                  : 'bg-neutral-50/30 border-neutral-100/50 opacity-40 hover:opacity-50'
                                }`}
                            >
                              <div className="w-11 h-11 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-xl shadow-sm shrink-0">
                                {badge.icon}
                              </div>
                              <div className="leading-tight flex-1 min-w-0">
                                <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                                  <span className="truncate">{badge.name}</span>
                                  {isUnlocked ? (
                                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[8px] font-extrabold border border-emerald-500/20 shrink-0" title="Unlocked">✓</span>
                                  ) : (
                                    <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                  )}
                                </div>
                                <p className="text-[10px] text-neutral-400 font-medium mt-0.5 leading-normal truncate" title={badge.desc}>
                                  {badge.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Professional details (only visible in Bizz mode) */}
                    {activeMode === 'bizz' && currentPersona.bizzRole && (
                      <>
                        <hr className="border-neutral-100" />
                        <div>
                          <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Professional Connection Details</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                            <div>
                              <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Professional Role</div>
                              <div className="text-xs font-bold text-neutral-700 mt-0.5 leading-relaxed">{currentPersona.bizzRole}</div>
                            </div>
                            <div>
                              <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Company</div>
                              <div className="text-xs font-bold text-neutral-700 mt-0.5 leading-relaxed">{currentPersona.bizzCompany}</div>
                            </div>
                            <div>
                              <div className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Collaboration Match</div>
                              <div className="text-xs font-bold text-teal-600 mt-0.5 leading-relaxed flex items-center gap-1 justify-center sm:justify-start">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>High Match</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

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

                  </div>
                )}

                {/* ----------------- VIEW: KARMA & PROGRESSION ----------------- */}
                {activeSidebarTab === 'karma' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* XP Overview Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-neutral-50/70 border border-neutral-100 rounded-2xl p-4 flex flex-col">
                        <span className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">XP Balance</span>
                        <span className="text-3xl font-extrabold text-neutral-800 tracking-tight mt-1">{currentPersona.karmaBalance}</span>
                      </div>

                      <div className="bg-neutral-50/70 border border-neutral-100 rounded-2xl p-4 flex flex-col">
                        <span className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Karma Tier</span>
                        <span className="text-lg font-extrabold text-neutral-700 mt-2 flex items-center gap-1.5">
                          <Award className={`w-5 h-5 ${theme.textAccent}`} />
                          {currentPersona.karmaTier}
                        </span>
                      </div>

                      <div className="bg-neutral-50/70 border border-neutral-100 rounded-2xl p-4 flex flex-col">
                        <span className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">Level Progress</span>
                        <span className="text-lg font-extrabold text-neutral-700 mt-2">{currentPersona.karmaPercentage}%</span>
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Progress Bar & Tier info */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Progression & Perks</h5>
                      <SegmentedProgress percentage={currentPersona.karmaPercentage} color={theme.progressColor} />
                      <p className="text-xs text-neutral-500 leading-relaxed font-normal mt-2.5 max-w-xl">
                        {currentPersona.karmaTier === 'Explorer' && 'Explorer Tier: Unlocks basic direct messaging, group chat RSVP capabilities, and offline community entry.'}
                        {currentPersona.karmaTier === 'Pathfinder' && 'Pathfinder Tier: Unlocks 24-hour priority ticket booking window for hot mixers, special venue perks, and host support badge status.'}
                        {currentPersona.karmaTier === 'Voyager' && 'Voyager Tier: Unlocks invite-only premium VIP mixers, private dining access, voting rights on community mixers, and VIP support.'}
                      </p>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Activity Breakdown */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Karma Activity Breakdown</h5>
                      <div className="space-y-2 max-w-md">
                        <div className="flex justify-between text-xs p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
                          <span className="text-neutral-500 font-medium">Attended Mixers (+10 XP)</span>
                          <span className="font-bold text-neutral-700">+{currentPersona.karmaBreakdown.attendedMixers} XP</span>
                        </div>
                        <div className="flex justify-between text-xs p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
                          <span className="text-neutral-500 font-medium">Moment Contributor (+15 XP)</span>
                          <span className="font-bold text-neutral-700">+{currentPersona.karmaBreakdown.momentContributor} XP</span>
                        </div>
                        <div className="flex justify-between text-xs p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
                          <span className="text-neutral-500 font-medium">Vibe Leader (+20 XP)</span>
                          <span className="font-bold text-neutral-700">+{currentPersona.karmaBreakdown.vibeLeader} XP</span>
                        </div>
                        <div className="flex justify-between text-xs p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
                          <span className="text-neutral-500 font-medium">Host Support (+50 XP)</span>
                          <span className="font-bold text-neutral-700">+{currentPersona.karmaBreakdown.hostSupport} XP</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* ----------------- VIEW: MY CIRCLE ----------------- */}
                {activeSidebarTab === 'circle' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Circle tab selectors */}
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest">My Circle Hub</h5>
                      <div className="flex bg-neutral-100 p-0.5 rounded-lg text-[10.5px] font-bold border border-neutral-200">
                        <button
                          onClick={() => setActiveTabCircle('squads')}
                          className={`px-3 py-1 rounded-md cursor-pointer transition-all ${activeTabCircle === 'squads' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                          Squads
                        </button>
                        <button
                          onClick={() => setActiveTabCircle('connections')}
                          className={`px-3 py-1 rounded-md cursor-pointer transition-all ${activeTabCircle === 'connections' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                          Offline Met
                        </button>
                      </div>
                    </div>

                    {/* Circle list renderer */}
                    {activeTabCircle === 'squads' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentPersona.bffCrew.map((squad, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/60 border border-neutral-100 hover:border-neutral-200 transition-colors">
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-neutral-800">{squad.name}</div>
                              <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{squad.type}</div>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-600 bg-white border border-neutral-200 px-3 py-1 rounded-full shadow-sm">
                              {squad.members} members
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 max-w-lg">
                        {currentPersona.connectionsMet.map((conn, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50/60 border border-neutral-100 hover:border-neutral-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <img src={conn.avatar} alt={conn.name} className="w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-sm shrink-0" />
                              <div className="leading-tight">
                                <div className="text-xs font-bold text-neutral-800">{conn.name}</div>
                                <div className="text-[9.5px] text-neutral-400 font-medium">{conn.role}</div>
                                <div className="text-[9.5px] text-[#0ea5e9] font-bold mt-0.5">{conn.mutualFriends} mutual friends</div>
                              </div>
                            </div>

                            <button
                              onClick={() => triggerToast(`Opened direct message thread with ${conn.name}!`)}
                              className="p-2 rounded-xl border border-neutral-200 text-neutral-500 bg-white hover:text-neutral-800 hover:bg-neutral-50 cursor-pointer shadow-sm transition-colors"
                              title="Direct Message"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}

                {/* ----------------- VIEW: MIXER CENTER ----------------- */}
                {activeSidebarTab === 'mixers' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Active Tickets */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <span>Active Tickets</span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      </h5>

                      <div className="space-y-4">
                        {currentPersona.activeTickets.map((tkt, i) => (
                          <div key={i} className="border border-neutral-200 rounded-2xl overflow-hidden flex flex-col md:flex-row bg-neutral-50/50 shadow-sm relative">
                            {/* Left Stub */}
                            <div className="flex-1 p-5 space-y-4 border-r border-dashed border-neutral-250 relative">
                              <div className="absolute right-[-6px] top-[-6px] w-3 h-3 rounded-full bg-white border border-neutral-200 hidden md:block" />
                              <div className="absolute right-[-6px] bottom-[-6px] w-3 h-3 rounded-full bg-white border border-neutral-200 hidden md:block" />

                              <div className="space-y-0.5 text-center sm:text-left">
                                <div className="text-[9px] text-[#0ea5e9] font-extrabold uppercase tracking-wider">Upcoming Mixer Ticket</div>
                                <h4 className="text-sm font-extrabold text-neutral-800 leading-snug">{tkt.name}</h4>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="space-y-0.5">
                                  <span className="text-neutral-400 font-bold block text-[9px] uppercase tracking-wider">Date & Time</span>
                                  <span className="font-bold text-neutral-700 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                    {tkt.date.split(',')[0]}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 block ml-4.5">{tkt.date.split(',')[1] || ''}</span>
                                </div>

                                <div className="space-y-0.5">
                                  <span className="text-neutral-400 font-bold block text-[9px] uppercase tracking-wider">Venue Location</span>
                                  <span className="font-bold text-neutral-700 flex items-center gap-1 max-w-[170px] truncate" title={tkt.locationPin}>
                                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                                    {tkt.locationPin}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs pt-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 rounded-full bg-neutral-200 border border-neutral-350 flex items-center justify-center text-[9px] font-bold text-neutral-600 uppercase">
                                    {tkt.organizer.charAt(0)}
                                  </div>
                                  <div className="leading-tight">
                                    <span className="text-[8.5px] text-neutral-400 block">Host Organizer</span>
                                    <span className="font-bold text-neutral-700">{tkt.organizer}</span>
                                  </div>
                                </div>

                                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-white">
                                  {tkt.countdown}
                                </span>
                              </div>
                            </div>

                            {/* Right Stub (QR Code) */}
                            <div className="w-full md:w-[130px] p-4 flex flex-col items-center justify-center bg-white shrink-0 border-l border-neutral-100">
                              <div className="p-1 border border-neutral-200 rounded-lg shadow-sm bg-neutral-50/50">
                                <svg className="w-16 h-16 text-neutral-800" viewBox="0 0 100 100">
                                  <rect width="100" height="100" fill="none" />
                                  <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                                  <rect x="5" y="5" width="20" height="20" fill="white" />
                                  <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                                  <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                                  <rect x="75" y="5" width="20" height="20" fill="white" />
                                  <rect x="80" y="10" width="10" height="10" fill="currentColor" />
                                  <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                                  <rect x="5" y="75" width="20" height="20" fill="white" />
                                  <rect x="10" y="80" width="10" height="10" fill="currentColor" />
                                  <rect x="40" y="10" width="10" height="25" fill="currentColor" />
                                  <rect x="50" y="5" width="10" height="10" fill="currentColor" />
                                  <rect x="45" y="45" width="15" height="15" fill="currentColor" />
                                  <rect x="15" y="45" width="15" height="15" fill="currentColor" />
                                  <rect x="70" y="45" width="20" height="15" fill="currentColor" />
                                  <rect x="45" y="75" width="15" height="15" fill="currentColor" />
                                  <rect x="75" y="75" width="15" height="15" fill="currentColor" />
                                </svg>
                              </div>
                              <span className="text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mt-2">
                                {tkt.qrCode}
                              </span>
                              <button
                                onClick={() => triggerToast(`Showing full-screen ticket layout for verification!`)}
                                className={`mt-1.5 text-[9px] font-bold ${theme.textAccent} hover:underline cursor-pointer`}
                              >
                                Show Full QR
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Applications status tracker */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Application Status Tracker</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentPersona.pendingApplications.map((app, i) => (
                          <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-150 bg-neutral-50/50 shadow-sm">
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-neutral-800 truncate max-w-[160px]" title={app.name}>{app.name}</div>
                              <div className="text-[9.5px] text-neutral-400 font-semibold">{app.date.split(',')[0]}</div>
                            </div>

                            <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${app.status.includes('Approved')
                              ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20'
                              : app.status === 'Applied'
                                ? 'bg-amber-500/10 text-amber-800 border-amber-500/20'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                              }`}>
                              {app.status === 'Approved & Ticket Generated' ? 'Approved' : app.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* Past Mixer activity timeline */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Past Mixer Activity Timeline</h5>
                      <div className="relative border-l border-neutral-200 ml-2 pl-4 space-y-4">
                        {currentPersona.pastTimeline.map((past, i) => (
                          <div key={i} className="relative">
                            <span className={`absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full border border-white ${theme.bgAccent} shadow-sm`} />

                            <div className="leading-tight">
                              <span className="text-[9px] font-bold text-neutral-400 block">{past.date}</span>
                              <div className="text-xs font-extrabold text-neutral-800">{past.name}</div>
                              <div className="flex gap-2 text-[9.5px] text-neutral-400 font-semibold mt-0.5">
                                <span>{past.category}</span>
                                <span>•</span>
                                <span className="text-[#0ea5e9]">Met {past.friendsMet} connections</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* ----------------- VIEW: CAPTURED MOMENTS ----------------- */}
                {activeSidebarTab === 'moments' && (
                  <div className="space-y-6 animate-fade-in">

                    {/* Gallery Stream */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Event Photo Stream</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {personaMoments.map((mom, i) => (
                          <div
                            key={i}
                            className="relative aspect-video rounded-2xl overflow-hidden border border-neutral-200 group shadow-sm bg-neutral-900"
                          >
                            <div className={`w-full h-full bg-gradient-to-br ${mom.imageColor} opacity-85 group-hover:scale-105 transition-transform duration-500 flex flex-col justify-center items-center text-white/30 p-4`}>
                              <svg className="w-8 h-8 opacity-30 group-hover:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              <span className="text-[9.5px] font-bold tracking-wider uppercase mt-1 opacity-50">{mom.date}</span>
                            </div>

                            <div className="absolute top-2.5 left-2.5 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/10">
                              <MapPin className="w-3 h-3 text-white" />
                              {mom.location}
                            </div>

                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6">
                              <p className="text-white text-xs font-semibold leading-snug drop-shadow-sm">
                                {mom.caption}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr className="border-neutral-100" />

                    {/* File Upload Zone */}
                    <div>
                      <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Upload Moments</h5>
                      <div
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 relative ${dragActive
                          ? `${theme.borderAccent} bg-neutral-50/50`
                          : 'border-neutral-200 bg-neutral-50/30 hover:border-neutral-300 hover:bg-neutral-50/50'
                          }`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="moment-file-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />

                        <label htmlFor="moment-file-upload" className="cursor-pointer block space-y-2.5">
                          {uploading ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-bold text-neutral-600">Uploading moment image...</span>
                              </div>

                              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden max-w-xs mx-auto border border-neutral-300">
                                <div
                                  className={`h-full ${theme.bgAccent} transition-all duration-150`}
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-neutral-400 block font-bold">{uploadProgress}% uploaded</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${theme.badgeBg}`}>
                                  <Upload className="w-4.5 h-4.5" />
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

              </div>
            </main>

          </div>
        </div>
        <div className="border-t border-white/30 w-full pt-4 mb-16" />

      </div>
    </div>
  );
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
