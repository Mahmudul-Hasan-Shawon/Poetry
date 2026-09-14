import { getDb } from './index.js';
import { rumiWritings } from './rumi-data.js';

const db = getDb();

const authors = db.prepare('SELECT id, name FROM authors').all();
const authorMap = {};
for (const a of authors) authorMap[a.name] = a.id;

const categories = db.prepare('SELECT id, name FROM categories').all();
const catMap = {};
for (const c of categories) catMap[c.name] = c.id;

const writings = [
  {
    author: 'Rumi',
    text: `The wound is the place
where the Light enters you.`,
    type: 'quote', language: 'english', source: 'The Essential Rumi',
    categories: ['Spirituality', 'Hope'], featured: true, status: 'published',
  },
  {
    author: 'Rumi',
    text: `Out beyond ideas of wrongdoing
and rightdoing
there is a field.
I'll meet you there.`,
    type: 'poetry', language: 'english', source: 'The Essential Rumi',
    categories: ['Love', 'Spirituality'], featured: true, status: 'published',
  },
  {
    author: 'Rumi',
    text: `What you seek is seeking you.`,
    type: 'quote', language: 'english', source: 'The Essential Rumi',
    categories: ['Love', 'Spirituality'], featured: true, status: 'published',
  },
  {
    author: 'Rumi',
    text: `Don't grieve. Anything you lose comes round in another form.`,
    type: 'quote', language: 'english', source: 'The Essential Rumi',
    categories: ['Hope', 'Loss'], status: 'published',
  },
  {
    author: 'Rumi',
    text: `Let yourself be silently drawn
by the stronger pull
of what you really love.
It will not lead you astray.`,
    type: 'poetry', language: 'english', source: 'The Essential Rumi',
    categories: ['Love', 'Wisdom'], status: 'published',
  },
  {
    author: 'Mirza Ghalib',
    text: `Dil-e-nādān tujhe huā kyā hai,
Āḳhir is dard kī dawā kyā hai.`,
    type: 'ghazal', language: 'urdu', direction: 'ltr',
    english_translation: `O innocent heart, what has happened to you?
After all, what is the cure for this pain?`,
    source: 'Diwan-e-Ghalib',
    categories: ['Love', 'Sorrow'], featured: true, status: 'published', verification_status: 'verified',
  },
  {
    author: 'Mirza Ghalib',
    text: `Ishq par zor nahīn hai ye woh ātamish Gālib,
ki lagāe na lage aur bujhāe na bane.`,
    type: 'ghazal', language: 'urdu',
    english_translation: `Love cannot be forced, this is a fire, Ghalib,
that cannot be kindled or extinguished at will.`,
    source: 'Diwan-e-Ghalib',
    categories: ['Love', 'Desire'], status: 'published', verification_status: 'verified',
  },
  {
    author: 'Mirza Ghalib',
    text: `Hazaaron khwāhishein aisi ke har khwāhish pe dam nikle,
bahut nikle mere armān lekin phir bhī kam nikle.`,
    type: 'ghazal', language: 'urdu',
    english_translation: `A thousand desires, each worth dying for,
many of my wishes were fulfilled, yet still they seem few.`,
    source: 'Diwan-e-Ghalib',
    categories: ['Desire', 'Life'], featured: true, status: 'published', verification_status: 'verified',
  },
  {
    author: 'Rabindranath Tagore',
    text: `Where the mind is without fear
and the head is held high;
Where knowledge is free;
Where the world has not been broken up
into fragments by narrow domestic walls.`,
    type: 'poetry', language: 'english',
    source: 'Gitanjali',
    categories: ['Freedom', 'Humanity', 'Hope'], featured: true, status: 'published',
  },
  {
    author: 'Rabindranath Tagore',
    text: `I slept and dreamt that life was joy.
I awoke and saw that life was service.
I acted and behold, service was joy.`,
    type: 'quote', language: 'english',
    categories: ['Life', 'Wisdom'], status: 'published',
  },
  {
    author: 'Kazi Nazrul Islam',
    text: `বল বীর—
বল উন্নত মম শির!
শির নেহারি আমারি, নতশির ওই শিখর হিমাদ্রির!

বল বীর —
বল মহাবিশ্বের মহাকাশ ফাড়ি'
চন্দ্র সূর্য গ্রহ তারা ছাড়ি'
ভূলোক দ্যুলোক গোলক ভেদিয়া,
খোদার আসন 'আরশ' ছেদিয়া
উঠিয়াছি চির-বিস্ময় আমি বিশ্ব-বিধাত্রীর!
মম ললাটে রুদ্র-ভগবান জ্বলে রাজ-রাজটীকা দীপ্ত জয়শ্রীর!
বল বীর —
আমি চির-উন্নত শির!

আমি চিরদুর্দম, দুর্বিনীত, নৃশংস,
মহা-প্রলয়ের আমি নটরাজ, আমি সাইক্লোন, আমি ধ্বংস,
আমি মহাভয়, আমি অভিশাপ পৃথ্বীর!
আমি দুর্বার,
আমি ভেঙে করি সব চুরমার!
আমি অনিয়ম উচ্ছৃঙ্খল,
আমি দলে যাই যত বন্ধন, যত নিয়ম কানুন শৃংখল!
আমি মানি নাকো কোনো আইন,
আমি ভরা-তরী করি ভরা-ডুবি, আমি টর্পেডো, আমি ভীম, ভাসমান মাইন!
আমি ধূর্জটি, আমি এলোকেশে ঝড় অকাল-বৈশাখীর!
আমি বিদ্রোহী আমি বিদ্রোহী-সূত বিশ্ব-বিধাত্রীর!
বল বীর —
চির উন্নত মম শির!

আমি ঝঞ্ঝা, আমি ঘূর্ণী,
আমি পথ-সম্মুখে যাহা পাই যাই চূর্ণী!
আমি নৃত্য-পাগল ছন্দ,
আমি আপনার তালে নেচে যাই, আমি মুক্ত জীবনানন্দ।
আমি হাম্বীর, আমি ছায়ানট, আমি হিন্দোল,
আমি চল-চঞ্চল, ঠমকি' ছমকি'
পথে যেতে যেতে চকিতে চমকি'
ফিং দিয়া দিই তিন দোল্!
আমি চপলা-চপল হিন্দোল!

আমি তাই করি ভাই যখন চাহে এ মন যা',
করি শত্রুর সাথে গলাগলি, ধরি মৃত্যুর সাথে পাঞ্জা,
আমি উন্মাদ, আমি ঝঞ্ঝা!
আমি মহামারী, আমি ভীতি এ ধরিত্রীর।
আমি শাসন-ত্রাসন, সংহার আমি উষ্ণ চির-অধীর।
বল বীর —
আমি চির-উন্নত শির!

আমি চির-দুরন্ত-দুর্মদ,
আমি দুর্দম, মম প্রাণের পেয়ালা হর্দম্ হ্যায়্ হর্দম্ ভরপুর মদ।
আমি হোম-শিখা, আমি সাগ্নিক, জমদগ্নি,
আমি যজ্ঞ, আমি পুরোহিত, আমি অগ্নি!
আমি সৃষ্টি, আমি ধ্বংস, আমি লোকালয়, আমি শ্মশান,
আমি অবসান, নিশাবসান।
আমি ইন্দ্রাণি-সুত হাতে-চাঁদ ভালে সূর্য,
মম এক হাতে-বাঁকা বাঁশের বাঁশরি, আর হাতে রণ-তূর্য।
আমি কৃষ্ণ-কন্ঠ, মন্থন-বিষ পিয়া ব্যথা বারিধির।
আমি ব্যোমকেশ, ধরি বন্ধন-হারা ধারা গঙ্গোত্রীর।
বল বীর —
চির উন্নত মম শির।

আমি সন্ন্যাসী, সুর-সৈনিক
আমি যুবরাজ, মম রাজবেশ ম্লান গৈরিক!
আমি বেদুঈন, আমি চেঙ্গিস,
আমি আপনা ছাড়া করি না কাহারে কুর্নিশ!
আমি বজ্র, আমি ঈশান-বিষাণে ওঙ্কার,
আমি ইস্রাফিলের শিঙ্গার মহা-হুঙ্কার,
আমি পিনাক-পাণির ডমরু-ত্রিশূল, ধর্মরাজের দণ্ড,
আমি চক্র ও মহাশঙ্খ, আমি প্রণব-নাদ-প্রচণ্ড!
আমি খ্যাপা দুর্বাসা-বিশ্বামিত্র-শিষ্য,
আমি দাবানল-দাহ, দাহন করিব বিশ্ব!
আমি প্রাণ-খোলা-হাসি উল্লাস, —আমি সৃষ্টি-বৈরী মহাত্রাস,
আমি মহা-প্রলয়ের দ্বাদশ রবির রাহু-গ্রাস!
আমি কভু প্রশান্ত, — কভু অশান্ত দারুণ স্বেচ্ছাচারী,
আমি অরুণ খুনের তরুণ, আমি বিধির দর্প-হারী!
আমি প্রভঞ্জনের উচ্ছ্বাস, আমি বারিধির মহাকল্লোল,
আমি উজ্জ্বল আমি প্রোজ্জ্বল,
আমি উচ্ছল জল-ছল-ছল, চল-ঊর্মির হিন্দোল্ দোল্!

আমি বন্ধন-হারা কুমারীর বেণী, তন্বী-নয়নে বহ্নি,
আমি ষোড়শীর হৃদি-সরসিজ প্রেম-উদ্দাম, আমি ধন্যি।
আমি উন্মন মন উদাসীর,
আমি বিধবার বুকে ক্রন্দন-শ্বাস, হা-হুতাশ আমি হুতাশির!
আমি বঞ্চিত ব্যথা পথবাসী চির-গৃহহারা যত পথিকের,
আমি অবমানিতের মরম-বেদনা, বিষ-জ্বালা, প্রিয়-লাঞ্ছিত বুকে গতি ফের!
আমি অভিমানী চির-ক্ষুব্ধ হিয়ার কাতরতা, ব্যথা সুনিবিড়,
চিত- চুম্বন-চোর-কম্পন আমি থর-থর-থর প্রথম পরশ কুমারীর!

আমি গোপন প্রিয়ার চকিত চাহনি, ছল করে দেখা অনুখন,
আমি চপল মেয়ের ভালোবাসা, তা'র কাঁকন-চুড়ির কন্-কন্।
আমি চির-শিশু, চির-কিশোর,
আমি যৌবন-ভীতু পল্লীবালার আঁচর কাঁচলি নিচোর!
আমি উত্তর-বায়ু, মলয়-অনিল, উদাসী পূরবী হাওয়া,
আমি পথিক-কবির গভীর রাগিণী, বেণু-বীণে গান গাওয়া!
আমি আকুল নিদাঘ-তিয়াসা, আমি রৌদ্র- রুদ্র রবি,
আমি মরু-নির্ঝর ঝর-ঝর, আমি শ্যামলিমা ছায়া-ছবি! -
আমি তুরীয়ানন্দে ছুটে চলি এ কি উন্মাদ, আমি উন্মাদ!
আমি সহসা আমারে চিনেছি, আমার খুলিয়া গিয়াছে সব বাঁধ!

আমি উত্থান, আমি পতন, আমি অচেতন-চিতে চেতন,
আমি বিশ্ব-তোরণে বৈজয়ন্তী, মানব-বিজয়-কেতন!
ছুটি ঝড়ের মতন করতালি দিয়া
স্বর্গ-মর্ত-করতলে,
তাজি বোরবাক্ আর উচ্চৈঃশ্রবা বাহন আমার
হিম্মৎ-হ্রেষা হেঁকে চলে!

আমি বসুধা-বক্ষে আগ্নেয়াদ্রি, বাড়ব-বহ্নি, কালানল,
আমি পাতালে মাতাল অগ্নি-পাথর-কলরোল-কল-কোলাহল!
আমি তড়িতে চড়িয়া উড়ে চলি জোর তুড়ি দিয়া, দিয়া লম্ফ,
আমি ত্রাস সঞ্চারি ভুবনে সহসা সঞ্চরি ভূমি-কম্প!
ধরি বাসুকির ফনা জাপটি,
ধরি স্বর্গীয় দূত জিব্রাইলের আগুনের পাখা সাপটি!
আমি দেব-শিশু, আমি চঞ্চল,
আমি ধৃষ্ট, আমি দাঁত দিয়া ছিঁড়ি বিশ্ব-মায়ের অঞ্চল!

আমি অর্ফিয়াসের বাঁশরি,
মহা-সিন্ধু উতলা ঘুম্-ঘুম্
ঘুম্ চুমু দিয়ে করে নিখিল বিশ্বে নিঝ্ঝুম্
মম বাঁশরির তানে পাশরি'
আমি শ্যামের হাতের বাঁশরি।
আমি রুষে উঠে' যবে ছুটি মহাকাশ ছাপিয়া,
ভয়ে সপ্ত নরক হারিয়া দোজখ নিভে নিভে যায় কাঁপিয়া!
আমি বিদ্রোহ-বাহী নিখিল অখিল ব্যাপিয়া!

আমি শ্রাবণ-প্লাবন- বন্যা,
কভু ধরণীরে করি বরণিয়া, কভু বিপুল ধ্বংস-ধন্যা -
আমি ছিনিয়া আনিব বিষ্ণু-বক্ষ হইতে যুগল কন্যা!
আমি অন্যায়, আমি উল্কা, আমি শনি,
আমি ধূমকেতু-জ্বালা, বিষধর কাল-ফণি!
আমি ছিন্নমস্তা চণ্ডি, আমি রণদা সর্বনাশী,
আমি জাহান্নামের আগুনে বসিয়া হাসি পুষ্পের হাসি!

আমি মৃণ্ময়, আমি চিন্ময়,
আমি অজর অমর অক্ষয়, আমি অব্যয়!
আমি মানব দানব দেবতার ভয়,
বিশ্বের আমি চির দুর্জয়,
জগদীশ্বর-ঈশ্বর আমি পুরুষোত্তম সত্য,
আমি তাথিয়া তাথিয়া মথিয়া ফিরি এ স্বর্গ-পাতাল-মর্ত!
আমি উন্মাদ, আমি উন্মাদ!!
আমি চিনেছি আমারে, আজিকে আমার খুলিয়া গিয়াছে সব বাঁধ!!

আমি পরশুরামের কঠোর কুঠার,
নিঃক্ষত্রিয় করিব বিশ্ব, আনিব শান্তি শান্ত উদার!
আমি হল বলরাম-স্কন্ধে,
আমি উপাড়ি' ফেলিব অধীন বিশ্ব অবহেলে নব-সৃষ্টির মহানন্দে।

মহা-বিদ্রোহী রণ-ক্লান্ত
আমি সেই দিন হব শান্ত,
যবে উৎপীড়িতের ক্রন্দন-রোল, আকাশে বাতাসে ধ্বনিবে না,
অত্যাচারীর খড়গ কৃপাণ ভীম রণ-ভূমে রণিবে না-বিদ্রোহী রণ-ক্লান্ত
আমি সেই দিন হব শান্ত!
আমি বিদ্রোহী ভৃগু, ভগবান বুকে এঁকে দিই পদ-চিহ্ন,
আমি স্রষ্টা-সূদন, শোক-তাপ-হানা খেয়ালি বিধির বক্ষ করিব-ভিন্ন!
আমি বিদ্রোহী ভৃগু, ভগবান বুকে এঁকে দেবো পদ-চিহ্ন!
আমি খেয়ালী বিধির বক্ষ করিব ভিন্ন!
আমি চির-বিদ্রোহী বীর -
আমি বিশ্ব ছাড়ায়ে উঠিয়াছি একা চির-উন্নত শির!`,
    type: 'poetry', language: 'bangla',
    english_translation: `Proclaim, brave one—
proclaim my head held high!
Seeing my head, that Himalayan summit bows low.`,
    source: 'বিদ্রোহী (The Rebel)',
    categories: ['Courage', 'Humanity'], status: 'published', verification_status: 'verified',
  },
  {
    author: 'Kazi Nazrul Islam',
    text: `মূর্খরা সব শোনো, মানুষ এনেছে গ্রন্থ';
গ্রন্থ' আনেনি মানুষ কোনো।
আদম দাউদ ঈসা মুসা ইব্রাহিম মোহাম্মাদ কৃষ্ণ বুদ্ধ নানক কবীর,—
বিশ্বের সম্পদ, আমাদেরি এঁরা পিতা-পিতামহ,
এই আমাদের মাঝে তাঁদেরি রক্ত কম-বেশী ক'রে প্রতি ধমনীতে রাজে!
আমরা তাঁদেরি সন্তান, জ্ঞাতি, তাঁদেরি মতন দেহ,
কে জানে কখন মোরাও অমনি হয়ে যেতে পারি কেহ।
হেসো না বন্ধু! আমার আমি সে কত অতল অসীম,
আমিই কি জানি—কে জানে কে আছে আমাতে মহামহিম।
হয়ত আমাতে আসিছে কল্কি, তোমাতে মেহেদী ঈসা,
কে জানে কাহার অন্-ও আদি, কে পায় কাহার দিশা?
কাহারে করিছ ঘৃণা তুমি ভাই, কাহারে মারিছ লাথি?
হয়ত উহারই বুকে ভগবান জাগিছেন দিবা-রাতি!
অথবা হয়ত কিছুই নহে সে, মহান্ উঁচু নহে,
আছে ক্লেদাক্ত ক্ষত-বিক্ষত পড়িয়া দুঃখ-দহে,
তবু জগতের যত পবিত্র গ্রন্থ ভজনালয়
ঐ একখানি ক্ষুদ্র দেহের সম পবিত্র নয়।
হয়ত ইহারি ঔরসে ভাই, ইহারই কুটীর-বাসে
জন্মিছে কেহ—জোড়া নাই যার জগতের ইতিহাসে!
যে বাণী আজিও শোনেনি জগৎ, যে মহাশক্তি-
ধরে আজিও বিশ্ব দেখনি,—হয়ত আসিছে সে এরই ঘরে!
ও কে? চণ্ডাল? চমকাও কেন? নহে ও ঘৃণ্য জীব!
ওই হ'তে পারে হরিশচন্দ্র, ওই শ্মশানের শিব।
আজ চণ্ডাল, কাল হ'তে পারে মহাযোগী-সম্রাট,
তুমি কাল তারে অর্ঘ্য দানিবে, করিবে নান্দী-পাঠ।
রাখাল বলিয়া কারে করো হেলা, ও-হেলা কাহারে বাজে!
হয়ত গোপনে ব্রজের গোপাল এসেছে রাখাল সাজে!
চাষা ব'লে কর ঘৃণা! দে'খো চাষা-রূপে লুকায়ে
জনক-বলরাম এলো কি না!
যত নবী ছিল মেষের রাখাল, তারাও ধরিল হাল,
তারাই আনিল অমর বাণী—যা আছে র'বে চিরকাল।
দ্বারে গালি খেয়ে ফিরে যায় নিতি ভিখারী ও ভিখারিনী,
তারি মাঝে কবে এলো ভোলা-নাথ-গিরিজায়া, তা কি চিনি!
তোমার ভোগের হ্রাস হয় পাছে ভিক্ষা-মুষ্টি দিলে,
দ্বারী দিয়ে তাই মার দিয়ে তুমি দেবতারে খেদাইলে।
সে মার রহিল জমা—কে জানে তোমায় লাঞ্ছিতা দেবী করিয়াছে কিনা ক্ষমা!
বন্ধু, তোমার বুক-ভরা লোভ, দু'চোখে স্বার্থ-ঠুলি,
নতুবা দেখিতে, তোমারে সেবিতে দেবতা হ'য়েছে কুলি।
মানুষের বুকে যেটুকু দেবতা, বেদনা-মথিত সুধা,
তাই লুটে তুমি খাবে পশু? তুমি তা দিয়ে মিটাবে ক্ষুধা?
তোমার ক্ষুধার আহার তোমার মন্দোদরীই জানে,
তোমার মৃত্যু-বাণ আছে তব প্রাসাদের কোন্'খানে!
তোমারি কামনা-রাণী যুগে যুগে পশু,
ফেলেছে তোমায় মৃত্যু-বিবরে টানি'।

গাহি সাম্যের গান—
যেখানে আসিয়া এক হয়ে গেছে সব বাধা-ব্যবধান,
যেখানে মিশেছে হিন্দু-বৌদ্ধ-মুসলিম-খ্রীষ্টান।
গাহি সাম্যের গান!

কে তুমি?—পার্সী? জৈন? ইহুদী? সাঁওতাল, ভীল, গারো?
কনফুসিয়াস? চার্বাক-চেলা? ব'লে যাও, বলো আরো!
বন্ধু, যা-খুশি হও,
পেটে পিঠে কাঁধে মগজে যা-খুশি পুঁথি ও কেতাব বও,
কোরান-পুরাণ-বেদ-বেদান্ত-বাইবেল-ত্রিপিটক-
জেন্দাবেস্তা-গ্রন্থসাহেব প'ড়ে যাও যত সখ,—
কিন্তু, কেন এ পণ্ডশ্রম, মগজে হানিছ শূল?
দোকানে কেন এ দর-কষাকষি?—পথে ফুটে তাজা ফুল!
তোমাতে রয়েছে সকল কেতাব, সকল কালের জ্ঞান,
সকল শাস্ত্র খুঁজে পাবে সখা, খুলে' দেখ নিজ প্রাণ!
তোমাতে রয়েছে সকল ধর্ম, সকল যুগাবতার,
তোমার হৃদয় বিশ্ব-দেউল, সকল দেবতার।
কেন খুঁজে ফের দেবতা-ঠাকুর মৃত পুঁথি-কঙ্কালে?
হাসিছেন তিনি অমৃত-হিয়ার নিভৃত অন্তরালে!

বন্ধু, বলিনি ঝুট,
এইখানে এসে লুটাইয়া পড়ে সকল রাজমুকুট!
এই হৃদয়ই সে নীলাচল, কাশী, মথুরা, বৃন্দাবন,
বুদ্ধ-গয়া এ, জেরুজালেম এ, মদিনা, কাবা-ভবন,
মসজিদ এই, মন্দির এই, গির্জা এই হৃদয়,
এইখানে ব'সে ঈসা-মুসা পেল সত্যের পরিচয়।
এই রণ-ভূমে বাঁশীর কিশোর গাহিলেন মহা-গীতা,
এই মাঠে হ'ল মেষের রাখাল নবীরা খোদার মিতা।
এই হৃদয়ের ধ্যান-গুহা-মাঝে বসিয়া শাক্যমুনি
ত্যজিল রাজ্য, মানবের মহা-বেদনার ডাক শুনি'।
এই কন্দরে আরব-দুলাল শুনিতেন আহ্বান,
এইখানে বসি' গাহিলেন তিনি কোরানের সাম-গান!
মিথ্যা শুনিনি ভাই,
এই হৃদয়ের চেয়ে বড় কোনো মন্দির-কাবা নাই।`,
    type: 'poetry', language: 'bangla',
    english_translation: `I sing the song of equality—
Where all barriers have melted into one,
Where Hindu, Buddhist, Muslim, and Christian are united.`,
    source: 'সাম্যবাদী (The Equalizer)',
    categories: ['Humanity', 'Peace', 'Faith'], status: 'published', verification_status: 'verified',
  },
  {
    author: 'Kazi Nazrul Islam',
    text: `চল্ চল্ চল্
ঊর্ধ্ব গগনে বাজে মাদল,
নিম্নে উতলা ধরণী-তল,
অরুণ প্রাতের তরুণ দল
চল্ রে চল্ রে চল্।
চল্ চল্ চল্।।

ঊষার দুয়ারে হানি' আঘাত
আমরা আনিব রাঙা প্রভাত,
আমরা টুটাব তিমির রাত,
বাধার বিন্ধ্যাচল।

নব নবীনের গাহিয়া গান
সজীব করিব মহাশ্মশান,
আমরা দানিব নূতন প্রাণ,
বাহুতে নবীন বল।

চল্ রে নও-জোয়ান,
শোন্ রে পাতিয়া কান—
মৃত্যু-তোরণ-দুয়ারে-দুয়ারে
জীবনের আহ্বান।

ভাঙ্ রে ভাঙ্ আগল,
চল্ রে চল্ রে চল্।
চল্ চল্ চল্।।

ঊর্ধ্বে আদেশ হানিছে বাজ,
শহীদী-ঈদের সেনারা সাজ,
দিকে দিকে চলে কুচ-কাওয়াজ—
খোল্ রে নিদ-মহল!

কবে সে খেয়ালি বাদশাহী,
সেই সে অতীতে আজো চাহি'
যাস্ মুসাফির গান গাহি'
ফেলিস অশ্রুজল।

যাক্ রে তখত-তাউস,
জাগ রে জাগ বেহুঁশ!
ডুবিল রে দেখ কত পারস্য,
কত রোম, গ্রীক্, রুশ!

জাগিল তা'রা সকল,
জেগে ওঠ্ হীনবল!
আমরা গড়িব নূতন করিয়া
ধূলায় তাজমহল!
চল্ চল্ চল্।।`,
    type: 'poetry', language: 'bangla',
    english_translation: `March on, march on, march on!
The drums resound in the heavens above,
Below, the restless earth—
the youthful band of the crimson dawn,
march on, march on, march on!`,
    source: 'চল্ চল্ চল্ (March On)',
    categories: ['Courage', 'Hope'], status: 'published', verification_status: 'verified',
  },
  {
    author: 'Hafiz',
    text: `Stay close to anything
that makes you glad
you are alive.`,
    type: 'quote', language: 'english',
    source: 'The Gift',
    categories: ['Life', 'Hope', 'Beauty'], status: 'published',
  },
  {
    author: 'Hafiz',
    text: `The small man builds cages
for everyone he knows,
while the sage, who has to duck his head
when the moon is low,
keeps dropping keys all night long
for the beautiful rowdy prisoners.`,
    type: 'poetry', language: 'english',
    source: 'The Gift',
    categories: ['Wisdom', 'Freedom'], featured: true, status: 'published',
  },
  {
    author: 'Saadi',
    text: `Human beings are members of a whole,
in creation of one essence and soul.
If one member is afflicted with pain,
other members uneasy will remain.
If you have no sympathy for human pain,
the name of human you cannot retain.`,
    type: 'poetry', language: 'english',
    source: 'Gulistan',
    categories: ['Humanity', 'Friendship'], featured: true, status: 'published', verification_status: 'verified',
  },
  {
    author: 'Omar Khayyam',
    text: `A book of verses underneath the bough,
a jug of wine, a loaf of bread—and thou
beside me singing in the wilderness—
oh, wilderness were paradise enow!`,
    type: 'verse', language: 'english',
    source: 'Rubáiyát of Omar Khayyám',
    categories: ['Life', 'Nature', 'Peace'], status: 'published', verification_status: 'verified',
  },
  {
    author: 'Omar Khayyam',
    text: `The moving finger writes; and, having writ,
moves on: nor all thy piety nor wit
shall lure it back to cancel half a line,
nor all thy tears wash out a word of it.`,
    type: 'verse', language: 'english',
    source: 'Rubáiyát of Omar Khayyám',
    categories: ['Time', 'Wisdom', 'Life'], featured: true, status: 'published', verification_status: 'verified',
  },
  {
    author: 'William Shakespeare',
    text: `All the world's a stage,
and all the men and women merely players;
they have their exits and their entrances,
and one man in his time plays many parts.`,
    type: 'verse', language: 'english',
    source: 'As You Like It',
    categories: ['Life', 'Time', 'Wisdom'], status: 'published', verification_status: 'verified',
  },
  {
    author: 'William Shakespeare',
    text: `To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
the slings and arrows of outrageous fortune,
or to take arms against a sea of troubles,
and by opposing end them.`,
    type: 'verse', language: 'english',
    source: 'Hamlet',
    categories: ['Life', 'Courage', 'Wisdom'], status: 'published', verification_status: 'verified',
  },
  {
    author: 'Pablo Neruda',
    text: `I want to do with you what spring does
with the cherry trees.`,
    type: 'poetry', language: 'english',
    source: 'Every Day You Play',
    categories: ['Love', 'Desire', 'Nature'], status: 'published',
  },
  {
    author: 'Pablo Neruda',
    text: `Love is so short, forgetting is so long.`,
    type: 'quote', language: 'english',
    source: 'Poetry',
    categories: ['Love', 'Sorrow', 'Loss'], featured: true, status: 'published',
  },
  {
    author: 'Khalil Gibran',
    text: `Your children are not your children.
They are the sons and daughters
of Life's longing for itself.
They come through you but not from you,
and though they are with you yet they belong not to you.`,
    type: 'poetry', language: 'english',
    source: 'The Prophet',
    categories: ['Life', 'Wisdom', 'Love'], featured: true, status: 'published',
  },
  {
    author: 'Khalil Gibran',
    text: `The tenderness of sorrow
is not heavier
than the joy of letting go.`,
    type: 'quote', language: 'english',
    source: 'Sand and Foam',
    categories: ['Sorrow', 'Wisdom', 'Loss'],
    status: 'published',
  },
  {
    author: 'Khalil Gibran',
    text: `Love knows not its own depth
until the hour of separation.`,
    type: 'quote', language: 'english',
    source: 'Sand and Foam',
    categories: ['Love', 'Sorrow'], status: 'published',
  },
  {
    author: 'Rumi',
    text: `Silence is the language of God,
all else is poor translation.`,
    type: 'quote', language: 'english',
    categories: ['Spirituality', 'Wisdom'], status: 'published',
  },
  {
    author: 'Rumi',
    text: `You are not a drop in the ocean.
You are the entire ocean in a drop.`,
    type: 'quote', language: 'english',
    source: 'The Essential Rumi',
    categories: ['Wisdom', 'Spirituality'], featured: true, status: 'published',
  },
  {
    author: 'Rumi',
    text: `Yesterday I was clever,
so I wanted to change the world.
Today I am wise,
so I am changing myself.`,
    type: 'quote', language: 'english',
    categories: ['Wisdom', 'Life'], status: 'published',
  },
  {
    author: 'Rabindranath Tagore',
    text: `If you cry because the sun has gone out of your life,
your tears will prevent you from seeing the stars.`,
    type: 'quote', language: 'english',
    categories: ['Hope', 'Wisdom'], status: 'published',
  },
  {
    author: 'Hafiz',
    text: `Even after all this time,
the Sun never says to the Earth,
"You owe me."
Look what happens
with a love like that.
It lights
the whole sky.`,
    type: 'poetry', language: 'english',
    source: 'The Sun Never Says',
    categories: ['Love', 'Spirituality', 'Nature'], featured: true, status: 'published',
  },
  {
    author: 'Saadi',
    text: `Whatever makes an impression on the heart
and lovely is suitable for a person.
Beauty is a gift of God.`,
    type: 'quote', language: 'english',
    source: 'Gulistan',
    categories: ['Beauty', 'Spirituality'], status: 'published',
  },
  {
    author: 'Khalil Gibran',
    text: `Work is love made visible.
And if you cannot work with love but only with distaste,
it is better that you should leave your work
and sit at the gate of the temple
and take alms of those who work with joy.`,
    type: 'quote', language: 'english',
    source: 'The Prophet',
    categories: ['Life', 'Wisdom'], status: 'published',
  },
  {
    author: 'Mirza Ghalib',
    text: `Koi ummeed bar nahīn ātī,
koi sūrat nazar nahīn ātī.`,
    type: 'ghazal', language: 'urdu',
    english_translation: `No hope seems to be fulfilled,
no solution seems to be in sight.`,
    source: 'Diwan-e-Ghalib',
    categories: ['Sorrow', 'Loneliness'], status: 'published', verification_status: 'verified',
  },
  {
    author: 'Pablo Neruda',
    text: `I can write the saddest lines tonight.
Write, for example, "The night is starry
and the stars are blue and shiver in the distance."
The night wind revolves in the sky and sings.`,
    type: 'poetry', language: 'english',
    source: 'Twenty Love Poems and a Song of Despair',
    categories: ['Sorrow', 'Nature', 'Love'], status: 'published',
  },
  {
    author: 'Omar Khayyam',
    text: `Myself when young did eagerly frequent
doctor and saint, and heard great argument
about it and about: but evermore
came out by the same door as in I went.`,
    type: 'verse', language: 'english',
    source: 'Rubáiyát of Omar Khayyám',
    categories: ['Wisdom', 'Life'], status: 'published', verification_status: 'verified',
  },

  ...rumiWritings,
];

