// Content taken from the current Wix site and the lab's YouTube channel (@ntuaprilab8618).

const WIX = 'https://aprilabntu.wixsite.com/website';

export const navItems = [
  { name: '研究領域', en: 'Research', link: '#research' },
  { name: '作品影片', en: 'Projects', link: '#projects' },
  { name: '最新消息', en: 'News', link: '#news' },
  { name: '學術發表', en: 'Publications', link: `${WIX}/publication` },
  { name: '實驗室成員', en: 'Members', link: `${WIX}/%E5%89%AF%E6%9C%AC-research-area-%E7%A0%94%E7%A9%B6%E9%A0%98%E5%9F%9F` },
];

export const links = {
  youtube: 'https://www.youtube.com/@ntuaprilab8618',
  publications: `${WIX}/publication`,
  patents: `${WIX}/copy-of-publication`,
  members: `${WIX}/%E5%89%AF%E6%9C%AC-research-area-%E7%A0%94%E7%A9%B6%E9%A0%98%E5%9F%9F`,
  gallery: `${WIX}/gallery`,
  server: 'https://aprilab.diskstation.me:5001/',
};

type Video = { id: string; title: string; hq?: boolean };

// hq = only a 4:3 letterboxed thumbnail exists, so the card crops it
const videos: Video[] = [
  { id: '4OQ4ysLxP_M', title: 'Exoskeleton Force Feedback Glove', hq: true },
  { id: 'BuJRlx7nT9A', title: 'MR Welding Training' },
  { id: 'Olnc7Fq4lVQ', title: 'Spatially-Accurate Augmented Virtuality Telerobotic System' },
  { id: 'yy8_IW4Q8dI', title: 'Virtual Shopping System with Haptic Interaction' },
  { id: 'bu5gTTL4mdw', title: 'Haptic Device for VR Intubation Training', hq: true },
  { id: 'DvdNnOv9Bao', title: 'Wearable Multimodal Haptics on Fingertips' },
  { id: 'as6L2iKR3sA', title: 'MR Milling Training' },
  { id: 'ni10vJHPZ0o', title: 'AR Robot' },
  { id: 'zy_XHWHqohw', title: 'Teleoperation for Remote Surface Textures' },
  { id: 'rLjpnnaARmk', title: '虛擬鼓棒 Virtual Drumstick' },
  { id: 'PIB7WxVzz0g', title: 'AR Motor Demo' },
  { id: 'Nbqx2FZOz_4', title: 'Handheld Haptic Feedback Device' },
  { id: 'QzVuLviOxmU', title: '路考模擬 Driving Test Simulator' },
  { id: 'zzXqx8iT2Cw', title: 'IoT Emulator Demo' },
  { id: '8tR5iLlEOKs', title: 'iOS Maintenance Device' },
];

export const projects = videos.map((v) => ({
  title: v.title,
  link: `https://www.youtube.com/watch?v=${v.id}`,
  thumbnail: `https://i.ytimg.com/vi/${v.id}/${v.hq ? 'hqdefault' : 'maxresdefault'}.jpg`,
  letterbox: v.hq,
}));

export const featured = {
  id: 'as6L2iKR3sA',
  title: 'MR Milling Training',
  zh: '混合實境銑床訓練',
  thumbnail: 'https://i.ytimg.com/vi/as6L2iKR3sA/maxresdefault.jpg',
};

