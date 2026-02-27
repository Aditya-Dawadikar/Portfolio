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
  skills: ["Python", "Javascript", "Typescript", "Java", "C++", "HTML", "CSS", "SQL",
    "FastAPI", "ExpressJs", "SpringBoot", "React", "Angular", "Tailwind CSS", "Bootstrap",
    "PostgreSQL", "MySQL", "Oracle SQL", "MongoDB", "Redis", "Firestore", "BigQuery", "Pinecone",
    "Cloud Functions", "PubSub", "Cloud Run", "GKE", "Cloud Storage", "Kafka", "Elastic Search", "Docker", "Kubernetes",
    "Junit", "Pytest", "Jest", "Selenium", "Behave",
    "Git", "Figma", "Postman", "Dbeaver", "Canva", "Jira"
  ],
  programmingLanguages: ["Python", "Javascript", "Typescript", "Go", "Java", "C++", , "SQL"],
  frontend: ["React", "Redux", "Zustand", "Angular", "Tailwind CSS", "Bootstrap", "HTML", "CSS"],
  backend: ["FastAPI", "ExpressJs", "Fastify", "SpringBoot"],
  database: ["PostgreSQL", "MySQL", "Oracle SQL", "MongoDB", "Redis", "Firestore", "BigQuery", "Pinecone"],
  cloud: ["Cloud Functions", "PubSub", "Cloud Run", "GKE", "Cloud Storage", "AWS Lambda", "AWS S3", "AWS EC2", "AWS RDS", "AWS DynamoDB", "SQS", "SNS"],
  dataprocessing: ["Apache Spark", "Apache Flink", "Kafka", "Elastic Search"],
  cicd: ["Git", "Github Actions", "Docker", "Kubernetes", "Prometheus", "Grafana"],
  testing: ["Junit", "Pytest", "Jest", "Selenium", "Behave"],
  tools: ["Figma", "Postman", "Dbeaver", "Canva", "Jira"],
  genAIskills: ["LangChain", "LangGraph", "RAG", "AgenticAI", "LLMs", "Prompt Engineering", "Context Engineering", "Image Generation", "Voice Generation"],
  mlResearchSkills: ["TensorFlow", "PyTorch", "Transformers", "Huggingface", "Fine Tuning", "Distributed Data Parallelism", "Tensor Parallelism", "AI workload deployment"],
  mlBasics: ["Scikit-learn", "Keras", "Pandas", "NumPy", "Matplotlib", "Seaborn"],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    // { href: "/blog", icon: NotebookIcon, label: "Blog" },
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
      Medium: {
        name: "Medium",
        url: "https://medium.com/@aditya-dawadikar",
        icon: Icons.medium,
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
      company: "PlanetBee",
      href: "https://www.planetbee.org/",
      badges: [],
      location: "San Jose, CA",
      title: "Programming Instructor",
      logoUrl: "/planetbee.png",
      start: "March 2026",
      end: "May 2026",
      description:
        "As an Instructional Student Assistant (ISA), I teach programming fundamentals to middle school students, focusing on basic programming constructs like conditions and loops. I design interactive lessons, mentor students through coding challenges, and provide hands-on debugging support to strengthen their programming skills. I developed the study materials, code samples and delivered lectures on MicroBit programming for processing sensor data.",
    },
    {
      company: "BreakThroughTech, Cornell University",
      href: "https://www.sjsu.edu/cs/",
      badges: [],
      location: "Remote",
      title: "ML Instructor",
      logoUrl: "/cornell.png",
      start: "May 2025",
      end: "August 2025",
      description:
        "As an Instructional Student Assistant (ISA), I teach ML fundamentals to freshman students from all over the USA. I mentored a batch of 60 students, taught the ML workflows from Preliminary Data Exploration to Model Selection, Training and Deployment.",
    },
    {
      company: "Dept. Computer Science, San Jose State University",
      href: "https://www.sjsu.edu/cs/",
      badges: [],
      location: "San Jose, CA",
      title: "Java Instructor",
      logoUrl: "/sjsu.png",
      start: "Jan 2025",
      end: "May 2026",
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
      title: "BMC Management Agentic System",
      href: "https://github.com/Aditya-Dawadikar/BMC_Management_Agentic_System",
      dates: "2025",
      active: false,
      description:
        "An agentic, AI-powered platform that combines deep infrastructure observability with autonomous control. It ingests hardware telemetry, uses LLM-based reasoning to interpret data, and can trigger automated control actions while providing real-time visualization and conversational insights.",
      technologies: [
        "Python",
        "FastAPI",
        "React",
        "MongoDB",
        "AWS S3",
        "Grafana",
        "Prometheus",
        "LangChain",
        "Gemini AI",
        "Redfish API"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/BMC_Management_Agentic_System",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image:
        "",
      video:
        "https://www.youtube.com/embed/YqEp3CP8ePM?si=G6tQfBazmQbMuK9U",
    }, {
      title: "Conway’s Game of Life",
      href: "https://github.com/Aditya-Dawadikar/ConwaysGameOfLife",
      dates: "2025",
      active: false,
      description:
        "A GPU-accelerated implementation of Conway’s Game of Life, simulating cellular automata on large grids in real time using CUDA and SDL2 for interactive rendering and controls. Conway’s Game of Life is a classic zero-player simulation where patterns evolve over discrete generations based on simple neighbor rules.",
      technologies: [
        "CUDA",
        "C++",
        "SDL2",
        "CMake",
        "GPU Acceleration",
        "Cellular Automata"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/ConwaysGameOfLife",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image:
        "/conways_game_of_life.gif",
      video:
        "",
    }, {
      title: "Pingu",
      href: "https://github.com/Aditya-Dawadikar/Pingu",
      dates: "2025",
      active: false,
      description:
        "Pingu is a lightweight CLI tool for testing REST APIs and validating JSON responses. It offers structured JSON diffs, parallel test execution, customizable test suites, and concise CLI output — making API testing fast and developer-friendly.",
      technologies: [
        "C++17",
        "CMake",
        "libcurl",
        "nlohmann/json",
        "CLI Tooling",
        "REST API Testing"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/Pingu",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image:
        "/pingu.gif",
      video:
        "",
    },
    {
      title: "RayFlux",
      href: "https://github.com/Aditya-Dawadikar/RayFlux",
      dates: "July 2025",
      active: true,
      description:
        "RayFlux is a distributed, S3-backed real-time messaging system designed with consistent hashing and stateless routing. It supports publisher-subscriber architecture with WebSocket streaming, JSONL log batching, and horizontal scalability via FluxNodes and a custom load balancer.",
      technologies: [
        "Go",
        "WebSockets",
        "AWS S3",
        "Kubernetes",
        "Consistent Hashing",
        "JSONL",
        "Distributed Systems"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/RayFlux",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image:
        "/rayflux.gif",
      video:
        "",
    }, {
      title: "BotTalk",
      href: "https://github.com/Aditya-Dawadikar/BotTalk",
      dates: "July 2025",
      active: false,
      description:
        "BotTalk is an AI-powered podcast generation system built using multi-agent orchestration. It simulates structured conversations between a host and guest using LLM-driven planning, flow control, and script refinement, enabling automated content generation pipelines.",
      technologies: [
        "LangChain",
        "Python",
        "LLMs",
        "Multi-Agent Systems",
        "Prompt Engineering",
        "Gemini",
        "Text-to-Speech"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/BotTalk",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video:
        "https://www.youtube.com/embed/EowingvpOEM?si=AdSeqGyISB3WDLmR",
    }, {
      title: "BanyanTree",
      href: "https://github.com/Aditya-Dawadikar/BanyanTree",
      dates: "June 2025",
      active: false,
      description:
        "BanyanTree is a Kubernetes-based distributed microservices architecture that integrates Raft consensus, Kafka log streaming, Elasticsearch indexing, and real-time dashboards. It demonstrates fault-tolerant cluster coordination and cloud-native deployment workflows.",
      technologies: [
        "Python",
        "FastAPI",
        "Raft Consensus",
        "Kafka",
        "Elasticsearch",
        "Kubernetes",
        "Docker",
        "AWS ECR"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/BanyanTree",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/banyantree.gif",
      video:
        "",
    }, {
      title: "EVBnB",
      href: "https://github.com/Aditya-Dawadikar/SFHacks2026",
      dates: "2026",
      active: false,
      description:
        "SFHacks 2026 Project is a hackathon-built full-stack system focused on rapid prototyping with AI integration. It combines frontend interaction, backend APIs, and intelligent automation to deliver a functional MVP within limited time constraints.",
      technologies: [
        "React",
        "Python",
        "FastAPI",
        "LLMs",
        "MongoDB",
        "Cloud Deployment"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/SFHacks2026",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "https://www.youtube.com/embed/XenX8vnUOwc?si=Yoqx3gKSVnBhDFEL",
    },
    {
      title: "CellCraft-AI",
      href: "https://github.com/Aditya-Dawadikar/cell-craft-ai",
      dates: "June 2025",
      active: false,
      description:
        "CellCraft-AI is an intelligent, version-controlled data cleaning assistant built for structured CSV files. It combines large language models (LLMs), commit-based checkpoints, and cloud-native architecture to help users transform, explore, and branch CSV data with traceability and reproducibility.",
      technologies: [
        "LangChain",
        "FastAPI",
        "ReactJs",
        "AWS S3",
        "MongoDB",
        "Redis",
        "Python",
        "Gemini 2.5 Flash"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/cell-craft-ai",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image:
        "/CellCraftAI-Demo.gif",
      video:
        "",
    }, {
      title: "SAGE-AI",
      href: "https://github.com/Aditya-Dawadikar/UCBerkeleyHackathon2025",
      dates: "June 2025",
      active: false,
      description:
        "A powerful voice-augmented AI assistant for developers and researchers, built for UCBerkeleyHackathon2025. SAGE AI helps users converse and brainstorm on the content they browse online. It combines real-time web summarization, semantic memory, and natural voice interaction.",
      technologies: [
        "Google Gemini 2.5 Flash",
        "PineCone",
        "Vapi",
        "GCS"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/UCBerkeleyHackathon2025",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image:
        "/sage-ai.jpg",
      video:
        "",
    }, {
      title: "Neuronite - C++ Library for Neural Networks",
      href: "https://github.com/Aditya-Dawadikar/Neuronite",
      dates: "April 2025",
      active: false,
      description:
        "Neuronite is a lightweight neural network library written from scratch in C++ — built for learning, experimentation, and full transparency into how neural networks work at the bare metal level.",
      technologies: [
        "C++",
        "Cmake",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/Aditya-Dawadikar/Neuronite",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image:
        "/neuronite.png",
      video:
        "",
    },
    {
      title: "Realtime LogManager",
      href: "https://github.com/Aditya-Dawadikar/RealtimeLogManager",
      dates: "Feb 2025",
      active: false,
      description:
        "This project simulates a real-time log streaming system using Kafka, FastAPI, and WebSockets. It consists of multiple components to generate, process, and consume logs.",
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
    }, {
      title: "Pulmonary Disease Prediction",
      href: "https://github.com/Aditya-Dawadikar/Pulmonary-Disease-Classification",
      dates: "June 2021 - March 2022",
      active: false,
      description:
        "This repository contains a deep learning-based solution for classifying pulmonary diseases using lung auscultation audio. The project leverages Convolutional Neural Networks (CNNs) and Recurrent Neural Networks (RNNs) to extract spatial and temporal features from lung sounds to detect respiratory anomalies.",
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
    }, {
      title: "C++ SQL Database",
      href: "https://github.com/Aditya-Dawadikar/cpp_sql_database",
      dates: "September 2024 - December 2024",
      active: false,
      description:
        "This project is a lightweight, terminal-based relational database management system (RDBMS) implemented in C++. Designed for simplicity and extensibility, the system supports essential database operations such as creating tables, inserting, updating, and deleting records, and executing queries with filtering, aggregation, and sorting.",
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
  hackathons: [
    {
      title: "SAGE-AI, Calhacks 2025",
      dates: "June, 2025",
      location: "UC Berkeley, California, USA",
      result: "participant",
      description:
        "A powerful voice-augmented AI assistant for developers and researchers, built for UCBerkeleyHackathon2025. SAGE AI helps users converse and brainstorm on the content they browse online. It combines real-time web summarization, semantic memory, and natural voice interaction.",
      image:
        "/sage-ai.jpg",
      links: [
        {
          title: "Source",
          href: "https://github.com/Aditya-Dawadikar/UCBerkeleyHackathon2025",
          icon: <Icons.github className="size-3" />,
        },
      ],
    },
    {
      title: "SFHacks 2026 Project",
      description:
        "A hackathon-built full-stack system focused on rapid prototyping with AI integration. It combines frontend interaction, backend APIs, and intelligent automation to deliver a functional MVP within limited time constraints.",
      dates: "February, 2026",
      location: "San Francisco State University, California, USA",
      result: "winner",
      image:
        "/SFHacks2026-Demo.gif",
      links: [
        {
          title: "Source",
          href: "https://github.com/Aditya-Dawadikar/SFHacks2026",
          icon: <Icons.github className="size-3" />,
        },
      ],
    }, {
      title: "Pump.co",
      description:
        "Pump.co is a lightweight tool designed for efficient resource monitoring and notification workflows. It integrates REST API testing, customizable alerts, and structured reporting to help developers keep track of service health.",
      dates: "November, 2025",
      location: "Pump.co HQ, San Francisco, California, USA",
      result: "winner",
      image:
        "/PumpCo-Demo.gif",
      links: [
        {
          title: "Source",
          href: "https://github.com/Aditya-Dawadikar/T-mon",
          icon: <Icons.github className="size-3" />,
        },
      ],
    }, {
      title: "A10 Hackathon Project",
      dates: "October, 2025",
      location: "A10 HQ, Santa Clara, California, USA",
      result: "participant",
      description:
        "A10 Hackathon Project is a rapid prototype built during a competitive hackathon. It focuses on building scalable backend services with real-time interaction and cloud deployment, demonstrating fast iteration, team collaboration, and production-ready architecture under time constraints.",
      image:
        "/A10Hackathon-Demo.gif",
      links: [
        {
          title: "Source",
          href: "https://github.com/Aditya-Dawadikar/A10_hackathon",
          icon: <Icons.github className="size-3" />,
        },
      ],
    }, {
      title: "Axiado — BMC Management Agentic System",
      dates: "September, 2025",
      location: "Remote",
      result: "winner",
      description:
        "An agentic, AI-powered platform that combines deep infrastructure observability with autonomous control. It ingests hardware telemetry, uses LLM-based reasoning to interpret data, and can trigger automated control actions while providing real-time visualization and conversational insights.",
      image:
        "/BMCManagementAgenticSystem-AppView.png",
      links: [
        {
          title: "Source",
          href: "https://github.com/Aditya-Dawadikar/BMC_Management_Agentic_System",
          icon: <Icons.github className="size-3" />,
        },
      ],
    }, {
      title: "AWS MCP Hackathon — BotTalk",
      description:
        "BotTalk is an AI-powered podcast generation system built using multi-agent orchestration. It simulates structured conversations between a host and guest using LLM-driven planning, flow control, and script refinement, enabling automated content generation pipelines.",
      dates: "August, 2025",
      location: "San Francisco State University, California, USA",
      result: "winner",
      image:
        "/BotTalk-Demo.gif",
      links: [
        {
          title: "Source",
          href: "https://github.com/Aditya-Dawadikar/BotTalk",
          icon: <Icons.github className="size-3" />,
        },
      ],
    }, {
      title: "PCCOE Hackathon — Pulmonary Disease Classification",
      description:
        "A machine learning classification system for pulmonary diseases, designed as a rapid-build hackathon project. It focuses on ingesting medical imaging data, extracting features, and applying predictive modeling to assist in early disease indication.",
      dates: "March, 2022",
      location: "PCCOE, Pune, Maharashtra, India",
      result: "winner",
      image:
        "/PulmonaryDiseaseClassification-Demo.gif",
      links: [
        {
          title: "Source",
          href: "https://github.com/Aditya-Dawadikar/Pulmonary-Disease-Classification",
          icon: <Icons.github className="size-3" />,
        },
      ],
    },
  ],
} as const;
