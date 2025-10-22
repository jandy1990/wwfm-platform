/**
 * Member Badge Easter Eggs
 * Hidden surprises and delights based on member numbers
 */

interface MemberBadge {
  emoji?: string
  label?: string
  color?: string
  special?: boolean
}

type BadgeRule = (memberNumber: number) => MemberBadge | null

const CORE_BADGES: Array<[number, MemberBadge]> = [
  [1, { emoji: '👑', label: 'Founder', color: 'text-yellow-500', special: true }],
  [2, { emoji: '🥈', label: 'Second Human' }],
  [3, { emoji: '🤖', label: 'Third Ever • Three Laws' }],
  [4, { emoji: '☸️', label: 'Four Noble Truths', color: 'text-amber-500' }],
  [5, { emoji: '🪷', label: 'Five Precepts', color: 'text-green-500' }],
  [6, { emoji: '🛕', label: 'Six Paramitas' }],
  [7, { emoji: '🕯️', label: 'Seven Enlightenment Factors' }],
  [8, { emoji: '🧭', label: 'Noble Eightfold Path', special: true }],
  [9, { emoji: '🕉️', label: 'Nine Yānas' }],
  [10, { emoji: '🐂', label: 'Ten Ox-Herding Tales', color: 'text-slate-500' }],
]

const BUDDHIST_EXACT_BADGES: Array<[number, MemberBadge]> = [
  [12, { emoji: '🔁', label: 'Twelve Links of Dependent Arising' }],
  [18, { emoji: '🙏', label: 'Eighteen Arhats' }],
  [21, { emoji: '🛕', label: 'Twenty-One Taras' }],
  [32, { emoji: '🌟', label: 'Thirty-Two Auspicious Marks' }],
  [49, { emoji: '🧘', label: 'Forty-Nine Day Vigil' }],
  [54, { emoji: '🎐', label: 'Fifty-Four Prajnaparamita' }],
  [81, { emoji: '🌀', label: 'Nine Times Nine Syllables' }],
  [84, { emoji: '🪷', label: 'Eighty-Four Mahāsiddhas' }],
  [88, { emoji: '🦋', label: 'Transformation' }],
  [108, { emoji: '📿', label: 'Mala Beads', special: true }],
  [216, { emoji: '🔄', label: 'Double Mala' }],
  [324, { emoji: '🪷', label: 'Triple Mala' }],
  [432, { emoji: '🎵', label: 'Cosmic Om Pitch' }],
  [540, { emoji: '🛕', label: 'Fivefold Chant' }],
  [648, { emoji: '🪔', label: 'Great Assembly' }],
  [864, { emoji: '🌞', label: 'Sunrise Mantra' }],
  [1008, { emoji: '🕯️', label: 'Thousand-and-Eight Offerings', special: true }],
]

const CLASSIC_LITERATURE_BADGES: Array<[number, MemberBadge]> = [
  [1603, { emoji: '🗡️', label: 'Othello Debuts' }],
  [1606, { emoji: '👑', label: 'King Lear Unleashed' }],
  [1611, { emoji: '🌊', label: 'The Tempest' }],
  [1812, { emoji: '🎭', label: 'Dickens Arrives' }],
  [1813, { emoji: '💌', label: 'Pride & Prejudice' }],
  [1821, { emoji: '🪆', label: 'Dostoevsky Born' }],
  [1828, { emoji: '🕊️', label: 'Tolstoy Born' }],
  [1843, { emoji: '🎄', label: 'Christmas Carol' }],
  [1846, { emoji: '📜', label: 'Poor Folk' }],
  [1847, { emoji: '🏚️', label: 'Jane Eyre' }],
  [1851, { emoji: '🐋', label: 'Moby-Dick' }],
  [1859, { emoji: '⚔️', label: 'Two Cities' }],
  [1864, { emoji: '🕳️', label: 'Notes from Underground' }],
  [1866, { emoji: '🪓', label: 'Crime & Punishment' }],
  [1869, { emoji: '⚔️', label: 'War and Peace' }],
  [1872, { emoji: '🔥', label: 'Demons' }],
  [1877, { emoji: '🚂', label: 'Anna Karenina' }],
  [1880, { emoji: '👬', label: 'Brothers Karamazov' }],
  [1881, { emoji: '🌌', label: 'Dostoevsky Farewell' }],
  [1886, { emoji: '⚖️', label: 'Ivan Ilyich' }],
  [1899, { emoji: '✝️', label: 'Resurrection' }],
]

