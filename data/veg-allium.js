/* =========================================================
   ネギ類（ヒガンバナ科）・多年草・ハーブ
   「一度植えたら長く穫れる」省力・高コスパ枠
   ========================================================= */

VEG_DB.push(

/* ---------------- タマネギ ---------------- */
{
  id: 'onion', name: 'タマネギ', kana: 'たまねぎ', family: 'ヒガンバナ科', emoji: '🧅',
  category: 'ネギ類',
  difficulty: 2, beginner: 4, cost: 5, freshness: 3, speed: 1,
  place: ['plot'], sun: 'full',
  depth: 20,
  spacing: { plant: 12, row: 20 },
  perM2: 40,
  stdQty: 40,   // 2人家族の目安株数
  summary: '11月に苗を植えて6月に収穫。冬の間ほぼ放置でよく、保存も効くので食費への貢献が最大級。',
  whyGood: '1束50本300〜500円の苗が、50個のタマネギ（市場価格2500円以上）になります。植えてから半年以上放置でき、収穫後も3〜6ヶ月保存可能。「畑を冬に遊ばせない」戦略の中心。',
  plans: [
    {
      id: 'autumn-seedling', label: '秋・苗から【最推奨】', start: 'seedling', difficulty: 2,
      note: '11月上旬〜中旬に苗を植える。植え時が1〜2週間ずれるだけで結果が変わります。',
      steps: [
        { kind: 'plant', label: '苗の植付け（浅植え）', from: [11, 1], to: [11, 3] },
        { kind: 'grow', label: '越冬（草取りのみ）', from: [12, 1], to: [1, 3] },
        { kind: 'grow', label: '追肥（2月・3月上旬の2回）', from: [2, 1], to: [3, 1] },
        { kind: 'harvest', label: '収穫（葉が倒れたら）', from: [5, 3], to: [6, 2] },
        { kind: 'store', label: '吊るして貯蔵（3〜6ヶ月）', from: [6, 1], to: [12, 1] }
      ],
      days: 210
    },
    {
      id: 'autumn-seed', label: '秋・種から', start: 'seed', difficulty: 4,
      note: '9月中旬に苗床にまき、11月に定植。苗作りが難しく、初年度は苗を買うのが圧倒的に有利。',
      steps: [
        { kind: 'sow', label: '苗床に種まき', from: [9, 2], to: [9, 3] },
        { kind: 'nursery', label: '育苗（50〜55日・鉛筆の太さに）', from: [9, 3], to: [11, 2] },
        { kind: 'plant', label: '定植', from: [11, 1], to: [11, 3] },
        { kind: 'grow', label: '越冬・追肥', from: [12, 1], to: [3, 1] },
        { kind: 'harvest', label: '収穫', from: [5, 3], to: [6, 2] }
      ],
      days: 260
    }
  ],
  yieldNote: '1株1個。1m²で30〜40個',
  marketValue: 2000, valueUnit: '1m²あたり',
  water: '植付け直後としっかり。以降は基本的に雨まかせ。',
  fert: '【重要】追肥は2月と3月上旬の2回まで。3月下旬以降の追肥は「とう立ち」と「貯蔵性低下」を招きます。',
  keys: [
    '【苗選び】太さ7〜8mm（鉛筆くらい）が最適。太すぎる苗はとう立ち、細すぎる苗は冬に枯れます',
    '植え付けは浅く。白い部分が2〜3cm埋まる程度で、根元がぐらつかない深さ',
    '株間12cm、条間20cm。密植すると小玉になります',
    '3月下旬以降は絶対に追肥しない（ここを守るかどうかで貯蔵性が決まります）',
    '葉が8割倒れたら収穫。晴天の日に抜いて2〜3日畑で干し、葉を編んで軒下に吊るす',
    '早生・中生・晩生を混ぜて植えると、収穫と消費のペースが合います'
  ],
  troubles: [
    { name: 'とう立ち（花芽が立つ）', sign: '茎の途中に硬い芯', cause: '苗が太すぎた／植え付けが早すぎた', fix: '適正サイズの苗を11月に植える。とう立ち株は貯蔵せず早めに食べ切る。' },
    { name: '玉が小さい', sign: '小玉ばかり', cause: '植え付けが遅い／密植／追肥不足', fix: '11月中旬までに植え、株間を確保し、2〜3月に追肥。' },
    { name: '冬に枯れる', sign: '苗が消える', cause: '苗が細すぎた・深植え', fix: '7〜8mmの苗を浅植えで。' }
  ],
  companions: [],
  tip: '「11月にタマネギを植える」は家庭菜園の年間計画の背骨です。9月に始めるなら、11月の苗の予約・購入を今からカレンダーに入れておいてください。'
},

/* ---------------- ニンニク ---------------- */
{
  id: 'garlic', name: 'ニンニク', kana: 'にんにく', family: 'ヒガンバナ科', emoji: '🧄',
  category: 'ネギ類',
  difficulty: 1, beginner: 5, cost: 5, freshness: 4, speed: 1,
  place: ['plot'], sun: 'full',
  depth: 25,
  spacing: { plant: 15, row: 20 },
  perM2: 30,
  stdQty: 20,   // 2人家族の目安株数
  summary: '9〜10月に植えて6月に収穫。8ヶ月間ほぼ何もしないのに、国産ニンニクは1個300円以上。',
  whyGood: '病害虫がほぼつかず、水やりもほぼ不要。「植えて忘れる」だけで高価な国産ニンニクが穫れる、投資対効果の最高峰。おまけに4月には「ニンニクの芽」も穫れます。',
  plans: [
    {
      id: 'autumn-bulb', label: '秋・鱗片から【唯一のルート】', start: 'bulb', difficulty: 1,
      note: '9月下旬〜10月中旬の植付けが適期。内陸なら10月上旬が安心。寒地系（ホワイト六片）より暖地系品種が合います。',
      steps: [
        { kind: 'plant', label: '鱗片を1片ずつ植える', from: [9, 3], to: [10, 3] },
        { kind: 'grow', label: '越冬（草取りのみ）', from: [11, 1], to: [1, 3] },
        { kind: 'grow', label: '追肥（2月・3月）', from: [2, 1], to: [3, 2] },
        { kind: 'harvest', label: 'ニンニクの芽（花茎）を収穫', from: [4, 2], to: [5, 1] },
        { kind: 'harvest', label: '球の収穫（葉の半分が枯れたら）', from: [5, 3], to: [6, 2] },
        { kind: 'store', label: '吊るして乾燥・貯蔵', from: [6, 1], to: [12, 3] }
      ],
      days: 240
    }
  ],
  yieldNote: '1片から1個（6片球）。1m²で25〜30個',
  marketValue: 5000, valueUnit: '1m²あたり（国産1個200〜300円）',
  water: 'ほぼ不要。雨まかせで育ちます。',
  fert: '2月・3月の追肥2回。それ以降は不要。',
  keys: [
    '種球（ネット入りの栽培用）を買い、1片ずつばらして「とがった方を上」に、深さ5cm程度で植える',
    '暖地では「平戸」「上海早生」など暖地系品種を。ホワイト六片（寒地系）は中間地〜暖地では小さくなりがち',
    '春に芽が2本出たら、細い方を抜く（分球して小さくなるのを防ぐ）',
    '4月頃に伸びる花茎（ニンニクの芽）は摘み取る。放置すると球が太りません。摘んだ芽は炒め物に',
    '葉の1/3〜1/2が黄色くなったら収穫。晴天が続いた日に抜き、風通しの良い日陰で吊るして乾燥',
    '収穫が遅れると球がバラけて保存が効かなくなります'
  ],
  troubles: [
    { name: '球が小さい・分球しない', sign: '玉ねぎのような1つ玉', cause: '植え付けが遅い／肥料不足', fix: '10月中旬までに植え、春に追肥。' },
    { name: '葉が黄色く枯れる（春先）', sign: 'さび病（オレンジの斑点）', cause: '多湿・密植', fix: '風通しを確保。ひどい葉は除去。収穫は可能。' }
  ],
  companions: ['イチゴ', 'トマト（病害虫よけ）'],
  tip: '「手間ゼロで金額効率が最高」の作物。畝の端、日当たりの良い一角を10月から6月まで丸ごと任せる価値があります。'
},

/* ---------------- 九条ネギ ---------------- */
{
  id: 'negi', name: '九条ネギ（葉ネギ）', kana: 'くじょうねぎ', family: 'ヒガンバナ科', emoji: '🌱',
  category: 'ネギ類',
  difficulty: 1, beginner: 5, cost: 4, freshness: 4, speed: 4,
  place: ['plot'], sun: 'full',
  depth: 20,
  spacing: { plant: 5, row: 15 },
  perM2: 100,
  stdQty: 20,   // 2人家族の目安株数
  summary: '関西の食卓に欠かせない葉ネギ。刈り取ればまた伸びる「無限ネギ」。薬味を買う必要がなくなります。',
  whyGood: '一度植えれば刈り取りと株分けで何年も続きます。薬味は少量ずつ必要になるものなので、買うと余らせがち。畝の端に少しあるだけで生活が変わる実用性。',
  plans: [
    {
      id: 'spring-seedling', label: '春・苗から【最推奨】', start: 'seedling', difficulty: 1,
      note: '苗（束売り）を3〜4月に植える。すぐに使い始められます。',
      steps: [
        { kind: 'plant', label: '苗の植付け（3〜4本ずつ束で）', from: [3, 1], to: [5, 1] },
        { kind: 'grow', label: '追肥・土寄せ', from: [4, 1], to: [11, 3] },
        { kind: 'harvest', label: '刈り取り収穫（何度でも）', from: [5, 1], to: [12, 3] }
      ],
      days: 60
    },
    {
      id: 'autumn-seedling', label: '秋・苗から', start: 'seedling', difficulty: 1,
      note: '9〜10月植えでも可。冬は生育が止まりますが春から一気に伸びます。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [9, 1], to: [10, 3] },
        { kind: 'grow', label: '追肥', from: [10, 1], to: [4, 3] },
        { kind: 'harvest', label: '刈り取り収穫', from: [11, 1], to: [6, 3] }
      ],
      days: 60
    },
    {
      id: 'regrow', label: '再生栽培（スーパーの根元から）', start: 'root', difficulty: 1,
      note: '買ってきたネギの根元5cmを植えるだけ。ほぼ無料で始められる、最初の一歩に最適。',
      steps: [
        { kind: 'plant', label: '根元5cmを土に植える', from: [3, 1], to: [11, 1] },
        { kind: 'grow', label: '生育', from: [3, 2], to: [12, 1] },
        { kind: 'harvest', label: '刈り取り（3週間ごと）', from: [4, 1], to: [12, 3] }
      ],
      days: 25
    },
    {
      id: 'seed', label: '種から', start: 'seed', difficulty: 2,
      note: '3〜4月または9月まき。時間はかかりますが1袋で大量に作れます。',
      steps: [
        { kind: 'sow', label: '種まき', from: [3, 1], to: [4, 3] },
        { kind: 'nursery', label: '育苗（60日）', from: [4, 1], to: [6, 3] },
        { kind: 'plant', label: '定植', from: [6, 1], to: [7, 2] },
        { kind: 'harvest', label: '収穫', from: [8, 1], to: [12, 3] }
      ],
      days: 150
    }
  ],
  yieldNote: '1m²あたり年間を通じて薬味を自給（刈り取り年5〜6回）',
  marketValue: 6000, valueUnit: '1m²・年間あたり',
  water: '普通。過湿は嫌います。',
  fert: '刈り取るたびに液肥か化成肥料を少量。',
  keys: [
    '株元3〜5cmを残して刈り取ると、3週間ほどでまた伸びます。これを繰り返す',
    '年に1回（春か秋）、掘り上げて株を分けて植え直すと若返ります',
    '土寄せをすると白い部分が長くなります',
    '真夏は生育が鈍り、葉先が枯れることがありますが、涼しくなれば復活します'
  ],
  troubles: [
    { name: '葉先が枯れる', sign: '茶色く先枯れ', cause: '夏の高温・肥料切れ', fix: '一度地際で刈り込んで追肥すると再生します。' },
    { name: '葉に白い筋・小さな虫', sign: 'ネギアザミウマ', cause: '乾燥した時期', fix: '刈り取って新しい葉を出させる。' }
  ],
  companions: ['トマト', 'キュウリ', 'ホウレンソウ（病害を抑える）'],
  tip: 'スーパーで買ったネギの根元を捨てずに植える「再生栽培」は、9月の今日からでも無料で始められます。まずここから。'
},