export const research = [
  {
    no: '01',
    zh: '觸覺力回饋',
    en: 'Tactile Haptic Feedback',
    body: '從外骨骼力回饋手套到指尖多模態觸覺裝置，讓手在虛擬世界裡感受到重量、軟硬與表面紋理。',
    bodyEn: 'From exoskeleton force-feedback gloves to fingertip multimodal haptic devices, letting hands feel weight, stiffness, and surface textures in virtual worlds.',
    tags: ['力回饋手套', '遠端紋理重現', '手持觸覺裝置'],
    tagsEn: ['Force-Feedback Glove', 'Remote Texture Rendering', 'Handheld Haptics'],
  },
  {
    no: '02',
    zh: '延展實境',
    en: 'Extended Reality',
    body: '以 VR、AR、MR 打造技能訓練與遠端操作系統，例如焊接、銑床、氣管插管訓練與擴增實境遙控機器人。',
    bodyEn: 'Building skill training and teleoperation systems with VR, AR, and MR—covering welding, milling, tracheal intubation training, and AR telerobotics.',
    tags: ['MR 焊接訓練', 'VR 插管訓練', 'AR 遙控機器人'],
    tagsEn: ['MR Welding', 'VR Intubation', 'AR Telerobot'],
  },
  {
    no: '03',
    zh: '綠色設計',
    en: 'Green Design',
    body: '把永續性放進產品開發流程，研究產品與產業管理中的環境衝擊評估與設計決策。',
    bodyEn: 'Integrating sustainability into product development, researching environmental impact assessment and design decisions in product and industrial management.',
    tags: ['永續產品設計', 'SSPIM 最佳論文'],
    tagsEn: ['Sustainable Product Design', 'SSPIM Best Paper'],
  },
  {
    no: '04',
    zh: '使用者中心設計',
    en: 'User Centered Design',
    body: '從使用者出發設計互動與介面，讓技術真正好用；從虛擬購物到醫療訓練都經過使用者驗證。',
    bodyEn: 'Designing interactions and interfaces around real users so technology is genuinely usable—validated across virtual shopping and medical training.',
    tags: ['互動設計', '使用者研究'],
    tagsEn: ['Interaction Design', 'User Research'],
  },
];

export const stats = [
  { value: 11, suffix: ' 項', suffixEn: '', label: '專利發表', labelEn: 'Patents', note: 'Patents' },
  { value: 6, suffix: ' 年', suffixEn: ' yrs', label: '入選全球前 2% 科學家', labelEn: "World's Top 2% Scientist", note: 'Stanford × Elsevier · 2020–2025' },
  { value: 23, suffix: ' 則', suffixEn: '', label: '獲獎與榮譽', labelEn: 'Awards & Honors', note: '2016 – 2025' },
  { value: 4, suffix: ' 大', suffixEn: '', label: '研究領域', labelEn: 'Research Areas', note: 'Haptics · XR · Green · UCD' },
];

export type NewsItem = { text: string; en: string; kind: 'award' | 'honor' | 'career' | 'service' };

