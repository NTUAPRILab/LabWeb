// Members and gallery photos, taken from the old Wix site (Members / Current Member / Gallery pages).
// Photos stay hosted on Wix's image CDN; wix() asks it for a cropped size.

export const wix = (id: string, w: number, h: number) => `https://static.wixstatic.com/media/${id}/v1/fill/w_${w},h_${h},al_c,q_85,enc_auto/photo.jpg`;

export const professor = {
  zh: '陳湘鳳',
  en: 'Shana Smith',
  titleZh: '教授',
  titleEn: 'Professor',
  deptZh: '國立臺灣大學 機械工程學系',
  deptEn: 'Department of Mechanical Engineering, National Taiwan University',
  photo: '05c8bb_522446ad4da24ca28c5e3d1efef6f722~mv2.jpg',
  email: 'ssmith@ntu.edu.tw',
  tel: '+886-2-3366-2692',
  fax: '+886-2-2363-1755',
  labTel: '+886-2-3366-9538 / +886-2-3366-4506',
  addressZh: '10617 臺北市大安區羅斯福路四段 1 號（機械系館 509）',
  addressEn: 'Room 509, Dept. of Mechanical Engineering, No. 1, Sec. 4, Roosevelt Rd., Taipei 10617',
  education: [
    { zh: '機械工程博士，愛荷華州立大學（美國）', en: 'Ph.D. in Mechanical Engineering, Iowa State University, Ames, Iowa' },
    { zh: '機械工程碩士，愛荷華州立大學（美國）', en: 'M.S. in Mechanical Engineering, Iowa State University, Ames, Iowa' },
    { zh: '機械工程學士，國立交通大學', en: 'B.S. in Mechanical Engineering, National Chiao-Tung University, Hsin-Chu, Taiwan' },
  ],
  experience: [
    { zh: '教授，國立臺灣大學', en: 'Professor, National Taiwan University' },
    { zh: '副教授，國立臺灣大學', en: 'Associate Professor, National Taiwan University' },
    { zh: '副教授（終身職），愛荷華州立大學', en: 'Associate Professor (with tenure), Iowa State University' },
    { zh: '助理教授，香港科技大學', en: 'Assistant Professor, Hong Kong University of Science and Technology' },
  ],
};

export type Role = 'phd' | 'm4' | 'm3' | 'm2' | 'm1' | 'master';
export const roleLabel: Record<Role, { zh: string; en: string }> = {
  phd: { zh: '博士生', en: 'Ph.D. Student' },
  m4: { zh: '碩四', en: 'Master 4' },
  m3: { zh: '碩三', en: 'Master 3' },
  m2: { zh: '碩二', en: 'Master 2' },
  m1: { zh: '碩一', en: 'Master 1' },
  master: { zh: '碩士', en: 'Master' },
};

export type Member = { name: string; role: Role; email: string; photo: string | null };

const m = (name: string, role: Role, email: string, photo: string | null): Member => ({ name, role, email, photo });

export const students: Member[] = [
  m('許瀚宸', 'phd', 'd15522005@ntu.edu.tw', '/members/d15522005.jpg'),
  m('鄭尹薰', 'm3', 'r13522629@ntu.edu.tw', '05c8bb_adfe8ad7bf324293912f6973a09cbeb8~mv2.jpg'),
  m('薛皓澤', 'm3', 'r13522605@ntu.edu.tw', '05c8bb_bede19e7b4dd47c884f2673ba956e9cd~mv2.jpeg'),
  m('陳均合', 'm3', 'R13522647@ntu.edu.tw', '05c8bb_4e3b96671ce84e7d9a80d53172467354~mv2.jpg'),
  m('王騰', 'm3', 'R13522641@ntu.edu.tw', null),
  m('鐘雪童', 'm2', 'R14522642@ntu.edu.tw', '05c8bb_94c93337447446db8b060203e713ca53~mv2.jpg'),
  m('戴維均', 'm2', 'R14522626@ntu.edu.tw', null),
  m('陳加祐', 'm2', 'R14522647@ntu.edu.tw', null),
  m('陳一豪', 'm2', 'R14522611@ntu.edu.tw', '05c8bb_984aa3bb01b540ec97c40258289348f6~mv2.jpg'),
  m('柯博文', 'm1', 'r15522641@ntu.edu.tw', null),
  m('簡恩生', 'm1', 'r15522616@ntu.edu.tw', null),
  m('黃浩軒', 'm1', '', null),
  m('王宣詠', 'm1', '', null),
  m('李俊毅', 'm1', 'r15522622@ntu.edu.tw', null),
  m('郭新豪', 'm1', 'r15522630@ntu.edu.tw', '/members/r15522630.jpg'),
];