const TWENTIETH_CENTURY_LITERATURE: Array<[number, MemberBadge]> = [
  [1902, { emoji: '🌾', label: 'Steinbeck • Salinas roots' }],
  [1922, { emoji: '💚', label: 'Fitzgerald • Green light beckons' }],
  [1925, { emoji: '🥂', label: 'Gatsby • Jazz Age pinnacle' }],
  [1932, { emoji: '🏌️', label: 'Updike • Brewer beginnings' }],
  [1933, { emoji: '📚', label: 'Roth • Newark boyhood' }],
  [1937, { emoji: '🐁', label: 'Steinbeck • Dust Bowl families' }],
  [1938, { emoji: '🎭', label: 'Nabokov • Invitation to Beheading' }],
  [1939, { emoji: '🍇', label: 'Steinbeck • Grapes of Wrath' }],
  [1947, { emoji: '🪳', label: 'Camus • The Plague spreads' }],
  [1949, { emoji: '🗝️', label: 'Nabokov • Bend Sinister world' }],
  [1952, { emoji: '🍎', label: 'Steinbeck • Eden myth reborn' }],
  [1953, { emoji: '🎭', label: 'Roth • Goodbye Columbus seeds' }],
  [1955, { emoji: '💋', label: 'Nabokov • Lolita echo' }],
  [1960, { emoji: '🐇', label: 'Updike • Rabbit runs' }],
  [1961, { emoji: '🏡', label: 'Yates • Suburban ache' }],
  [1962, { emoji: '🌫️', label: 'Nabokov • Pale Fire mirror' }],
  [1967, { emoji: '🖋️', label: 'Cusk • Outline voice' }],
  [1969, { emoji: '🥩', label: 'Roth • Portnoy unleashed' }],
  [1973, { emoji: '💔', label: 'Roth • My Life as a Man' }],
  [1986, { emoji: '🍂', label: 'Roth • Counterlife splits' }],
  [1990, { emoji: '🕊️', label: 'Franzen • Freedom seeds' }],
  [1992, { emoji: '🌊', label: 'Franzen • Strong Motion undertow' }],
  [1997, { emoji: '🇺🇸', label: 'Roth • American Pastoral myth' }],
  [2000, { emoji: '😶', label: 'Roth • The Human Stain' }],
  [2001, { emoji: '📡', label: 'Franzen • Corrections orbit' }],
  [2014, { emoji: '🗣️', label: 'Cusk • Outline listening' }],
  [2016, { emoji: '🚉', label: 'Cusk • Transit passage' }],
  [2018, { emoji: '🏆', label: 'Cusk • Kudos recognition' }],
]

const LITERATURE_LORE_BADGES: Array<[number, MemberBadge]> = [
  // Updike
  [34, { emoji: '🏀', label: 'Rabbit • Number 34 jersey' }],

  // Steinbeck
  [66, { emoji: '🚚', label: 'Steinbeck • Route 66 caravan' }],

  // Tolstoy
  [365, { emoji: '📖', label: 'War and Peace • 365 chapters' }],

  // Dostoevsky
  [77, { emoji: '🪓', label: 'Crime & Punishment • July 7' }],
  [30, { emoji: '🪙', label: 'Crime & Punishment • 30 kopeks' }],
  [73, { emoji: '🔨', label: 'Crime & Punishment • 73 steps' }],

  // Fitzgerald
  [115, { emoji: '🏡', label: 'Revolutionary Road • Number 115' }],

  // Nabokov
  [342, { emoji: '🛏️', label: 'Lolita • Room 342' }],
  [999, { emoji: '🔥', label: 'Pale Fire • 999-line poem' }],

  // Roth
  [51, { emoji: '🏙️', label: 'Roth • Newark Street 51' }],
  [69, { emoji: '🥩', label: 'Portnoy • Complaint age' }],

  // Franzen
  [500, { emoji: '📄', label: 'The Corrections • 500 pages of truth' }],

  // Other
  [117, { emoji: '🏠', label: 'Mrs Bridge • 117 vignettes' }],
  [1536, { emoji: '🗡️', label: 'Wolf Hall • Anne\'s fate 1536' }],
  [451, { emoji: '🔥', label: 'Fahrenheit 451 • Book burning point' }],
]

