import React from "react";

export default function NotFound() {
    return (
        <div style={N.bg}>
            <style>{KEYFRAMES}</style>
            <div style={N.noise} />
            <div style={N.card} className="yn-notfound-card">
                <div style={N.glitchWrap}>
                    <h1 style={N.title} className="yn-glitch" data-text="404">404</h1>
                </div>
                <h2 style={N.subtitle}>Halaman Tidak Ditemukan</h2>
                <p style={N.desc}>
                    Ups! Sepertinya Anda tersesat. Halaman yang Anda cari tidak ada di buku kenangan ini atau telah dipindahkan.
                </p>
                <div style={N.rule} />
                <button 
                    className="yn-btn" 
                    style={N.btn} 
                    onClick={() => { window.location.href = "/"; }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Kembali ke Beranda
                </button>
            </div>
        </div>
    );
}

const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes noise {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-5%, -5%); }
    20% { transform: translate(-10%, 5%); }
    30% { transform: translate(5%, -10%); }
    40% { transform: translate(-5%, 15%); }
    50% { transform: translate(-10%, 5%); }
    60% { transform: translate(15%, 0); }
    70% { transform: translate(0, 10%); }
    80% { transform: translate(-15%, 0); }
    90% { transform: translate(10%, 5%); }
  }
  .yn-notfound-card {
    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .yn-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 20px rgba(35, 28, 21, 0.15);
  }
  .yn-btn:active {
    transform: scale(0.97);
  }
  .yn-glitch {
    position: relative;
    color: #231c15;
  }
  .yn-glitch::before, .yn-glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }
  .yn-glitch::before {
    left: 2px;
    text-shadow: -2px 0 #b85e45;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim 5s infinite linear alternate-reverse;
  }
  .yn-glitch::after {
    left: -2px;
    text-shadow: -2px 0 #a38c74;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim2 5s infinite linear alternate-reverse;
  }
  @keyframes glitch-anim {
    0% { clip: rect(6px, 9999px, 83px, 0); }
    5% { clip: rect(10px, 9999px, 99px, 0); }
    10% { clip: rect(72px, 9999px, 44px, 0); }
    15% { clip: rect(16px, 9999px, 12px, 0); }
    20% { clip: rect(8px, 9999px, 63px, 0); }
    25% { clip: rect(31px, 9999px, 16px, 0); }
    30% { clip: rect(51px, 9999px, 80px, 0); }
    35% { clip: rect(81px, 9999px, 34px, 0); }
    40% { clip: rect(27px, 9999px, 16px, 0); }
    45% { clip: rect(63px, 9999px, 92px, 0); }
    50% { clip: rect(98px, 9999px, 19px, 0); }
    55% { clip: rect(70px, 9999px, 91px, 0); }
    60% { clip: rect(65px, 9999px, 43px, 0); }
    65% { clip: rect(47px, 9999px, 90px, 0); }
    70% { clip: rect(31px, 9999px, 2px, 0); }
    75% { clip: rect(43px, 9999px, 59px, 0); }
    80% { clip: rect(69px, 9999px, 5px, 0); }
    85% { clip: rect(59px, 9999px, 100px, 0); }
    90% { clip: rect(40px, 9999px, 21px, 0); }
    95% { clip: rect(20px, 9999px, 99px, 0); }
    100% { clip: rect(92px, 9999px, 29px, 0); }
  }
  @keyframes glitch-anim2 {
    0% { clip: rect(31px, 9999px, 83px, 0); }
    5% { clip: rect(79px, 9999px, 27px, 0); }
    10% { clip: rect(83px, 9999px, 66px, 0); }
    15% { clip: rect(69px, 9999px, 78px, 0); }
    20% { clip: rect(100px, 9999px, 3px, 0); }
    25% { clip: rect(2px, 9999px, 72px, 0); }
    30% { clip: rect(62px, 9999px, 58px, 0); }
    35% { clip: rect(47px, 9999px, 13px, 0); }
    40% { clip: rect(8px, 9999px, 10px, 0); }
    45% { clip: rect(63px, 9999px, 97px, 0); }
    50% { clip: rect(42px, 9999px, 55px, 0); }
    55% { clip: rect(21px, 9999px, 45px, 0); }
    60% { clip: rect(50px, 9999px, 82px, 0); }
    65% { clip: rect(8px, 9999px, 7px, 0); }
    70% { clip: rect(78px, 9999px, 38px, 0); }
    75% { clip: rect(96px, 9999px, 37px, 0); }
    80% { clip: rect(18px, 9999px, 38px, 0); }
    85% { clip: rect(96px, 9999px, 57px, 0); }
    90% { clip: rect(50px, 9999px, 25px, 0); }
    95% { clip: rect(7px, 9999px, 16px, 0); }
    100% { clip: rect(24px, 9999px, 4px, 0); }
  }
`;

const N = {
    bg: {
        minHeight: "100vh",
        background: "#f4eee1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Lora', Georgia, serif",
        position: "relative",
        overflow: "hidden",
        color: "#231c15"
    },
    noise: {
        position: "absolute",
        top: "-50%", left: "-50%", right: "-50%", bottom: "-50%",
        width: "200%", height: "200%",
        background: "transparent url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png') repeat 0 0",
        backgroundRepeat: "repeat",
        animation: "noise .2s infinite",
        opacity: 0.05,
        pointerEvents: "none",
        zIndex: 1,
    },
    card: {
        width: "100%",
        maxWidth: 480,
        background: "#fcfbfa",
        border: "1px solid rgba(190, 168, 140, 0.4)",
        borderRadius: 4,
        padding: "56px 40px",
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        boxShadow: "0 12px 24px rgba(44,27,14,0.06), 0 1px 1px rgba(0,0,0,0.02)",
    },
    glitchWrap: {
        animation: "float 6s ease-in-out infinite",
        marginBottom: 16,
    },
    title: {
        margin: 0,
        fontFamily: "'DM Serif Display', serif",
        fontSize: 110,
        fontWeight: 400,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        color: "#231c15",
    },
    subtitle: {
        margin: "0 0 16px",
        fontSize: 22,
        color: "#b85e45",
        fontFamily: "'DM Serif Display', serif",
        fontWeight: 400,
    },
    desc: {
        margin: "0 0 36px",
        fontSize: 15,
        color: "#5e4c3a",
        lineHeight: 1.6,
    },
    rule: {
        margin: "0 auto 36px",
        width: "48px",
        height: "2px",
        background: "rgba(190, 168, 140, 0.4)",
        borderRadius: 2,
    },
    btn: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 28px",
        border: "none",
        borderRadius: 3,
        background: "#231c15",
        color: "#fcfbfa",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'Lora', Georgia, serif",
        cursor: "pointer",
        letterSpacing: ".02em",
        transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)",
    },
};
