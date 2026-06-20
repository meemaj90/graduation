import { Graduate, ProgramItem, NetworkingTable, Sponsor } from '@/types'

export const graduates: Graduate[] = [
  {
    id: 'grad-001',
    name: 'Alexandra Chen',
    degree: 'Bachelor of Science in Computer Science',
    department: 'College of Engineering',
    honors: 'summa',
    bio: 'Alexandra specialized in artificial intelligence and machine learning, publishing two papers on neural network optimization during her undergraduate studies. She will be joining Google Brain as a research engineer following graduation.',
    achievements: [
      'Published 2 peer-reviewed papers in IEEE conferences',
      'First place, ACM International Collegiate Programming Contest',
      "Dean's List all 8 semesters",
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Alexandra',
    messages: [
      {
        id: 'msg-001-1',
        author: 'Dr. James Liu',
        content: 'Alexandra, your dedication to AI research has been truly inspiring. Watching you grow from a curious freshman into a published researcher has been the highlight of my career. Congratulations!',
        timestamp: '2026-07-14T09:30:00',
      },
      {
        id: 'msg-001-2',
        author: 'Mom & Dad Chen',
        content: 'We are so incredibly proud of you, Lexi. All those late nights and early mornings paid off. You have shown us all what hard work and passion can achieve. We love you!',
        timestamp: '2026-07-14T11:15:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/alexandra-chen',
      twitter: 'https://twitter.com/alexchen_ai',
      website: 'https://alexandrachen.dev',
    },
  },
  {
    id: 'grad-002',
    name: 'Marcus Williams',
    degree: 'Bachelor of Business Administration',
    department: 'College of Business',
    honors: 'magna',
    bio: 'Marcus founded a campus startup during his sophomore year that grew to serve over 500 local businesses, earning him recognition in Forbes 30 Under 30 Education list. He is passionate about social entrepreneurship and sustainable business practices.',
    achievements: [
      'Founded LocalBiz Connect, serving 500+ businesses',
      'Forbes 30 Under 30 Education honoree',
      'President, Entrepreneurship Club (3 years)',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Marcus',
    messages: [
      {
        id: 'msg-002-1',
        author: 'Prof. Sandra Torres',
        content: 'Marcus, you embody what business leadership should look like in the 21st century. Your ability to combine profit with purpose is rare and remarkable. The business world is lucky to have you.',
        timestamp: '2026-07-14T10:00:00',
      },
      {
        id: 'msg-002-2',
        author: 'The Entrepreneurship Club',
        content: 'To our fearless president — you built something special here. The club will never be the same without your energy and vision. Go out and change the world, Marcus!',
        timestamp: '2026-07-14T14:20:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/marcus-williams-biz',
      website: 'https://localbizconnect.com',
    },
  },
  {
    id: 'grad-003',
    name: 'Priya Patel',
    degree: 'Bachelor of Science in Biomedical Engineering',
    department: 'College of Engineering',
    honors: 'summa',
    bio: 'Priya conducted groundbreaking research on low-cost diagnostic devices for underserved communities, winning the Gates Grand Challenges Student Award. She has been accepted into Johns Hopkins School of Medicine.',
    achievements: [
      'Gates Grand Challenges Student Award winner',
      'Designed low-cost malaria diagnostic device deployed in 3 countries',
      'NIH Undergraduate Research Fellowship recipient',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Priya',
    messages: [
      {
        id: 'msg-003-1',
        author: 'Dr. Rachel Kim',
        content: 'Priya, your work on accessible diagnostics will save real lives. I have never had a student who combined technical brilliance with such deep humanitarian commitment. Johns Hopkins does not know how lucky they are!',
        timestamp: '2026-07-13T16:45:00',
      },
      {
        id: 'msg-003-2',
        author: 'Auntie Meena',
        content: 'From the little girl who used to take apart every toy to see how it worked — look at you now, saving lives with your inventions. Our whole family in Gujarat is celebrating with you today. Jai Ho!',
        timestamp: '2026-07-14T08:00:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/priya-patel-bme',
      twitter: 'https://twitter.com/priyapatel_med',
    },
  },
  {
    id: 'grad-004',
    name: 'Jordan Taylor',
    degree: 'Bachelor of Arts in Political Science',
    department: 'College of Liberal Arts',
    bio: 'Jordan served as student body president for two consecutive terms and led a successful campaign to make the university carbon-neutral by 2030. They are heading to Washington D.C. to work for a U.S. Senate office.',
    achievements: [
      'Student Body President (2 terms)',
      'Led university carbon-neutral initiative',
      'Truman Scholarship recipient',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Jordan',
    messages: [
      {
        id: 'msg-004-1',
        author: 'President Margaret Walsh',
        content: 'Jordan, you have been an extraordinary student leader. Your carbon-neutral initiative will be your legacy at this institution long after you have moved on to even greater things. We are so proud.',
        timestamp: '2026-07-14T09:00:00',
      },
      {
        id: 'msg-004-2',
        author: 'The Student Senate',
        content: 'Four years of fighting for students, for the planet, for justice. You showed us all that one person really can change things. Thank you, President Jordan. Washington better watch out!',
        timestamp: '2026-07-14T13:30:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/jordan-taylor-polisci',
      twitter: 'https://twitter.com/jordantaylor_dc',
    },
  },
  {
    id: 'grad-005',
    name: 'Sofia Ramirez',
    degree: 'Bachelor of Fine Arts in Graphic Design',
    department: 'College of Arts',
    honors: 'cum',
    bio: "Sofia's senior thesis collection \"Borders & Belonging\" received national attention, being featured in PRINT Magazine and the AIGA Student Show. She has accepted a creative director position at a leading agency in New York City.",
    achievements: [
      'AIGA Student Show featured artist',
      'PRINT Magazine "Students to Watch" 2026',
      'Adobe Design Achievement Award finalist',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Sofia',
    messages: [
      {
        id: 'msg-005-1',
        author: 'Prof. David Nguyen',
        content: 'Sofia, "Borders & Belonging" moved me to tears when I first saw it. You have a rare gift — you make people feel seen through your art. New York is going to fall in love with you.',
        timestamp: '2026-07-14T10:45:00',
      },
      {
        id: 'msg-005-2',
        author: 'Grandma Rosa',
        content: "Mi amor, tu abuelo y yo te vemos desde arriba con tanto orgullo. You used your art to tell our family's story and the world listened. Go shine in New York, mija!",
        timestamp: '2026-07-14T07:30:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sofia-ramirez-design',
      website: 'https://sofiaramirez.design',
    },
  },
  {
    id: 'grad-006',
    name: 'Ethan Park',
    degree: 'Bachelor of Science in Electrical Engineering',
    department: 'College of Engineering',
    honors: 'magna',
    bio: 'Ethan developed a patent-pending wireless charging system for electric vehicles during his senior capstone, working directly with Tesla engineers as mentors. He will be pursuing a Ph.D. at MIT in Electrical Engineering and Computer Science.',
    achievements: [
      'Patent-pending wireless EV charging system',
      'Tesla Engineering Mentorship Program',
      'IEEE Outstanding Student Award',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Ethan',
    messages: [
      {
        id: 'msg-006-1',
        author: 'Dr. Yuki Tanaka',
        content: 'Ethan, you tackled a problem that entire R&D teams struggle with and solved it in a single year. MIT has an exceptional student coming their way. Keep pushing boundaries!',
        timestamp: '2026-07-13T15:00:00',
      },
      {
        id: 'msg-006-2',
        author: 'The Park Family',
        content: 'From building circuits at age 8 to MIT at 22. You never stopped dreaming big, and we never stopped believing in you. We are beyond proud, son.',
        timestamp: '2026-07-14T06:45:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/ethan-park-ee',
    },
  },
  {
    id: 'grad-007',
    name: 'Amara Okonkwo',
    degree: 'Bachelor of Science in Environmental Science',
    department: 'College of Natural Sciences',
    honors: 'summa',
    bio: "Amara's research on microplastic filtration in West African river systems was published in Nature's Environmental Science journal, making her one of the youngest researchers published in the journal. She will lead a NOAA climate research fellowship.",
    achievements: [
      'Published in Nature Environmental Science at age 21',
      'NOAA Climate Research Fellowship 2026',
      'United Nations Youth Climate Summit delegate',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Amara',
    messages: [
      {
        id: 'msg-007-1',
        author: 'Dr. Christine Adeyemi',
        content: 'Amara, you are the kind of scientist the world desperately needs right now. Your work is not just academically excellent — it matters. I cannot wait to see what you do with that NOAA fellowship.',
        timestamp: '2026-07-14T11:00:00',
      },
      {
        id: 'msg-007-2',
        author: 'Nigerian Environmental Society',
        content: 'You have made us all so proud. By studying the rivers of home from an American university, you showed that distance never separates us from our roots. Come back and help us build a greener Nigeria!',
        timestamp: '2026-07-14T12:00:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/amara-okonkwo',
      twitter: 'https://twitter.com/amara_enviro',
    },
  },
  {
    id: 'grad-008',
    name: "Liam O'Brien",
    degree: 'Bachelor of Science in Finance',
    department: 'College of Business',
    bio: "Liam managed the university's student investment fund, generating a 23% return over two years against a 12% benchmark. He interned at Goldman Sachs for two consecutive summers and has accepted a full-time analyst position there.",
    achievements: [
      '23% return managing $2M student investment fund',
      'Goldman Sachs summer analyst (2 years)',
      'CFA Level I passed as an undergraduate',
    ],
    photoUrl: "https://api.dicebear.com/8.x/personas/svg?seed=Liam",
    messages: [
      {
        id: 'msg-008-1',
        author: 'Prof. Harold Stone',
        content: 'Liam, you treated that student fund with the same seriousness as seasoned portfolio managers. Your instincts for markets are extraordinary. Goldman is getting a future partner — I am sure of it.',
        timestamp: '2026-07-14T09:15:00',
      },
      {
        id: 'msg-008-2',
        author: 'Investment Fund Team',
        content: 'The fund was never just about the returns — it was about the lessons you taught us about discipline, patience, and integrity. Thanks for being the best mentor we could have asked for. Slainte!',
        timestamp: '2026-07-14T14:00:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/liam-obrien-finance',
    },
  },
  {
    id: 'grad-009',
    name: 'Mei-Ling Zhang',
    degree: 'Bachelor of Science in Computer Science',
    department: 'College of Engineering',
    honors: 'magna',
    bio: 'Mei-Ling built an award-winning open-source accessibility toolkit used by over 10,000 developers worldwide to make web applications more inclusive for users with disabilities. She joins Microsoft\'s Accessibility Team this fall.',
    achievements: [
      'Open-source accessibility toolkit with 10,000+ users',
      'Google Anita Borg Memorial Scholarship',
      'Best Senior Project, College of Engineering',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=MeiLing',
    messages: [
      {
        id: 'msg-009-1',
        author: 'Dr. Patricia Moss',
        content: 'Mei-Ling, you built technology that genuinely changes daily life for people with disabilities. That is the highest form of engineering — building for everyone. Microsoft is a perfect fit for your mission.',
        timestamp: '2026-07-14T10:30:00',
      },
      {
        id: 'msg-009-2',
        author: 'Zhang Family',
        content: 'You always told us you wanted to help people with your computer skills. You did exactly that. We are so proud of you, Mei-Ling!',
        timestamp: '2026-07-14T08:30:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/meiling-zhang',
    },
  },
  {
    id: 'grad-010',
    name: 'Daniel Reyes',
    degree: 'Bachelor of Arts in Psychology',
    department: 'College of Liberal Arts',
    honors: 'cum',
    bio: 'Daniel conducted a longitudinal study on first-generation college student mental health, presenting his findings at the American Psychological Association annual conference. He is pursuing a Psy.D. at the University of Michigan.',
    achievements: [
      'APA Annual Conference presenter',
      'First-generation college student mental health study published',
      'Campus Counseling Center peer counselor (4 years)',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Daniel',
    messages: [
      {
        id: 'msg-010-1',
        author: 'Dr. Elaine Foster',
        content: 'Daniel, your research matters because you lived it. As a first-generation student yourself, you brought authenticity and empathy to your work that no textbook could teach. Ann Arbor is very lucky.',
        timestamp: '2026-07-13T17:00:00',
      },
      {
        id: 'msg-010-2',
        author: 'Mama y Papa',
        content: 'We crossed borders so you could have opportunities we never had. Today, watching you graduate with honors and head to graduate school — every sacrifice was worth it a thousand times over. Te amamos, mijo.',
        timestamp: '2026-07-14T07:00:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/daniel-reyes-psych',
    },
  },
  {
    id: 'grad-011',
    name: 'Isabelle Fontaine',
    degree: 'Bachelor of Science in Data Science',
    department: 'College of Engineering',
    honors: 'summa',
    bio: 'Isabelle developed a predictive model for hospital readmission rates that was adopted by two regional hospital networks, potentially preventing thousands of readmissions annually. She will be joining a health-tech startup as lead data scientist.',
    achievements: [
      'Hospital readmission model adopted by 2 regional networks',
      'Kaggle Grandmaster ranking achieved during junior year',
      'National Science Foundation Graduate Fellowship',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Isabelle',
    messages: [
      {
        id: 'msg-011-1',
        author: 'Prof. Antoine Dubois',
        content: 'Isabelle, you turned numbers into lives saved. That is the most powerful application of data science I have witnessed in twenty years of teaching. I will be pointing to your work for years to come.',
        timestamp: '2026-07-14T11:30:00',
      },
      {
        id: 'msg-011-2',
        author: 'Famille Fontaine',
        content: "Ma cherie, tu nous as toujours epates. Aujourd'hui, le monde entier commence a te voir telle que tu es vraiment — extraordinaire. Nous t'aimons fort fort fort!",
        timestamp: '2026-07-14T09:00:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/isabelle-fontaine-ds',
      website: 'https://isabellefontaine.io',
    },
  },
  {
    id: 'grad-012',
    name: 'Kevin Oduya',
    degree: 'Bachelor of Science in Mechanical Engineering',
    department: 'College of Engineering',
    bio: 'Kevin led a team of 12 students to win the national Formula SAE competition with a race car they designed and built from scratch. His focus on lightweight composite materials earned him a full scholarship to Stanford\'s graduate engineering program.',
    achievements: [
      'National Formula SAE champion (team lead)',
      'Stanford Graduate Engineering full scholarship',
      'Society of Automotive Engineers scholarship recipient',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Kevin',
    messages: [
      {
        id: 'msg-012-1',
        author: 'Prof. Amelia Grant',
        content: 'Kevin, I have coached Formula SAE for fifteen years and never had a team leader like you. Your technical mastery is matched only by your ability to bring people together. Stanford is getting a gem.',
        timestamp: '2026-07-14T10:15:00',
      },
      {
        id: 'msg-012-2',
        author: 'Formula SAE Team',
        content: 'You made us believe we could build a national champion from scratch. You stayed late every night, fixed every problem, and never complained once. We would not have won without you. Go show Stanford what we are made of!',
        timestamp: '2026-07-14T15:00:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/kevin-oduya-me',
    },
  },
  {
    id: 'grad-013',
    name: 'Natasha Volkov',
    degree: 'Bachelor of Science in Mathematics',
    department: 'College of Natural Sciences',
    honors: 'summa',
    bio: 'Natasha proved a partial result on a long-standing conjecture in combinatorial graph theory as part of her senior thesis, drawing attention from top mathematics departments worldwide. She has been admitted to the Princeton mathematics doctoral program.',
    achievements: [
      'Proved partial result on Zarankiewicz problem variant',
      'Putnam Fellow (top 5 nationally, twice)',
      'Princeton Mathematics Ph.D. program admit',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Natasha',
    messages: [
      {
        id: 'msg-013-1',
        author: 'Prof. Gregory Stern',
        content: 'Natasha, you did in four years what some researchers spend a career attempting. Your mind operates at a level I encounter perhaps once a decade. Princeton will change mathematics — and you will be part of that.',
        timestamp: '2026-07-13T14:00:00',
      },
      {
        id: 'msg-013-2',
        author: 'The Volkov Family',
        content: 'Our Natasha, a professor in the making! We are so proud of you. All of Moscow knows what you have achieved. Make us proud at Princeton. We love you so much!',
        timestamp: '2026-07-14T06:00:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/natasha-volkov-math',
    },
  },
  {
    id: 'grad-014',
    name: 'Omar Hassan',
    degree: 'Bachelor of Science in Civil Engineering',
    department: 'College of Engineering',
    honors: 'cum',
    bio: "Omar spent two summers in Nairobi with Engineers Without Borders, designing a water distribution system that now serves a community of 4,000 people. He is joining AECOM's sustainable infrastructure division.",
    achievements: [
      'Engineers Without Borders — water system serving 4,000 people',
      'ASCE Outstanding Civil Engineering Student Award',
      'AECOM Diversity in Engineering Scholarship',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Omar',
    messages: [
      {
        id: 'msg-014-1',
        author: 'Dr. Fatima Al-Rashid',
        content: 'Omar, you did not wait to graduate before making an impact. You showed that engineering is not just about structures — it is about people. AECOM and the world are better for having you.',
        timestamp: '2026-07-14T11:45:00',
      },
      {
        id: 'msg-014-2',
        author: 'EWB Nairobi Community',
        content: 'Every morning when our children drink clean water, we remember the quiet young man from America who worked alongside us for two summers. You built more than pipes — you built trust. Thank you, Omar.',
        timestamp: '2026-07-14T13:00:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/omar-hassan-ce',
    },
  },
  {
    id: 'grad-015',
    name: 'Chloe Bennett',
    degree: 'Bachelor of Arts in Communications',
    department: 'College of Liberal Arts',
    bio: 'Chloe founded the campus journalism collective that broke a national story on university endowment ethics, receiving the Society of Professional Journalists Mark of Excellence Award. She begins a fellowship at The New York Times this summer.',
    achievements: [
      'SPJ Mark of Excellence Award — investigative reporting',
      'NYT Summer Fellowship recipient',
      'Founded investigative journalism collective (20 members)',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Chloe',
    messages: [
      {
        id: 'msg-015-1',
        author: 'Prof. Nina Clarke',
        content: 'Chloe, you reminded an entire campus — and a nation — why journalism matters. You did not seek fame; you sought truth. That is the rarest quality in any journalist. The Times is in good hands.',
        timestamp: '2026-07-14T10:00:00',
      },
      {
        id: 'msg-015-2',
        author: 'The Journalism Collective',
        content: 'You built something real here, Chloe. A place where students could do real journalism with real impact. We will keep the flame burning. Go make history at the Times — we know you will.',
        timestamp: '2026-07-14T14:45:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/chloe-bennett-journalism',
      twitter: 'https://twitter.com/chloebennett_nyt',
    },
  },
  {
    id: 'grad-016',
    name: 'Raj Krishnamurthy',
    degree: 'Bachelor of Science in Chemical Engineering',
    department: 'College of Engineering',
    honors: 'magna',
    bio: 'Raj developed a novel catalyst for carbon capture reactions that increases efficiency by 40% compared to current industrial standards. His work has attracted interest from three energy companies and he is pursuing a Ph.D. at Caltech.',
    achievements: [
      '40%-efficiency carbon capture catalyst — 2 patents filed',
      'American Chemical Society Undergraduate Award',
      'Caltech Chemical Engineering Ph.D. fellowship',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Raj',
    messages: [
      {
        id: 'msg-016-1',
        author: 'Dr. Pradeep Sharma',
        content: 'Raj, the catalyst work you did belongs in a doctoral thesis, not an undergraduate project. Caltech has admitted a future leader in green chemistry. I cannot wait to read your first journal article.',
        timestamp: '2026-07-14T09:30:00',
      },
      {
        id: 'msg-016-2',
        author: 'Amma and Appa',
        content: 'From Chennai to Caltech. We love you so much. You carried all our dreams on your shoulders and you made them real. Our proudest day. Go change the world, our dear Raj.',
        timestamp: '2026-07-14T07:15:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/raj-krishnamurthy-chem',
    },
  },
  {
    id: 'grad-017',
    name: 'Emma Johansson',
    degree: 'Bachelor of Science in Nursing',
    department: 'College of Health Sciences',
    honors: 'summa',
    bio: 'Emma completed her clinical rotations with distinction at three leading hospitals and developed a patient-communication protocol for non-English-speaking patients that has been adopted hospital-wide at University Medical Center. She has accepted a position in the ICU at Mass General.',
    achievements: [
      'Patient communication protocol adopted by University Medical Center',
      'Sigma Theta Tau International Nursing Honor Society',
      'Clinical Excellence Award — top 1% of nursing graduates',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Emma',
    messages: [
      {
        id: 'msg-017-1',
        author: 'Charge Nurse Patricia Moore',
        content: 'Emma, in thirty years of nursing I have never had a student who commanded a room with such calm and competence. Those ICU patients at Mass General will be in the best hands possible. What a career ahead of you.',
        timestamp: '2026-07-14T08:45:00',
      },
      {
        id: 'msg-017-2',
        author: 'Familjen Johansson',
        content: 'You crossed an ocean to study, you learned a new language, and now you are headed to one of the best hospitals in the world. We are overwhelmed with pride. Vi alskar dig!',
        timestamp: '2026-07-14T06:30:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/emma-johansson-rn',
    },
  },
  {
    id: 'grad-018',
    name: 'Tyrone Jackson',
    degree: 'Bachelor of Science in Computer Engineering',
    department: 'College of Engineering',
    bio: 'Tyrone designed a low-power embedded system for precision agriculture sensors that can run on solar energy alone in remote farmlands. His device is already being piloted by two agricultural cooperatives in the Mississippi Delta.',
    achievements: [
      'Solar-powered precision agriculture sensor — pilot in Mississippi Delta',
      'Texas Instruments Innovation Challenge winner',
      "NSBE National President's Award",
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Tyrone',
    messages: [
      {
        id: 'msg-018-1',
        author: 'Dr. Marcus Lee',
        content: 'Tyrone, you built technology that directly helps Black farmers — a community that has been underserved by agri-tech for generations. That is not just engineering excellence, that is justice. We are so proud.',
        timestamp: '2026-07-14T11:15:00',
      },
      {
        id: 'msg-018-2',
        author: 'Grandpa Earl',
        content: 'Boy, your great-great-grandfather sharecropped that same Delta soil you are helping to farm smarter. What a full circle. He would not believe it — but I do, because I watched you become this man. Proud of you, son.',
        timestamp: '2026-07-14T10:00:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/tyrone-jackson-cpe',
      twitter: 'https://twitter.com/tyronejackson_eng',
    },
  },
  {
    id: 'grad-019',
    name: 'Valentina Cruz',
    degree: 'Bachelor of Arts in Economics',
    department: 'College of Business',
    honors: 'magna',
    bio: "Valentina's senior thesis on the economic impact of microlending programs in rural Latin America was cited by the World Bank in a 2026 policy brief. She will join the IMF's Economic Research Department as a junior economist.",
    achievements: [
      'Senior thesis cited by World Bank 2026 policy brief',
      'IMF Junior Economist fellowship',
      'Phi Beta Kappa inducted (top 10% of class)',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Valentina',
    messages: [
      {
        id: 'msg-019-1',
        author: 'Prof. Robert Chen',
        content: 'Valentina, the World Bank citing an undergraduate thesis is extraordinary. But knowing you, it is just the beginning. You combine rigorous economics with genuine care for people — that is your superpower.',
        timestamp: '2026-07-14T10:30:00',
      },
      {
        id: 'msg-019-2',
        author: 'Papa y Mama Cruz',
        content: 'Valentinita, when we left Guadalajara we hoped you would have more opportunities than us. Today you are going to the IMF. You have exceeded every dream we dared to dream. Te amamos con todo el corazon.',
        timestamp: '2026-07-14T08:00:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/valentina-cruz-econ',
    },
  },
  {
    id: 'grad-020',
    name: 'Samuel Adeyemi',
    degree: 'Bachelor of Science in Information Systems',
    department: 'College of Business',
    honors: 'cum',
    bio: 'Samuel built a cybersecurity awareness training platform used by 15 campus organizations and three local non-profits. He has earned the CISSP certification — one of the youngest ever — and will join Deloitte\'s cybersecurity practice.',
    achievements: [
      'CISSP certified at age 21 — among youngest in history',
      'Cybersecurity training platform deployed to 18 organizations',
      'Deloitte Cyber Diversity Scholarship',
    ],
    photoUrl: 'https://api.dicebear.com/8.x/personas/svg?seed=Samuel',
    messages: [
      {
        id: 'msg-020-1',
        author: 'Prof. Linda Osei',
        content: 'Samuel, getting CISSP as an undergraduate is jaw-dropping. But what impresses me more is that you immediately used that knowledge to protect organizations that could not afford professional security training. Deloitte is getting a leader.',
        timestamp: '2026-07-14T11:00:00',
      },
      {
        id: 'msg-020-2',
        author: 'The Adeyemi Family',
        content: 'Sammy, from Lagos to the dean\'s list, from the dean\'s list to Deloitte. You made every sacrifice worthwhile. Our family name has never shone brighter. Go and make us proud — not that you ever stopped!',
        timestamp: '2026-07-14T09:45:00',
      },
    ],
    photos: [],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/samuel-adeyemi-cyber',
      twitter: 'https://twitter.com/samueladeyemi_sec',
    },
  },
]

export const programItems: ProgramItem[] = [
  {
    id: 'prog-001',
    time: '9:30 AM',
    title: 'Processional',
    description:
      'Faculty and graduates process into the ceremonial hall to the traditional "Pomp and Circumstance" march. Guests are asked to remain standing until the processional is complete and the platform party is seated.',
    duration: 15,
  },
  {
    id: 'prog-002',
    time: '9:45 AM',
    title: 'Welcome Address',
    speaker: 'President Margaret Walsh',
    description:
      "University President Margaret Walsh welcomes graduates, families, faculty, and distinguished guests to the 2026 Commencement Ceremony. President Walsh will reflect on the university's achievements and the class's journey.",
    duration: 10,
  },
  {
    id: 'prog-003',
    time: '9:55 AM',
    title: 'Invocation',
    speaker: 'Rev. Dr. Samuel Osei',
    description:
      'A moment of reflection and inspiration led by University Chaplain Rev. Dr. Samuel Osei. Students of all faiths and backgrounds are welcome to observe in a manner that feels comfortable to them.',
    duration: 5,
  },
  {
    id: 'prog-004',
    time: '10:00 AM',
    title: 'Keynote Address',
    speaker: 'Dr. Aisha Mbeki, Nobel Laureate',
    description:
      'Dr. Aisha Mbeki, 2024 Nobel Prize in Chemistry recipient and alumna of Excellence University (Class of 1994), will deliver the keynote address. Her remarks — "Building Bridges, Breaking Barriers" — will draw on her journey from graduate to global scientific leader.',
    duration: 35,
  },
  {
    id: 'prog-005',
    time: '10:35 AM',
    title: 'Conferring of Degrees — College of Engineering',
    speaker: 'Dean Richard Hargrove',
    description:
      'Dean Richard Hargrove of the College of Engineering will present the graduates of the Departments of Computer Science, Electrical Engineering, Mechanical Engineering, Civil Engineering, Biomedical Engineering, Chemical Engineering, Computer Engineering, Data Science, and Environmental Science for the conferring of their degrees.',
    duration: 40,
  },
  {
    id: 'prog-006',
    time: '11:15 AM',
    title: 'Conferring of Degrees — College of Business',
    speaker: 'Dean Patricia Vance',
    description:
      'Dean Patricia Vance of the College of Business will present graduates from the Departments of Business Administration, Finance, Economics, Information Systems, and Marketing. Graduates will be recognized individually as they cross the stage.',
    duration: 30,
  },
  {
    id: 'prog-007',
    time: '11:45 AM',
    title: 'Commencement Address',
    speaker: 'Valedictorian Alexandra Chen',
    description:
      'Class Valedictorian Alexandra Chen delivers the commencement address on behalf of the graduating class. In a speech entitled "The Algorithm of Courage," Alexandra will speak about taking risks, embracing failure, and building a future worthy of the challenges the world faces.',
    duration: 15,
  },
  {
    id: 'prog-008',
    time: '12:00 PM',
    title: 'Recessional',
    description:
      'The graduating class, faculty, and platform party process out of the ceremonial hall. Graduates will gather on the East Lawn for photographs and the traditional cap toss. Families are invited to join their graduates on the lawn immediately following the recessional.',
    duration: 15,
  },
]

export const networkingTables: NetworkingTable[] = [
  {
    id: 'table-001',
    theme: 'Tech & Startups',
    description:
      'Connect with fellow graduates passionate about launching tech startups, joining early-stage companies, or exploring the venture capital ecosystem. Share ideas, swap war stories from hackathons, and find potential co-founders.',
    bbbLink: '',
    seats: 12,
    occupants: [],
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  },
  {
    id: 'table-002',
    theme: 'Healthcare & Life Sciences',
    description:
      'A gathering space for graduates pursuing careers in medicine, nursing, biomedical research, public health, or health-tech. Discuss graduate school applications, clinical experiences, and the future of healthcare delivery.',
    bbbLink: '',
    seats: 12,
    occupants: [],
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  },
  {
    id: 'table-003',
    theme: 'Arts, Media & Communications',
    description:
      'For graduates entering creative fields — graphic design, journalism, film, marketing, UX, and beyond. Discuss portfolios, freelancing versus studio life, and how to build a sustainable creative career in a rapidly changing media landscape.',
    bbbLink: '',
    seats: 10,
    occupants: [],
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  },
  {
    id: 'table-004',
    theme: 'Policy, Law & Social Impact',
    description:
      'Join graduates heading into law school, government service, NGOs, or policy research. Topics include the law school application process, careers in public service, and how to leverage your degree to drive meaningful social change.',
    bbbLink: '',
    seats: 10,
    occupants: [],
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  },
  {
    id: 'table-005',
    theme: 'Finance, Consulting & Business',
    description:
      'A table for graduates joining investment banks, consulting firms, corporate finance teams, or pursuing an MBA. Exchange insights on analyst programs, case interview preparation, and long-term career trajectories in the business world.',
    bbbLink: '',
    seats: 12,
    occupants: [],
    color: 'from-yellow-500/20 to-amber-400/20 border-yellow-500/30',
  },
  {
    id: 'table-006',
    theme: 'Graduate School & Research',
    description:
      "For those continuing their academic journey — Ph.D. programs, master's degrees, post-baccalaureate programs, and research fellowships. Discuss funding, advisor relationships, the realities of graduate life, and how to thrive in academia.",
    bbbLink: '',
    seats: 10,
    occupants: [],
    color: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
  },
]

export const sponsors: Sponsor[] = [
  {
    id: 'sponsor-001',
    name: 'Apex Technologies',
    tier: 'gold',
    logo: 'https://api.dicebear.com/8.x/initials/svg?seed=AT&backgroundColor=E8720C&textColor=0A0E1A',
    url: 'https://apextechnologies.example.com',
  },
  {
    id: 'sponsor-002',
    name: 'Meridian Capital Group',
    tier: 'gold',
    logo: 'https://api.dicebear.com/8.x/initials/svg?seed=MCG&backgroundColor=A88A20&textColor=ffffff',
    url: 'https://meridiancapital.example.com',
  },
  {
    id: 'sponsor-003',
    name: 'Horizon Health Systems',
    tier: 'gold',
    logo: 'https://api.dicebear.com/8.x/initials/svg?seed=HHS&backgroundColor=1a2235&textColor=E8720C',
    url: 'https://horizonhealth.example.com',
  },
  {
    id: 'sponsor-004',
    name: 'Greenfield Foundation',
    tier: 'silver',
    logo: 'https://api.dicebear.com/8.x/initials/svg?seed=GF&backgroundColor=374151&textColor=F0D060',
    url: 'https://greenfieldfoundation.example.com',
  },
]