const AI_LORE_BADGES: Array<[number, MemberBadge]> = [
  [42, { emoji: '🌌', label: 'Answer to Deep Thought' }],
  [1837, { emoji: '🧮', label: 'Ada Writes Algorithms' }],
  [1912, { emoji: '🧠', label: 'Alan Turing Born' }],
  [1916, { emoji: '🔐', label: 'Claude Shannon Arrives' }],
  [1920, { emoji: '⚙️', label: 'Čapek Robot Dreams' }],
  [1927, { emoji: '🧠', label: 'Marvin Minsky Born' }],
  [1936, { emoji: '📄', label: 'Turing Computable Numbers' }],
  [1941, { emoji: '⚙️', label: 'Zuse Z3 Clicks Alive' }],
  [1943, { emoji: '🔗', label: 'McCulloch-Pitts Neuron' }],
  [1946, { emoji: '💡', label: 'ENIAC Lights Up' }],
  [1950, { emoji: '🤖', label: 'Imitation Game Test' }],
  [1951, { emoji: '🏁', label: 'Ferranti Chess Plays' }],
  [1956, { emoji: '🏛️', label: 'Dartmouth Genesis' }],
  [1957, { emoji: '📡', label: 'Perceptrons Paper' }],
  [1958, { emoji: '🧾', label: 'Rosenblatt Publishes' }],
  [1959, { emoji: '📚', label: 'Samuel Coins Machine Learning' }],
  [1965, { emoji: '🏆', label: 'Samuel Checkers Crown' }],
  [1966, { emoji: '💬', label: 'ELIZA Talks Back' }],
  [1968, { emoji: '🛰️', label: 'HAL 9000 Watch' }],
  [1970, { emoji: '🚶', label: 'SHAKEY Roams the Lab' }],
  [1972, { emoji: '🧠', label: 'John McCarthy Lisp' }],
  [1982, { emoji: '🗂️', label: 'TRON Grid' }],
  [1984, { emoji: '⚠️', label: 'Skynet Prophecy' }],
  [1985, { emoji: '🔁', label: 'Backprop Renaissance' }],
  [1998, { emoji: '🧠', label: 'LeCun CNN Breakthrough' }],
  [1999, { emoji: '💊', label: 'Matrix Awakening' }],
  [2002, { emoji: '🛡️', label: 'AdaBoost Honored' }],
  [2006, { emoji: '🧠', label: 'Hinton Deep Belief' }],
  [2009, { emoji: '🌐', label: 'ImageNet Dream' }],
  [2010, { emoji: '🤖', label: 'DeepMind Founded' }],
  [2011, { emoji: '❓', label: 'Watson Wins Jeopardy!' }],
  [2012, { emoji: '🐱', label: 'AlexNet Vision Revolution' }],
  [2015, { emoji: '🏅', label: 'ResNet Scales the Summit' }],
  [2017, { emoji: '🌏', label: 'AlphaZero Epoch' }],
  [2019, { emoji: '🧬', label: 'BERT Language Pulse' }],
  [2020, { emoji: '🧠', label: 'AlphaFold Protein Leap' }],
  [2021, { emoji: '🎨', label: 'DALL·E Dreams in Colour' }],
  [2022, { emoji: '🎨', label: 'Diffusion Dreams' }],
  [2042, { emoji: '🧬', label: 'Synthetic Rights Draft' }],
  [2081, { emoji: '🔮', label: 'Sentience Equality Act' }],
]

const POP_CULTURE_BADGES: Array<[number, MemberBadge]> = []

