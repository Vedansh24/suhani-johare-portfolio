/**
 * Typed Data Architecture for Suhani Johare's Clinical Blueprint Portfolio
 * 100% verified real resume data. Server-compatible module.
 */

export interface PersonalInfo {
  name: string;
  role: string;
  affiliation: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  dob: string;
  languages: string[];
  hobbies: string[];
  socials: {
    linkedin: string;
    github: string;
  };
  metrics: {
    label: string;
    value: string;
    detail: string;
  }[];
}

export interface WorkExperienceItem {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  responsibilities: string[];
}

export interface InternshipTrainingItem {
  id: string;
  title: string;
  organization: string;
  period: string;
  location?: string;
  summary: string;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  score: string;
  location: string;
  notes?: string;
}

export interface TechnicalSkills {
  biomedical: string[];
  programming: string[];
  os: string[];
}

export interface AcademicProject {
  id: string;
  title: string;
  period: string;
  mentor: string;
  tech: string[];
  summary: string;
  impact: string;
}

export interface WorkshopAchievement {
  workshops: {
    title: string;
    organization: string;
    period: string;
  }[];
  sports: {
    title: string;
    year: string;
  }[];
}

export interface ICULayerSpec {
  id: string;
  layerNumber: string;
  title: string;
  systemName: string;
  clinicalDomain: string;
  hospitalDutyRef: string;
  dutyTitle: string;
  dutyDescription: string;
  technicalSpecs: {
    component: string;
    inspectionMetric: string;
    protocol: string;
  };
}

export interface ResumeData {
  personal: PersonalInfo;
  workExperience: WorkExperienceItem[];
  internshipsTrainings: InternshipTrainingItem[];
  education: EducationItem[];
  skills: TechnicalSkills;
  projects: AcademicProject[];
  workshopsAchievements: WorkshopAchievement;
  icuLayers: ICULayerSpec[];
}

