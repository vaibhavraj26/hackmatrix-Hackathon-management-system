const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Hackathon = require('./models/Hackathon');
const Team = require('./models/Team');
const Submission = require('./models/Submission');
const Review = require('./models/Review');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Clearing database...');
    await User.deleteMany({});
    await Hackathon.deleteMany({});
    await Team.deleteMany({});
    await Submission.deleteMany({});
    await Review.deleteMany({});

    console.log('Seeding Users...');
    
    // Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@hackmatrix.com',
      password: 'password123',
      role: 'admin',
      profile: {
        bio: 'Chief Platform Administrator for HackMatrix.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin'
      }
    });

    // Create Organizers
    const org1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'org1@hackmatrix.com',
      password: 'password123',
      role: 'organizer',
      profile: {
        bio: 'Director of Developer Relations. Organizing AI and Web3 hackathons globally.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah'
      }
    });

    const org2 = await User.create({
      name: 'Marcus Chen',
      email: 'org2@hackmatrix.com',
      password: 'password123',
      role: 'organizer',
      profile: {
        bio: 'Hackathon Operations Lead. Focused on HealthTech and GreenTech.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus'
      }
    });

    // Create Judges
    const judge1 = await User.create({
      name: 'Dr. Evelyn Foster',
      email: 'judge1@hackmatrix.com',
      password: 'password123',
      role: 'judge',
      profile: {
        bio: 'AI researcher and venture partner.',
        techStack: ['Python', 'PyTorch', 'TensorFlow', 'LLMs'],
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Evelyn'
      }
    });

    const judge2 = await User.create({
      name: 'David Miller',
      email: 'judge2@hackmatrix.com',
      password: 'password123',
      role: 'judge',
      profile: {
        bio: 'Senior Backend Architect. Focused on security, performance, and API schemas.',
        techStack: ['Node.js', 'Go', 'Rust', 'Kubernetes'],
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=David'
      }
    });

    // Create Participants
    const part1 = await User.create({
      name: 'Alice Cooper',
      email: 'part1@hackmatrix.com',
      password: 'password123',
      role: 'participant',
      profile: {
        bio: 'Frontend engineer passionate about UX and React apps.',
        techStack: ['React.js', 'Tailwind CSS', 'Vite', 'HTML/CSS'],
        github: 'https://github.com/alicecooper',
        linkedin: 'https://linkedin.com/in/alicecooper',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alice'
      }
    });

    const part2 = await User.create({
      name: 'Bob Smith',
      email: 'part2@hackmatrix.com',
      password: 'password123',
      role: 'participant',
      profile: {
        bio: 'Fullstack node wizard who loves hackathons.',
        techStack: ['Node.js', 'Express.js', 'MongoDB', 'React'],
        github: 'https://github.com/bobsmith',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bob'
      }
    });

    const part3 = await User.create({
      name: 'Charlie Davis',
      email: 'part3@hackmatrix.com',
      password: 'password123',
      role: 'participant',
      profile: {
        bio: 'Web3 developer and Solidity expert.',
        techStack: ['Solidity', 'Ethers.js', 'Next.js', 'Tailwind'],
        github: 'https://github.com/charliedavis',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Charlie'
      }
    });

    console.log('Seeding Hackathons...');
    
    // Future Date generators
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Ongoing Hackathon (AI)
    const hack1 = await Hackathon.create({
      title: 'AI Revolution Hackathon',
      description: 'Build cutting edge products utilizing Generative AI Models, Agentic Frameworks, or LLMs to solve real-world problems. Teams will have 48 hours to complete and submit projects.',
      theme: 'AI',
      mode: 'online',
      startDate: new Date(now.getTime() - oneDay),
      endDate: new Date(now.getTime() + oneDay),
      registrationDeadline: new Date(now.getTime() - oneDay/2),
      banner: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
      prizePool: 25000,
      maxTeamSize: 4,
      rules: [
        'All code must be written during the coding phase.',
        'Use of open-source pre-trained models is allowed.',
        'Teams must submit a working demo video and repository link.'
      ],
      judgingCriteria: [
        { name: 'Innovation', maxScore: 10 },
        { name: 'Technical Complexity', maxScore: 10 },
        { name: 'User Interface', maxScore: 10 },
        { name: 'Functionality', maxScore: 10 }
      ],
      organizer: org1._id,
      judges: [judge1._id, judge2._id],
      status: 'ongoing'
    });

    // Upcoming Hackathon (Web3)
    const hack2 = await Hackathon.create({
      title: 'DeFi Builder\'s Cup',
      description: 'Build decentralized finance protocols, smart contracts, or web3 consumer products to scale global payment infrastructures.',
      theme: 'Web3',
      mode: 'offline',
      venue: 'Metropolitan Tech Hub, Hall A',
      startDate: new Date(now.getTime() + 10 * oneDay),
      endDate: new Date(now.getTime() + 12 * oneDay),
      registrationDeadline: new Date(now.getTime() + 5 * oneDay),
      banner: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
      prizePool: 15000,
      maxTeamSize: 3,
      rules: [
        'Projects must deploy on a testnet.',
        'Collaborate offline at the venue or virtually.',
        'Maximum 3 members per team.'
      ],
      judgingCriteria: [
        { name: 'Smart Contract Design', maxScore: 10 },
        { name: 'Innovation', maxScore: 10 },
        { name: 'Scalability', maxScore: 10 }
      ],
      organizer: org1._id,
      judges: [judge2._id],
      status: 'upcoming'
    });

    // Completed Hackathon (HealthTech)
    const hack3 = await Hackathon.create({
      title: 'Global HealthTech Challenge',
      description: 'Develop technical platforms to bridge communication gaps between healthcare providers, clinical researchers, and remote patients.',
      theme: 'HealthTech',
      mode: 'online',
      startDate: new Date(now.getTime() - 10 * oneDay),
      endDate: new Date(now.getTime() - 8 * oneDay),
      registrationDeadline: new Date(now.getTime() - 11 * oneDay),
      banner: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      prizePool: 10000,
      maxTeamSize: 4,
      rules: [
        'Strict HIPAA compliance if applicable.',
        'Detailed presentation PDF slides required.',
        'Open to global participants.'
      ],
      judgingCriteria: [
        { name: 'Innovation', maxScore: 10 },
        { name: 'Impact', maxScore: 10 },
        { name: 'Presentation', maxScore: 10 }
      ],
      organizer: org2._id,
      judges: [judge1._id, judge2._id],
      status: 'completed'
    });

    console.log('Seeding Teams...');
    
    // Team 1: AI Revolution - Alice & Bob
    const team1 = await Team.create({
      name: 'Neural Knights',
      hackathon: hack1._id,
      leader: part1._id,
      members: [part1._id, part2._id],
      registrationStatus: 'approved'
    });

    // Team 2: DeFi Builder's Cup - Charlie
    const team2 = await Team.create({
      name: 'Decentralized Dynamos',
      hackathon: hack2._id,
      leader: part3._id,
      members: [part3._id],
      registrationStatus: 'pending'
    });

    // Team 3: HealthTech - Alice & Bob (Registered for completed event)
    const team3 = await Team.create({
      name: 'BioCoders',
      hackathon: hack3._id,
      leader: part1._id,
      members: [part1._id, part2._id],
      registrationStatus: 'approved'
    });

    console.log('Seeding Submissions...');
    
    // Submission for Team 1
    const sub1 = await Submission.create({
      team: team1._id,
      hackathon: hack1._id,
      projectName: 'BrainWave',
      problemStatement: 'Analyzing EEG data using standard sensors is highly complex and lacks visual, real-time developer APIs.',
      solution: 'We built a React Dashboard connected to a Node.js server that translates raw neural sensor frequencies into semantic emotion classifications in real-time.',
      description: 'Features include dynamic charts, model confidence scores, and historical user telemetry storage.',
      githubUrl: 'https://github.com/alicecooper/brainwave',
      demoUrl: 'https://brainwave-demo.vercel.app',
      techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Tailwind CSS'],
      status: 'under_review'
    });

    // Submission for Team 3 (Completed event)
    const sub3 = await Submission.create({
      team: team3._id,
      hackathon: hack3._id,
      projectName: 'PulseHeart',
      problemStatement: 'Remote patients diagnosed with cardiac arrhythmias lack automated diagnostic alert systems for their local doctors.',
      solution: 'PulseHeart is a smart IoT gateway simulation connected to a cloud diagnostic API that alerts emergency responders within 3 seconds of a critical event.',
      githubUrl: 'https://github.com/alicecooper/pulseheart',
      demoUrl: 'https://pulseheart-health.com',
      techStack: ['Node.js', 'React', 'MongoDB', 'Express', 'Twilio API'],
      status: 'approved'
    });

    console.log('Seeding Reviews...');
    
    // Judge 1 reviews BrainWave
    await Review.create({
      submission: sub1._id,
      judge: judge1._id,
      scores: [
        { criterionName: 'Innovation', score: 9 },
        { criterionName: 'Technical Complexity', score: 8 },
        { criterionName: 'User Interface', score: 9 },
        { criterionName: 'Functionality', score: 8 }
      ],
      feedback: 'Excellent integration of brain telemetry and frontend visualization. Highly innovative!'
    });

    // Judge 2 reviews BrainWave
    await Review.create({
      submission: sub1._id,
      judge: judge2._id,
      scores: [
        { criterionName: 'Innovation', score: 8 },
        { criterionName: 'Technical Complexity', score: 9 },
        { criterionName: 'User Interface', score: 8 },
        { criterionName: 'Functionality', score: 8 }
      ],
      feedback: 'Very solid architectural design, backend looks extremely robust.'
    });

    // Judge 1 reviews PulseHeart
    await Review.create({
      submission: sub3._id,
      judge: judge1._id,
      scores: [
        { criterionName: 'Innovation', score: 8 },
        { criterionName: 'Impact', score: 10 },
        { criterionName: 'Presentation', score: 9 }
      ],
      feedback: 'Life-saving concept with a very clear business plan.'
    });

    // Judge 2 reviews PulseHeart
    await Review.create({
      submission: sub3._id,
      judge: judge2._id,
      scores: [
        { criterionName: 'Innovation', score: 7 },
        { criterionName: 'Impact', score: 9 },
        { criterionName: 'Presentation', score: 8 }
      ],
      feedback: 'Good implementation, code structure is very clean.'
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