const MUSIC_LYRIC_BADGES: Array<[number, MemberBadge]> = [
  // Taylor Swift
  [13, { emoji: '💘', label: 'Swift • Dressed like a daydream' }],
  [15, { emoji: '💚', label: 'Swift • Fifteen and everything changed' }],
  [22, { emoji: '🎈', label: 'Swift • Feeling 22' }],
  [89, { emoji: '📸', label: 'Swift • Polaroids on the floor' }],
  [112, { emoji: '🧣', label: 'Swift • Left my scarf at your sister\'s house' }],
  [459, { emoji: '🎤', label: 'Swift • Speak now or forever hold your peace' }],
  [713, { emoji: '🌲', label: 'Swift • Meet me behind the mall' }],
  [1201, { emoji: '🌌', label: 'Swift • Midnight rain I was sunshine' }],
  [1989, { emoji: '🌃', label: 'Swift • New York waiting' }],
  [100, { emoji: '🎯', label: 'Swift • This is me trying 100%' }],

  // Pink Floyd
  [19, { emoji: '💋', label: 'Pink Floyd • Young lust calling' }],
  [23, { emoji: '🌬️', label: 'Pink Floyd • Breathe in the air' }],
  [41, { emoji: '🕰️', label: 'Pink Floyd • Time has come' }],
  [74, { emoji: '🌊', label: 'Pink Floyd • Echoes overhead' }],
  [1979, { emoji: '🧱', label: 'Pink Floyd • Another brick' }],

  // The Doors
  [20, { emoji: '🎸', label: 'The Doors • Light my fire' }],
  [27, { emoji: '🕯️', label: 'The Doors • Forever 27 club' }],

  // Black Sabbath
  [616, { emoji: '😈', label: 'Sabbath • Original beast number' }],
  [757, { emoji: '⚔️', label: 'Sabbath • Generals gathered' }],
  [1980, { emoji: '👑', label: 'Sabbath • Heaven and Hell Dio era' }],

  // Cat Stevens
  [1948, { emoji: '☮️', label: 'Cat Stevens • Yusuf born' }],
  [1971, { emoji: '🌙', label: 'Cat Stevens • Moonshadow dancing' }],
  [1974, { emoji: '🍫', label: 'Cat Stevens • Buddha and chocolate' }],

  // CHVRCHES
  [318, { emoji: '🔔', label: 'CHVRCHES • We sink our teeth' }],

  // The 1975
  [16, { emoji: '🖤', label: 'The 1975 • She\'s American sixteen' }],
  [102, { emoji: '💤', label: 'The 1975 • I like it when you sleep 102' }],
  [725, { emoji: '🎧', label: 'The 1975 • Modernity has failed us' }],

  // Fleetwood Mac
  [35, { emoji: '🛣️', label: 'Fleetwood • Go your own way' }],
  [1975, { emoji: '🌧️', label: 'Fleetwood • Thunder only happens' }],
  [1977, { emoji: '🕊️', label: 'Fleetwood • Dreams unwind' }],

  // Angie McMahon
  [319, { emoji: '🌧️', label: 'Angie McMahon • Salt in my hands' }],

  // Chance the Rapper
  [316, { emoji: '🙌', label: 'Chance • Blessings rain down' }],
  [1993, { emoji: '👶', label: 'Chance • Chicago born' }],

  // Tame Impala
  [25, { emoji: '🎸', label: 'Tame Impala • Eventually fade' }],
  [629, { emoji: '🌈', label: 'Tame Impala • Let it happen' }],

  // Kendrick Lamar
  [217, { emoji: '🎤', label: 'Kendrick • Sit down be humble' }],
  [425, { emoji: '👑', label: 'Kendrick • King Kunta throne' }],
  [2024, { emoji: '🥊', label: 'Kendrick • Not like us victory' }],
  [48, { emoji: '🌍', label: 'Kendrick • 48 laws of power' }],
  [301, { emoji: '🏙️', label: 'Kendrick • Compton 301 streets' }],

  // The Weeknd
  [103, { emoji: '📻', label: 'Weeknd • Dawn FM 103.5' }],
  [311, { emoji: '🌴', label: 'Weeknd • House of Balloons' }],
  [416, { emoji: '🌆', label: 'Weeknd • 6ix starboy skyline' }],
  [1035, { emoji: '🔊', label: 'Weeknd • Radio frequency calling' }],

  // Lana Del Rey
  [212, { emoji: '🗽', label: 'Lana Del Rey • New York calling' }],
  [405, { emoji: '🛣️', label: 'Lana Del Rey • Riding down the 405' }],
  [24, { emoji: '💎', label: 'Lana Del Rey • 24 karat magic' }],

  // Other Artists
  [323, { emoji: '🔥', label: 'Fred again.. • Jungle drumline' }],
  [414, { emoji: '🎛️', label: 'Mutual Benefit • River light' }],
  [808, { emoji: '💔', label: 'Kanye • 808s in my heart' }],
  [909, { emoji: '🤖', label: 'Daft Punk • Harder better faster stronger' }],
  [1976, { emoji: '🌌', label: 'Bob Seger • Working on night moves' }],
  [2005, { emoji: '🎺', label: 'Sufjan • I made a lot of mistakes' }],
  [2007, { emoji: '🥁', label: 'LCD • Tonight we lose our friends' }],
  [2008, { emoji: '✒️', label: 'Vampire Weekend • Who gives an Oxford comma' }],
]