export const news: { year: string; items: NewsItem[] }[] = [
  {
    year: '2025',
    items: [
      {
        kind: 'award',
        text: '2025 Future Tech Award：A Metaverse-Enhanced Extended Reality Neck Simulator for Ultrasound-Guided Procedures and Surgical Training',
        en: '2025 Future Tech Award: A Metaverse-Enhanced Extended Reality Neck Simulator for Ultrasound-Guided Procedures and Surgical Training',
      },
      {
        kind: 'honor',
        text: '陳湘鳳教授入選 World’s Top 2% Scientist（2020–2025，終身與年度影響力），Stanford University 與 Elsevier 發布',
        en: "Prof. Hsiang-Feng Chen named among World's Top 2% Scientists (2020–2025, career-long & single-year impact) by Stanford University & Elsevier",
      },
    ],
  },
  {
    year: '2024',
    items: [
      {
        kind: 'award',
        text: '博士生謝子傑「迎接林業機械化世代—爬樹機設計與功能簡介」獲中華林學會 113 年森林資源永續發展研討會口頭發表林產組佳作',
        en: 'Ph.D. student Tzu-Chieh Hsieh won Honorable Mention (Forest Products Oral Session) at the 2024 Chinese Forestry Association Symposium for tree-climbing machine design',
      },
      {
        kind: 'award',
        text: '「氣管插管教學之視-力共覺虛擬實境系統之開發」獲 112 年自動化學門成果發表最佳海報獎優等',
        en: 'Visuo-haptic VR system for tracheal intubation training won Best Poster Award (Excellence) at the 2023 NSTC Automation Division Symposium',
      },
      {
        kind: 'award',
        text: '碩士生洪慧諭獲 112 學年度國立臺灣大學工學院研究生院長獎',
        en: "M.S. student Hui-Yu Hung received the 2023–2024 NTU College of Engineering Dean's Award",
      },
      {
        kind: 'honor',
        text: '2024 I-Zone 全國創新智慧顯示專區入圍，獲免費參展',
        en: 'Selected as a finalist at the 2024 I-Zone National Innovative Smart Display Exhibition',
      },
    ],
  },
  {
    year: '2023',
    items: [
      {
        kind: 'award',
        text: '碩士生吳泓昇獲 111 學年度國立臺灣大學工學院研究生院長獎',
        en: "M.S. student Hung-Sheng Wu received the 2022–2023 NTU College of Engineering Dean's Award",
      },
      {
        kind: 'career',
        text: '博士生 Kalpana Shankhwar 獲聘為印度 IIIT Delhi 以人為本設計系（Human-Centered Design）助理教授',
        en: 'Ph.D. graduate Kalpana Shankhwar appointed Assistant Professor in Human-Centered Design at IIIT Delhi, India',
      },
    ],
  },
  {
    year: '2022',
    items: [
      {
        kind: 'award',
        text: '陳湘鳳教授獲 2022 國科會自動化學門優良海報獎',
        en: 'Prof. Hsiang-Feng Chen received the 2022 NSTC Automation Division Excellent Poster Award',
      },
      {
        kind: 'award',
        text: '碩士生林昱廷獲 110 學年度國立臺灣大學工學院研究生院長獎',
        en: "M.S. student Yu-Ting Lin received the 2021–2022 NTU College of Engineering Dean's Award",
      },
      {
        kind: 'award',
        text: '楊立承、陳東閱、吳念潔、吳東翰獲 XR 實境教育創意大賞—國家文化記憶庫特別獎學生組佳作',
        en: 'Li-Cheng Yang, Tung-Yueh Chen, Nien-Chieh Wu, and Tung-Han Wu won Honorable Mention at the XR Education Creative Awards',
      },
      {
        kind: 'service',
        text: 'Associate Editor, ASME Journal of Computing and Information Science in Engineering；Editorial Board, Journal of Engineering Design',
        en: 'Associate Editor, ASME Journal of Computing and Information Science in Engineering; Editorial Board, Journal of Engineering Design',
      },
    ],
  },
  {
    year: '2021',
    items: [
      {
        kind: 'award',
        text: '碩士生賴雅晴、林昱廷獲永續性產品與產業管理研討會（SSPIM）最佳論文獎',
        en: 'M.S. students Ya-Ching Lai and Yu-Ting Lin won the Best Paper Award at SSPIM 2021',
      },
    ],
  },
  {
    year: '2020',
    items: [
      {
        kind: 'award',
        text: '博士生 Kalpana Shankhwar 獲中華扶輪教育基金會境外生研究獎學金',
        en: 'Ph.D. student Kalpana Shankhwar awarded the China Rotary Educational Foundation International Student Research Scholarship',
      },
    ],
  },
  {
    year: '2019',
    items: [
      {
        kind: 'award',
        text: '碩士生呂元皓獲 108 年度中國機械工程學會碩士論文獎佳作',
        en: 'M.S. student Yuan-Hao Lu won Honorable Mention in the 2019 CSME Master Thesis Award',
      },
      {
        kind: 'award',
        text: '博士生 Kalpana Shankhwar 獲中技社（CTCI Foundation）境外生研究獎學金',
        en: 'Ph.D. student Kalpana Shankhwar awarded the CTCI Foundation International Student Research Scholarship',
      },
      {
        kind: 'award',
        text: '碩士生呂元皓獲 IET 碩士佳作論文獎',
        en: 'M.S. student Yuan-Hao Lu received the IET Master Thesis Honorable Mention Award',
      },
    ],
  },
  {
    year: '2018',
    items: [
      {
        kind: 'honor',
        text: '碩士生呂元皓獲選 2018 筑波大學暑期參訪交換生',
        en: 'M.S. student Yuan-Hao Lu selected for the 2018 University of Tsukuba Summer Exchange Program',
      },
      {
        kind: 'award',
        text: '蔡博州論文獲 2018 永續性與產業管理國際研討會最佳論文獎',
        en: 'Po-Chou Tsai won the Best Paper Award at the 2018 International Conference on Sustainability and Industrial Management',
      },
    ],
  },
  {
    year: '2016',
    items: [
      {
        kind: 'award',
        text: '林柏宏獲經濟部工業局與資策會「3D 夢想家—3D 列印大賽」E 組最佳創意獎',
        en: 'Po-Hung Lin won Best Creativity Award (Group E) at the MOEA & III 3D Printing Competition',
      },
      {
        kind: 'award',
        text: '許家維、許泰源、楊智凱、柯柏年、張富凱獲第一屆 VR 開發者黑客松評審第二大獎',
        en: 'Chia-Wei Hsu, Tai-Yuan Hsu, Chih-Kai Yang, Po-Nien Ko, and Fu-Kai Chang won 2nd Jury Prize at the 1st VR Developer Hackathon',
      },
      {
        kind: 'award',
        text: '林品樺獲 2016 NTU-3MT 臺大三分鐘英語學術簡報競賽第三名',
        en: 'Pin-Hua Lin won 3rd Place at the 2016 NTU Three Minute Thesis (3MT) Competition',
      },
    ],
  },
];