/* ---------------- ニラ ---------------- */
{
  id: 'nira', name: 'ニラ', kana: 'にら', family: 'ヒガンバナ科', emoji: '🌿',
  category: 'ネギ類',
  difficulty: 1, beginner: 5, cost: 5, freshness: 3, speed: 3,
  place: ['plot'], sun: 'half',
  depth: 20,
  spacing: { plant: 20, row: 25 },
  perM2: 20,
  stdQty: 4,   // 2人家族の目安株数
  summary: '一度植えたら3〜4年、年に5〜6回刈り取れる多年草。半日陰でも育つ究極の省力作物。',
  whyGood: '植えっぱなしで年5〜6回×3年以上収穫。市販1束150円として、1株から数千円分。しかも半日陰OKなので、日当たりの悪い場所を有効活用できます。',
  plans: [
    {
      id: 'spring-root', label: '春・株から【最推奨】', start: 'root', difficulty: 1,
      note: '3〜4月に株（根）を植える。植えた年は株を育て、2年目から本格収穫。',
      steps: [
        { kind: 'plant', label: '株の植付け', from: [3, 1], to: [4, 3] },
        { kind: 'grow', label: '1年目は株を育てる（収穫は控えめに）', from: [4, 1], to: [11, 3] },
        { kind: 'harvest', label: '刈り取り収穫（2年目以降・年5〜6回）', from: [4, 1], to: [10, 3] }
      ],
      days: 60
    },
    {
      id: 'spring-seed', label: '春・種から', start: 'seed', difficulty: 2,
      note: '収穫は翌年から。時間はかかるが1袋で大量に作れます。',
      steps: [
        { kind: 'sow', label: '種まき', from: [3, 2], to: [4, 3] },
        { kind: 'nursery', label: '育苗（60日）', from: [4, 2], to: [7, 1] },
        { kind: 'plant', label: '定植', from: [6, 2], to: [7, 3] },
        { kind: 'harvest', label: '収穫（翌春から）', from: [4, 1], to: [10, 3] }
      ],
      days: 380
    }
  ],
  yieldNote: '1株から年5〜6回刈り取り。3〜4年継続',
  marketValue: 800, valueUnit: '1株・年あたり',
  water: '乾燥に強い。',
  fert: '刈り取るたびに追肥すると、次の葉が太くなります。',
  keys: [
    '株元3〜4cmを残して刈り取る。20〜25日でまた収穫できます',
    '夏に花茎（ニラの花）が出たら早めに摘む。放置すると株が消耗します',
    '3〜4年経って株が混み合ったら、春に掘り上げて株分け',
    '半日陰でも育つので、建物の陰になる場所に配置するのが賢い使い方'
  ],
  troubles: [
    { name: '葉が細くなる', sign: '年々やせる', cause: '株の混み合い・肥料切れ', fix: '3年目に株分け＋追肥。' },
    { name: '刈っても伸びない', sign: '再生が遅い', cause: '刈り取りすぎ・肥料不足', fix: '刈り取り間隔を25日以上あけ、毎回追肥。' }
  ],
  companions: ['トマト', 'ナス', 'イチゴ（土壌病害を抑える）'],
  tip: 'トマトやナスの株元にニラを植えると、根から出る抗菌物質が青枯病を抑えます。畑の「守り神」として1株は持っておきたい。'
},