const SCIENCE_AND_NUMBERS_BADGES: Array<[number, MemberBadge]> = [
  [137, { emoji: '⚛️', label: 'Fine Structure' }],
  [161, { emoji: '🌀', label: 'Golden Ratio' }],
  [220, { emoji: '💞', label: 'Amicable Partner' }],
  [284, { emoji: '💕', label: 'Amicable Pair' }],
  [299, { emoji: '💡', label: 'Speed of Light' }],
  [343, { emoji: '🔊', label: 'Sound Speed' }],
  [369, { emoji: '⚡', label: 'Tesla Code' }],
  [496, { emoji: '✨', label: 'Perfect Number' }],
  [528, { emoji: '💚', label: 'Love Frequency' }],
  [6022, { emoji: '🔬', label: 'Avogadro' }],
  [8008, { emoji: '🔢', label: 'Calculator Giggle' }],
]

const NUMEROLOGY_BADGES: Array<[number, MemberBadge]> = [
  [11, { emoji: '🔮', label: 'Master Number' }],
  [33, { emoji: '☸️', label: 'Master Teacher' }],
  [40, { emoji: '🏜️', label: 'Forty Days & Nights' }],
  [72, { emoji: '📿', label: 'Names of God' }],
  [333, { emoji: '🙏', label: 'Ascended Allies' }],
  [444, { emoji: '👼', label: 'Angel Sequence' }],
  [555, { emoji: '🌪️', label: 'Change Coming' }],
  [666, { emoji: '😈', label: 'Number of Beast' }],
  [777, { emoji: '🍀', label: 'Divine Luck' }],
  [888, { emoji: '🐉', label: 'Triple Fortune' }],
  [1010, { emoji: '🌟', label: 'Awakening' }],
]

const HISTORICAL_BADGES: Array<[number, MemberBadge]> = [
  [476, { emoji: '🏛️', label: 'Rome Falls' }],
  [704, { emoji: '🎆', label: 'Independence Eve' }],
  [867, { emoji: '📞', label: 'Jenny Hotline' }],
  [1031, { emoji: '🎃', label: 'Halloween Eve' }],
  [1066, { emoji: '🏹', label: 'Battle of Hastings' }],
  [1111, { emoji: '🎖️', label: 'Armistice Echo' }],
  [1215, { emoji: '📋', label: 'Magna Carta' }],
  [1492, { emoji: '⛵', label: 'Ocean Blue' }],
  [1776, { emoji: '🗽', label: 'Independence' }],
  [1789, { emoji: '🥖', label: 'Révolution' }],
  [1865, { emoji: '📜', label: 'Abolition' }],
  [1914, { emoji: '🎖️', label: 'Great War' }],
  [1918, { emoji: '☮️', label: 'Armistice' }],
  [1929, { emoji: '📉', label: 'Market Crash' }],
  [1945, { emoji: '🕊️', label: 'VE Day' }],
  [1963, { emoji: '✊', label: 'I Have a Dream' }],
]

const ENTERTAINMENT_BADGES: Array<[number, MemberBadge]> = [
  [47, { emoji: '🖖', label: 'Star Trek Code' }],
  [1701, { emoji: '🚀', label: 'Enterprise Registry' }],
  [221, { emoji: '🔍', label: 'Baker Street' }],
  [360, { emoji: '🎮', label: 'No-Scope Legend' }],
  [404, { emoji: '🔍', label: 'Not Found' }],
  [411, { emoji: 'ℹ️', label: 'Information Desk' }],
  [8675309, { emoji: '☎️', label: 'Jenny Jenny' }],
  [4815162342, { emoji: '🏝️', label: 'Lost Numbers' }],
  [24601, { emoji: '🍞', label: 'Jean Valjean' }],
  [1312, { emoji: '🎸', label: 'Punk Code' }],
  [1337, { emoji: '💻', label: 'Leet Speak' }],
]

