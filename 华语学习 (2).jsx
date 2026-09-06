import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Square, Play, Pause, Flame, Check, HelpCircle, X, BookOpen, MessageCircle, BarChart3, RotateCcw, Gift, Sparkles, Lock, Coins, FileText, Volume2, ChevronRight, Award, Clock, Pickaxe, Boxes, Layers, Mountain } from "lucide-react";

// ---------- Sample data (P5 SG common characters — replace/extend later) ----------
const SEED_CHARS = [
  { id: "c1", char: "校", pinyin: "xiào", meaning: "学校，上课的地方", word: "学校", sentence: "我每天走路去学校。" },
  { id: "c2", char: "级", pinyin: "jí", meaning: "年级，班级", word: "年级", sentence: "我读五年级。" },
  { id: "c3", char: "级", pinyin: "jí", meaning: "（重复示例，稍后替换）", word: "班级", sentence: "我们班级有三十人。" },
  { id: "c4", char: "邻", pinyin: "lín", meaning: "住在附近的人", word: "邻居", sentence: "我的邻居很友善。" },
  { id: "c5", char: "居", pinyin: "jū", meaning: "住", word: "居民", sentence: "这里的居民都认识彼此。" },
  { id: "c6", char: "商", pinyin: "shāng", meaning: "买卖，生意", word: "商店", sentence: "楼下有一家商店。" },
  { id: "c7", char: "顾", pinyin: "gù", meaning: "照看，注意", word: "顾客", sentence: "顾客在商店里买东西。" },
  { id: "c8", char: "境", pinyin: "jìng", meaning: "地方，环境", word: "环境", sentence: "我们要爱护环境。" },
  { id: "c9", char: "染", pinyin: "rǎn", meaning: "使变脏，污染", word: "污染", sentence: "工厂排烟会造成污染。" },
  { id: "c10", char: "康", pinyin: "kāng", meaning: "身体好", word: "健康", sentence: "运动对健康有好处。" },
  { id: "c11", char: "食", pinyin: "shí", meaning: "吃", word: "食物", sentence: "妈妈煮的食物很好吃。" },
  { id: "c12", char: "养", pinyin: "yǎng", meaning: "照顾，培育", word: "营养", sentence: "蔬菜有很多营养。" },
  { id: "c13", char: "态", pinyin: "tài", meaning: "样子，情况", word: "态度", sentence: "他做事的态度很认真。" },
  { id: "c14", char: "度", pinyin: "dù", meaning: "程度，限度", word: "速度", sentence: "巴士开得很有速度。" },
  { id: "c15", char: "责", pinyin: "zé", meaning: "应该做的事", word: "负责", sentence: "他负责打扫课室。" },
  { id: "c16", char: "任", pinyin: "rèn", meaning: "职务，担当", word: "责任", sentence: "帮助同学是我的责任。" },
  { id: "c17", char: "礼", pinyin: "lǐ", meaning: "礼貌，礼物", word: "礼貌", sentence: "见到老师要有礼貌。" },
  { id: "c18", char: "貌", pinyin: "mào", meaning: "样子，外表", word: "礼貌", sentence: "他对人很有礼貌。" },
  { id: "c19", char: "谅", pinyin: "liàng", meaning: "原谅，体谅", word: "原谅", sentence: "请你原谅我的错误。" },
  { id: "c20", char: "耐", pinyin: "nài", meaning: "能忍受", word: "耐心", sentence: "老师很有耐心地教我们。" },
];

const SPEAKING_PROMPTS = [
  { id: "s1", type: "句型", frame: "我喜欢＿＿＿，因为＿＿＿。", hint: "说说你喜欢的一样东西/一件事，再说一个原因。" },
  { id: "s2", type: "句型", frame: "星期六，我和家人一起＿＿＿。", hint: "说说上个星期六做了什么。" },
  { id: "s3", type: "句型", frame: "我觉得学校最好玩的是＿＿＿，因为＿＿＿。", hint: "描述一件学校里的事，加一个理由。" },
  { id: "s4", type: "看图说话", frame: "描述：一个小朋友在公园里骑脚踏车，旁边有一只小狗。", hint: "试着说：谁、在哪里、在做什么、心情怎样。" },
  { id: "s5", type: "看图说话", frame: "描述：一家人在食阁吃晚饭，桌上有很多食物。", hint: "试着说：什么时候、有谁、他们在做什么。" },
  { id: "s6", type: "句型", frame: "今天我学会了＿＿＿，我觉得＿＿＿。", hint: "说说今天学的一个新字或新东西。" },
];

// ---------- Mock Exam content (原创练习题，仿PSLE题型，非历年真题) ----------
const EXAM_LISTENING = {
  minutes: 3,
  audioText:
    "小明对小华说：我们的科学作业星期五就要交了，你今天下午方便一起做吗？小华说：可以，我三点半下课，我们四点在图书馆见面吧。小明说：好，我会带电脑，你记得带课本。",
  questions: [
    { id: "l1", q: "他们打算什么时候见面？", options: ["三点半", "四点", "星期五", "放学后马上"], correct: 1 },
    { id: "l2", q: "他们在哪里见面？", options: ["小明家", "课室", "图书馆", "食堂"], correct: 2 },
    { id: "l3", q: "小华要负责带什么？", options: ["电脑", "课本", "作业簿", "字典"], correct: 1 },
  ],
};

const EXAM_LANGUAGE = {
  minutes: 5,
  questions: [
    { id: "g1", q: "妈妈买了一＿＿＿鱼。", options: ["个", "条", "只", "张"], correct: 1 },
    { id: "g2", q: "＿＿＿天气不好，运动会＿＿＿照常举行。", options: ["因为…所以", "虽然…但是", "不但…而且", "一…就"], correct: 1 },
    { id: "g3", q: "他做事的态度非常认真，跟“认真”意思最接近的是？", options: ["马虎", "细心", "高兴", "紧张"], correct: 1 },
    { id: "g4", q: "客厅里有一＿＿＿椅子。", options: ["张", "个", "条", "只"], correct: 0 },
    { id: "g5", q: "他每天都练习跑步，＿＿＿他的速度越来越快。", options: ["可是", "所以", "还是", "或者"], correct: 1 },
  ],
};

const EXAM_READING = {
  minutes: 8,
  passage:
    "上个星期，学校举办了一场“环保周”活动。同学们分组收集家里不用的纸张、塑料瓶和旧衣服，送到回收站。老师说，只要大家愿意从小事做起，就能减少垃圾，保护环境。活动结束后，班上收集到的资源最多的一组，得到了老师颁发的“环保之星”奖状。小美的小组虽然收集的东西不是最多，但她说：“重要的不是拿奖，而是我们都学会了爱护环境。”",
  questions: [
    { id: "r1", q: "这篇文章主要在说什么？", options: ["学校运动会", "环保周活动", "小美生病了", "老师的生日"], correct: 1 },
    { id: "r2", q: "同学们收集了哪些东西？", options: ["旧玩具、书本、文具", "纸张、塑料瓶、旧衣服", "食物、水果、饮料", "课本、铅笔、橡皮擦"], correct: 1 },
    { id: "r3", q: "哪一组得到“环保之星”奖状？", options: ["小美的小组", "收集最多东西的小组", "老师那一组", "没有人得奖"], correct: 1 },
    { id: "r4", q: "从小美说的话可以看出，她认为最重要的是什么？", options: ["得奖比较重要", "收集的数量最重要", "学会爱护环境", "比赛输赢"], correct: 2 },
  ],
};

const EXAM_WRITING = {
  minutes: 15,
  type: "情境写作",
  prompt:
    "你想邀请朋友参加你的生日会，请写一张便条给他，包括：时间、地点，还有你希望他带来的东西。字数大约50字。",
  minWords: 40,
};

const EXAM_ORAL = {
  minutes: 5,
  picturePrompt: "看图说话：一个小朋友在图书馆里安静地看书，旁边有其他同学也在看书。",
  followUp: "你喜欢去图书馆吗？为什么？",
};

const EXAM_SECTION_META = [
  { id: "listening", label: "听力理解", icon: Volume2 },
  { id: "language", label: "语文运用", icon: FileText },
  { id: "reading", label: "阅读理解", icon: BookOpen },
  { id: "writing", label: "情境写作", icon: FileText },
  { id: "oral", label: "口试", icon: Mic },
];

const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 15, 30]; // index = box level

