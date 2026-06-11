import React, { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   GAGAN SINGH RAUT — TERMINAL / DIGITAL-RAIN PORTFOLIO
   Single-file React component. No external deps beyond React.
   ============================================================ */

const C = {
  bg: "#020602",
  panel: "#04120699",
  green: "#00ff41",
  dim: "#0f5a25",
  faint: "#0a2e14",
  text: "#b8f5c4",
  white: "#eafff0",
  amber: "#ffd24a",
};

/* ---------- mantra rain canvas ---------- */
/* Each column streams one mantra top-to-bottom, split into akshara
   (syllable clusters) so conjuncts like क्ष्म्यै render intact. */
const MANTRAS = [
  ["ॐ", "गं", "ग", "ण", "प", "त", "ये", "न", "मः"],
  ["ॐ", "श्री", "म", "हा", "ल", "क्ष्म्यै", "न", "मः"],
  ["ॐ", "न", "मः", "शि", "वा", "य"],
  ["ॐ", "ह", "नु", "म", "ते", "न", "मः"],
];
const pickMantra = () => MANTRAS[Math.floor(Math.random() * MANTRAS.length)];

function DigitalRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf, cols, drops, steps, texts, w, h;
    const fontSize = 17;
    const colWidth = 28; // wider than fontSize: conjunct clusters need room
    const rowH = 24; // extra leading for matras above/below the baseline
    const gap = 4; // blank cells between mantra repetitions

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / colWidth);
      drops = Array(cols).fill(1).map(() => Math.random() * -50);
      steps = Array(cols).fill(0);
      texts = Array.from({ length: cols }, pickMantra);
      if (reduce) {
        // setting canvas dimensions clears it, so repaint the static frame
        ctx.fillStyle = "rgba(2,6,2,1)";
        ctx.fillRect(0, 0, w, h);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    let last = 0;
    const draw = (t) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 45) return; // slow fall, easy to read
      last = t;
      ctx.fillStyle = "rgba(2, 6, 2, 0.06)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = fontSize + "px 'Noto Sans Devanagari', monospace";
      for (let i = 0; i < cols; i++) {
        const m = texts[i];
        const idx = steps[i] % (m.length + gap);
        const y = drops[i] * rowH;
        if (idx < m.length) {
          const ch = m[idx];
          ctx.fillStyle =
            ch === "ॐ" ? "#ffd24a" : Math.random() > 0.96 ? "#d6ffe0" : "#00ff41bb";
          ctx.fillText(ch, i * colWidth, y);
        }
        steps[i]++;
        drops[i]++;
        if (y > h && Math.random() > 0.975) {
          drops[i] = 0;
          steps[i] = 0;
          texts[i] = pickMantra();
        }
      }
    };

    // reduced-motion users get the static frame painted in resize()
    if (!reduce) raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        opacity: 0.5,
        pointerEvents: "none",
      }}
    />
  );
}

/* ---------- typewriter hook ---------- */
function useTypewriter(lines, speed = 28, startDelay = 300) {
  const [out, setOut] = useState([]);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOut(lines);
      setDone(true);
      return;
    }
    let li = 0,
      ci = 0,
      cancelled = false;
    const buf = lines.map(() => "");
    const tick = () => {
      if (cancelled) return;
      if (li >= lines.length) {
        setDone(true);
        return;
      }
      buf[li] = lines[li].slice(0, ci + 1);
      setOut([...buf.slice(0, li + 1)]);
      ci++;
      if (ci >= lines[li].length) {
        li++;
        ci = 0;
        setTimeout(tick, 220);
      } else {
        setTimeout(tick, speed);
      }
    };
    const t = setTimeout(tick, startDelay);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []); // eslint-disable-line
  return [out, done];
}