/* ---------------- ミョウガ ---------------- */
{
  id: 'myoga', name: 'ミョウガ', kana: 'みょうが', family: 'ショウガ科', emoji: '🌱',
  category: '多年草',
  difficulty: 1, beginner: 5, cost: 5, freshness: 5, speed: 1,
  place: ['plot'], sun: 'shade',
  depth: 30,
  spacing: { plant: 20, row: 30 },
  perM2: 15,
  stdQty: 3,   // 2人家族の目安株数
  summary: '日陰でこそよく育つ稀有な野菜。一度植えたら10年放置で毎夏収穫。3個200円の薬味が穫り放題。',
  whyGood: '日当たりの悪い場所は家庭菜園では「使えない土地」ですが、ミョウガならむしろ好適地。完全放置で毎年勝手に穫れる、労力あたりの効率が異常に高い作物。',
  plans: [
    {
      id: 'spring-root', label: '春・地下茎から【唯一のルート】', start: 'root', difficulty: 1,
      note: '2月下旬〜4月に地下茎（根株）を植える。植えた年は少なく、2〜3年目から本格化。',
      steps: [
        { kind: 'plant', label: '地下茎の植付け（深さ7〜10cm）', from: [2, 3], to: [4, 3] },
        { kind: 'grow', label: '生育（ほぼ放置・敷きわらで乾燥防止）', from: [5, 1], to: [7, 3] },
        { kind: 'harvest', label: '花みょうがの収穫（株元から出る）', from: [7, 3], to: [10, 1] },
        { kind: 'grow', label: '冬は地上部が枯れる（そのままでOK）', from: [11, 1], to: [2, 3] }
      ],
      days: 150
    }
  ],
  yieldNote: '2年目以降、1株あたり年20〜50個',
  marketValue: 1500, valueUnit: '1株・年あたり',
  water: '乾燥に弱い。夏は敷きわらをして乾かさない。',
  fert: '春と秋に少量。ほぼ不要。',
  keys: [
    '【配置が命】北側・建物の陰・大きな木の下など、直射日光が当たらない場所を選ぶ',
    '夏の乾燥だけが敵。敷きわらか腐葉土でマルチをする',
    '収穫は地面から顔を出したつぼみ（花みょうが）を、花が咲く前に根元から手で摘む',
    '地植えすると地下茎で広がるので、範囲を決めるか容器栽培に',
    '冬に地上部が枯れても根は生きています。掘り返さないこと'
  ],
  troubles: [
    { name: '穫れる数が少ない', sign: '1〜2個しか出ない', cause: '植えて1年目（正常）／乾燥', fix: '2〜3年目から急増します。夏の乾燥対策を。' },
    { name: '花が咲いてしまった', sign: '白い花', cause: '収穫遅れ', fix: '香りが落ちますが食べられます。夏は3日おきに株元をチェック。' }
  ],
  companions: [],
  tip: '「うちの北側の日陰、何も植えられない」という場所の答えがこれです。家の北側や建物際に、ぜひ。'
},