export const alumni: Member[] = [
  m('李姿瑩', 'phd', 'D09522016@ntu.edu.tw', '05c8bb_bb03f9e3c915487794a50b90d0b919a6~mv2.png'),
  m('謝子傑', 'phd', 'D07522017@ntu.edu.tw', '8b67cc_f25d98354b2d40e395e68b453fa46a51~mv2.jpg'),
  m('莊東叡', 'phd', 'D07522004@ntu.edu.tw', '8b67cc_0b1e00ed0c1d48ca9b0856e3f205b5db~mv2.jpg'),
  m('Kalpana Shankhwar', 'phd', 'D06522022@ntu.edu.tw', 'bf57ef_def28840f0b4426aa8dfc7b4bf82620f~mv2.jpg'),
  m('吳健民', 'phd', 'cokenmine@yahoo.com.tw', 'bf57ef_492eac5c1e5d4f4e861294162aa081ff~mv2.jpg'),
  m('鄭敬文', 'master', 'b09502029@ntu.edu.tw', '05c8bb_ad00a42e1a584468a8a660a58a8fd0f2~mv2.jpg'),
  m('陳泊錦', 'master', 'r11522635@ntu.edu.tw', '05c8bb_e114c75660f44db1b7eeb7676c253475~mv2.jpg'),
  m('謝元昊', 'master', 'r11522623@ntu.edu.tw', '05c8bb_e9ac671e9426430cb965369c7647652c~mv2.jpg'),
  m('童凱廷', 'master', 'r11522626@ntu.edu.tw', '05c8bb_d77a9de06288485b81ad2d9c84a00e2e~mv2.jpg'),
  m('李晉碩', 'master', 'r12522608@ntu.edu.tw', '05c8bb_5d2f827823c449379fc48339cd8cb1b6~mv2.jpg'),
  m('吳政霖', 'master', 'r12522636@ntu.edu.tw', '05c8bb_5c4866c43657464e82ac230aeae659c7~mv2.jpg'),
  m('白居庭', 'master', 'r12522603@ntu.edu.tw', '05c8bb_6eb8a27ec04a49278969b943b2e1b50c~mv2.jpg'),
  m('翁廷皓', 'master', 'r12522607@ntu.edu.tw', '05c8bb_f2714ce29ebc46209ed5b12984a96879~mv2.png'),
  m('卓靖鎧', 'master', 'r11522659@ntu.edu.tw', '05c8bb_49a23b41b26a4b63bc43f3c15fd0e78b~mv2.jpg'),
  m('史貝娜', 'master', 'r11522647@ntu.edu.tw', '05c8bb_368d0c3fa1434fa19a2c7473928f56fb~mv2.jpg'),
  m('黃子席', 'master', 'r11522608@ntu.edu.tw', '05c8bb_03a06c6f59374d0aa7d501269116db9b~mv2.jpg'),
  m('楊立承', 'master', 'r11522614@ntu.edu.tw', '05c8bb_75747f196a2f4e60a3fb629fbf0faf3d~mv2.png'),
  m('潘暐曈', 'master', 'r10522615@ntu.edu.tw', '05c8bb_16f70b4aa54c4832b5aff1d35cd5d02f~mv2.jpg'),
  m('吳泓昇', 'master', 'r10522623@ntu.edu.tw', '05c8bb_82c8976213bd4e4b8580823e38fa7ac8~mv2.jpg'),
  m('袁宗宏', 'master', 'r10522634@ntu.edu.tw', '05c8bb_9ce2418d9da84b2197c57a9c385634f9~mv2.jpg'),
  m('洪慧諭', 'master', 'r10522624@ntu.edu.tw', '05c8bb_3677180923ab4022a87355aa70fb4464~mv2.jpg'),
  m('楊承翰', 'master', 'r10522641@ntu.edu.tw', '05c8bb_17896622c3804d3cbc82c53a803ac5ae~mv2.jpg'),
  m('林昱廷', 'master', 'r09522638@ntu.edu.tw', '05c8bb_4ea19bc321b64d32abadf311d63b8acb~mv2.jpg'),
  m('黃彥傑', 'master', 'r09522634@ntu.edu.tw', '05c8bb_63c727abd4934394bb3833679d07d23a~mv2.jpg'),
  m('吳秉叡', 'master', 'r09522606@ntu.edu.tw', '05c8bb_16e6b0b6250c429499636f419f4bd2b2~mv2.jpg'),
  m('林柏廷', 'master', 'r09522603@ntu.edu.tw', '05c8bb_e0265d8db56d44dea9c1f34ff8d16596~mv2.jpg'),
  m('劉錦鑫', 'master', 'r08522638@ntu.edu.tw', '05c8bb_377da63132394eb1a2fbb0f39e2411d9~mv2.jpg'),
  m('何承祐', 'master', 'r08522602@ntu.edu.tw', '05c8bb_c1e6489768124d40a1ab6f7930ac675c~mv2.jpg'),
  m('羅文謙', 'master', 'r08522625@ntu.edu.tw', '05c8bb_8760dcbbb6594eefa5aa392f630c3e0b~mv2_d_3916_2936_s_4_2.jpg'),
  m('簡聿民', 'master', 'r08522620@ntu.edu.tw', '05c8bb_215de6e63aa54620a0c1abcc637bed98~mv2.jpg'),
  m('石耘碩', 'master', 'r08522654@ntu.edu.tw', '05c8bb_f30305c569844706a4fed5f7ea95b2fa~mv2.jpg'),
  m('蔡詠丞', 'master', 'r08522632@ntu.edu.tw', '05c8bb_10f563cdca1c4bb3b2f1908bbd5e2673~mv2.jpg'),
  m('黃俊琪', 'master', 'r07522616@ntu.edu.tw', '8b67cc_c02795985b444d058bbdb34120715aba~mv2.jpg'),
  m('賴雅晴', 'master', 'r07522630@ntu.edu.tw', '8b67cc_87307492e16c4fedb9a697382fc34ec8~mv2_d_1536_2048_s_2.jpg'),
  m('汪鈺珉', 'master', 'r07522628@ntu.edu.tw', '8b67cc_573d2eee116e455ea4031c0f61e50c6e~mv2_d_1518_2048_s_2.jpg'),
  m('蔡証仲', 'master', 'r07522608@ntu.edu.tw', '8b67cc_830d8465c3834f9caca2619440e7593a~mv2.jpg'),
  m('帥見侒', 'master', 'r07522641@ntu.edu.tw', '8b67cc_bea7ea5ea49745ba817054f3574ff4a1~mv2_d_1530_2032_s_2.jpg'),
  m('蔡誌烜', 'master', 'r06522601@ntu.edu.tw', '05c8bb_2513f98c71c145f68aaafd7263faa8f3~mv2_d_3088_2320_s_2.jpg'),
  m('郭振宇', 'master', 'r06522642@ntu.edu.tw', 'bf57ef_20594c6c53664b72827d5be3b7b6d41d~mv2.jpg'),
  m('黃靖涵', 'master', 'r06522612@ntu.edu.tw', 'bf57ef_9156bab354b04f198c42c2b71e3d5171~mv2.jpg'),
  m('呂元皓', 'master', 'r06522614@ntu.edu.tw', 'bf57ef_073c81b49a6743b9ad76658ae3c782e3~mv2.jpg'),
  m('柯柏年', 'master', 'yajackya1992@yahoo.com.tw', 'bf57ef_90df428dafd44caeac1376997f3c1afe~mv2.jpg'),
  m('林柏宏', 'master', 'r05522606@ntu.edu.tw', 'bf57ef_c3f69935d90f45f78701a4f5714117fa~mv2.png'),
  m('林家暐', 'master', 'r05522631@ntu.edu.tw', 'bf57ef_7381b40df324456db70032bd5fd00af2~mv2.jpg'),
  m('陳奕誌', 'master', 'r05522633@ntu.edu.tw', 'bf57ef_1c059a6f6f514183badc6a48a6a01da0~mv2.jpg'),
  m('陳昱熙', 'master', 'r05522629@ntu.edu.tw', 'bf57ef_88a6d12a151949b1a61011611917a43c~mv2.jpg'),
  m('蔡博州', 'master', 'r05522617@ntu.edu.tw', 'bf57ef_cc57c33770704873be3fd8d18203dc69~mv2.jpg'),
  m('楊智凱', 'master', 'kkyyllee1107@gmail.com', 'bf57ef_5cbc9b8c90834e1f9f07e043ac5952d3~mv2.jpg'),
  m('林品樺', 'master', 'r04522611@ntu.edu.tw', 'bf57ef_c30b95afb7354574abacbae9f93f3c5c~mv2.jpg'),
  m('許泰源', 'master', 'r04522602@ntu.edu.tw', 'bf57ef_533c87fbc2ce41b29b184f49e744ea2d~mv2.jpg'),
  m('龔家萱', 'master', 'r04522607@ntu.edu.tw', 'bf57ef_5ab2fd53dc1b44ad838c038ccbcd7bae~mv2.jpg'),
];

/** 活動花絮 — group photos from lab outings and events. */
export const galleryPhotos = [
  '05c8bb_aabee22b156748bea95d33f3e5934c5b~mv2.jpg',
  '05c8bb_891e57f4c3ca453bac8ca0a66c723187~mv2_d_4032_3024_s_4_2.jpg',
  '05c8bb_c22df1edaeb345e68c0e3a503f7b24a3~mv2_d_2640_1488_s_2.jpg',
  '05c8bb_e579c27b1eb046ef959f9a9c8827238b~mv2_d_2364_1773_s_2.jpg',
  '05c8bb_4c1c20cbee434e82b3ae0007088a3616~mv2.jpg',
  '05c8bb_04db234bf2d648df950cfe81bcc67799~mv2_d_4011_2512_s_4_2.jpg',
  '05c8bb_f95307a0316a4be3ad302bae0a325c98~mv2_d_4032_1960_s_2.jpg',
  'bf57ef_a033e41fd1f340e69d8584284739ab48~mv2_d_2048_1536_s_2.jpg',
  '05c8bb_500d9e449f594dabbc1550d2107bfd49~mv2.jpg',
];