/* ---------- shared bits ---------- */
const Cursor = () => (
  <span
    style={{
      display: "inline-block",
      width: "9px",
      height: "1.1em",
      background: C.green,
      verticalAlign: "text-bottom",
      marginLeft: "2px",
      animation: "blink 1s steps(1) infinite",
    }}
  />
);

function Window({ title, children, id }) {
  return (
    <section id={id} style={{ margin: "0 0 56px" }}>
      <div
        style={{
          border: `1px solid ${C.dim}`,
          background: C.panel,
          backdropFilter: "blur(2px)",
          boxShadow: `0 0 24px #00ff4111`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderBottom: `1px solid ${C.faint}`,
            background: "#03160a",
          }}
        >
          <span style={dot("#ff5f56")} />
          <span style={dot("#ffbd2e")} />
          <span style={dot("#27c93f")} />
          <span
            style={{
              marginLeft: "10px",
              color: C.dim,
              fontSize: "12px",
              letterSpacing: "0.08em",
            }}
          >
            gagan@uws:~$ {title}
          </span>
        </div>
        <div style={{ padding: "26px 28px" }}>{children}</div>
      </div>
    </section>
  );
}
const dot = (c) => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: c,
  opacity: 0.85,
});

const H = ({ children }) => (
  <h2
    style={{
      color: C.green,
      fontSize: "13px",
      letterSpacing: "0.25em",
      textTransform: "uppercase",
      margin: "0 0 18px",
    }}
  >
    ▸ {children}
  </h2>
);

const Tag = ({ children }) => (
  <span
    style={{
      display: "inline-block",
      border: `1px solid ${C.dim}`,
      color: C.text,
      padding: "3px 9px",
      margin: "0 6px 6px 0",
      fontSize: "12px",
    }}
  >
    {children}
  </span>
);