// ---------- Gamification data ----------
const STICKERS = [
  { id: "st1", emoji: "🐼", name: "熊猫伙伴", rarity: "普通" },
  { id: "st2", emoji: "🐯", name: "小虎将", rarity: "普通" },
  { id: "st3", emoji: "🦋", name: "蝴蝶结", rarity: "普通" },
  { id: "st4", emoji: "🎈", name: "气球", rarity: "普通" },
  { id: "st5", emoji: "🥮", name: "月饼", rarity: "普通" },
  { id: "st6", emoji: "🐲", name: "小龙", rarity: "稀有" },
  { id: "st7", emoji: "🏮", name: "灯笼", rarity: "稀有" },
  { id: "st8", emoji: "🧧", name: "红包", rarity: "稀有" },
  { id: "st9", emoji: "🐉", name: "金龙", rarity: "传说" },
  { id: "st10", emoji: "👑", name: "华语王冠", rarity: "传说" },
];
const RARITY_COLOR = { 普通: "#8D876F", 稀有: "#3DAE86", 传说: "#C23616" };

// ---------- Block/voxel-world theme (Minecraft-inspired, original pixel art) ----------
const BLOCK_THEME = {
  mine: {
    title: "识字矿场",
    subtitle: "挖到新字，收进矿车",
    sky: ["#BEE7F2", "#E4F6FA"],
    groundTop: "#6FAF46",
    groundTopDark: "#5C9C3B",
    groundBottom: "#8B5E34",
    groundBottomDark: "#6E4A29",
    accent: "#3FA34D",
  },
  tower: {
    title: "训练营",
    subtitle: "对着麦克风，大声喊出来",
    sky: ["#CDE7F5", "#EAF6FB"],
    groundTop: "#9C9C94",
    groundTopDark: "#83837B",
    groundBottom: "#6E6E64",
    groundBottomDark: "#57574F",
    accent: "#E8534A",
  },
  map: {
    title: "远征地图",
    subtitle: "五个关卡，一路升级",
    sky: ["#D8E9C9", "#F1F7E6"],
    groundTop: "#C9B27A",
    groundTopDark: "#B39960",
    groundBottom: "#8B5E34",
    groundBottomDark: "#6E4A29",
    accent: "#E8C547",
  },
  chest: {
    title: "宝箱基地",
    subtitle: "每天一个宝箱，看看开出什么",
    sky: ["#F5E6BE", "#FBF3DD"],
    groundTop: "#8B5E34",
    groundTopDark: "#6E4A29",
    groundBottom: "#6E4A29",
    groundBottomDark: "#573A20",
    accent: "#E8C547",
  },
};

// Original 8x8 pixel-art avatar (not derived from any game's character design)
const PANDA_PIXELS = [
  [0, 1, 1, 0, 0, 1, 1, 0],
  [1, 2, 2, 1, 1, 2, 2, 1],
  [1, 2, 1, 2, 2, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 2, 3, 3, 2, 2, 1],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];
const PIXEL_COLOR_MAP = { 0: "transparent", 1: "#22282B", 2: "#FFFDF6", 3: "#F3B6B0" };

// ---------- Mining/crafting resource system ----------
const ORE_TYPES = {
  stone: { label: "石头", color: "#8B8B85", darkColor: "#6E6E68" },
  iron: { label: "铁矿", color: "#D8D2C4", darkColor: "#B8B2A4" },
  gold: { label: "金矿", color: "#E8C547", darkColor: "#C9A83A" },
  diamond: { label: "钻石", color: "#5FD3D9", darkColor: "#3FB3B9" },
};

function rollOre() {
  const r = Math.random();
  if (r < 0.55) return "stone";
  if (r < 0.85) return "iron";
  if (r < 0.97) return "gold";
  return "diamond";
}

// Base tiers rendered bottom-to-top like a growing structure; "need" = ore count to fully fill that tier
const BASE_TIERS = [
  { key: "stone", ...ORE_TYPES.stone, label: "石头地基", need: 10 },
  { key: "iron", ...ORE_TYPES.iron, label: "铁层", need: 8 },
  { key: "gold", ...ORE_TYPES.gold, label: "金层", need: 6 },
  { key: "diamond", ...ORE_TYPES.diamond, label: "钻石顶", need: 4 },
];

const LEVELS = [
  { min: 0, title: "矿场新人", badge: "⛏️" },
  { min: 4, title: "挖矿学徒", badge: "🔎" },
  { min: 8, title: "训练勇士", badge: "🎤" },
  { min: 12, title: "远征达人", badge: "⭐" },
  { min: 16, title: "传奇矿工", badge: "💎" },
];
function getLevel(masteredCount) {
  let current = LEVELS[0];
  let next = LEVELS[1] || null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (masteredCount >= LEVELS[i].min) current = LEVELS[i];
    next = LEVELS[i + 1] || null;
  }
  return { current, next };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---------- Storage helpers ----------
async function loadJSON(key, fallback) {
  try {
    const res = await window.storage.get(key, false);
    if (!res) return fallback;
    return JSON.parse(res.value);
  } catch (e) {
    return fallback;
  }
}
async function saveJSON(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
    return true;
  } catch (e) {
    console.error("storage save failed", e);
    return false;
  }
}