/* ---------------- シソ（大葉） ---------------- */
{
  id: 'shiso', name: 'シソ（大葉）', kana: 'しそ', family: 'シソ科', emoji: '🌿',
  category: 'ハーブ',
  difficulty: 1, beginner: 5, cost: 5, freshness: 5, speed: 4,
  place: ['plot'], sun: 'half',
  depth: 20,
  spacing: { plant: 30, row: 40 },
  perM2: 8,
  stdQty: 1,   // 2人家族の目安株数
  summary: '1株で夏中、数百枚。10枚100円の大葉を買う生活から解放されます。こぼれ種で翌年も生えます。',
  whyGood: '半日陰でよく育ち、手間はほぼゼロ。大葉は必要なとき少量ずつ使うので買うと必ず余らせる食材。自給の実利が最も分かりやすい作物のひとつ。',
  plans: [
    {
      id: 'spring-seedling', label: '春・苗から【最推奨】', start: 'seedling', difficulty: 1,
      note: '4月下旬〜5月に苗を1株。それだけで夏中足ります。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [4, 3], to: [6, 1] },
        { kind: 'grow', label: '摘心・追肥', from: [5, 2], to: [9, 3] },
        { kind: 'harvest', label: '葉の収穫', from: [6, 1], to: [10, 2] },
        { kind: 'harvest', label: '穂じそ・実じその収穫', from: [9, 2], to: [10, 3] }
      ],
      days: 40
    },
    {
      id: 'spring-seed', label: '春・種から', start: 'seed', difficulty: 2,
      note: '好光性なので覆土はごく薄く。発芽に地温20℃以上が必要なので5月まき。',
      steps: [
        { kind: 'sow', label: '種まき（覆土は薄く）', from: [4, 3], to: [5, 3] },
        { kind: 'grow', label: '間引き・摘心', from: [5, 3], to: [9, 3] },
        { kind: 'harvest', label: '収穫', from: [6, 2], to: [10, 2] }
      ],
      days: 60
    }
  ],
  yieldNote: '1株から200〜500枚',
  marketValue: 2000, valueUnit: '1株あたり',
  water: '乾燥すると葉が硬くなる。夏はしっかり。',
  fert: '月1回程度の追肥で葉が柔らかく大きくなります。',
  keys: [
    '草丈20〜30cmで先端を摘む（摘心）と、わき芽が増えて収量が数倍に',
    '下の葉から順に収穫。上の若い葉を残す',
    '直射日光が強すぎると葉が硬くなるので、半日陰が実はベスト',
    '9月に穂じそ（花穂）が出たら天ぷらや醤油漬けに。実じそも塩漬けにできます',
    '種を落とせば翌春に勝手に生えてきます（こぼれ種）'
  ],
  troubles: [
    { name: '葉が硬い・小さい', sign: '食感が悪い', cause: '乾燥・強すぎる日射・肥料切れ', fix: '半日陰へ移動、水と追肥。' },
    { name: '葉裏に虫の卵・穴', sign: 'ベニフキノメイガ', cause: '夏', fix: '葉を巻いている部分ごと除去。' }
  ],
  companions: ['ミニトマト'],
  tip: '大葉1株で1シーズン2000円分。「買うと高いのに作ると簡単」ランキングの上位です。'
},