const EXACT_BADGES = new Map<number, MemberBadge>([
  ...CORE_BADGES,
  ...BUDDHIST_EXACT_BADGES,
  ...CLASSIC_LITERATURE_BADGES,
  ...TWENTIETH_CENTURY_LITERATURE,
  ...LITERATURE_LORE_BADGES,
  ...NUMEROLOGY_BADGES,
  ...AI_LORE_BADGES,
  ...POP_CULTURE_BADGES,
  ...MUSIC_LYRIC_BADGES,
  ...SCIENCE_AND_NUMBERS_BADGES,
  ...HISTORICAL_BADGES,
  ...ENTERTAINMENT_BADGES,
])

const buddhistMultipleRule: BadgeRule = (memberNumber) => {
  if (memberNumber !== 0 && memberNumber % 1080 === 0) {
    return { emoji: '🛕', label: 'Tenfold Mala Resonance', special: true }
  }
  if (memberNumber !== 0 && memberNumber % 108 === 0) {
    return { emoji: '🪷', label: 'Mala Multiple' }
  }
  return null
}

const contains108Rule: BadgeRule = (memberNumber) => {
  if (memberNumber.toString().includes('108') && !EXACT_BADGES.has(memberNumber)) {
    return { emoji: '🪷', label: '108 Thread' }
  }
  return null
}

const buddhistEightfoldRule: BadgeRule = (memberNumber) => {
  if (memberNumber !== 0 && memberNumber % 8 === 0 && !EXACT_BADGES.has(memberNumber)) {
    return { emoji: '🧘', label: 'Eightfold Rhythm' }
  }
  return null
}

const digitalRoot = (value: number): number => {
  const positive = Math.abs(value)
  if (positive === 0) return 0
  return ((positive - 1) % 9) + 1
}

const buddhistDigitalRootRule: BadgeRule = (memberNumber) => {
  const root = digitalRoot(memberNumber)
  if (root === 9 && !EXACT_BADGES.has(memberNumber)) {
    return { emoji: '🪷', label: 'Nine Lotus Cycle' }
  }
  if (root === 8 && !EXACT_BADGES.has(memberNumber)) {
    return { emoji: '🧭', label: 'Eightfold Echo' }
  }
  return null
}

const aiDirectiveRule: BadgeRule = (memberNumber) => {
  const str = memberNumber.toString()
  if (str.endsWith('42') && !EXACT_BADGES.has(memberNumber)) {
    return { emoji: '🤖', label: 'Directive 42' }
  }
  if (str.includes('2049')) {
    return { emoji: '🌆', label: 'Blade Runner Signal' }
  }
  return null
}

const palindromeRule: BadgeRule = (memberNumber) => {
  const str = memberNumber.toString()
  if (str.length >= 3 && str === str.split('').reverse().join('')) {
    return { emoji: '🪞', label: 'Palindrome' }
  }
  return null
}

const repeatingDigitRule: BadgeRule = (memberNumber) => {
  const str = memberNumber.toString()
  if (str.length >= 3) {
    const uniqueDigits = new Set(str.split(''))
    if (uniqueDigits.size === 1) {
      return { emoji: '🎯', label: 'Repeating' }
    }
  }
  return null
}

const ascendingRule: BadgeRule = (memberNumber) => {
  const digits = memberNumber.toString().split('')
  if (
    digits.length >= 3 &&
    digits.every((digit, index, array) => index === 0 || parseInt(digit) === parseInt(array[index - 1]) + 1)
  ) {
    return { emoji: '📈', label: 'Ascending' }
  }
  return null
}

const descendingRule: BadgeRule = (memberNumber) => {
  const digits = memberNumber.toString().split('')
  if (
    digits.length >= 3 &&
    digits.every((digit, index, array) => index === 0 || parseInt(digit) === parseInt(array[index - 1]) - 1)
  ) {
    return { emoji: '📉', label: 'Descending' }
  }
  return null
}

