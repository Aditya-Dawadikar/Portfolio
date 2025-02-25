import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Aditya Dawadikar",
  initials: "AD",
  url: "http://localhost:3000",
  location: "San Jose, CA",
  locationLink: "https://maps.app.goo.gl/3Wd2cdFZQkRpkBJc8",
  description:
    "Full-Stack Developer. Exploring, Experimenting, and Engineering Software Solutions",
  summary:
    "My journey into coding started back in 2016 as a 10th grader, when I first discovered my passion for writing code and solving problems. Since then, I’ve been [building projects for fun](#projects), experimenting with new technologies, and continuously refining my [skills](#skills). Over time, what started as curiosity turned into an ambition—to work in the Silicon Valley, and learn from the best minds in the industry. Now, as a [master’s student](#education) with [2 years of professional software development experience](#work), I focus on building scalable applications, designing robust architectures, and tackling real-world engineering challenges while continuously expanding my expertise.",
  avatarUrl: "/me.png",
  skills: ["Javascript","Typescript","Python","Java","Go","C++","C","HTML","CSS","SQL",
    "ExpressJs","Flask","SpringBoot","FastAPI","React","Angular","Tailwind CSS", "Bootstrap",
    "PostgreSQL","MySQL","Oracle SQL","MongoDB","Redis","Firestore","BigQuery",
    "Cloud Functions","PubSub","Cloud Run","GKE","Cloud Storage","Kafka","Docker","Kubernetes","Terraform","Github Actions","Jenkins",
    "Junit","Pytest","Jest","Selenium","Behave",
    "Git","Figma","Postman","Dbeaver","Canva","Jira"
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "mail.aditya.dawadikar@gmail.com",
    tel: "+14085924630",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/Aditya-Dawadikar",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/aditya-dawadikar",
        icon: Icons.linkedin,

        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mai.aditya.dawadikar@gmail.com",
        icon: Icons.email,

        navbar: false,
      },
    },
  },

  work: [
    {
      company: "Dept. Computer Science, San Jose State University",
      href: "https://www.sjsu.edu/cs/",
      badges: [],
      location: "San Jose, CA",
      title: "Java Instructor",
      logoUrl: "/sjsu.png",
      start: "Jan 2025",
      end: "Present",
      description:
        "As an Instructional Student Assistant (ISA), I teach Java fundamentals to sophomore students, focusing on object-oriented programming, data structures, and problem-solving. I design interactive lessons, mentor students through coding challenges, and provide hands-on debugging support to strengthen their programming skills. By fostering a practical, project-based learning approach, I help students build a strong foundation in Java and prepare them for real-world software development.",
    },
    {
      company: "Quantiphi Analytics Pvt. Ltd",
      badges: [],
      href: "https://quantiphi.com/",
      location: "Mumbai, India",
      title: "Software Developer",
      logoUrl: "/quantiphi.png",
      start: "August 2022",
      end: "April 2024",
      description:
        "As a Full-Stack Software Developer, I played a key role in architecting scalable microservices, optimizing databases, and integrating cloud-based solutions under resource constraints. Working on mission-critical projects with tight deadlines, I ensured high-performance, reliable software delivery while collaborating across teams to refine system architecture and maintain QoC standards.",
    },
    {
      company: "Quantiphi Analytics Pvt. Ltd",
      href: "https://quantiphi.com/",
      badges: [],
      location: "Mumbai, India",
      title: "Intern Software Developer",
      logoUrl: "/quantiphi.png",
      start: "January 2022",
      end: "July 2022",
      description:
        "As an intern, I shadowed senior developers, learned best practices, and quickly adapted to scalable architecture principles. I contributed to API development, debugging critical issues, and system optimization, gaining hands-on experience with real-world, high-performance applications. My ability to deliver efficient solutions and quickly learn industry standards led to my promotion as a full-time Software Developer.",
    },
  ],
  education: [
    {
      school: "San Jose State University",
      href: "https://www.sjsu.edu/cs/",
      degree: "Master's Degree of Computer Science (Ms CS)",
      logoUrl: "/sjsu.png",
      start: "2024",
      end: "2026 (expected)",
    },
    {
      school: "Savitribai Phule Pune University",
      href: "http://www.unipune.ac.in/",
      degree: "Bachelor's Degree of Computer Engineering (Bs CE)",
      logoUrl: "/sppu.png",
      start: "2018",
      end: "2022",
    },
  ],
  projects: [
    {
      title: "Realtime LogManager",
      href: "https://github.com/Aditya-Dawadikar/RealtimeLogManager",
      dates: "Feb 2025",
      active: false,
      description:
        "",
      technologies: [
        "Kafka",
        "React",
        "FastAPI",
        "NodeJs",
        "TailwindCSS",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/RealtimeLogManager",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: 
      "/real-time-log-demo.gif",
      video:
      "",
    },{
      title: "Pulmonary Disease Prediction",
      href: "https://github.com/Aditya-Dawadikar/Pulmonary-Disease-Classification",
      dates: "June 2021 - March 2022",
      active: false,
      description:
        "",
      technologies: [
        "React",
        "Redux",
        "Bootstrap",
        "ExpressJs",
        "Firestore",
        "SQLite",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/Pulmonary-Disease-Classification",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: 
      "/pulmonary-disease-prediction-demo.gif",
      video:
      "",
    },{
      title: "C++ SQL Database",
      href: "https://github.com/Aditya-Dawadikar/cpp_sql_database",
      dates: "September 2024 - December 2024",
      active: false,
      description:
        "",
      technologies: [
        "C",
        "C++",
        "Linux",
        "GCC Compiler",
        "GDB Debugger"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/cpp_sql_database",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: 
      "/cpp-sql-db-demo.gif",
      video:
      "",
    },
  ],
  // hackathons: [
  //   {
  //     title: "Hack Western 5",
  //     dates: "November 23rd - 25th, 2018",
  //     location: "London, Ontario",
  //     description:
  //       "Developed a mobile application which delivered bedtime stories to children using augmented reality.",
  //     image:
  //       "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-western.png",
  //     mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
  //     links: [],
  //   },
  // ],
} as const;