// ---- v3 additions ----
const yt = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

export const heroShapes = {
  a: yt('DvdNnOv9Bao'),
  b: yt('BuJRlx7nT9A'),
  c: yt('ni10vJHPZ0o'),
  d: yt('yy8_IW4Q8dI'),
  e: yt('zy_XHWHqohw'),
  f: yt('as6L2iKR3sA'),
};

export const showcase = [
  { id: 'DvdNnOv9Bao', category: 'Haptics', title: '指尖多模態觸覺穿戴裝置', en: 'Wearable Multimodal Haptics on Fingertips' },
  { id: 'BuJRlx7nT9A', category: 'Mixed Reality', title: '混合實境焊接訓練', en: 'MR Welding Training' },
  { id: 'Olnc7Fq4lVQ', category: 'Telerobotics', title: '空間精準的擴增虛擬遙控系統', en: 'Augmented Virtuality Telerobotic System' },
  { id: 'yy8_IW4Q8dI', category: 'Haptics × VR', title: '具觸覺互動的虛擬購物系統', en: 'Virtual Shopping with Haptic Interaction' },
  { id: 'zy_XHWHqohw', category: 'Haptics', title: '遠端表面紋理觸覺重現', en: 'Teleoperation for Remote Surface Textures' },
  { id: 'as6L2iKR3sA', category: 'Mixed Reality', title: '混合實境銑床訓練', en: 'MR Milling Training' },
  { id: 'ni10vJHPZ0o', category: 'Augmented Reality', title: 'AR 機器人', en: 'AR Robot' },
  { id: 'rLjpnnaARmk', category: 'Interaction', title: '虛擬鼓棒', en: 'Virtual Drumstick' },
].map((v) => ({ ...v, src: yt(v.id), link: `https://www.youtube.com/watch?v=${v.id}` }));

export const bounceImages = ['Nbqx2FZOz_4', 'PIB7WxVzz0g', 'BuJRlx7nT9A', 'zzXqx8iT2Cw', 'QzVuLviOxmU'].map(yt);