export const resumeData: ResumeData = {
  personal: {
    name: "Suhani Johare",
    role: "Biomedical Engineer",
    affiliation: "Vishesh Jupiter Hospital, Indore",
    summary:
      "Biomedical Engineer with experience in Machine Learning, Web Development, and Medical Image Processing. Skilled in Python, MATLAB, and AI/ML, with practical exposure to hospital-based biomedical applications. Passionate about using technology to solve real-world problems.",
    email: "joharesuhani@gmail.com",
    phone: "+91 6261076103",
    location: "Indore, Madhya Pradesh, India",
    dob: "30th March 2003",
    languages: ["English", "Hindi"],
    hobbies: ["Sports (Badminton)", "Dancing", "Cooking"],
    socials: {
      linkedin: "https://www.linkedin.com/in/suhani-johare",
      github: "https://github.com/suhanijohare",
    },
    metrics: [
      {
        label: "Clinical Operations",
        value: "Vishesh Jupiter",
        detail: "Biomedical Department, Indore",
      },
      {
        label: "Academic Degree",
        value: "B.Tech BME",
        detail: "SGSITS Indore (CGPA 6.67)",
      },
      {
        label: "Core Tooling",
        value: "Python · MATLAB",
        detail: "Medical Image Processing & AI/ML",
      },
      {
        label: "Hospital Systems",
        value: "ICU & Diagnostics",
        detail: "Preventive Maintenance & Safety",
      },
    ],
  },

  workExperience: [
    {
      id: "exp-vjh-indore",
      role: "Biomedical Engineer",
      organization: "Vishesh Jupiter Hospital",
      location: "Indore, India",
      period: "Aug 2026 – Present",
      responsibilities: [
        "Perform scheduled preventive maintenance, calibration, and electrical safety inspections on diagnostic, monitoring, and life-support medical equipment across hospital departments.",
        "Troubleshoot and resolve equipment breakdowns promptly to minimize clinical downtime and support uninterrupted patient care.",
        "Maintain medical equipment inventory, service histories, AMC/CMC records, and compliance documentation in accordance with hospital quality standards.",
        "Coordinate with vendors and service engineers for equipment installation, repairs, and technical guidance to nursing and clinical staff on safe device operation.",
      ],
    },
  ],

  internshipsTrainings: [
    {
      id: "intern-ybi",
      title: "AI & Machine Learning Internship",
      organization: "YBI Foundation",
      period: "May – June 2024",
      summary:
        "Developed a Movie Recommendation System using Python, Pandas, and Scikit-Learn on real-world datasets.",
      highlights: [
        "Constructed collaborative filtering and content-based recommendation models.",
        "Preprocessed high-dimensional user-item interaction matrices using Pandas & NumPy.",
      ],
    },
    {
      id: "training-vjh",
      title: "Hospital Biomedical Training",
      organization: "Vishesh Jupiter Hospital",
      period: "June – July 2023",
      location: "Indore, India",
      summary:
        "Comprehensive hospital clinical training in biomedical administration, device maintenance, calibration, and surgical suite operations.",
      highlights: [
        "Assisted in Biomedical Department administration, service history logs, and calibration verification.",
        "Gained practical exposure to preventive maintenance protocols and electrical safety checks on patient monitoring systems.",
        "Observed live surgical procedures to analyze the Biomedical Engineer's operational role in operating theaters.",
      ],
    },
  ],

  education: [
    {
      id: "edu-sgsits",
      institution:
        "Shri Govindram Seksaria Institute of Technology and Science (SGSITS)",
      degree: "B.Tech in Biomedical Engineering",
      period: "Graduated 2025",
      score: "CGPA: 6.67",
      location: "Indore, India",
      notes: "Focus on Biomedical Instrumentation, Medical Image Processing, and Healthcare Systems.",
    },
    {
      id: "edu-holycross-12",
      institution: "Holy Cross School",
      degree: "12th CBSE (Senior Secondary)",
      period: "2021",
      score: "73%",
      location: "Indore, India",
    },
    {
      id: "edu-holycross-10",
      institution: "Holy Cross School",
      degree: "10th CBSE (Secondary Examination)",
      period: "2019",
      score: "71.2%",
      location: "Indore, India",
    },
  ],

  skills: {
    biomedical: [
      "Preventive Maintenance",
      "Calibration (Basic Exposure)",
      "Biomedical Instrumentation",
      "Medical Image Processing",
      "Electrical Safety Inspections",
      "Equipment Inventory & AMC/CMC Management",
    ],
    programming: ["Python", "MATLAB", "Pandas", "Scikit-Learn", "Django", "HTML/CSS"],
    os: ["Windows"],
  },

  projects: [
    {
      id: "proj-rescue-ready",
      title: "Rescue Ready",
      period: "2024 – 2025",
      mentor: "Mr. Vinay Manurkar",
      tech: ["Django", "Python", "WebSockets", "Geolocation", "Tailwind CSS"],
      summary:
        "Web application designed for seamless hospital-ambulance coordination, featuring role-based authentication, live vehicle tracking, and real-time emergency dispatch updates.",
      impact:
        "Reduces emergency communication latency between dispatchers, ambulance paramedics, and trauma triage teams.",
    },
    {
      id: "proj-vein-detector",
      title: "Vein Detector",
      period: "2023 – 2024",
      mentor: "Mr. Sunny Ganavdiya",
      tech: ["MATLAB", "Image Processing Toolbox", "Near-Infrared Imaging Algorithms"],
      summary:
        "Medical image processing algorithm that enhances subcuticular venous structures from optical/NIR frames to assist clinicians during venipuncture, IV line insertion, and blood sampling.",
      impact:
        "Improves first-attempt vascular access rates and reduces puncture trauma in pediatric and geriatric patients.",
    },
    {
      id: "proj-motion-detector",
      title: "Motion Detector",
      period: "2022 – 2023",
      mentor: "Dr. Anuj Rawat (EI Department)",
      tech: ["PIR Sensors", "Infrared Pyroelectric Hardware", "Alert Trigger Logic"],
      summary:
        "Passive Infrared (PIR) sensor-based motion detection apparatus engineered for automated security, hospital area surveillance, and automated trigger response.",
      impact:
        "Enabled touchless room automation and sterile corridor movement tracking with zero optical privacy intrusion.",
    },
  ],

  workshopsAchievements: {
    workshops: [
      {
        title: "Care & Maintenance Workshop",
        organization: "B. Braun Medical (India) Pvt. Ltd.",
        period: "June 2023",
      },
    ],
    sports: [
      {
        title: "Silver Medallist in Basketball",
        year: "2016",
      },
      {
        title: "Bronze Medallist in Kho-Kho & Basketball",
        year: "2018",
      },
    ],
  },

  // 4 Architectural Layers matching Suhani's 4 Hospital Responsibilities
  icuLayers: [
    {
      id: "layer-01",
      layerNumber: "01",
      title: "Diagnostic Display & Clinical UI Bezel",
      systemName: "Multi-Parameter Clinical Interface",
      clinicalDomain: "Real-time Patient Monitoring",
      hospitalDutyRef: "DUTY 01 // PREVENTIVE MAINTENANCE & CALIBRATION",
      dutyTitle: "Preventive Maintenance & Calibration",
      dutyDescription:
        "Perform scheduled preventive maintenance, calibration, and electrical safety inspections on diagnostic, monitoring, and life-support medical equipment across hospital departments.",
      technicalSpecs: {
        component: "TFT Medical-Grade Touchscreen & Optical Filter Layer",
        inspectionMetric: "Optical Luminance & Zero-Drift Calibration",
        protocol: "Scheduled Monthly PM Inspection & Electrical Safety Check",
      },
    },
    {
      id: "layer-02",
      layerNumber: "02",
      title: "Telemetry PCB, Signal Processing & Safety Board",
      systemName: "Electrophysiology & Processing Subsystem",
      clinicalDomain: "Hardware Troubleshooting & Uptime",
      hospitalDutyRef: "DUTY 02 // BREAKDOWN TROUBLESHOOTING & UPTIME",
      dutyTitle: "Breakdown Troubleshooting & Rapid Recovery",
      dutyDescription:
        "Troubleshoot and resolve equipment breakdowns promptly to minimize clinical downtime and support uninterrupted patient care.",
      technicalSpecs: {
        component: "ECG/SpO2/NIBP Analog Front-End & Isolated DSP Microcontroller",
        inspectionMetric: "Patient Leakage Current < 10µA & Power Supply Ripple < 15mV",
        protocol: "Rapid On-Call Diagnostic & Board-Level Fault Isolation",
      },
    },
    {
      id: "layer-03",
      layerNumber: "03",
      title: "Pneumatics, Infusion Valves & Calibration Bus",
      systemName: "Fluidic & Life-Support Valve Manifold",
      clinicalDomain: "Inventory & Compliance Documentation",
      hospitalDutyRef: "DUTY 03 // INVENTORY, AMC/CMC & COMPLIANCE",
      dutyTitle: "Equipment Records & Regulatory Compliance",
      dutyDescription:
        "Maintain medical equipment inventory, service histories, AMC/CMC records, and compliance documentation in accordance with hospital quality standards.",
      technicalSpecs: {
        component: "Piezoelectric Pressure Transducers & Solenoid Micro-Valves",
        inspectionMetric: "Flow Volumetric Accuracy ±1.5% & Pressure Stability 0.1 PSI",
        protocol: "AMC/CMC Service Log Archiving & Equipment Quality Auditing",
      },
    },
    {
      id: "layer-04",
      layerNumber: "04",
      title: "Structural Hospital Chassis & Grounding Housing",
      systemName: "Shielded Polycarbonate Medical Enclosure",
      clinicalDomain: "Vendor Coordination & Clinical Guidance",
      hospitalDutyRef: "DUTY 04 // VENDOR COORDINATION & STAFF TRAINING",
      dutyTitle: "Vendor Coordination & Clinical Staff Guidance",
      dutyDescription:
        "Coordinate with vendors and service engineers for equipment installation, repairs, and technical guidance to nursing and clinical staff on safe device operation.",
      technicalSpecs: {
        component: "Extruded Aluminium Baseplate with Faraday Shield & Earth Bonding",
        inspectionMetric: "Protective Earth Resistance < 0.1Ω per IEC 60601-1",
        protocol: "Vendor Commissioning Sign-off & Nursing Staff In-Service Training",
      },
    },
  ],
};