const insertWriting = db.prepare(`
  INSERT INTO writings (author_id, title, slug, text, original_text, english_translation, bangla_translation, urdu_translation,
    type, language, direction, source, status, featured, verification_status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertCat = db.prepare('INSERT OR IGNORE INTO writing_categories (writing_id, category_id) VALUES (?, ?)');

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')
    .substring(0, 200);
}

function generateSlug(db, baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = db.prepare('SELECT id FROM writings WHERE slug = ?').get(slug);
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

const insertAll = db.transaction((items) => {
  let count = 0;
  for (const w of items) {
    const authorId = authorMap[w.author] || null;
    const slug = generateSlug(db, slugify(w.text.substring(0, 80)));

    const result = insertWriting.run(
      authorId,
      w.title || null,
      slug,
      w.text,
      w.original_text || null,
      w.english_translation || null,
      w.bangla_translation || null,
      w.urdu_translation || null,
      w.type || 'quote',
      w.language || 'english',
      w.direction || 'ltr',
      w.source || null,
      w.status || 'draft',
      w.featured ? 1 : 0,
      w.verification_status || 'attributed'
    );

    if (w.categories) {
      for (const catName of w.categories) {
        const catId = catMap[catName];
        if (catId) insertCat.run(result.lastInsertRowid, catId);
      }
    }
    count++;
  }
  return count;
});

const count = insertAll(writings);
console.log(`Seeded ${count} writings`);

// Set a daily word
const dailyWriting = db.prepare("SELECT id FROM writings WHERE status = 'published' ORDER BY RANDOM() LIMIT 1").get();
if (dailyWriting) {
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT OR REPLACE INTO daily_words (writing_id, date) VALUES (?, ?)').run(dailyWriting.id, today);
  console.log('Daily word set');
}

// Make a couple featured
db.prepare("UPDATE writings SET featured = 1 WHERE id IN (SELECT id FROM writings WHERE status = 'published' ORDER BY RANDOM() LIMIT 5)").run();

console.log('Database seeded successfully!');
process.exit(0);
