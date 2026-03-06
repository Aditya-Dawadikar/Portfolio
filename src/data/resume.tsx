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
    "My journey into coding started back in 2016 as a 10th grader, when I first discovered my passion for writing code and solving problems. Since then, I’ve been [building projects for fun](projects), experimenting with new technologies, and continuously refining my [skills](skills). Over time, what started as curiosity turned into an ambition—to work in the Silicon Valley, and learn from the best minds in the industry. Now, as a [master’s student](#education) with [2 years of professional software development experience](#work), I focus on building scalable applications, designing robust architectures, and tackling real-world engineering challenges while continuously expanding my expertise. I learn, I teach, I collaborate, I compete & I build...",
  interests: [
    "Frontend Engineering",
    "Backend Engineering",
    "Fullstack Engineering",
    "System Design",
    "Generative AI",
    "Agentic AI",
    "ML/AI Research",
    "Hackathons",
    "Tech Blogs",
    "Teaching & Mentorship",
  ],
  avatarUrl: "/me.png",
  topSkills: ["Python", "Javascript", "Typescript", "HTML", "CSS", "SQL",
    "FastAPI", "ExpressJs", "React", "Angular", "PostgreSQL", "MongoDB", "Redis", "Figma",
    "Docker", "Kubernetes", "Git", "AWS", "GCP", "Java", "C++", "Kafka", "Prometheus", "Grafana"],
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
      title: "KT - AI-Powered Podcast Generator",
      href: "https://cf-ai-podcast-generator.pages.dev/",
      dates: "December 2025",
      active: false,
      team: true,
      hackathonWinner: true,
      description:
        "Generate professional podcasts on any topic in minutes with AI. Perfect for passive learning on the go.",
      technologies: [
        "Python",
        "FastAPI",
        "React",
        "Open AI GPT",
        "Open AI Dall-E",
        "Open AI TTS"
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/siddharthck/cf_ai_podcast_generator",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image:
        "/generated podcasts.png",
      video:
        "",
    },
    {
      title: "BMC Management Agentic System",
      href: "https://github.com/Aditya-Dawadikar/BMC_Management_Agentic_System",
      dates: "September 2025",
      active: false,
      team: true,
      hackathonWinner: true,
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
      dates: "May 2025",
      active: false, team: false, description:
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
      dates: "May 2025",
      active: false,
      team: false,
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
      team: false,
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
      team: true,
      hackathonWinner: true,
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
      team: false,
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
      dates: "February 2026",
      active: false,
      team: true,
      hackathonWinner: true,
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
      team: false,
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
      team: true,
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
      team: false,
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
      team: false,
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
      team: true,
      hackathonWinner: true,
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
      team: false,
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
  scholarProfiles: {
    googleScholar: "https://scholar.google.com/citations?user=w1AsakoAAAAJ&hl=en",
    orcid: "https://orcid.org/0000-0001-7208-6681",
  },
  papers: [
    {
      title: "Survey of Techniques for Pulmonary Disease Classification using Deep Learning",
      authors: "A. Dawadikar, A. Srivastava, N. Shelar, G. Gaikwad and A. Pawar",
      venue: "2022 IEEE 7th International conference for Convergence in Technology (I2CT), Mumbai, India, 2022, pp. 1-5, doi: 10.1109/I2CT54291.2022.9824879",
      date: "07-09 April 2022",
      description: "The field of medical science is getting more effective with emerging trends of computer science technologies like AI, ML, and DL. The area where these technologies play an important role is the detection or recognition of diseases. This paper discusses existing methodologies and various steps involved in the process of detection/recognition of pulmonary diseases using lung sound. The paper is divided into 4 sections. These sections include general steps of any recognition system using lung sound and study of existing methods. The paper helps to overview the different approaches/experiments and build new and effective ones which can give better accuracy.",
      links: [
        {
          type: "Paper",
          href: "https://ieeexplore.ieee.org/document/9824879",
          icon: <Icons.globe className="size-3" />,
        },
      ],
    }, {
      title: "Three Feature Based Ensemble Deep Learning Model for Pulmonary Disease Classification",
      authors: "Aditya Dawadikar, Anshu Srivastava, Neha Shelar, Gaurav Gaikwad, Prof. Atul Pawar",
      venue: "International Research Journal of Engineering and Technology (IRJET), Volume: 10 Issue: 02",
      date: "Feb 2023",
      description: "In recent years there has been a rise in the number of patients suffering from acute and chronic pulmonary diseases because of varying reasons like pollution, lung damage, or infections. The following research is regarding a Neural Network based solution for the recognition of the abnormality and possible disease based on lung auscultation. The following paper depicts that RNN-LSTM and CNN were the best-performing techniques. Although a higher percentage of noise while capturing the auscultation audio and limited data leads to a saturation point for the models to improve. The dataset had over 5000 breathing cycles for COPD, whereas only about 100 breathing cycles for LRTI and URTI. This unbalanced data made it difficult for the models to perform well on test audio clips because of the bias introduced by the large count of COPD samples. We adopted a filter-based audio augmentation to rebalance the dataset. To get the most out of the data we had, we utilized multiple features like MFCC, Chromagram, and Spectrogram extracted from the same audio clip. Since these extracted features are not fathomable to humans, we used convolutional neural networks to perform primary feature extraction. Likewise, dedicated CNN models acted as feature extractors whereas the dense neural network served as the actual classifier. We developed multiple versions of the models with fine-tuned parameters. The ML models based on a single feature were considered the benchmark for evaluating more complex, multi-feature DL models.",
      links: [
        {
          type: "Paper",
          href: "https://www.irjet.net/archives/V10/i2/IRJET-V10I2102.pdf",
          icon: <Icons.globe className="size-3" />,
        },
      ],
    },
    // {
    //   title: "Activation-Guided Layer Selection for LoRA",
    //   authors: "Aditya Dawadikar, Pooja Shyamsundar, Rashmi Vishwanath Bhat, Navrati Saxena",
    //   venue: "MDPI Information, Modeling in the Era of Generative AI",
    //   date: "May 2026",
    //   description: "Low-Rank Adaptation (LoRA) has become a widely adopted parameter-efficient fine-tuning (PEFT) technique for large language models (LLMs). LoRA's benefits stem from its light weight and modular adapters. Standard LoRA applies adapters uniformly across all Transformer layers, implicitly assuming that each layer contributes equally to task adaptation. However, LLMs are found to have internal substructures that contribute in a disproportionate manner. In this work, we provide a theoretical analysis of how LoRA weight updates are influenced by a layer's activation magnitude. We propose Act-LoRA, a simple activation-guided layer selection strategy for selective Low-Rank Adaptation. We evaluate this strategy for both encoder-only and decoder-only architectures using the GLUE benchmark. Our method achieved a 20% GPUh saving with a 1% drop in GLUE score using DeBERTaV3-Base on a single-instance GPU with 50% less LoRA parameters. It also achieved 2% GPUh savings with a less than 0.15% drop in GLUE score with the Llama-3.1-8B model in Distributed Data Parallel mode with 25% fewer LoRA parameters. Our experiments and analysis show that the compute and memory requirements of LoRA adapters increase linearly with the number of selected layers. We further compare activation-guided selection against gradient-guided importance metrics and show that activation norms yield more stable and reproducible layer rankings across seeds and datasets. Overall, our results demonstrate that activation-guided layer selection is a practical and effective way to improve the efficiency of LoRA fine-tuning, making it immediately compatible with some existing PEFT techniques and distributed training frameworks.",
    //   links: [
    //     {
    //       type: "Paper",
    //       href: "#",
    //       icon: <Icons.globe className="size-3" />,
    //     },
    //   ],
    // },
  ],
  stories: [
    {
      title: "Designing a Secure and Cost-Efficient Static Content Hosting Layer for an LMS",
      company: "Quantiphi Analytics",
      date: "2023",
      description: "While building a Learning Management System serving more than 4,000 concurrent users and processing over 10,000 learning-content updates daily, we needed a scalable way to host thousands of static HTML learning modules stored in cloud buckets. The initial architecture assumed these files could be served directly from storage using signed URLs or a CDN. However, as we approached the UAT phase we discovered a critical issue: the HTML learning modules contained multiple relative imports (CSS, JavaScript, images). A single signed URL could not authorize all dependent assets, and generating signed URLs for every imported file would have been computationally expensive and difficult to maintain. Integrating a CDN at that stage would also have required significant architectural changes and ongoing operational cost while the system was close to release. We needed a solution that could be integrated quickly into the existing architecture, remain secure because the learning material was copyrighted, and require minimal maintenance. I designed a REST-based virtual file system layer where cloud storage buckets were mounted as volumes on our application servers, allowing HTML files to be served locally so relative imports resolved naturally. To keep the application stateless while still managing access efficiently, we used our existing Redis cluster to cache signed URLs and file metadata such as age and expiry. Authentication was enforced through secure cookies so only authorized learners could access the content. This solution allowed us to deliver the feature before UAT, support thousands of concurrent learners, and avoid the complexity and cost of introducing a CDN late in the development cycle.",
      tags: ["Cloud Architecture", "Backend", "Storage Systems", "Cost Optimization"]
    },
    {
      title: "Scaling a Real-Time Visualization Dashboard to Handle High Event Throughput",
      company: "Quantiphi Analytics",
      date: "2023",
      description: "We were building a micro-frontend visualization dashboard where chart configurations were sourced from Looker Studio while the underlying data streamed from BigQuery queries and Google Cloud Pub/Sub event pipelines. Because the dashboard displayed event-driven operational metrics, the UI needed to ingest high-frequency updates in near real time. Initially, every event was pushed directly to the frontend, which resulted in excessive message rates and frequent UI re-renders across micro-frontend components. We optimized the system on two fronts. First, on the backend we introduced event batching for a predefined interval, intentionally converting the system from strict real-time to near-real-time streaming. This drastically reduced the number of messages per minute while preserving the freshness needed for monitoring dashboards. Second, on the frontend we redesigned the data layer using custom React hooks and a shared state store built with Zustand. Instead of each component opening its own streaming connection, a single Server-Sent Events (SSE) connection collected all updates and distributed them through the shared store. This eliminated redundant network requests and prevented unnecessary component re-renders. Together, these changes allowed the dashboard to sustain more than 500 streaming events per second while maintaining sub-300 ms perceived latency across the UI.",
      tags: ["React", "Real-Time Systems", "Frontend Architecture", "Performance Optimization"]
    },
    {
      title: "Processing a 5-Year Document Backlog with an Event-Driven AI Pipeline",
      company: "Quantiphi Analytics",
      date: "2023",
      description: "We initially built a proof-of-concept system to process a large backlog of documents using AI services, but the prototype quickly evolved into the production system. The platform had to process more than 50,000 PDFs accumulated over five years. We designed an event-driven architecture with three AI microservices that consumed Vertex AI services for different stages of document processing. Because each AI call took a variable amount of time, synchronous workflows would have caused severe bottlenecks. To solve this, we used Google Cloud Pub/Sub to orchestrate asynchronous processing between services. Intermediate results were stored in transactional tables in Postgres so each stage could resume reliably and maintain job state. We used Cloud Schedulers for archiving the Transaction tables data to BigQuery everyday at midnight. We also integrated Cloud Functions as hooks to notify users when processing jobs completed. To maximize throughput, we tuned CPU and memory allocations on Cloud Run deployments and optimized the Python workers for parallel processing. Cloud Run’s free tier of 1M requests per month meant our compute cost was effectively zero, so the system only incurred costs for Vertex AI inference. The final pipeline processed the entire backlog within roughly three hours after deployment.",
      tags: ["AI Systems", "Event Driven Architecture", "Cloud Run", "Distributed Processing"]
    }
    , {
      title: "Building a JSON-Driven Form Builder for a Human-in-the-Loop AI Pipeline",
      company: "Quantiphi Analytics",
      date: "2022",
      description: "Our team was developing a Human-in-the-Loop (HITL) pipeline where users uploaded batches of PDF documents and AI models extracted structured information from them, eliminating large amounts of manual data entry. The AI also produced confidence scores for each extracted field so human reviewers could quickly verify or correct the results. A major challenge emerged because the PDFs existed in many historical formats and versions, which meant every variation required a slightly different verification form in the UI. Initially these forms were hardcoded in the repository, creating a maintenance nightmare as new formats were introduced. I solved this by designing a JSON-driven form builder. Instead of embedding forms in code, the application fetched a JSON schema from a cloud storage bucket based on the detected PDF version. The React frontend dynamically rendered the verification form in real time using this schema. I also built a lightweight internal tool to generate the schema files and wrote Jest tests to ensure the components behaved correctly across schema variations. This architecture removed the need to hardcode multiple forms and dramatically simplified maintenance. The tool proved useful beyond our project, and sister teams working on similar PDF processing HITL pipelines adopted the form builder across their applications.",
      tags: ["React", "AI Systems", "Human-in-the-Loop", "Developer Productivity"]
    },
    {
      title: "Reducing BigQuery Costs and Latency for User-Generated Reports",
      company: "Quantiphi Analytics",
      date: "2022",
      description: "We were building a self-service analytics platform where business executives could configure and schedule their own reports. The data was sourced from BigQuery tables containing more than 10,000 columns and petabyte-scale datasets. Because BigQuery charges based on the amount of data processed, poorly written queries could become extremely expensive. Since the report creators were not data engineers, many queries contained redundant filters or scanned far more data than necessary, resulting in slow dashboard renders and high processing costs. To address this, I implemented several guardrails directly in the UI layer. We dynamically queried table schemas from BigQuery and highlighted redundant filters while suggesting filter pushdowns before a query was executed. For every saved report query, we ran a BigQuery dry-run and surfaced the estimated query cost to the user, making them aware of the financial impact of their queries. We also enforced server-side pagination even when users did not explicitly request it, limiting the amount of data scanned and returned to the UI. These optimizations reduced query processing overhead and improved response times from roughly 3–5 seconds to around 250–500 milliseconds depending on the query, while significantly lowering BigQuery processing costs.",
      tags: ["Big Data", "SQL Optimization", "BigQuery", "Cost Optimization"]
    },
    {
      title: "Eliminating CI/CD Bottlenecks by Redesigning GitHub Actions Workflows",
      company: "Quantiphi Analytics",
      date: "2024",
      description: "Our CI/CD pipelines relied on GitHub Actions, but the organization account could run only two workflows in parallel. Each pipeline built and deployed the entire microservice stack, which caused runs to take nearly 1.5 hours. As the project approached the UAT phase and pull requests increased, workflows began competing for limited runners. Queue times grew, failure rates increased, and code shipping slowed significantly. I redesigned the pipeline to deploy only the microservices affected by a pull request by introducing service-level dependency detection and targeted build steps in GitHub Actions. This reduced workflow runtime from 1.5 hours to about 20 minutes (78% less time), which effectively unlocked the ability to process 5–7 pull request workflows in parallel. The change eliminated pipeline congestion, reduced infrastructure costs, and restored development velocity during a critical release window with estimated savings of 900+ developer hours.",
      tags: ["CI/CD", "GitHub Actions", "DevOps", "Engineering Productivity"]
    }
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
      title: "SFHacks 2026",
      description:
        "We built a platform for renting private EV charging stations, with features like real-time availability, booking, and AI-powered recommendations. The system was designed for rapid prototyping with a focus on user experience and seamless integration of AI capabilities.",
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
        "We developed an AI-powered content creation platform to help onboard new employees at Pump.co. The system uses LLMs to generate personalized onboarding materials, interactive tutorials, and a Q&A assistant to facilitate a smooth transition for new hires. It was designed for rapid prototyping with a focus on user experience and seamless integration of AI capabilities.",
      dates: "November, 2025",
      location: "Pump.co HQ, San Francisco, California, USA",
      result: "winner",
      image:
        "/PumpCo-Demo.gif",
      links: [
        {
          title: "Source",
          href: "https://github.com/siddharthck/cf_ai_podcast_generator",
          icon: <Icons.github className="size-3" />,
        },
      ],
    }, {
      title: "A10 Hackathon Project",
      dates: "October, 2025",
      location: "A10 HQ, Santa Clara, California, USA",
      result: "participant",
      description:
        "We developed an AI prompt injection safety tool which can be integrated on the Load Balancer level to detect and mitigate prompt injection attacks in real time. The system uses a combination of pattern recognition, anomaly detection, and LLM-based analysis to identify malicious inputs and prevent them from reaching the backend services.",
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
