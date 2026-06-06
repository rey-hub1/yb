// Data section "Dokumentasi" (03.x). Tiap box = 1 subfolder Drive.
// COVERS[folderId] = file ID kandidat (hasil scrape) untuk thumbnail acak.
// Kalau kosong / thumbnail gagal → frontend fallback ke icon.
// Admin bisa override cover per box; tersimpan di localStorage (key DOC_COVER_KEY).

export const DOC_COVER_KEY = "yb-doc-covers"; // { [boxId]: fileId | url }

// thumbnail Drive dari file ID (gambar / poster video). Butuh file public.
// lh3.googleusercontent lebih reliable + balikin 404 beneran (onError nyala) vs
// endpoint /thumbnail yang sering hang/blank buat ID subfolder/video.
export const driveThumb = (id) =>
    `https://lh3.googleusercontent.com/d/${id}=w600`;

// ekstrak file ID dari input admin (boleh paste link Drive penuh atau ID mentah)
export function parseDriveId(input = "") {
    const s = input.trim();
    if (!s) return "";
    const m = s.match(/[-\w]{25,}/);
    return m ? m[0] : s;
}

// pool kandidat cover hasil scrape embeddedfolderview (per folder box)
const COVERS = {
    "1r-uBCfdrSS-UKRbJa2BL2_4FWIdI2-PK": [
        "1CuDwQ-t9pbcoBctE3tdoh7e-Raw61GNq",
        "1EYA5XL6ZoqnRE4CT623tHvoUdf1Nouqp",
        "11iQ7SA6HpYbcQ8IutIM3pjfH4WynePvo",
        "1eUQhgGcDfTq3vY8iJeIcM0VJbaW3u_rP",
        "1rI9tmeQH3Fw-1R2TQcFghBpI0cJmpMLM",
        "1VhvOmLz2sZuCU7XfqWasZUIMvM3Uuycm",
        "1lsqKSpdYKAqmph8PiqxvDXeMaIFppEow",
        "1ypqxb9L3FH7mddFlZXVAZhvVwBWtlqc2",
    ],
    "1fA7wXPvT322cGpIEcLQVDoGjyLowMcIL": [
        "1gt8DuxrMum9BuPGk-nD1qKgjWIestGop",
        "1TYVPMZsnUV2zkd-RUNbeirtRNiEBsDAa",
        "1oasE82Iq9NvtV249FmCmgJtViJ5Z2pZm",
        "1EveRAc_12bZ7UVeRpXSS1JuY4cDkouMB",
        "1v4Q101ppKqavof6C9Tq9CIVLlXHBm-V-",
        "1N-r97guujIbek9-DeSVHFjz8Og-jT9jr",
        "1BKrt5mWjEktp5kuxGzGx0BD14R3-EHq2",
        "1AfUOeVB0tNQyMVw9zlBYpbKLFJ7cPwa8",
    ],
    "1zj7Rx-oL5D82IXALTyQstKLHzN6oZH_4": [
        "1a7sPa8J400XYUNv5p2GKyFKpFGrzSv2b",
        "1WJFmZ40JIr6cisOMt9yktKLMHzC2D5N1",
        "1w9ppKkJVTEcjFEJnnWIuoiSDYGtnDIhu",
        "1mpaX3eNTE3ohNVKU37sQWi41eh0TwhpH",
        "1l1AjNOITcbZ9Zr0pct9SfusxT9tUlIhE",
        "1eWUGBmDxSNdr1iiRT_-4QeaYwDUJ_mvw",
        "1BlZN0hmIDXe39ywQkrCmOSa3EE8WvGvC",
        "1NfAM79BaseeRJaZjXT_GiiM9bKoSZjbx",
    ],
    "1ICpVe9gKeqaeJlvUZ0rvmHs3vAIoDqwB": [
        "1vHA6V7VaweVWODEMaWcwTrm4pU5f0NHo",
        "1Y5ajA3Q8kifV7DX1CSi6N9E-OO2nXHvC",
        "1q5q2opoZ3grK0n0HiCdZZYXxsiEx2-Xm",
        "1Oz5GC4V-cHarYKaHao7W9AyKI57CibZ1",
        "1ePTE778TIny2vyvlt7s5omQOM8gA9VxX",
        "190A7bnTmQ0GSoPhWZapwWeNwQBgDvIwZ",
        "1lYMpiFSdozdXeK_D5KFp5wW2OBf4jS9T",
        "1fTq2tSi4XHzyr1oa5dEvDCqQZz5OFo9Y",
    ],
    "1rLgysNXYQ_C3v-FnLXK1z_PX50hyYKvJ": [
        "1UrORI0E8u8brc-n6a5E6c1xUY7JdXDLt",
        "1aquzOYBl4hZCQnAsHczif4e69FjRJltq",
        "1cpGDOKfcDT6t6EDj1uugHwTKCpzuoIPJ",
        "1yECVFWP-DCfz1Vp7erbMx6u0ixqwphii",
        "1KfPgXSDSBZapIleRmliwG9S1IPBChekJ",
        "1_Q9KQr6UQB437ZVGsBj89sRssYG5-ReH",
        "16fUDAarGwA6bwLE7ocmXVu0j_net3EVM",
        "1DtZgMeEo_cjSQNLXfYgKXlE-_kmrPuuL",
    ],
    "1syQ-8caW2HKhWvsxP-owj_chYsgD55BB": [
        "1ihEIg1oifngh5tSSzTzVBnLZJ1dLPVUH",
        "1BCL5Jc3l6nDVWXxD9fqZn4gkDpRH02T5",
        "1r9mTAT1JDUcsn64eyREsHHJM5Tu-UD_q",
        "1riu7V2dqjimY_uubQFvWBOg3yEfT1Si7",
        "16HW8UIAjZDVKE43XgkqnXmZvx7ah-AN1",
        "1ESA3vm8Yi-rWT2-WamouHhtnF46zpbxL",
        "1sLbuXuEdKgGkyP_N8dZKdEuwnVxJTnm6",
        "1ujnKaMqdHul3pN8KSD8wEx0qKByijPBI",
    ],
    "1bqfAEekq5mMtuuwY0kSCAFale2F89ptP": [
        "1DzuGpaRRl9CWA0YXU9q9RB9aI978W4yS",
        "1BpO24xs5wjbFbnfQzPnPq9ORoOrYE5Z7",
        "1cB2oK389ztAEODSMrrLm7Ip_50XfkSLf",
        "1-DZMYYArebmIRjKnWfL4_sncfY17MkoL",
        "15zBOrtpW79ZjNkkmwvtXs6aMXGAIaatR",
        "1_X7ws96tEakyC4hdKpu8wBsEfIFcMiCg",
        "1GAXl6u5x453_yn72DkMZqTyLW0kGXkcg",
        "1a8RmF9yEqVELJ116FtcZ9cy-8pJdVxps",
    ],
    "1prB7VJQjIE0Cf6C7klD-Se_-hOOxQsn-": [
        "1FwL-1OWN7FvcEm1HoBvHJm-WAPBTkwiv",
        "1WvuJNuctlnFy_ltvZx0dPRv8JTWqcB4D",
        "1GpeVANMn2FViFciOUW8NtGmur9MIzTvZ",
        "18iVcWv47sw7M2gYW00nQHBTK9tajp-TT",
        "17hGA1tyYguZvozD_IYI6iKMNQ9ovl11g",
        "10tEjstsJ79nFghYZTQHqwWo25sA4NTyG",
        "1E-5LgdzfvsnuShyyRYbJX4PDKu1MbT-T",
        "1vsha0ZqrvXx5WjtyYzTHKQi-wsBqtp_2",
    ],
    "1GiIVWGYTHMIrNnZH0YR-Qo_MdRGPlLAy": [
        "1dQi3xBs4pL8mYmSnTKP4GOSirfRNrIzM",
        "1gH7pfkE-UvdcEKhfkJ6N8CE6Reo-GU3S",
        "1DbiiKhWeUVnNW01TNi49kmqE9uxj0OPl",
        "1ffHX9PYWwmY4YhIE9WcJjnIN_aOYjjdb",
        "1Qg61r-yvUtQ4QE_riZfKtbUxQ0ZPfdof",
        "1sq5DMjfLckCcwMAj7-Apc0Vxh5Y5iOsl",
        "1Mres1C8W4pdyieoRew22bBLcoGtsnIkh",
        "1hz7Dna6YDw7A0CZVk2gWtXN5lI59JnNZ",
    ],
    "1ilga5F9qmp9kGLOwRn__VB_xHMJ_0Jl1": [
        "1Hja-arlsgEpvggtT6ZFLZOPyEsGx-wh-",
        "1dAfxCaOPLI_UL9hj_qzb3qNwnu00zAjK",
        "1bRj0e1wyehV66My3g4pn0mPHs-4XId6q",
        "1VBLyP6HGtjpy8Yi8NGkq8glaH4tiEh5m",
        "1mwf-OwhzYzPkbTS_ocDN00z359za4Ofr",
        "1AWViWYYoLgI100TJkzpbN1FG4f1s9hbf",
        "11QLHYQkSOYUdo3t9vjrWhzSq__xPZvaL",
        "1AQnXkQ2EQ4MpMAh7rdHEEtubSAShje5W",
    ],
    "1aMM3IHGKlUcG2yu_8w_xuRhyiO6lCnvZ": [
        "1Hy4fcUD2c4XIbkxIIWVh7vn07ygLr5q_",
        "14Ifo7f4O-J53Mn1pRnMfJkphAgq6yewz",
        "1pitVrkRNBfVzp0SjWVvWUjTL6re-qmBP",
        "1ZbOGzwIrsajxanjnUw2N0BFCMELwE_h7",
        "1XX14hXOYLKKKJANp5Je2iCehP8ZLn48V",
        "1jpQ6ey8ny6I0nj22T9Y5tcmyv6oIVoKU",
        "1D5Dd-Y1cTqgLGQS9KajAZD8Ql94eJfmR",
        "1VjQ0973uyzYjig6aXe3XAy0B5LqhqZuS",
    ],
    "1DBxDnbCD_Gj7rmJJe185P2wdb-o0q1wj": [
        "1mFmoK1fFprRS3uezSzSvvn9VMg8Gthhd",
        "11ikogeNJ7nK9wfLpHIG7-7F_UXhG4e_q",
        "1vtriC7ZbV_kTDQF4btRr0SiNGdv_QkML",
        "1JrdWvIOOU9CcIdT0CRfiYU3d54ztm94s",
        "1LUtokM85mtX7PPT1azALtJOQjxzLc-Ww",
        "1SulADb6WiDVnA7724_T3Ahoa3_SIibeA",
        "1JKsME1DeZtca9Hy5KlmP-p0qqwyE6K2d",
        "1NthlFIIW1PjvVLxSc8cpLZttqhSP12R0",
    ],
    "1rsY3qwTUWWOxgWcyQpAClCFnKWEYVXJn": [
        "1uk9xjGZW_OMS2Qx1hKZDrZ0CGH6cXJJ_",
        "1C9BXT6z_QR1gfUVmX9qhtLMnwTleJtLz",
        "1-DxhDpmNbWgQ0R6tYjb--yBx3G4ui3xO",
        "1XxBOILDPPhuTHELL5wmrVvAWnKi6UwXp",
        "12aAx1GjCtpn3fVG3Mhd0Mg62RnBaLYkW",
        "1H83d2uktxRYF-Yaj09IlsJbM_Y5htlB4",
        "1c79Daa5LOtAFc2rHQv5rWQ1bLIezULuL",
        "1hV1xTzNDqxuzqMQUWLLdBXboPY0_Ed51",
    ],
    "1_8wbmESd6MuLlA9CQ9XadF_yX8UqAkmB": [
        "1vb0UixnALf7bMP9oK0LQt4GLjDy5hjS1",
        "1N3zRLqX3J1py6SEIME0rMeu_GPMZ8sKb",
        "11zH11oYLcvf5ggLsUP_-h2M5sQ01sdwP",
        "1KXzMQPiFQkVMQf01FTOYIsQXZnkmrR8_",
        "1hAVcSbvlT5DksdlYluKeOKNyXQQ9NImJ",
        "1bxUaiZPQxy6ZusCeii767sYpZL_ui3-D",
        "1PjvahCUNHsRj4SKn_EUi9UjU7N5JOsnx",
        "13EB9DFOAK5kIIEMutvTI7bjAdJe86Kqj",
    ],
    "1ViYp32gbhyqqn2BEO2UX4wZhxuOuR-CA": [
        "1SysUFh38Qcy0t7FtzdLV9PLAXVzyhyJx",
        "1rNYP4jhTXpdJTMd8-2FRVyYWfVlM9Aje",
        "1efmPYQlQv5J57ekq4Inj0rZIThLfMHo0",
        "1JQ0cL3Bcx4a1o14oGvAhPLWan39GQsKl",
        "1PVU1ohq6U1eO7jqBkP45E1mNt0q63Eft",
        "1pdNvY2qDF5rZru22BdPzW7Gkj9WAiDRW",
        "1f8BeOuxSd3tl3NzDT3ap72AHYJaGny1N",
        "1cVTH1fbm4AYDr9aHqRcmxp61unvlqYNz",
    ],
    // catatan: folder berikut hanya berisi subfolder / kosong → thumbnail mungkin gagal,
    // fallback ke icon. Admin bisa override manual lewat panel Cover PDD.
    // 15t15... (Cinematic), 1sJer... (Foto HP), 10QIS... (Angklung), 1x9Fu... (Tari),
    // 1EcTI... (Jurusan), 1THdC... (Sambutan), 1p1rd... (Ibu KCD), 1J973... (Desti, kosong),
    // 1dnf9... (Video Mentah, cache collision).
};