// ---------- Root ----------
export default function App() {
  const [tab, setTab] = useState("flashcards");
  const [loading, setLoading] = useState(true);
  const [srs, setSrs] = useState({}); // { charId: { box, due, seen, correct } }
  const [speakingLog, setSpeakingLog] = useState({}); // { 'YYYY-MM-DD': [promptId,...] }
  const [streak, setStreak] = useState({ count: 0, lastDay: null });
  const [saveError, setSaveError] = useState(false);
  const [coins, setCoins] = useState(0);
  const [collection, setCollection] = useState({}); // { stickerId: count }
  const [blindbox, setBlindbox] = useState({ lastFreeDrawDate: null });
  const [oreInventory, setOreInventory] = useState({ stone: 0, iron: 0, gold: 0, diamond: 0 });

  useEffect(() => {
    (async () => {
      const [srsData, logData, streakData, coinsData, collectionData, blindboxData, oreData] = await Promise.all([
        loadJSON("srs-state-v1", null),
        loadJSON("speaking-log-v1", {}),
        loadJSON("streak-v1", { count: 0, lastDay: null }),
        loadJSON("coins-v1", 0),
        loadJSON("collection-v1", {}),
        loadJSON("blindbox-v1", { lastFreeDrawDate: null }),
        loadJSON("ore-inventory-v1", { stone: 0, iron: 0, gold: 0, diamond: 0 }),
      ]);
      let initSrs = srsData;
      if (!initSrs) {
        initSrs = {};
        SEED_CHARS.forEach((c) => {
          initSrs[c.id] = { box: 0, due: todayStr(), seen: 0, correct: 0 };
        });
      } else {
        // ensure any new seed chars get entries
        SEED_CHARS.forEach((c) => {
          if (!initSrs[c.id]) initSrs[c.id] = { box: 0, due: todayStr(), seen: 0, correct: 0 };
        });
      }
      setSrs(initSrs);
      setSpeakingLog(logData || {});
      setStreak(streakData || { count: 0, lastDay: null });
      setCoins(coinsData || 0);
      setCollection(collectionData || {});
      setBlindbox(blindboxData || { lastFreeDrawDate: null });
      setOreInventory(oreData || { stone: 0, iron: 0, gold: 0, diamond: 0 });
      setLoading(false);
    })();
  }, []);

  const addOre = useCallback((oreKey, amount = 1) => {
    setOreInventory((prev) => {
      const next = { ...prev, [oreKey]: (prev[oreKey] || 0) + amount };
      saveJSON("ore-inventory-v1", next).then((ok) => setSaveError(!ok));
      return next;
    });
  }, []);

  const addCoins = useCallback((amount) => {
    setCoins((prev) => {
      const next = prev + amount;
      saveJSON("coins-v1", next).then((ok) => setSaveError(!ok));
      return next;
    });
  }, []);

  const bumpStreakIfNeeded = useCallback(async () => {
    const today = todayStr();
    setStreak((prev) => {
      if (prev.lastDay === today) return prev;
      const yesterday = addDays(today, -1);
      const next = {
        count: prev.lastDay === yesterday ? prev.count + 1 : 1,
        lastDay: today,
      };
      saveJSON("streak-v1", next).then((ok) => setSaveError(!ok));
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div style={S.loadingWrap}>
        <div style={S.loadingCard}>加载中…</div>
      </div>
    );
  }

  const masteredCount = Object.values(srs).filter((s) => s.box >= BOX_INTERVALS_DAYS.length - 1).length;

  return (
    <div style={S.app}>
      <FontLoader />
      <GlobalStyles />
      <Header streak={streak.count} coins={coins} masteredCount={masteredCount} />
      <div style={S.body}>
        {tab === "flashcards" && (
          <FlashcardsTab
            srs={srs}
            setSrs={setSrs}
            onProgress={bumpStreakIfNeeded}
            setSaveError={setSaveError}
            addCoins={addCoins}
            addOre={addOre}
          />
        )}
        {tab === "speaking" && (
          <SpeakingTab
            speakingLog={speakingLog}
            setSpeakingLog={setSpeakingLog}
            onProgress={bumpStreakIfNeeded}
            setSaveError={setSaveError}
            addCoins={addCoins}
          />
        )}
        {tab === "exam" && (
          <ExamTab addCoins={addCoins} setCollection={setCollection} collection={collection} onProgress={bumpStreakIfNeeded} setSaveError={setSaveError} />
        )}
        {tab === "progress" && <ProgressTab srs={srs} speakingLog={speakingLog} streak={streak} oreInventory={oreInventory} />}
        {tab === "rewards" && (
          <RewardsTab
            coins={coins}
            addCoins={addCoins}
            collection={collection}
            setCollection={setCollection}
            blindbox={blindbox}
            setBlindbox={setBlindbox}
            streak={streak}
            masteredCount={masteredCount}
            setSaveError={setSaveError}
          />
        )}
      </div>
      {saveError && (
        <div style={S.errorBanner}>保存失败，请检查网络后重试。（进度暂时只保留在本次对话中）</div>
      )}
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}

function FontLoader() {
  useEffect(() => {
    if (document.getElementById("hanyu-fonts")) return;
    const link = document.createElement("link");
    link.id = "hanyu-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;800&family=Noto+Sans+SC:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
}

function GlobalStyles() {
  useEffect(() => {
    if (document.getElementById("hanyu-anim-styles")) return;
    const style = document.createElement("style");
    style.id = "hanyu-anim-styles";
    style.textContent = `
      @keyframes hanyuFloatY { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
      .hanyu-float { animation: hanyuFloatY 3.4s ease-in-out infinite; display: inline-block; }
      .hanyu-float-slow { animation: hanyuFloatY 5.2s ease-in-out infinite; display: inline-block; }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

function PixelAvatar({ size = 36 }) {
  const cell = size / 8;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "grid",
        gridTemplateColumns: `repeat(8, ${cell}px)`,
        gridTemplateRows: `repeat(8, ${cell}px)`,
      }}
    >
      {PANDA_PIXELS.flat().map((v, i) => (
        <div key={i} style={{ width: cell, height: cell, background: PIXEL_COLOR_MAP[v] }} />
      ))}
    </div>
  );
}

function BlockScene({ themeKey }) {
  const t = BLOCK_THEME[themeKey] || BLOCK_THEME.mine;
  const cols = 10;
  const tileW = 400 / cols;
  return (
    <div style={S.sceneBanner}>
      <svg viewBox="0 0 400 104" preserveAspectRatio="none" style={S.sceneSvg}>
        <rect x="0" y="0" width="400" height="104" fill={t.sky[1]} />
        <rect x="0" y="0" width="400" height="70" fill={t.sky[0]} opacity="0.55" />
        {/* pixel clouds */}
        <rect x="20" y="20" width="46" height="8" fill="#FFFFFF" opacity="0.85" />
        <rect x="30" y="13" width="26" height="9" fill="#FFFFFF" opacity="0.85" />
        <rect x="288" y="17" width="42" height="7" fill="#FFFFFF" opacity="0.8" />
        <rect x="300" y="10" width="20" height="8" fill="#FFFFFF" opacity="0.8" />
        {/* voxel ground: two tile rows */}
        {Array.from({ length: cols }).map((_, i) => (
          <rect key={"top" + i} x={i * tileW} y={68} width={tileW - 1} height={16} fill={i % 2 === 0 ? t.groundTop : t.groundTopDark} />
        ))}
        {Array.from({ length: cols }).map((_, i) => (
          <rect key={"bot" + i} x={i * tileW} y={84} width={tileW - 1} height={20} fill={i % 2 === 0 ? t.groundBottomDark : t.groundBottom} />
        ))}
        {/* accent block (ore / signal / flag / gold, themed) */}
        <rect x={tileW * 4 + 6} y={54} width={tileW - 10} height={14} fill={t.accent} />
      </svg>
      <div style={S.pixelAvatarFrame} className="hanyu-float-slow">
        <PixelAvatar size={30} />
      </div>
      <div style={S.sceneTextWrap}>
        <div style={S.sceneTitle}>{t.title}</div>
        <div style={S.sceneSubtitle}>{t.subtitle}</div>
      </div>
    </div>
  );
}

// ---------- Header ----------
function Header({ streak, coins, masteredCount }) {
  const { current } = getLevel(masteredCount);
  return (
    <div style={S.header}>
      <div>
        <div style={S.headerTitle}>
          <span style={{ marginRight: 6 }}>{current.badge}</span>
          {current.title}
        </div>
        <div style={S.headerSub}>一天一点，慢慢就会</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={S.coinPill}>
          <Coins size={15} color="#D9AE4E" strokeWidth={2.4} />
          <span style={{ marginLeft: 4 }}>{coins}</span>
        </div>
        <div style={S.streakPill}>
          <Flame size={16} color="#C23616" strokeWidth={2.4} />
          <span style={{ marginLeft: 4 }}>{streak}</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Tab bar ----------
function TabBar({ tab, setTab }) {
  const items = [
    { id: "flashcards", label: "挖矿", icon: Pickaxe },
    { id: "speaking", label: "训练", icon: MessageCircle },
    { id: "exam", label: "远征", icon: Mountain },
    { id: "rewards", label: "宝箱", icon: Boxes },
    { id: "progress", label: "基地", icon: Layers },
  ];
  return (
    <div style={S.tabBar}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            style={{ ...S.tabBtn, color: active ? "#3DAE86" : "#8D876F" }}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2.6 : 2} />
            <span style={{ fontSize: 12, marginTop: 2, fontWeight: active ? 700 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Flashcards Tab ----------
function FlashcardsTab({ srs, setSrs, onProgress, setSaveError, addCoins, addOre }) {
  const dueQueue = SEED_CHARS.filter((c) => srs[c.id] && srs[c.id].due <= todayStr());
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [justMastered, setJustMastered] = useState(false);
  const [lastOre, setLastOre] = useState(null);
  const [coinPop, setCoinPop] = useState(false);

  useEffect(() => {
    setIdx(0);
    setFlipped(false);
  }, [dueQueue.length === 0]);

  if (dueQueue.length === 0) {
    return (
      <div>
        <BlockScene themeKey="mine" />
        <div style={S.emptyWrap}>
          <div style={S.emptyStamp}>今</div>
          <div style={S.emptyTitle}>今天要复习的字都完成了！</div>
          <div style={S.emptyBody}>明天再回来看看有没有新的字要复习。</div>
        </div>
      </div>
    );
  }

  const current = dueQueue[Math.min(idx, dueQueue.length - 1)];
  const state = srs[current.id];

  const answer = async (result) => {
    // result: 'no' | 'unsure' | 'yes'
    setSrs((prev) => {
      const s = { ...prev[current.id] };
      s.seen = (s.seen || 0) + 1;
      if (result === "yes") {
        s.box = Math.min((s.box || 0) + 1, BOX_INTERVALS_DAYS.length - 1);
        s.correct = (s.correct || 0) + 1;
        addCoins(5);
        setCoinPop(true);
        setTimeout(() => setCoinPop(false), 700);
        if (s.box === BOX_INTERVALS_DAYS.length - 1) {
          setJustMastered(true);
          const ore = rollOre();
          addOre(ore);
          setLastOre(ore);
          setTimeout(() => setJustMastered(false), 900);
        }
      } else if (result === "unsure") {
        s.box = Math.max((s.box || 0) - 1, 1);
      } else {
        s.box = 0;
      }
      s.due = addDays(todayStr(), BOX_INTERVALS_DAYS[s.box]);
      const next = { ...prev, [current.id]: s };
      saveJSON("srs-state-v1", next).then((ok) => setSaveError(!ok));
      return next;
    });
    onProgress();
    setFlipped(false);
    setTimeout(() => setIdx((i) => i + 1), result === "yes" && current.box === 4 ? 500 : 0);
  };

  return (
    <div style={S.flashWrap}>
      <BlockScene themeKey="mine" />
      <div style={S.progressLine}>
        今天还有 <strong>{dueQueue.length - idx}</strong> 个字
      </div>
      <div style={S.tianziCardOuter} onClick={() => setFlipped((f) => !f)}>
        <div style={S.tianziCard}>
          <svg style={S.gridSvg} viewBox="0 0 200 200" preserveAspectRatio="none">
            <line x1="0" y1="100" x2="200" y2="100" stroke="#4A4E57" strokeWidth="1.5" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="#4A4E57" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="200" y2="200" stroke="#3A3E46" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="200" y1="0" x2="0" y2="200" stroke="#3A3E46" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
          {!flipped ? (
            <div style={S.charDisplay}>{current.char}</div>
          ) : (
            <div style={S.cardBack}>
              <div style={S.pinyin}>{current.pinyin}</div>
              <div style={S.meaning}>{current.meaning}</div>
              <div style={S.wordRow}>
                <span style={S.wordLabel}>词</span>
                <span>{current.word}</span>
              </div>
              <div style={S.sentence}>{current.sentence}</div>
            </div>
          )}
          {justMastered && (
            <div style={S.stamp}>
              已挖到{lastOre ? ORE_TYPES[lastOre].label : ""}！
            </div>
          )}
          {coinPop && (
            <div style={S.coinPop}>
              <Coins size={14} color="#D9AE4E" /> +5
            </div>
          )}
        </div>
      </div>
      <div style={S.tapHint}>{flipped ? "再点一下回到正面" : "点一下卡片，看拼音和意思"}</div>

      <div style={S.answerRow}>
        <button style={{ ...S.answerBtn, background: "#331E19", color: "#E2735A" }} onClick={() => answer("no")}>
          <X size={18} />
          <span>不认得</span>
        </button>
        <button style={{ ...S.answerBtn, background: "#332B16", color: "#D9AE4E" }} onClick={() => answer("unsure")}>
          <HelpCircle size={18} />
          <span>不确定</span>
        </button>
        <button style={{ ...S.answerBtn, background: "#17332B", color: "#3DAE86" }} onClick={() => answer("yes")}>
          <Check size={18} />
          <span>认得</span>
        </button>
      </div>
    </div>
  );
}

// ---------- Speaking Tab ----------
function SpeakingTab({ speakingLog, setSpeakingLog, onProgress, setSaveError, addCoins }) {
  const [promptIdx, setPromptIdx] = useState(0);
  const [recState, setRecState] = useState("idle"); // idle | recording | recorded
  const [audioUrl, setAudioUrl] = useState(null);
  const [micError, setMicError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  const today = todayStr();
  const doneToday = speakingLog[today] || [];
  const prompt = SPEAKING_PROMPTS[promptIdx];
  const alreadyDone = doneToday.includes(prompt.id);

  useEffect(() => {
    setRecState("idle");
    setAudioUrl(null);
    setMicError(null);
  }, [promptIdx]);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setRecState("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecState("recording");
    } catch (e) {
      setMicError("无法使用麦克风，请检查权限设置。");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current && mediaRecorderRef.current.stop();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const markDone = async () => {
    const next = { ...speakingLog, [today]: [...new Set([...(speakingLog[today] || []), prompt.id])] };
    setSpeakingLog(next);
    const ok = await saveJSON("speaking-log-v1", next);
    setSaveError(!ok);
    addCoins(10);
    onProgress();
  };

  return (
    <div style={S.speakWrap}>
      <BlockScene themeKey="tower" />
      <div style={S.progressLine}>
        今天已完成 <strong>{doneToday.length}</strong> / {SPEAKING_PROMPTS.length} 个练习
      </div>

      <div style={S.promptCard}>
        <div style={S.promptType}>{prompt.type}</div>
        <div style={S.promptFrame}>{prompt.frame}</div>
        <div style={S.promptHint}>{prompt.hint}</div>
        {alreadyDone && <div style={S.doneBadge}>✓ 今天说过了</div>}
      </div>

      <div style={S.recordArea}>
        {micError && <div style={S.micError}>{micError}</div>}
        {recState !== "recording" ? (
          <button style={S.micBtn} onClick={startRecording}>
            <Mic size={26} color="#fff" />
          </button>
        ) : (
          <button style={{ ...S.micBtn, background: "#C23616" }} onClick={stopRecording}>
            <Square size={22} color="#fff" />
          </button>
        )}
        <div style={S.micLabel}>
          {recState === "idle" && "按下开始录音"}
          {recState === "recording" && "录音中…按下停止"}
          {recState === "recorded" && "录好了，回听一下"}
        </div>

        {audioUrl && (
          <div style={S.playbackRow}>
            <audio
              ref={audioRef}
              src={audioUrl}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
            <button style={S.playBtn} onClick={togglePlay}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
              <span style={{ marginLeft: 6 }}>{playing ? "暂停" : "回听"}</span>
            </button>
            <button style={S.retryBtn} onClick={startRecording}>
              <RotateCcw size={16} />
              <span style={{ marginLeft: 6 }}>重录</span>
            </button>
          </div>
        )}

        {!alreadyDone && (
          <button style={S.markDoneBtn} onClick={markDone}>
            说完了，标记完成 · +10金币
          </button>
        )}
      </div>

      <div style={S.promptNav}>
        <button
          style={S.navBtn}
          disabled={promptIdx === 0}
          onClick={() => setPromptIdx((i) => Math.max(0, i - 1))}
        >
          上一题
        </button>
        <div style={S.navCount}>
          {promptIdx + 1} / {SPEAKING_PROMPTS.length}
        </div>
        <button
          style={S.navBtn}
          disabled={promptIdx === SPEAKING_PROMPTS.length - 1}
          onClick={() => setPromptIdx((i) => Math.min(SPEAKING_PROMPTS.length - 1, i + 1))}
        >
          下一题
        </button>
      </div>
    </div>
  );
}

// ---------- Mock Exam Tab (模拟考场) ----------
function ExamTab({ addCoins, setCollection, collection, onProgress, setSaveError }) {
  const [phase, setPhase] = useState("intro"); // intro | in-progress | results
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { listening: {qid: optIdx}, language: {...}, reading: {...}, writing: text, oral: {audioUrl} }

  const startExam = () => {
    setAnswers({});
    setSectionIdx(0);
    setPhase("in-progress");
  };

  const goNextSection = (sectionAnswers) => {
    setAnswers((prev) => ({ ...prev, [EXAM_SECTION_META[sectionIdx].id]: sectionAnswers }));
    if (sectionIdx < EXAM_SECTION_META.length - 1) {
      setSectionIdx((i) => i + 1);
    } else {
      setPhase("results");
    }
  };

  useEffect(() => {
    if (phase === "results") {
      const score = computeScore(answers);
      addCoins(30);
      onProgress();
      const owned = collection["examBadge"] || 0;
      const nextCollection = { ...collection, examBadge: owned + 1 };
      setCollection(nextCollection);
      saveJSON("collection-v1", nextCollection).then((ok) => setSaveError(!ok));
      const historyEntry = { date: todayStr(), score };
      loadJSON("exam-history-v1", []).then((hist) => {
        const next = [...hist, historyEntry].slice(-10);
        saveJSON("exam-history-v1", next).then((ok) => setSaveError(!ok));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "intro") {
    return (
      <div>
        <BlockScene themeKey="map" />
        <div style={S.examIntro}>
        <FileText size={40} color="#3DAE86" strokeWidth={1.6} />
        <div style={S.examIntroTitle}>远征试炼</div>
        <div style={S.examIntroBody}>
          今天要挑战完整的一套练习：听力理解 → 语文运用 → 阅读理解 → 情境写作 → 口试。
          <br />
          题目是仿照PSLE题型自己出的，不是历年真题，专门用来练习考试的感觉。
        </div>
        <div style={S.examSectionList}>
          {EXAM_SECTION_META.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.id} style={S.examSectionRow}>
                <Icon size={16} color="#8D876F" />
                <span>{i + 1}. {s.label}</span>
              </div>
            );
          })}
        </div>
        <button style={S.examStartBtn} onClick={startExam}>
          出发远征 · 完成有奖励
        </button>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const score = computeScore(answers);
    return <ExamResults score={score} onRestart={() => setPhase("intro")} />;
  }

  const currentMeta = EXAM_SECTION_META[sectionIdx];
  return (
    <div style={S.examWrap}>
      <ExamProgressHeader sectionIdx={sectionIdx} />
      {currentMeta.id === "listening" && <ListeningSection onNext={goNextSection} />}
      {currentMeta.id === "language" && <MCQSection data={EXAM_LANGUAGE} label="语文运用" onNext={goNextSection} />}
      {currentMeta.id === "reading" && <ReadingSection onNext={goNextSection} />}
      {currentMeta.id === "writing" && <WritingSection onNext={goNextSection} />}
      {currentMeta.id === "oral" && <OralExamSection onNext={goNextSection} />}
    </div>
  );
}

function computeScore(answers) {
  let correct = 0;
  let total = 0;
  ["listening", "language", "reading"].forEach((key) => {
    const data = key === "listening" ? EXAM_LISTENING : key === "language" ? EXAM_LANGUAGE : EXAM_READING;
    const given = answers[key] || {};
    data.questions.forEach((q) => {
      total += 1;
      if (given[q.id] === q.correct) correct += 1;
    });
  });
  return { correct, total };
}

function ExamProgressHeader({ sectionIdx }) {
  return (
    <div style={S.questPathWrap}>
      <div style={S.questPathLine} />
      <div style={S.questPathRow}>
        {EXAM_SECTION_META.map((s, i) => {
          const Icon = s.icon;
          const state = i < sectionIdx ? "done" : i === sectionIdx ? "current" : "todo";
          return (
            <div key={s.id} style={S.questNodeWrap}>
              <div
                style={{
                  ...S.questNode,
                  background: state === "done" ? "#3DAE86" : state === "current" ? "#C23616" : "#2A2D33",
                  color: state === "todo" ? "#7D7864" : "#fff",
                  transform: state === "current" ? "scale(1.12)" : "scale(1)",
                }}
              >
                {state === "done" ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <div style={{ ...S.questNodeLabel, color: state === "current" ? "#C23616" : "#8D876F" }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function useCountdown(minutes) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return { secondsLeft, display: `${mm}:${ss}` };
}

function TimerBadge({ minutes }) {
  const { secondsLeft, display } = useCountdown(minutes);
  return (
    <div style={{ ...S.timerBadge, color: secondsLeft === 0 ? "#C23616" : "#B3AD98" }}>
      <Clock size={13} />
      <span style={{ marginLeft: 4 }}>{secondsLeft === 0 ? "时间到，尽快完成吧" : display}</span>
    </div>
  );
}

function ListeningSection({ onNext }) {
  const [chosen, setChosen] = useState({});
  const [played, setPlayed] = useState(false);

  const playAudio = () => {
    try {
      const utter = new SpeechSynthesisUtterance(EXAM_LISTENING.audioText);
      utter.lang = "zh-CN";
      utter.rate = 0.92;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      setPlayed(true);
    } catch (e) {
      setPlayed(true);
    }
  };

  const allAnswered = EXAM_LISTENING.questions.every((q) => chosen[q.id] !== undefined);

  return (
    <div style={S.examSectionBody}>
      <TimerBadge minutes={EXAM_LISTENING.minutes} />
      <div style={S.listenBox}>
        <button style={S.playAudioBtn} onClick={playAudio}>
          <Volume2 size={18} /> {played ? "再听一次" : "播放录音"}
        </button>
        <div style={S.listenHint}>{played ? "可以再听一次，然后作答" : "按播放键，仔细听对话"}</div>
      </div>
      {EXAM_LISTENING.questions.map((q, i) => (
        <MCQQuestion key={q.id} index={i} q={q} chosen={chosen[q.id]} onChoose={(idx) => setChosen((p) => ({ ...p, [q.id]: idx }))} />
      ))}
      <button style={S.examNextBtn} disabled={!allAnswered} onClick={() => onNext(chosen)}>
        下一部分 <ChevronRight size={16} />
      </button>
    </div>
  );
}

function MCQSection({ data, label, onNext }) {
  const [chosen, setChosen] = useState({});
  const allAnswered = data.questions.every((q) => chosen[q.id] !== undefined);
  return (
    <div style={S.examSectionBody}>
      <TimerBadge minutes={data.minutes} />
      {data.questions.map((q, i) => (
        <MCQQuestion key={q.id} index={i} q={q} chosen={chosen[q.id]} onChoose={(idx) => setChosen((p) => ({ ...p, [q.id]: idx }))} />
      ))}
      <button style={S.examNextBtn} disabled={!allAnswered} onClick={() => onNext(chosen)}>
        下一部分 <ChevronRight size={16} />
      </button>
    </div>
  );
}

function ReadingSection({ onNext }) {
  const [chosen, setChosen] = useState({});
  const allAnswered = EXAM_READING.questions.every((q) => chosen[q.id] !== undefined);
  return (
    <div style={S.examSectionBody}>
      <TimerBadge minutes={EXAM_READING.minutes} />
      <div style={S.passageBox}>{EXAM_READING.passage}</div>
      {EXAM_READING.questions.map((q, i) => (
        <MCQQuestion key={q.id} index={i} q={q} chosen={chosen[q.id]} onChoose={(idx) => setChosen((p) => ({ ...p, [q.id]: idx }))} />
      ))}
      <button style={S.examNextBtn} disabled={!allAnswered} onClick={() => onNext(chosen)}>
        下一部分 <ChevronRight size={16} />
      </button>
    </div>
  );
}

function MCQQuestion({ index, q, chosen, onChoose }) {
  return (
    <div style={S.mcqCard}>
      <div style={S.mcqQ}>{index + 1}. {q.q}</div>
      <div style={S.mcqOptions}>
        {q.options.map((opt, i) => (
          <button
            key={i}
            style={{
              ...S.mcqOption,
              borderColor: chosen === i ? "#3DAE86" : "#33373F",
              background: chosen === i ? "#17332B" : "#20232A",
            }}
            onClick={() => onChoose(i)}
          >
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function WritingSection({ onNext }) {
  const [text, setText] = useState("");
  const wordCount = text.replace(/\s/g, "").length;
  const enough = wordCount >= EXAM_WRITING.minWords * 0.5; // gentle threshold, not strict grading
  return (
    <div style={S.examSectionBody}>
      <TimerBadge minutes={EXAM_WRITING.minutes} />
      <div style={S.promptCard}>
        <div style={S.promptType}>{EXAM_WRITING.type}</div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: "#D6D1C0" }}>{EXAM_WRITING.prompt}</div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="在这里写下你的便条…"
        style={S.writingArea}
      />
      <div style={S.wordCount}>已写 {wordCount} 字（参考字数约 {EXAM_WRITING.minWords} 字）</div>
      <div style={S.writingNote}>写作不打分，写完记得给爸爸妈妈看看，一起讨论可以怎么写得更好。</div>
      <button style={S.examNextBtn} disabled={wordCount === 0} onClick={() => onNext(text)}>
        下一部分 <ChevronRight size={16} />
      </button>
    </div>
  );
}

function OralExamSection({ onNext }) {
  const [recState, setRecState] = useState("idle");
  const [audioUrl, setAudioUrl] = useState(null);
  const [micError, setMicError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setRecState("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecState("recording");
    } catch (e) {
      setMicError("无法使用麦克风，请检查权限设置。");
    }
  };
  const stopRecording = () => mediaRecorderRef.current && mediaRecorderRef.current.stop();

  return (
    <div style={S.examSectionBody}>
      <TimerBadge minutes={EXAM_ORAL.minutes} />
      <div style={S.promptCard}>
        <div style={S.promptType}>看图说话</div>
        <div style={{ fontSize: 14, lineHeight: 1.7 }}>{EXAM_ORAL.picturePrompt}</div>
        <div style={{ fontSize: 12, color: "#8D876F", marginTop: 10 }}>追问：{EXAM_ORAL.followUp}</div>
      </div>
      <div style={S.recordArea}>
        {micError && <div style={S.micError}>{micError}</div>}
        {recState !== "recording" ? (
          <button style={S.micBtn} onClick={startRecording}>
            <Mic size={26} color="#fff" />
          </button>
        ) : (
          <button style={{ ...S.micBtn, background: "#C23616" }} onClick={stopRecording}>
            <Square size={22} color="#fff" />
          </button>
        )}
        <div style={S.micLabel}>
          {recState === "idle" && "按下开始录音，说说看图内容和追问"}
          {recState === "recording" && "录音中…按下停止"}
          {recState === "recorded" && "录好了"}
        </div>
        {audioUrl && (
          <audio controls src={audioUrl} style={{ marginTop: 10, width: "100%" }} />
        )}
      </div>
      <button style={S.examNextBtn} disabled={!audioUrl} onClick={() => onNext({ audioUrl })}>
        完成远征 <ChevronRight size={16} />
      </button>
    </div>
  );
}

function ExamResults({ score, onRestart }) {
  const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;
  return (
    <div style={S.examResultsWrap}>
      <Award size={44} color="#C23616" strokeWidth={1.6} />
      <div style={S.examResultsTitle}>远征完成！</div>
      <div style={S.examResultsScore}>
        选择题部分：{score.correct} / {score.total} 题（{pct}%）
      </div>
      <div style={S.examResultsNote}>
        写作和口试不打分，建议和爸爸妈妈一起回听录音、看看写的便条，聊聊哪里可以更好。
      </div>
      <div style={S.examRewardLine}>
        <Coins size={16} color="#D9AE4E" /> +30 金币　<Award size={16} color="#C23616" /> 远征徽章 +1
      </div>
      <button style={S.examStartBtn} onClick={onRestart}>
        再来一套
      </button>
    </div>
  );
}

// ---------- Rewards Tab (福袋 + 等级 + 收藏) ----------
function RewardsTab({ coins, addCoins, collection, setCollection, blindbox, setBlindbox, streak, masteredCount, setSaveError }) {
  const [reveal, setReveal] = useState(null); // { type, amount } | { type:'sticker', sticker, dup }
  const [opening, setOpening] = useState(false);

  const today = todayStr();
  const earnedToday = streak.lastDay === today; // did any task today (flashcards/speaking bump this)
  const freeAvailable = earnedToday && blindbox.lastFreeDrawDate !== today;

  const { current, next } = getLevel(masteredCount);
  const prevMin = current.min;
  const nextMin = next ? next.min : prevMin;
  const levelProgress = next ? Math.min(1, (masteredCount - prevMin) / (nextMin - prevMin)) : 1;

  const rollBox = () => {
    const roll = Math.random();
    if (roll < 0.4) {
      const amount = 10 + Math.floor(Math.random() * 21);
      return { type: "coins", amount };
    }
    const r = Math.random();
    const rarity = r < 0.6 ? "普通" : r < 0.9 ? "稀有" : "传说";
    const pool = STICKERS.filter((s) => s.rarity === rarity);
    const sticker = pool[Math.floor(Math.random() * pool.length)];
    return { type: "sticker", sticker };
  };

  const openBox = async (free) => {
    if (!free && coins < 20) return;
    setOpening(true);
    setTimeout(async () => {
      const result = rollBox();
      if (result.type === "coins") {
        addCoins(free ? result.amount : result.amount - 20);
        setReveal({ type: "coins", amount: result.amount });
      } else {
        const owned = collection[result.sticker.id] || 0;
        const dup = owned > 0;
        const nextCollection = { ...collection, [result.sticker.id]: owned + 1 };
        setCollection(nextCollection);
        saveJSON("collection-v1", nextCollection).then((ok) => setSaveError(!ok));
        if (dup) addCoins(15);
        if (!free) addCoins(-20);
        setReveal({ type: "sticker", sticker: result.sticker, dup });
      }
      if (free) {
        const nextBox = { lastFreeDrawDate: today };
        setBlindbox(nextBox);
        saveJSON("blindbox-v1", nextBox).then((ok) => setSaveError(!ok));
      }
      setOpening(false);
    }, 900);
  };

  return (
    <div style={S.rewardsWrap}>
      <BlockScene themeKey="chest" />
      <div style={S.levelCard}>
        <div style={S.levelBadge}>{current.badge}</div>
        <div style={{ flex: 1 }}>
          <div style={S.levelTitle}>{current.title}</div>
          <div style={S.levelBarTrack}>
            <div style={{ ...S.levelBarFill, width: `${levelProgress * 100}%` }} />
          </div>
          <div style={S.levelSub}>
            {next ? `再掌握 ${Math.max(0, nextMin - masteredCount)} 个字升级到「${next.title}」` : "已经是最高等级啦！"}
          </div>
        </div>
      </div>

      <div style={S.sectionTitle}>今日福袋</div>
      <div style={S.boxCard}>
        {!opening && !reveal && (
          <>
            <Gift size={40} color="#C23616" strokeWidth={1.6} />
            <div style={S.boxHint}>
              {earnedToday
                ? freeAvailable
                  ? "今天的任务做完了，开一个福袋吧！"
                  : "今天的免费福袋已经开过了"
                : "先完成今天的识字或开口练习，才能开福袋"}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              {freeAvailable && (
                <button style={S.boxBtnFree} onClick={() => openBox(true)}>
                  免费开一个
                </button>
              )}
              <button style={S.boxBtnPaid} onClick={() => openBox(false)} disabled={coins < 20}>
                <Coins size={14} /> 花20金币再开
              </button>
            </div>
          </>
        )}
        {opening && (
          <div style={S.boxOpening}>
            <Sparkles size={36} color="#C9A24B" />
            <div style={S.boxHint}>正在开福袋…</div>
          </div>
        )}
        {reveal && !opening && (
          <div style={S.boxReveal}>
            {reveal.type === "coins" ? (
              <>
                <Coins size={40} color="#D9AE4E" />
                <div style={S.revealText}>获得 {reveal.amount} 金币！</div>
              </>
            ) : (
              <>
                <div style={S.revealEmoji}>{reveal.sticker.emoji}</div>
                <div style={{ ...S.revealText, color: RARITY_COLOR[reveal.sticker.rarity] }}>
                  {reveal.dup ? `重复的「${reveal.sticker.name}」，换成15金币` : `获得新贴纸「${reveal.sticker.name}」`}
                </div>
                <div style={S.revealRarity}>{reveal.sticker.rarity}</div>
              </>
            )}
            <button style={S.boxAgainBtn} onClick={() => setReveal(null)}>
              好的
            </button>
          </div>
        )}
      </div>

      <div style={S.sectionTitle}>贴纸收藏 ({Object.keys(collection).length}/{STICKERS.length})</div>
      <div style={S.collectionGrid}>
        {STICKERS.map((s) => {
          const owned = collection[s.id];
          return (
            <div key={s.id} style={{ ...S.stickerCell, borderColor: owned ? RARITY_COLOR[s.rarity] : "#33373F" }}>
              {owned ? (
                <>
                  <div style={S.stickerEmoji}>{s.emoji}</div>
                  {owned > 1 && <div style={S.stickerCount}>×{owned}</div>}
                </>
              ) : (
                <Lock size={16} color="#5C584A" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Progress Tab ----------
function BaseBuilder({ oreInventory }) {
  const cols = 12;
  const rowH = 16;
  const totalRows = BASE_TIERS.length;
  const svgH = totalRows * rowH + 10;
  return (
    <div style={S.baseCard}>
      <div style={S.baseTitleRow}>
        <Layers size={16} color="#D9AE4E" />
        <span style={S.baseTitle}>我的基地</span>
      </div>
      <svg viewBox={`0 0 ${cols * 20} ${svgH}`} preserveAspectRatio="xMidYMax meet" style={{ width: "100%", height: svgH + 20 }}>
        {BASE_TIERS.map((tier, tierIdxFromBottom) => {
          const rowFromTop = totalRows - 1 - tierIdxFromBottom;
          const y = rowFromTop * rowH;
          const owned = Math.min(oreInventory[tier.key] || 0, tier.need);
          const cellsInRow = tier.need;
          const rowWidthPx = cols * 20;
          const cellW = rowWidthPx / cellsInRow;
          const startX = (rowWidthPx - cellsInRow * cellW) / 2;
          return Array.from({ length: cellsInRow }).map((_, i) => {
            const filled = i < owned;
            return (
              <rect
                key={`${tier.key}-${i}`}
                x={startX + i * cellW + 1}
                y={y + 1}
                width={cellW - 2}
                height={rowH - 2}
                fill={filled ? (i % 2 === 0 ? tier.color : tier.darkColor) : "#2A2D33"}
                stroke={filled ? "#15171C" : "#3A3E46"}
                strokeWidth="1"
              />
            );
          });
        })}
      </svg>
      <div style={S.baseTierLegend}>
        {BASE_TIERS.map((tier) => (
          <div key={tier.key} style={S.baseTierRow}>
            <div style={{ width: 10, height: 10, background: tier.color, borderRadius: 2, marginRight: 6 }} />
            <span style={{ flex: 1 }}>{tier.label}</span>
            <span style={{ fontWeight: 700 }}>
              {Math.min(oreInventory[tier.key] || 0, tier.need)} / {tier.need}
            </span>
          </div>
        ))}
      </div>
      <div style={S.baseHint}>挖矿场里学会的每个字都有机会挖到矿石，砌成你自己的基地</div>
    </div>
  );
}

function ProgressTab({ srs, speakingLog, streak, oreInventory }) {
  const total = SEED_CHARS.length;
  const mastered = Object.values(srs).filter((s) => s.box >= BOX_INTERVALS_DAYS.length - 1).length;
  const learning = Object.values(srs).filter((s) => s.box > 0 && s.box < BOX_INTERVALS_DAYS.length - 1).length;
  const notStarted = total - mastered - learning;

  const speakingDays = Object.keys(speakingLog).length;
  const totalSpeakingReps = Object.values(speakingLog).reduce((a, arr) => a + arr.length, 0);

  const barSeg = (val, color, label) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
      <div style={{ width: 64, fontSize: 13, color: "#B3AD98" }}>{label}</div>
      <div style={S.barTrack}>
        <div style={{ ...S.barFill, width: `${(val / total) * 100}%`, background: color }} />
      </div>
      <div style={{ width: 28, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#D6D1C0" }}>{val}</div>
    </div>
  );

  return (
    <div style={S.progressWrap}>
      <BaseBuilder oreInventory={oreInventory} />
      <div style={S.statCardRow}>
        <div style={S.statCard}>
          <Flame size={20} color="#C23616" />
          <div style={S.statNum}>{streak.count}</div>
          <div style={S.statLabel}>连续天数</div>
        </div>
        <div style={S.statCard}>
          <BookOpen size={20} color="#3DAE86" />
          <div style={S.statNum}>{mastered}</div>
          <div style={S.statLabel}>已掌握生字</div>
        </div>
        <div style={S.statCard}>
          <MessageCircle size={20} color="#D9AE4E" />
          <div style={S.statNum}>{totalSpeakingReps}</div>
          <div style={S.statLabel}>开口练习次数</div>
        </div>
      </div>

      <div style={S.sectionTitle}>识字进度（共 {total} 字）</div>
      <div style={S.sectionCard}>
        {barSeg(mastered, "#3DAE86", "已掌握")}
        {barSeg(learning, "#C9A24B", "学习中")}
        {barSeg(notStarted, "#5C584A", "未开始")}
      </div>

      <div style={S.sectionTitle}>开口练习记录</div>
      <div style={S.sectionCard}>
        <div style={S.speakStatRow}>
          <span>练习过的天数</span>
          <strong>{speakingDays} 天</strong>
        </div>
        <div style={S.speakStatRow}>
          <span>累计练习次数</span>
          <strong>{totalSpeakingReps} 次</strong>
        </div>
      </div>

      <div style={S.footNote}>
        小提示：生字表目前是示范内容，之后可以换成孩子学校的生字表，让复习更贴近考试范围。
      </div>
    </div>
  );
}

// ---------- Styles ----------
const S = {
  app: {
    fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
    background: "#15171C",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    color: "#F2EEE2",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
  },
  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#15171C",
    fontFamily: "'Noto Sans SC', sans-serif",
  },
  loadingCard: { color: "#8D876F", fontSize: 14 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px 14px",
    borderBottom: "1px solid #33373F",
  },
  headerTitle: {
    fontFamily: "'Noto Serif SC', serif",
    fontWeight: 800,
    fontSize: 22,
    color: "#F2EEE2",
  },
  headerSub: { fontSize: 12, color: "#8D876F", marginTop: 2 },
  streakPill: {
    display: "flex",
    alignItems: "center",
    background: "#331D18",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    color: "#E2735A",
  },
  coinPill: {
    display: "flex",
    alignItems: "center",
    background: "#332B16",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    color: "#D9AE4E",
  },
  body: { flex: 1, padding: "16px 18px 90px", overflowY: "auto" },
  errorBanner: {
    position: "fixed",
    bottom: 66,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#7A2E20",
    color: "#fff",
    fontSize: 12,
    padding: "8px 14px",
    borderRadius: 8,
    maxWidth: 420,
    textAlign: "center",
  },
  tabBar: {
    position: "sticky",
    bottom: 0,
    display: "flex",
    borderTop: "1px solid #33373F",
    background: "#1B1D22",
    padding: "8px 0 12px",
  },
  tabBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },

  // Flashcards
  flashWrap: { display: "flex", flexDirection: "column", alignItems: "center" },
  progressLine: { fontSize: 13, color: "#9C9682", marginBottom: 14, alignSelf: "flex-start" },
  tianziCardOuter: { cursor: "pointer", width: "100%", display: "flex", justifyContent: "center" },
  tianziCard: {
    width: 220,
    height: 220,
    background: "#20232A",
    borderRadius: 12,
    border: "1px solid #33373F",
    boxShadow: "0 4px 18px rgba(90,80,50,0.10)",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gridSvg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  charDisplay: {
    fontFamily: "'Noto Serif SC', serif",
    fontWeight: 800,
    fontSize: 108,
    color: "#F2EEE2",
    zIndex: 1,
  },
  cardBack: {
    zIndex: 1,
    textAlign: "center",
    padding: "0 18px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  pinyin: { fontSize: 22, fontWeight: 700, color: "#3DAE86" },
  meaning: { fontSize: 13, color: "#B3AD98" },
  wordRow: { fontSize: 14, marginTop: 4, display: "flex", gap: 6, alignItems: "center" },
  wordLabel: {
    fontSize: 10,
    background: "#17332B",
    color: "#3DAE86",
    borderRadius: 4,
    padding: "1px 5px",
    fontWeight: 700,
  },
  sentence: { fontSize: 12, color: "#8D876F", marginTop: 4, lineHeight: 1.5 },
  stamp: {
    position: "absolute",
    bottom: 14,
    right: 14,
    border: "2.5px solid #C23616",
    color: "#C23616",
    fontSize: 13,
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: 6,
    transform: "rotate(-12deg)",
    fontFamily: "'Noto Serif SC', serif",
    background: "rgba(255,255,255,0.85)",
  },
  coinPop: {
    position: "absolute",
    top: 14,
    right: 14,
    display: "flex",
    alignItems: "center",
    gap: 3,
    background: "#332B16",
    color: "#D9AE4E",
    fontSize: 12,
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: 999,
  },
  tapHint: { fontSize: 12, color: "#7D7864", marginTop: 10 },
  answerRow: { display: "flex", gap: 10, marginTop: 22, width: "100%" },
  answerBtn: {
    flex: 1,
    border: "none",
    borderRadius: 10,
    padding: "12px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  emptyWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 20px" },
  emptyStamp: {
    width: 56,
    height: 56,
    border: "3px solid #C23616",
    color: "#C23616",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Noto Serif SC', serif",
    fontWeight: 800,
    fontSize: 26,
    marginBottom: 16,
    transform: "rotate(-8deg)",
  },
  emptyTitle: { fontWeight: 700, fontSize: 16, textAlign: "center" },
  emptyBody: { fontSize: 13, color: "#8D876F", marginTop: 6, textAlign: "center" },

  // Speaking
  speakWrap: { display: "flex", flexDirection: "column" },
  promptCard: {
    background: "#20232A",
    border: "1px solid #33373F",
    borderRadius: 12,
    padding: 18,
    position: "relative",
  },
  promptType: {
    fontSize: 11,
    fontWeight: 700,
    color: "#3DAE86",
    background: "#17332B",
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    marginBottom: 8,
  },
  promptFrame: {
    fontFamily: "'Noto Serif SC', serif",
    fontSize: 19,
    fontWeight: 700,
    lineHeight: 1.6,
    color: "#F2EEE2",
  },
  promptHint: { fontSize: 12, color: "#8D876F", marginTop: 8 },
  doneBadge: {
    marginTop: 10,
    display: "inline-block",
    fontSize: 12,
    fontWeight: 700,
    color: "#3DAE86",
  },
  recordArea: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  micError: { fontSize: 12, color: "#E2735A", marginBottom: 10, textAlign: "center" },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 10,
    background: "#3DAE86",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.28), inset 0 3px 0 rgba(255,255,255,0.3), 0 4px 10px rgba(47,107,94,0.3)",
  },
  micLabel: { fontSize: 12, color: "#9C9682", marginTop: 8 },
  playbackRow: { display: "flex", gap: 10, marginTop: 14 },
  playBtn: {
    display: "flex",
    alignItems: "center",
    background: "#17332B",
    color: "#3DAE86",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  retryBtn: {
    display: "flex",
    alignItems: "center",
    background: "#332B16",
    color: "#D9AE4E",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  markDoneBtn: {
    marginTop: 18,
    background: "#C23616",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.28), inset 0 2px 0 rgba(255,255,255,0.3)",
  },
  promptNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 26,
  },
  navBtn: {
    background: "#1B1D22",
    border: "1px solid #33373F",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    color: "#B3AD98",
    cursor: "pointer",
  },
  navCount: { fontSize: 12, color: "#8D876F" },

  // Progress
  progressWrap: { display: "flex", flexDirection: "column" },
  statCardRow: { display: "flex", gap: 10, marginBottom: 22 },
  statCard: {
    flex: 1,
    background: "#20232A",
    border: "1px solid #33373F",
    borderRadius: 12,
    padding: "14px 8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  statNum: { fontSize: 20, fontWeight: 800, fontFamily: "'Noto Serif SC', serif" },
  statLabel: { fontSize: 11, color: "#8D876F", textAlign: "center" },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#D6D1C0" },
  sectionCard: {
    background: "#20232A",
    border: "1px solid #33373F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  barTrack: {
    flex: 1,
    height: 8,
    background: "#2A2D33",
    borderRadius: 4,
    overflow: "hidden",
    margin: "0 8px",
  },
  barFill: { height: "100%", borderRadius: 4 },
  speakStatRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#B3AD98",
    padding: "4px 0",
  },
  footNote: { fontSize: 11, color: "#7D7864", lineHeight: 1.6, marginTop: 4 },

  // Rewards
  rewardsWrap: { display: "flex", flexDirection: "column" },
  levelCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#20232A",
    border: "1px solid #33373F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 22,
  },
  levelBadge: { fontSize: 34 },
  levelTitle: { fontWeight: 800, fontSize: 15, fontFamily: "'Noto Serif SC', serif", marginBottom: 6 },
  levelBarTrack: { height: 7, background: "#2A2D33", borderRadius: 4, overflow: "hidden" },
  levelBarFill: { height: "100%", background: "#3DAE86", borderRadius: 4 },
  levelSub: { fontSize: 11, color: "#8D876F", marginTop: 6 },
  boxCard: {
    background: "#20232A",
    border: "1px solid #33373F",
    borderRadius: 12,
    padding: "26px 18px",
    marginBottom: 22,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    minHeight: 150,
    justifyContent: "center",
  },
  boxHint: { fontSize: 13, color: "#B3AD98", marginTop: 10 },
  boxBtnFree: {
    background: "#3DAE86",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.28), inset 0 2px 0 rgba(255,255,255,0.25)",
  },
  boxBtnPaid: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "#332B16",
    color: "#D9AE4E",
    border: "none",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  boxOpening: { display: "flex", flexDirection: "column", alignItems: "center" },
  boxReveal: { display: "flex", flexDirection: "column", alignItems: "center" },
  revealEmoji: { fontSize: 48 },
  revealText: { fontSize: 14, fontWeight: 700, marginTop: 8 },
  revealRarity: { fontSize: 11, color: "#8D876F", marginTop: 2 },
  boxAgainBtn: {
    marginTop: 14,
    background: "#1B1D22",
    border: "1px solid #33373F",
    borderRadius: 8,
    padding: "7px 18px",
    fontSize: 12,
    color: "#B3AD98",
    cursor: "pointer",
  },
  collectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 10,
  },
  stickerCell: {
    aspectRatio: "1",
    background: "#20232A",
    border: "1.5px solid",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  stickerEmoji: { fontSize: 24 },
  stickerCount: { position: "absolute", bottom: 3, right: 5, fontSize: 10, fontWeight: 700, color: "#8D876F" },

  // Exam mode
  examIntro: { display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 6px", textAlign: "center" },
  examIntroTitle: { fontFamily: "'Noto Serif SC', serif", fontWeight: 800, fontSize: 20, marginTop: 10 },
  examIntroBody: { fontSize: 13, color: "#B3AD98", lineHeight: 1.7, marginTop: 10 },
  examSectionList: { width: "100%", marginTop: 18, marginBottom: 20 },
  examSectionRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#B3AD98",
    padding: "8px 4px",
    borderBottom: "1px solid #2A2D33",
  },
  examStartBtn: {
    background: "#C23616",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "13px 24px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.28), inset 0 2px 0 rgba(255,255,255,0.3)",
  },
  examWrap: { display: "flex", flexDirection: "column" },
  examProgressHeader: { marginBottom: 16 },
  examStepDot: { display: "inline-block", width: 22, height: 5, borderRadius: 3, marginRight: 5 },
  examStepLabel: { fontSize: 12, color: "#9C9682", marginTop: 8, fontWeight: 700 },
  examSectionBody: { display: "flex", flexDirection: "column" },
  timerBadge: {
    alignSelf: "flex-start",
    display: "flex",
    alignItems: "center",
    background: "#1B1D22",
    border: "1px solid #33373F",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 14,
  },
  listenBox: {
    background: "#20232A",
    border: "1px solid #33373F",
    borderRadius: 12,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
  },
  playAudioBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#3DAE86",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  listenHint: { fontSize: 12, color: "#8D876F", marginTop: 8 },
  passageBox: {
    background: "#20232A",
    border: "1px solid #33373F",
    borderRadius: 12,
    padding: 16,
    fontSize: 13,
    lineHeight: 1.8,
    color: "#D6D1C0",
    marginBottom: 16,
  },
  mcqCard: { marginBottom: 16 },
  mcqQ: { fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#F2EEE2" },
  mcqOptions: { display: "flex", flexDirection: "column", gap: 6 },
  mcqOption: {
    textAlign: "left",
    border: "1.5px solid",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    cursor: "pointer",
    color: "#D6D1C0",
  },
  examNextBtn: {
    marginTop: 6,
    alignSelf: "flex-end",
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#3DAE86",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  writingArea: {
    width: "100%",
    minHeight: 130,
    borderRadius: 10,
    border: "1px solid #33373F",
    padding: 12,
    fontSize: 14,
    fontFamily: "'Noto Sans SC', sans-serif",
    marginTop: 12,
    boxSizing: "border-box",
    resize: "vertical",
  },
  wordCount: { fontSize: 12, color: "#8D876F", marginTop: 6 },
  writingNote: { fontSize: 11, color: "#7D7864", marginTop: 4, marginBottom: 14, lineHeight: 1.6 },
  examResultsWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 10px", textAlign: "center" },
  examResultsTitle: { fontFamily: "'Noto Serif SC', serif", fontWeight: 800, fontSize: 20, marginTop: 10 },
  examResultsScore: { fontSize: 14, color: "#D6D1C0", marginTop: 10, fontWeight: 700 },
  examResultsNote: { fontSize: 12, color: "#8D876F", marginTop: 10, lineHeight: 1.7, maxWidth: 320 },
  examRewardLine: { display: "flex", alignItems: "center", fontSize: 13, fontWeight: 700, color: "#B3AD98", marginTop: 16, marginBottom: 20 },

  // Scene banner (game-like backdrop per tab)
  sceneBanner: {
    position: "relative",
    width: "100%",
    height: 104,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    border: "1px solid #33373F",
  },
  sceneSvg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  sceneDeco: { position: "absolute" },
  sceneMascot: { position: "absolute", bottom: 4, right: 12, fontSize: 32 },
  pixelAvatarFrame: {
    position: "absolute",
    bottom: 8,
    right: 10,
    background: "#FFFDF6",
    border: "3px solid #22282B",
    borderRadius: 6,
    padding: 3,
    boxShadow: "2px 2px 0 rgba(0,0,0,0.25)",
  },
  sceneTextWrap: { position: "absolute", left: 16, top: 14 },
  sceneTitle: { fontFamily: "'Noto Serif SC', serif", fontWeight: 800, fontSize: 17, color: "#22282B" },
  sceneSubtitle: { fontSize: 11, color: "#5B5647", marginTop: 3 },

  // Quest path (exam progress)
  questPathWrap: { position: "relative", marginBottom: 18 },
  questPathLine: {
    position: "absolute",
    top: 15,
    left: "10%",
    right: "10%",
    height: 2,
    background: "#33373F",
    zIndex: 0,
  },
  questPathRow: { display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 },
  questNodeWrap: { display: "flex", flexDirection: "column", alignItems: "center", width: 56 },
  questNode: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s",
  },
  questNodeLabel: { fontSize: 10, marginTop: 5, textAlign: "center", fontWeight: 600 },

  // Base builder (我的基地)
  baseCard: {
    background: "#20232A",
    border: "1px solid #33373F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  baseTitleRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 10 },
  baseTitle: { fontFamily: "'Noto Serif SC', serif", fontWeight: 800, fontSize: 15, color: "#F2EEE2" },
  baseTierLegend: { marginTop: 10 },
  baseTierRow: { display: "flex", alignItems: "center", fontSize: 12, color: "#B3AD98", padding: "3px 0" },
  baseHint: { fontSize: 11, color: "#7D7864", marginTop: 8, lineHeight: 1.6 },
};