/* ---------- data from CV ---------- */
const PROJECTS = [
  {
    name: "explainable_ids_treeshap.py",
    title: "Explainable IDS — TreeSHAP Stability & ATT&CK Alignment",
    badge: "MSc DISSERTATION",
    desc:
      "Random Forest intrusion detection on CICIDS2017 with per-alert TreeSHAP explanations. Original stability analysis (Jaccard, Spearman across nearest-neighbour flows) and MITRE ATT&CK alignment scoring for DDoS (T1498) and Brute Force (T1110), presented in a Streamlit alert viewer.",
    tags: ["Python", "scikit-learn", "SHAP", "CICIDS2017", "MITRE ATT&CK", "Streamlit"],
  },
  {
    name: "c2_beacon_hunt.spl",
    title: "Threat Intelligence & Splunk — C2 Beaconing Detection",
    desc:
      "Ingested OSINT threat feeds (URLhaus, Abuse.ch, AlienVault OTX) into Splunk Enterprise; hypothesis-driven hunts with SPL and Smart Outlier Detection surfaced 15 C2 beaconing events in web server logs. Produced an ATT&CK-mapped adversary profile for NoName057(16).",
    tags: ["Splunk", "SPL", "OSINT", "Threat Hunting"],
  },
  {
    name: "llm_metasploit_mcp.sh",
    title: "AI-Augmented Penetration Testing — LLM + Metasploit via MCP",
    desc:
      "Integrated Claude with the Metasploit RPC daemon through a Model Context Protocol server on Kali Linux: natural-language reconnaissance (Nmap), exploit selection and post-exploitation (VSFTPD backdoor, EternalBlue MS17-010) in an isolated lab.",
    tags: ["MCP", "Metasploit", "Kali Linux", "Nmap"],
  },
  {
    name: "malware_static_dynamic.md",
    title: "Malware Analysis — Static & Dynamic",
    desc:
      "In-depth static analysis of a DOS/boot-sector sample using PEStudio, Detect It Easy and IDA Pro (raw 16-bit mode); dynamic analysis via Cuckoo Sandbox, correlating AV reputation, behavioural indicators and VirusTotal results (Yesmile variant, 27/62 detection rate).",
    tags: ["IDA Pro", "PEStudio", "Cuckoo Sandbox", "VirusTotal"],
  },
  {
    name: "disk_image_forensics.e01",
    title: "Digital Forensics — Disk Image Analysis",
    desc:
      "Forensic examination of an E01 disk image with Autopsy following UK forensic best practices: contemporaneous logbook, verified hash integrity and recovered evidence for a simulated criminal investigation. Additional tooling: Nmap, Wireshark, FTK Imager.",
    tags: ["Autopsy", "FTK Imager", "Chain of Custody"],
  },
  {
    name: "incident_response_plan.docx",
    title: "Incident Response Plan — Multinational Media Organisation",
    desc:
      "Authored a formal IRP using the SANS PICERL framework covering ransomware, insider threat and spear-phishing across three jurisdictions (UK GDPR, India DPDP Act 2023, CCPA), including Volatility 3 memory forensics analysis.",
    tags: ["SANS PICERL", "Volatility 3", "GRC"],
  },
  {
    name: "sentry_nlp_detector.py",
    title: "SENTRY — NLP-Based Social Engineering Detection",
    desc:
      "Enterprise email security tool using NLP pipelines to detect social engineering attempts; built the email parsing, cleaning pipeline and tokeniser components in Python.",
    tags: ["Python", "NLP", "Email Security"],
  },
  {
    name: "rogue_ap_lab.conf",
    title: "Rogue Access Point & Wi-Fi Security Lab",
    desc:
      "Configured a rogue AP with HOSTAPD and DNSMASQ on Kali Linux; captured plaintext HTTP credentials and 4-way EAPOL handshake frames via Wireshark, demonstrating real-world Wi-Fi attack vectors and countermeasures.",
    tags: ["HOSTAPD", "DNSMASQ", "Wireshark"],
  },
  {
    name: "keycloak_iam.yaml",
    title: "Cloud Identity & Access Management — Keycloak",
    desc:
      "Configured a Keycloak identity provider with GitHub and Google OAuth2 social login in a custom realm; managed user lifecycle, client secrets and redirect URIs — federated identity in practice.",
    tags: ["Keycloak", "OAuth2", "IAM"],
  },
  {
    name: "rsa_crypto_lab.pem",
    title: "RSA Cryptography Lab — Encryption, Signatures & Tamper Detection",
    desc:
      "Generated 2048-bit RSA keys with OpenSSL; demonstrated confidentiality via public-key encryption and integrity via SHA-256 digital signatures, with a tamper test confirming signature invalidation on file modification.",
    tags: ["OpenSSL", "RSA", "SHA-256"],
  },
];

const SKILLS = [
  ["SIEM & Monitoring", ["Splunk (SPL, AI Toolkit)", "Kibana", "Wireshark", "Nmap", "Burp Suite"]],
  ["Forensics", ["Autopsy", "FTK Imager", "Volatility 3", "WinHex"]],
  ["Malware Analysis", ["PEStudio", "IDA Pro", "Detect It Easy", "Cuckoo Sandbox"]],
  ["Offensive & Network", ["Kali Linux", "Metasploit (MCP/RPC)", "HOSTAPD/DNSMASQ", "OpenSSL"]],
  ["Programming & ML", ["Python (pandas, scikit-learn)", "SQL", "Java", "PHP", "SHAP/TreeSHAP", "Ollama (Llama 3)", "Streamlit"]],
  ["IAM", ["Keycloak", "OAuth2", "GitHub/Google federation"]],
  ["Frameworks", ["MITRE ATT&CK", "SANS PICERL", "Cyber Kill Chain", "NIST 800-61"]],
  ["Systems", ["Kali Linux", "Ubuntu", "Windows 10/Server", "VirtualBox", "Flare VM", "WSL2"]],
];

const NAV = [
  ["about", "whoami"],
  ["experience", "history"],
  ["projects", "ls ./projects"],
  ["skills", "modules"],
  ["contact", "ping me"],
  ["references", "refs"],
];