/* ---------------- バジル ---------------- */
{
  id: 'basil', name: 'バジル', kana: 'ばじる', family: 'シソ科', emoji: '🌿',
  category: 'ハーブ',
  difficulty: 1, beginner: 5, cost: 5, freshness: 5, speed: 4,
  place: ['plot'], sun: 'full',
  depth: 20,
  spacing: { plant: 25, row: 30 },
  perM2: 12,
  stdQty: 2,   // 2人家族の目安株数
  summary: '摘むほど増える。夏の間ずっと穫れて、最後にジェノベーゼソースにすれば冷凍で1年もちます。',
  whyGood: 'スーパーでは10g200円前後。1株から数百グラム穫れるので費用対効果が極めて高い。トマトのコンパニオンプランツとしても優秀。',
  plans: [
    {
      id: 'spring-seedling', label: '春・苗から【最推奨】', start: 'seedling', difficulty: 1,
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [4, 3], to: [6, 2] },
        { kind: 'grow', label: '摘心（何度も）・追肥', from: [5, 2], to: [9, 3] },
        { kind: 'harvest', label: '収穫', from: [6, 1], to: [10, 2] }
      ],
      days: 35
    },
    {
      id: 'spring-seed', label: '春・種から', start: 'seed', difficulty: 2,
      note: '好光性・地温20℃以上が必要。5月まきが確実。',
      steps: [
        { kind: 'sow', label: '種まき（覆土は薄く）', from: [4, 3], to: [6, 1] },
        { kind: 'grow', label: '間引き・摘心', from: [5, 2], to: [9, 3] },
        { kind: 'harvest', label: '収穫', from: [6, 2], to: [10, 2] }
      ],
      days: 55
    }
  ],
  yieldNote: '1株から300〜500g',
  marketValue: 3000, valueUnit: '1株あたり',
  water: '乾燥に弱い。夏は毎日。',
  fert: '摘心のたびに液肥。',
  keys: [
    '【摘心が命】草丈20cmで先端を摘む。摘むたびに枝が2本に分かれ、収量が倍々に増えます',
    '花が咲くと葉が硬くなるので、つぼみは見つけ次第摘む',
    '秋の終わりに一気に刈り取り、ペースト（ジェノベーゼ）にして冷凍すると1年使えます',
    '寒さに弱く11月には枯れます。1年草と割り切る'
  ],
  troubles: [
    { name: '葉が黒くなる', sign: '低温障害', cause: '10℃以下', fix: '秋は早めに収穫を終える。' },
    { name: '茎ばかり伸びて葉が少ない', sign: '徒長', cause: '摘心不足・日照不足', fix: '思い切って半分に切り戻すと復活します。' }
  ],
  companions: ['ミニトマト（害虫よけ・生育促進）'],
  tip: 'ミニトマトの株元に一緒に植えるのが定番。互いに相性がよく、収穫も同じ時期です。'
},