const powersOfTwoRule: BadgeRule = (memberNumber) => {
  if (memberNumber > 0 && (memberNumber & (memberNumber - 1)) === 0) {
    const exponent = Math.log2(memberNumber)
    return { emoji: '💻', label: `2^${exponent}` }
  }
  return null
}

const fibonacciSet = new Set<number>([1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765])
const fibonacciRule: BadgeRule = (memberNumber) => {
  if (fibonacciSet.has(memberNumber)) {
    return { emoji: '🌀', label: 'Fibonacci' }
  }
  return null
}

const perfectSquareRule: BadgeRule = (memberNumber) => {
  const root = Math.sqrt(memberNumber)
  if (Number.isInteger(root) && root > 10 && root < 100) {
    return { emoji: '◻️', label: `${root}²` }
  }
  return null
}

const isPrime = (value: number): boolean => {
  if (value <= 1) return false
  if (value === 2) return true
  if (value % 2 === 0) return false
  const limit = Math.floor(Math.sqrt(value))
  for (let i = 3; i <= limit; i += 2) {
    if (value % i === 0) return false
  }
  return true
}

const primeRule: BadgeRule = (memberNumber) => {
  if (memberNumber > 50 && memberNumber < 100000 && isPrime(memberNumber) && !EXACT_BADGES.has(memberNumber)) {
    return { emoji: '🔐', label: 'Prime Beacon' }
  }
  return null
}

const thousandsRule: BadgeRule = (memberNumber) => {
  if (memberNumber % 1000 === 0 && memberNumber > 0) {
    return { emoji: '🎊', label: `${memberNumber / 1000}K`, special: true }
  }
  return null
}

const centuriesRule: BadgeRule = (memberNumber) => {
  if (memberNumber % 100 === 0 && memberNumber > 100) {
    return { emoji: '💯', label: `${memberNumber / 100} Centuries` }
  }
  return null
}

const roundNumberRule: BadgeRule = (memberNumber) => {
  if (memberNumber % 500 === 0 && memberNumber > 0) {
    return { emoji: '🌟', label: 'Round Number' }
  }
  return null
}

const luckySevenRule: BadgeRule = (memberNumber) => {
  if (memberNumber % 777 === 0 && memberNumber !== 0) {
    return { emoji: '🍀', label: 'Super Lucky' }
  }
  return null
}

const luckyThirteenRule: BadgeRule = (memberNumber) => {
  if (memberNumber % 13 === 0 && memberNumber > 13 && memberNumber % 100 !== 0) {
    return { emoji: '🐱', label: 'Lucky 13' }
  }
  return null
}

const earlyMembershipRangeRules: BadgeRule = (memberNumber) => {
  if (memberNumber >= 11 && memberNumber <= 20) {
    return { emoji: '✨', label: 'Early Pioneer', color: 'text-blue-500' }
  }
  if (memberNumber >= 21 && memberNumber <= 50) {
    return { emoji: '🌱', label: 'Early Adopter', color: 'text-green-500' }
  }
  if (memberNumber >= 51 && memberNumber <= 99) {
    return { emoji: '🎯', label: 'First 100', color: 'text-indigo-500' }
  }
  return null
}

const DYNAMIC_BADGE_RULES: BadgeRule[] = [
  buddhistMultipleRule,
  contains108Rule,
  buddhistEightfoldRule,
  buddhistDigitalRootRule,
  aiDirectiveRule,
  palindromeRule,
  repeatingDigitRule,
  ascendingRule,
  descendingRule,
  powersOfTwoRule,
  fibonacciRule,
  perfectSquareRule,
  primeRule,
  thousandsRule,
  centuriesRule,
  roundNumberRule,
  luckySevenRule,
  luckyThirteenRule,
  earlyMembershipRangeRules,
]

export function getMemberBadge(memberNumber: number): MemberBadge {
  const exactMatch = EXACT_BADGES.get(memberNumber)
  if (exactMatch) {
    return exactMatch
  }

  for (const rule of DYNAMIC_BADGE_RULES) {
    const badge = rule(memberNumber)
    if (badge) {
      return badge
    }
  }

  return {}
}

export function formatMemberNumber(memberNumber: number): string {
  return `#${memberNumber.toLocaleString()}`
}