/* ---------- main ---------- */
export default function Portfolio() {
  const [bootDone, setBootDone] = useState(false);
  const [bootLines] = useState([
    "> initializing secure session ...",
    "> loading profile: GAGAN SINGH RAUT",
    "> role: MSc Cybersecurity Student",
    "> clearance granted. welcome.",
  ]);
  const [typed, typeDone] = useTypewriter(bootLines, 18, 400);
  const [pendingScroll, setPendingScroll] = useState(null);
  useEffect(() => {
    if (typeDone) {
      const t = setTimeout(() => setBootDone(true), 500);
      return () => clearTimeout(t);
    }
  }, [typeDone]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // section not rendered yet (boot still typing) — skip boot, scroll after render
      setBootDone(true);
      setPendingScroll(id);
    }
  }, []);

  useEffect(() => {
    if (bootDone && pendingScroll) {
      document.getElementById(pendingScroll)?.scrollIntoView({ behavior: "smooth" });
      setPendingScroll(null);
    }
  }, [bootDone, pendingScroll]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Share Tech Mono','JetBrains Mono',ui-monospace,monospace",
        position: "relative",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        section { scroll-margin-top: 64px; }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:.6} 94%{opacity:1} }
        a { color: ${C.green}; text-decoration: none; }
        a:hover, button:hover { text-shadow: 0 0 8px ${C.green}; }
        a:focus-visible, button:focus-visible { outline: 2px solid ${C.green}; outline-offset: 3px; }
        .navbtn { background:none;border:none;color:${C.text};cursor:pointer;
          font-family:inherit;font-size:13px;letter-spacing:.08em;padding:6px 4px; }
        .navbtn:hover { color:${C.green}; }
        .projcard { transition: border-color .2s, box-shadow .2s; }
        .projcard:hover { border-color:${C.green} !important; box-shadow:0 0 18px #00ff4133; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
          html { scroll-behavior: auto; }
        }
        @media (max-width: 640px) { .wrap { padding: 0 16px !important; } }
      `}</style>

      <DigitalRain />

      {/* scanline overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.18) 2px 4px)",
        }}
      />

      <div className="wrap" style={{ position: "relative", zIndex: 2, maxWidth: 920, margin: "0 auto", padding: "0 28px" }}>
        {/* nav */}
        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 22px",
            alignItems: "center",
            padding: "18px 0",
            borderBottom: `1px solid ${C.faint}`,
            position: "sticky",
            top: 0,
            background: "#020602ee",
            zIndex: 5,
          }}
        >
          <span style={{ color: C.green, fontWeight: 700, letterSpacing: ".15em", marginRight: "auto" }}>
            [GSR://SEC]
          </span>
          {NAV.map(([id, label]) => (
            <button key={id} className="navbtn" onClick={() => scrollTo(id)}>
              ./{label}
            </button>
          ))}
          <a
            className="navbtn"
            href="https://github.com/arsenic55"
            target="_blank"
            rel="noopener noreferrer"
          >
            ./github
          </a>
        </nav>

        {/* hero / boot sequence */}
        <header style={{ padding: "72px 0 64px", animation: "flicker 7s infinite" }}>
          <div style={{ minHeight: "120px", fontSize: "14px", lineHeight: 1.9, color: C.text }}>
            {typed.map((l, i) => (
              <div key={i}>
                {l}
                {i === typed.length - 1 && !typeDone && <Cursor />}
              </div>
            ))}
          </div>
          {bootDone && (
            <>
              <h1
                style={{
                  margin: "26px 0 8px",
                  fontSize: "clamp(30px, 6vw, 56px)",
                  color: C.white,
                  letterSpacing: ".04em",
                  textShadow: `0 0 18px #00ff4166`,
                }}
              >
                GAGAN SINGH RAUT<Cursor />
              </h1>
              <p style={{ color: C.green, fontSize: "15px", letterSpacing: ".12em", margin: 0 }}>
                MSc CYBERSECURITY · SOC & EXPLAINABLE-AI INTRUSION DETECTION
              </p>
              <p style={{ maxWidth: 640, lineHeight: 1.8, fontSize: "14px", marginTop: 18 }}>
                Carluke, Scotland, UK — defending networks by day, explaining machine-learning
                detections by dissertation. Hands-on across SIEM, forensics, malware
                analysis and incident response.
              </p>
              <div style={{ marginTop: 24 }}>
                <button className="navbtn" style={{ border: `1px solid ${C.green}`, color: C.green, padding: "10px 18px" }}
                  onClick={() => scrollTo("projects")}>
                  &gt; view projects_
                </button>
              </div>
            </>
          )}
        </header>

        {bootDone && (
          <>
            {/* about */}
            <Window id="about" title="whoami">
              <H>Profile</H>
              <p style={{ lineHeight: 1.9, fontSize: "14px", margin: 0 }}>
                MSc Cybersecurity student at the <span style={{ color: C.white }}>University of the West of Scotland</span>,
                achieving distinction-level performance, with commercial experience as a
                Junior Network and Security Analyst monitoring and securing enterprise
                networks. Hands-on across network security, digital forensics, malware
                analysis, threat intelligence and incident response, using
                industry-standard tooling — Splunk, Wireshark, Autopsy, Volatility — in
                both lab and professional environments. Dissertation in progress on{" "}
                <span style={{ color: C.green }}>
                  explainable AI for intrusion detection and SOC alert triage
                </span>.
              </p>
            </Window>

            {/* experience + education */}
            <Window id="experience" title="cat ./history.log">
              <H>Work Experience</H>
              {[
                {
                  role: "Junior Network and Security Analyst",
                  org: "Leading Edge Software Pvt. Ltd. — Birtamode, Nepal",
                  time: "May 2024 – Apr 2025",
                  pts: [
                    "Monitored enterprise networks for security anomalies, intrusion attempts and policy violations using SIEM tooling and network monitoring platforms.",
                    "Investigated and triaged security incidents — malware infections, unauthorised access attempts and data exfiltration alerts — producing structured incident reports.",
                    "Performed root cause analysis on security breaches, identifying attack vectors and recommending remediation actions.",
                    "Deployed and maintained firewalls, endpoint protection and access controls, reducing recurring network vulnerabilities.",
                  ],
                },
                {
                  role: "IT Assistant (Intern)",
                  org: "Roshan Lab — Kathmandu, Nepal",
                  time: "Mar 2019 – Jun 2019",
                  pts: [
                    "Assisted in network maintenance, ensuring smooth connectivity and uptime for all users.",
                    "Coordinated IT equipment transfer and setup during a full office relocation with zero downtime for core operations.",
                  ],
                },
              ].map((j) => (
                <div key={j.role} style={{ marginBottom: 26 }}>
                  <div style={{ color: C.white, fontSize: "15px" }}>{j.role}</div>
                  <div style={{ color: C.green, fontSize: "12px", margin: "4px 0 10px" }}>
                    {j.org} · {j.time}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: "13px" }}>
                    {j.pts.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <H>Education</H>
              <div style={{ marginBottom: 18 }}>
                <div style={{ color: C.white }}>MSc Cybersecurity</div>
                <div style={{ color: C.green, fontSize: "12px", margin: "4px 0 8px" }}>
                  University of the West of Scotland — UK · Sep 2025 – Sep 2026
                </div>
                <p style={{ fontSize: "13px", lineHeight: 1.8, margin: 0 }}>
                  Distinction-level performance across all modules: Advanced Network
                  Security, Malware Analysis, Cyber Threat Intelligence, Digital
                  Forensics, Incident Response, Applied Cryptography, GRC.
                </p>
              </div>
              <div>
                <div style={{ color: C.white }}>BEng Computer Network Engineering</div>
                <div style={{ color: C.green, fontSize: "12px", margin: "4px 0 8px" }}>
                  NAMI, affiliated to the University of Northampton, UK — Kathmandu · 2017 – 2021
                </div>
                <p style={{ fontSize: "13px", lineHeight: 1.8, margin: 0 }}>
                  Thesis: "Preventing Web Applications from Web Attacks" — web application
                  penetration testing, vulnerability identification and mitigation.
                </p>
              </div>
            </Window>

            {/* projects */}
            <Window id="projects" title="ls -la ./projects">
              <H>Hands-On Projects</H>
              <div style={{ display: "grid", gap: 18 }}>
                {PROJECTS.map((p) => (
                  <article
                    key={p.name}
                    className="projcard"
                    style={{ border: `1px solid ${C.faint}`, padding: "18px 20px", background: "#02100799" }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
                      <span style={{ color: C.dim, fontSize: "12px" }}>-rwxr--r--</span>
                      <span style={{ color: C.green, fontSize: "13px" }}>{p.name}</span>
                      {p.badge && (
                        <span style={{ color: C.amber, border: `1px solid ${C.amber}55`, fontSize: "10px", padding: "2px 8px", letterSpacing: ".12em" }}>
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <h3 style={{ color: C.white, fontSize: "15px", margin: "10px 0 8px", fontWeight: 600 }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: "13px", lineHeight: 1.8, margin: "0 0 12px" }}>{p.desc}</p>
                    <div>{p.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
                  </article>
                ))}
              </div>
            </Window>

            {/* skills */}
            <Window id="skills" title="lsmod | grep skills">
              <H>Technical Skills</H>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
                {SKILLS.map(([cat, items]) => (
                  <div key={cat}>
                    <div style={{ color: C.green, fontSize: "12px", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 10 }}>
                      [{cat}]
                    </div>
                    <div>{items.map((s) => <Tag key={s}>{s}</Tag>)}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28 }}>
                <H>Volunteering</H>
                <p style={{ fontSize: "13px", lineHeight: 1.8, margin: 0 }}>
                  <span style={{ color: C.white }}>Network Administrator Volunteer — Everest Hack 2019 (International Hackathon):</span>{" "}
                  set up, maintained and administered the full computer network and
                  computing environment over a continuous 48-hour event, supporting
                  international participants.
                </p>
              </div>
            </Window>

            {/* contact */}
            <Window id="contact" title="ping gagan --now">
              <H>Establish Connection</H>
              <p style={{ fontSize: "14px", lineHeight: 2, margin: 0 }}>
                <span style={{ color: C.dim }}>&gt; location:</span> Carluke, Scotland, UK
                <br />
                <span style={{ color: C.dim }}>&gt; github:&nbsp;&nbsp;</span>
                <a href="https://github.com/arsenic55" target="_blank" rel="noopener noreferrer">arsenic55</a>
                <br />
                <span style={{ color: C.dim }}>&gt; status:&nbsp;&nbsp;</span>
                <span style={{ color: C.green }}>open</span>
                <Cursor />
              </p>
            </Window>

            {/* references */}
            <Window id="references" title="cat ./references.txt">
              <H>References</H>
              <p style={{ fontSize: "14px", lineHeight: 2, margin: 0 }}>
                <span style={{ color: C.white }}>Althaff Mohideen PhD, FHEA</span>
                <br />
                <a href="mailto:Althaff.Mohideen@uws.ac.uk">Althaff.Mohideen@uws.ac.uk</a>
                <br />
                University of the West of Scotland
              </p>
            </Window>

            <footer style={{ padding: "12px 0 48px", color: C.dim, fontSize: "12px", textAlign: "center" }}>
              © {new Date().getFullYear()} Gagan Singh Raut · session encrypted · no cookies, only packets
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