function box(id, name, sub, icon, disabled = false) {
    return { id, name, sub, icon, disabled, covers: COVERS[id] || [] };
}

export const DOC_SECTIONS = [
    {
        id: "smartfest",
        index: "3.1",
        label: "Smart Fest",
        desc: "Dokumentasi acara · 25 Mei 2026",
        folder: "1Yhj_RXJnZ35U5bORiKktije6hTouq1Re",
        boxes: [
            box(
                "1r-uBCfdrSS-UKRbJa2BL2_4FWIdI2-PK",
                "Pengalungan Medali",
                "& Siswa Berprestasi",
                "🏅",
            ),
            box(
                "15t15xMXHTPUxUL6mG6GxTq31UiOh9oPi",
                "Cinematic Video",
                "Highlight acara",
                "🎬",
                "true",
            ),
            box(
                "1fA7wXPvT322cGpIEcLQVDoGjyLowMcIL",
                "Video HP",
                "Rekaman warga",
                "📱",
            ),
            box(
                "1sJerDlqP2RSzqCMWCQyHYByhOiyrWbGN",
                "Foto (HP)",
                "Galeri foto",
                "📸",
            ),
            box(
                "1zj7Rx-oL5D82IXALTyQstKLHzN6oZH_4",
                "Potong Tumpeng",
                "Seremoni",
                "🍚",
            ),
            box(
                "1ICpVe9gKeqaeJlvUZ0rvmHs3vAIoDqwB",
                "Doorprize",
                "Bagi hadiah",
                "🎁",
            ),
            box(
                "10QISQ0UUgCwyn5GXHgQJsBDK6S5CMcwl",
                "Penampilan Angklung",
                "Pentas seni",
                "🎶",
            ),
            box(
                "1x9Fugru3pWgWU9cahRBIA1tSeP7GClJF",
                "Penampilan Tari",
                "Pentas seni",
                "💃",
            ),
            box(
                "1EcTILOgTfaKtcKlloYaLxrWPcb0H9gCI",
                "Penampilan Jurusan",
                "Pentas seni",
                "🎭",
            ),
            box(
                "1THdCGm_xMND_ADWZZubiQ1uUGXVO-8gT",
                "Sambutan",
                "Pidato",
                "🗣️",
            ),
            box(
                "1rLgysNXYQ_C3v-FnLXK1z_PX50hyYKvJ",
                "MC",
                "Pembawa acara",
                "🎤",
            ),
            box(
                "1syQ-8caW2HKhWvsxP-owj_chYsgD55BB",
                "Panitia",
                "Tim acara",
                "🤝",
            ),
            box(
                "1bqfAEekq5mMtuuwY0kSCAFale2F89ptP",
                "Guru",
                "Bapak/Ibu guru",
                "🧑‍🏫",
            ),
            box(
                "1p1rdV04rY9dm963eKkBiBm1R9skpv0B4",
                "Ibu KCD",
                "Tamu undangan",
                "🎀",
            ),
            box(
                "1prB7VJQjIE0Cf6C7klD-Se_-hOOxQsn-",
                "Siswa-siswi",
                "Wajah angkatan",
                "🎓",
            ),
        ],
    },
    {
        id: "pdd",
        index: "3.2",
        label: "Dokumentasi PDD",
        desc: "Rekaman dokumentasi per orang",
        folder: "1GBCAzKQR9jFzXUTqII0chkhijt13YL1N",
        boxes: [
            box(
                "1J973So2OHeU2xe2ZZJloehVJ9SYEqrqd",
                "Dokumentasi Desti",
                "Rekaman HP",
                "🎥",
            ),
            box(
                "1ilga5F9qmp9kGLOwRn__VB_xHMJ_0Jl1",
                "Dokumentasi Syhdan",
                "Rekaman HP",
                "🎥",
            ),
            box(
                "1DBxDnbCD_Gj7rmJJe185P2wdb-o0q1wj",
                "Dokumentasi Reyno",
                "Rekaman HP",
                "🎥",
            ),
        ],
    },
    {
        id: "angkatan",
        index: "3.3",
        label: "Foto Angkatan",
        desc: "Kenangan satu angkatan",
        folder: "1t-l6d3NKN-G0mtyKI8FN7H-7lYTFjcL8",
        boxes: [
            box(
                "1rsY3qwTUWWOxgWcyQpAClCFnKWEYVXJn",
                "Photo Edit",
                "Foto editan",
                "🖼️",
            ),
            box(
                "1_8wbmESd6MuLlA9CQ9XadF_yX8UqAkmB",
                "Smekda 1",
                "Sesi 1",
                "📷",
            ),
            box(
                "1ViYp32gbhyqqn2BEO2UX4wZhxuOuR-CA",
                "Smekda 2",
                "Sesi 2",
                "📷",
            ),
            box(
                "1dnf9m8C6kLoVlgyh2Eno_fQXyGnVz6IP",
                "Video Mentah",
                "Footage mentah",
                "🎞️",
            ),
        ],
    },
];

// flatten semua box (dipakai admin PDD)
export const ALL_DOC_BOXES = DOC_SECTIONS.flatMap((s) =>
    s.boxes.map((b) => ({ ...b, sectionId: s.id, sectionLabel: s.label })),
);