/* ---------------- パセリ ---------------- */
{
  id: 'parsley', name: 'パセリ・イタリアンパセリ', kana: 'ぱせり', family: 'セリ科', emoji: '🌿',
  category: 'ハーブ',
  difficulty: 2, beginner: 4, cost: 5, freshness: 4, speed: 3,
  place: ['plot'], sun: 'half',
  depth: 20,
  spacing: { plant: 20, row: 25 },
  perM2: 16,
  stdQty: 2,   // 2人家族の目安株数
  summary: '半日陰で1年以上収穫が続く。外葉をかき取れば真冬でも穫れる、息の長い実用ハーブ。',
  whyGood: '一度植えれば1〜2年収穫が続き、半日陰でOK。少量ずつ必要な食材なので自給の価値が高い。',
  plans: [
    {
      id: 'autumn-seedling', label: '秋・苗から【推奨】', start: 'seedling', difficulty: 1,
      note: '9〜10月に苗を植えると、冬〜翌年6月まで長く穫れます。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [9, 1], to: [10, 3] },
        { kind: 'grow', label: '生育・追肥', from: [9, 3], to: [5, 3] },
        { kind: 'harvest', label: '外葉のかき取り収穫', from: [10, 2], to: [6, 3] }
      ],
      days: 40
    },
    {
      id: 'spring-seedling', label: '春・苗から', start: 'seedling', difficulty: 1,
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [3, 1], to: [5, 1] },
        { kind: 'grow', label: '生育・追肥', from: [3, 3], to: [11, 3] },
        { kind: 'harvest', label: '収穫', from: [4, 3], to: [12, 3] }
      ],
      days: 40
    },
    {
      id: 'seed', label: '種から', start: 'seed', difficulty: 3,
      note: '発芽に3週間かかり、乾燥させると失敗します。苗を買うほうが確実。',
      steps: [
        { kind: 'sow', label: '種まき（一晩浸水・覆土は薄く）', from: [3, 2], to: [5, 1] },
        { kind: 'nursery', label: '発芽まで20日前後', from: [4, 1], to: [5, 3] },
        { kind: 'harvest', label: '収穫', from: [6, 1], to: [12, 3] }
      ],
      days: 90
    }
  ],
  yieldNote: '1株から1〜2年、必要な分だけ',
  marketValue: 1500, valueUnit: '1株あたり',
  water: '乾燥を嫌う。',
  fert: '月1回の液肥。',
  keys: [
    '外葉から順にかき取り、中心の若い葉は必ず残す（常に10枚以上残す）',
    '直射日光が強いと葉が硬くなるので半日陰が最適',
    '2年目に花が咲くと株は終わり。そのタイミングで植え替える',
    'キアゲハの幼虫が付きますが、数匹なら取るだけで十分'
  ],
  troubles: [
    { name: '葉が黄色い', sign: '色が薄い', cause: '肥料切れ', fix: '液肥を定期的に。' },
    { name: '大きな縞模様の芋虫', sign: 'キアゲハ幼虫', cause: 'セリ科の宿命', fix: '見つけて移動。放置すると丸坊主にされます。' }
  ],
  companions: ['ナス（株元の乾燥防止）', 'トマト'],
  tip: 'ナスの株元に植えると、地面を覆って乾燥を防ぐ「リビングマルチ」になります。'
}

);
