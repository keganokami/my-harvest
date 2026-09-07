/* =========================================================
   葉物野菜（アブラナ科・キク科ほか）
   日付はすべて「中間地（近畿平地）」基準
   ========================================================= */

VEG_DB.push(

/* ---------------- コマツナ ---------------- */
{
  id: 'komatsuna', name: 'コマツナ', kana: 'こまつな', family: 'アブラナ科', emoji: '🥬',
  category: '葉物',
  difficulty: 1, beginner: 5, cost: 3, freshness: 3, speed: 5,
  place: ['plot'], sun: 'half',
  depth: 15,
  spacing: { plant: 5, row: 15 },
  perM2: 100,
  stdQty: 20,   // 2人家族の目安株数
  summary: '種をまいて30〜40日で穫れる、家庭菜園の入門No.1。暑さ寒さに強く、ほぼ失敗しません。',
  whyGood: '発芽率が非常に高く、間引き菜も食べられるので「失敗」という状態になりにくい。畝1mもあれば1〜2回の食卓分が穫れます。',
  plans: [
    {
      id: 'autumn', label: '秋まき【最推奨】', start: 'seed', difficulty: 1,
      note: '9〜10月まきが最高。虫が減り、寒さで甘みが乗ります。初めての1袋はこれ。',
      steps: [
        { kind: 'sow', label: '種まき（すじまき）', from: [9, 1], to: [10, 3] },
        { kind: 'grow', label: '間引き・追肥', from: [9, 2], to: [12, 1] },
        { kind: 'harvest', label: '収穫', from: [10, 1], to: [1, 2] }
      ],
      days: 35
    },
    {
      id: 'spring', label: '春まき', start: 'seed', difficulty: 2,
      note: '暖かくなると虫（アブラムシ・キスジノミハムシ）が急増。防虫ネットは必須。',
      steps: [
        { kind: 'sow', label: '種まき', from: [3, 2], to: [5, 3] },
        { kind: 'grow', label: '間引き・追肥', from: [3, 3], to: [6, 2] },
        { kind: 'harvest', label: '収穫', from: [4, 2], to: [6, 3] }
      ],
      days: 30
    }
  ],
  yieldNote: '1m²あたり80〜100株（畝70cm×1mで50〜70株）',
  marketValue: 3000, valueUnit: '1m²あたり',
  water: '土の表面が乾いたらたっぷり。乾燥すると葉が硬くなり辛くなります。',
  fert: '元肥のみでほぼ足りる。2回目の間引き後に化成肥料をひとつまみ追肥すると葉が厚くなります。',
  keys: [
    '深さ1cm・幅1cmのまき溝に1cm間隔でパラパラまき、土を薄くかけて手で軽く押さえる',
    '本葉1〜2枚で3cm間隔、本葉3〜4枚で5〜6cm間隔に間引く（間引き菜はサラダや味噌汁へ）',
    '種まき直後から防虫ネットをかける。これだけで虫害の9割が消えます',
    '草丈20〜25cmで収穫。大きくしすぎると硬くなるので早めに'
  ],
  troubles: [
    { name: '葉に細かい穴が無数', sign: '2〜3mmの丸い食害痕', cause: 'キスジノミハムシ（黒い小さな甲虫）', fix: '種まき直後からの防虫ネットで完全に防げます。発生後の駆除は困難。' },
    { name: '葉が黄色くなる', sign: '下葉から黄変', cause: '肥料切れ、または水のやりすぎで根が傷んでいる', fix: '追肥を少量。水はけが悪い畝は高くして、雨のあとに水が溜まらないようにする。' },
    { name: '育ちが遅い・小さい', sign: 'いつまでも本葉が展開しない', cause: '間引き不足で密集している', fix: 'もったいながらず間引く。株間5cmは確保。' }
  ],
  companions: ['シュンギク（虫よけ）', 'リーフレタス'],
  tip: '2週間おきに少しずつまく「ずらしまき」で、収穫が途切れません。これが家庭菜園の基本テクニックです。'
},

/* ---------------- ホウレンソウ ---------------- */
{
  id: 'spinach', name: 'ホウレンソウ', kana: 'ほうれんそう', family: 'ヒユ科', emoji: '🥬',
  category: '葉物',
  difficulty: 2, beginner: 4, cost: 4, freshness: 4, speed: 4,
  place: ['plot'], sun: 'half',
  depth: 20,
  spacing: { plant: 5, row: 15 },
  perM2: 80,
  stdQty: 25,   // 2人家族の目安株数
  summary: '冬に穫る「寒締めホウレンソウ」は市販品と別物の甘さ。ただし土が酸性だと絶対に育ちません。',
  whyGood: '冬の畑の主役。霜に当たるほど糖度が上がり、スーパーでは買えない味になります。冬は虫もほぼいません。',
  plans: [
    {
      id: 'autumn', label: '秋まき【最推奨】', start: 'seed', difficulty: 2,
      note: '9月中旬〜11月上旬まき。特に10月まきの「寒締め」が絶品。',
      steps: [
        { kind: 'sow', label: '種まき', from: [9, 2], to: [11, 1] },
        { kind: 'grow', label: '間引き・追肥', from: [9, 3], to: [1, 3] },
        { kind: 'harvest', label: '収穫（寒締めで甘くなる）', from: [10, 3], to: [2, 3] }
      ],
      days: 45
    },
    {
      id: 'spring', label: '春まき', start: 'seed', difficulty: 3,
      note: '日が長くなると「とう立ち（花芽が伸びて硬くなる）」しやすい。とう立ちしにくい品種を選ぶこと。',
      steps: [
        { kind: 'sow', label: '種まき', from: [2, 3], to: [4, 1] },
        { kind: 'grow', label: '間引き・追肥', from: [3, 1], to: [5, 2] },
        { kind: 'harvest', label: '収穫', from: [4, 1], to: [5, 3] }
      ],
      days: 40
    }
  ],
  yieldNote: '1m²あたり70〜80株（お浸し15回分ほど）',
  marketValue: 3500, valueUnit: '1m²あたり',
  water: '過湿を嫌う。表面が乾いてからたっぷり。',
  fert: '元肥＋間引き後の追肥1〜2回。',
  keys: [
    '【最重要】種まきの2週間前に苦土石灰を1m²あたり150g入れて pH6.5〜7.0 にする。酸性土壌では発芽しても育ちません',
    '種は硬い殻に覆われているので、一晩水に浸けてからまくと発芽が揃う（「ネーキッド種子」なら不要）',
    '株間を最終的に5〜6cmに間引く。混み合うとべと病が出ます',
    '草丈20〜25cmで根ごと引き抜くか、株元を切って収穫'
  ],
  troubles: [
    { name: '発芽しない・育たない', sign: 'まばらにしか出ない、出ても大きくならない', cause: '土が酸性（最頻出の原因）', fix: '苦土石灰を必ず投入。ホウレンソウ失敗の8割はこれです。' },
    { name: '葉が黄色く枯れ上がる', sign: '下葉から黄変、葉裏に灰色のカビ', cause: 'べと病（多湿・密植）', fix: '間引いて風通しを確保。病葉は畑の外へ。' },
    { name: '春に急に茎が伸びて花が咲く', sign: 'とう立ち', cause: '日長が伸びた・気温上昇', fix: '春まきは「晩抽性」品種を選び、早めに収穫しきる。' }
  ],
  companions: ['ネギ（べと病を抑える）'],
  tip: '真冬に外葉が地面に張り付くように広がったら「寒締め」成功のサイン。糖度が跳ね上がります。'
},

/* ---------------- ミズナ ---------------- */
{
  id: 'mizuna', name: 'ミズナ（水菜）', kana: 'みずな', family: 'アブラナ科', emoji: '🥗',
  category: '葉物',
  difficulty: 1, beginner: 5, cost: 3, freshness: 4, speed: 5,
  place: ['plot'], sun: 'half',
  depth: 15,
  spacing: { plant: 10, row: 20 },
  perM2: 50,
  stdQty: 10,   // 2人家族の目安株数
  summary: '関西の冬野菜の代表。サラダにも鍋にも使え、寒さに非常に強く年内から2月まで穫り続けられます。',
  whyGood: 'コマツナと並ぶ超簡単作物。小株なら30日、大株なら60日と収穫幅が広く、放っておいても穫れます。',
  plans: [
    {
      id: 'autumn', label: '秋まき【最推奨】', start: 'seed', difficulty: 1,
      note: '9月まきが本命。株間を広く取れば1株1kgの大株になります。',
      steps: [
        { kind: 'sow', label: '種まき', from: [9, 1], to: [10, 3] },
        { kind: 'grow', label: '間引き・追肥', from: [9, 2], to: [12, 3] },
        { kind: 'harvest', label: '収穫（小株30日／大株60日）', from: [10, 1], to: [2, 3] }
      ],
      days: 40
    },
    {
      id: 'spring', label: '春まき', start: 'seed', difficulty: 2,
      steps: [
        { kind: 'sow', label: '種まき', from: [3, 2], to: [4, 3] },
        { kind: 'grow', label: '間引き・追肥', from: [3, 3], to: [6, 1] },
        { kind: 'harvest', label: '収穫', from: [4, 3], to: [6, 2] }
      ],
      days: 35
    }
  ],
  yieldNote: '1m²あたり小株50株、または鍋用の大株12株',
  marketValue: 2500, valueUnit: '1m²あたり',
  water: '名前のとおり水を好む。乾かしすぎない。',
  fert: '追肥1〜2回で株が大きく育つ。',
  keys: [
    'サラダ用の小株なら株間5cm、鍋用の大株なら株間25〜30cmとまったく違う作り方になる',
    '外葉から順にかき取れば1株から長期間収穫できる',
    '霜に強く、年明けまで畑に置いたままにできる「冷蔵庫がわり」の野菜'
  ],
  troubles: [
    { name: '虫食い', sign: '葉に穴', cause: 'アオムシ・コナガ', fix: '防虫ネット。ただし11月以降はほぼ虫がいなくなります。' }
  ],
  companions: ['コマツナ', 'シュンギク'],
  tip: '同じ袋の種で「サラダ用に間引きながら食べ、残した株を鍋用の大株に育てる」二段構えができます。'
},

/* ---------------- シュンギク ---------------- */
{
  id: 'shungiku', name: 'シュンギク（春菊）', kana: 'しゅんぎく', family: 'キク科', emoji: '🌿',
  category: '葉物',
  difficulty: 2, beginner: 4, cost: 4, freshness: 5, speed: 4,
  place: ['plot'], sun: 'half',
  depth: 20,
  spacing: { plant: 15, row: 20 },
  perM2: 30,
  stdQty: 8,   // 2人家族の目安株数
  summary: '独特の香りで虫がほとんど付かない優等生。摘み取り収穫で冬中ずっと穫れます。鍋の必需品。',
  whyGood: 'キク科の香りのおかげで無農薬でもきれいに育つ。1回まけば脇芽を摘み続けて12月〜3月まで収穫が続き、コスパが非常に高い。',
  plans: [
    {
      id: 'autumn', label: '秋まき【最推奨】', start: 'seed', difficulty: 2,
      note: '9月上旬〜10月上旬まき。遅すぎると寒さで生育が止まります。',
      steps: [
        { kind: 'sow', label: '種まき', from: [9, 1], to: [10, 1] },
        { kind: 'grow', label: '間引き・摘心', from: [9, 3], to: [11, 3] },
        { kind: 'harvest', label: '摘み取り収穫', from: [10, 3], to: [3, 2] }
      ],
      days: 50
    },
    {
      id: 'spring', label: '春まき', start: 'seed', difficulty: 3,
      note: '早くとう立ちするので収穫期間は短め。',
      steps: [
        { kind: 'sow', label: '種まき', from: [3, 2], to: [4, 2] },
        { kind: 'grow', label: '間引き', from: [3, 3], to: [5, 2] },
        { kind: 'harvest', label: '収穫', from: [5, 1], to: [6, 1] }
      ],
      days: 50
    }
  ],
  yieldNote: '1株から冬中で2〜3回の摘み取り（10株で20〜30回分）',
  marketValue: 150, valueUnit: '1株あたり',
  water: '普通。乾燥に弱いので夏まきは避ける。',
  fert: '摘み取りのたびに追肥すると脇芽の出がよくなる。',
  keys: [
    '種は「好光性」。土を薄くかけるだけ（5mm程度）。厚くかけると発芽しません',
    '発芽率がやや低いので厚めにまいて間引く',
    '草丈20cmになったら、下の葉を4〜5枚残して先端を摘む。すると脇芽が2〜4本出て、それを繰り返し収穫できます',
    '抜き取らずに「摘む」のが長期収穫のコツ'
  ],
  troubles: [
    { name: '発芽しない', sign: 'ほとんど出ない', cause: '覆土が厚い（好光性種子）', fix: '土は種が隠れる程度に薄く。板で軽く押さえるだけでも可。' },
    { name: '春に花が咲く', sign: '黄色い菊の花', cause: 'とう立ち（自然な現象）', fix: '3月頃までが収穫期。花はそのまま観賞するか片付けて次の作物へ。' }
  ],
  companions: ['ハクサイ・キャベツ（アブラナ科の虫よけになる）'],
  tip: 'キャベツやハクサイの畝の縁にシュンギクを植えると、香りで青虫が寄りにくくなる「コンパニオンプランツ」の定番です。'
},

/* ---------------- リーフレタス ---------------- */
{
  id: 'leaflettuce', name: 'リーフレタス（サニーレタス）', kana: 'りーふれたす', family: 'キク科', emoji: '🥗',
  category: '葉物',
  difficulty: 1, beginner: 5, cost: 4, freshness: 5, speed: 5,
  place: ['plot'], sun: 'half',
  depth: 15,
  spacing: { plant: 20, row: 25 },
  perM2: 16,
  stdQty: 4,   // 2人家族の目安株数
  summary: '外葉をかき取って使う「もぎ取りレタス」。1株で1〜2ヶ月間サラダが穫れ続けます。虫も付きにくい。',
  whyGood: 'キク科なので青虫がほとんど来ない。玉レタスと違い結球を待たなくてよく、必要な分だけ収穫できるので失敗しようがありません。畝の縁の空きスペースにも植えられます。',
  plans: [
    {
      id: 'autumn-seedling', label: '秋・苗から【最推奨】', start: 'seedling', difficulty: 1,
      note: '9月〜10月にホームセンターで苗を買うのが最短ルート。1株100円前後。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [9, 1], to: [10, 3] },
        { kind: 'grow', label: '生育・追肥', from: [9, 2], to: [11, 3] },
        { kind: 'harvest', label: '外葉かき取り収穫', from: [10, 1], to: [1, 1] }
      ],
      days: 30
    },
    {
      id: 'autumn-seed', label: '秋・種から', start: 'seed', difficulty: 2,
      note: '種は非常に細かい。好光性なので覆土はごく薄く。',
      steps: [
        { kind: 'sow', label: '種まき', from: [8, 3], to: [10, 1] },
        { kind: 'nursery', label: '育苗（ポットの場合3週間）', from: [9, 1], to: [10, 2] },
        { kind: 'grow', label: '生育・追肥', from: [9, 2], to: [12, 1] },
        { kind: 'harvest', label: '収穫', from: [10, 2], to: [1, 2] }
      ],
      days: 50
    },
    {
      id: 'spring', label: '春・苗から', start: 'seedling', difficulty: 2,
      note: '3〜4月植付け。暑くなるととう立ちして苦くなるので6月までに終える。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [3, 1], to: [4, 3] },
        { kind: 'grow', label: '生育', from: [3, 2], to: [5, 3] },
        { kind: 'harvest', label: '収穫', from: [4, 2], to: [6, 2] }
      ],
      days: 30
    }
  ],
  yieldNote: '1株から20〜30枚。4株あればサラダが途切れません',
  marketValue: 300, valueUnit: '1株あたり',
  water: '乾燥に弱い。葉物の中では水を好みます。',
  fert: 'かき取り収穫のたびに液肥を少量。',
  keys: [
    '外側の葉を下から2〜3枚ずつかき取る。中心の芽を残せば次々と新しい葉が出ます',
    '株ごと抜くのは最後だけ。「収穫＝摘み取り」と考える',
    '種は好光性。土はほぼかけない（新聞紙をかけて乾燥防止すると発芽が揃う）',
    '真夏は発芽しない（25℃以上で休眠する）。夏まきは種を濡らして冷蔵庫で1日冷やしてからまく'
  ],
  troubles: [
    { name: '葉が苦い', sign: '食べると苦味', cause: 'とう立ち開始・水切れ', fix: '若いうちに収穫。水を切らさない。' },
    { name: '葉が溶ける・腐る', sign: '株元がぬめる', cause: '軟腐病（過湿）', fix: '水はけをよくし、株元に水をためない。' },
    { name: 'アブラムシ', sign: '新芽に緑の虫', cause: '春・秋の暖かい時期', fix: '見つけ次第テープで取る。牛乳スプレーやシルバーマルチも有効。' }
  ],
  companions: ['ブロッコリー・キャベツ（互いに虫を分散）'],
  tip: '「レタスとアブラナ科を交互に植える」と、青虫がキク科の匂いを嫌って産卵が減ります。畝の設計で使えるテクニック。'
},

/* ---------------- チンゲンサイ ---------------- */
{
  id: 'chingensai', name: 'チンゲンサイ', kana: 'ちんげんさい', family: 'アブラナ科', emoji: '🥬',
  category: '葉物',
  difficulty: 1, beginner: 5, cost: 3, freshness: 3, speed: 5,
  place: ['plot'], sun: 'half',
  depth: 15,
  spacing: { plant: 15, row: 20 },
  perM2: 35,
  stdQty: 8,   // 2人家族の目安株数
  summary: '40日で株元がぷっくり膨らむ中国野菜。生育が早く、炒め物にすぐ使えます。',
  whyGood: 'コマツナ並みに簡単で、しかも「野菜らしい形」に育つので達成感があります。秋まきなら虫害も少ない。',
  plans: [
    {
      id: 'autumn', label: '秋まき【最推奨】', start: 'seed', difficulty: 1,
      steps: [
        { kind: 'sow', label: '種まき', from: [9, 1], to: [10, 2] },
        { kind: 'grow', label: '間引き・追肥', from: [9, 2], to: [11, 2] },
        { kind: 'harvest', label: '収穫', from: [10, 1], to: [12, 3] }
      ],
      days: 45
    },
    {
      id: 'spring', label: '春まき', start: 'seed', difficulty: 2,
      steps: [
        { kind: 'sow', label: '種まき', from: [3, 2], to: [5, 1] },
        { kind: 'grow', label: '間引き・追肥', from: [3, 3], to: [6, 1] },
        { kind: 'harvest', label: '収穫', from: [4, 3], to: [6, 2] }
      ],
      days: 40
    }
  ],
  yieldNote: '1m²あたり30〜35株',
  marketValue: 2100, valueUnit: '1m²あたり',
  water: '普通。',
  fert: '間引き後に1回追肥。',
  keys: [
    '最終株間15cm。狭いと株元が膨らみません',
    '草丈15〜20cm、株元が太くなったら収穫',
    '低温に当たるととう立ちするので、春まきは3月下旬以降に'
  ],
  troubles: [
    { name: '株元が膨らまない', sign: '細いまま', cause: '密植・肥料不足', fix: '株間15cmを確保し、追肥する。' }
  ],
  companions: [],
  tip: '収穫が遅れると硬くなります。「まだ小さいかな」くらいで穫るのがちょうどいい。'
},

/* ---------------- ルッコラ ---------------- */
{
  id: 'rucola', name: 'ルッコラ', kana: 'るっこら', family: 'アブラナ科', emoji: '🌿',
  category: '葉物',
  difficulty: 1, beginner: 5, cost: 5, freshness: 5, speed: 5,
  place: ['plot'], sun: 'half',
  depth: 15,
  spacing: { plant: 8, row: 15 },
  perM2: 80,
  stdQty: 12,   // 2人家族の目安株数
  summary: '20〜30日で穫れる最速級。ゴマの香りとピリッとした辛味は買うと高いのに、育てるのは超簡単。',
  whyGood: 'スーパーでは50gで200円前後する高級ハーブ野菜。生育が早く、かき取れば何度も穫れるので費用対効果が最強クラスです。',
  plans: [
    {
      id: 'autumn', label: '秋まき【最推奨】', start: 'seed', difficulty: 1,
      steps: [
        { kind: 'sow', label: '種まき', from: [9, 1], to: [10, 3] },
        { kind: 'grow', label: '間引き', from: [9, 2], to: [11, 3] },
        { kind: 'harvest', label: 'かき取り収穫', from: [9, 3], to: [1, 2] }
      ],
      days: 30
    },
    {
      id: 'spring', label: '春まき', start: 'seed', difficulty: 2,
      note: '春は辛味が強くなり、とう立ちも早い。',
      steps: [
        { kind: 'sow', label: '種まき', from: [3, 1], to: [5, 1] },
        { kind: 'grow', label: '間引き', from: [3, 2], to: [5, 3] },
        { kind: 'harvest', label: '収穫', from: [4, 1], to: [6, 1] }
      ],
      days: 25
    }
  ],
  yieldNote: '1m²あたり市販パック30〜40袋分（かき取りで3〜4回）',
  marketValue: 5000, valueUnit: '1m²あたり',
  water: '乾かしすぎると辛味が強くなりすぎる。',
  fert: 'ほぼ不要。元肥だけで育つ。',
  keys: [
    '草丈15cmくらいで外葉からかき取る。中心を残せば3〜4回収穫できます',
    '虫（キスジノミハムシ）が好むので防虫ネット推奨',
    '花が咲いても花はサラダに使えます（甘い香り）'
  ],
  troubles: [
    { name: '葉に穴だらけ', sign: '小さい穴', cause: 'キスジノミハムシ', fix: '防虫ネットを最初から。' }
  ],
  companions: [],
  tip: '「買うと高いが作ると楽」の代表格。空いたスペースがあれば迷わずまいて損はありません。'
},

/* ---------------- ブロッコリー ---------------- */
{
  id: 'broccoli', name: 'ブロッコリー', kana: 'ぶろっこりー', family: 'アブラナ科', emoji: '🥦',
  category: '葉物',
  difficulty: 2, beginner: 4, cost: 5, freshness: 4, speed: 2,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 45, row: 45 },
  perM2: 4,
  stdQty: 4,   // 2人家族の目安株数
  summary: '中央の大きな花蕾を穫った後、脇から小さな側花蕾が春まで次々出る「長距離ランナー」。コスパ抜群。',
  whyGood: '1株で頂花蕾1個＋側花蕾10〜20個。スーパーなら1個200〜300円するものが1株から1000円分以上穫れます。秋植えは虫が減る時期なので初心者でも成功しやすい。',
  plans: [
    {
      id: 'autumn-seedling', label: '秋・苗から【最推奨】', start: 'seedling', difficulty: 2,
      note: '8月下旬〜9月中旬に苗を植える。これを逃すと冬までに花蕾が育ちません。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [8, 3], to: [9, 3] },
        { kind: 'grow', label: '生育・追肥・防虫', from: [9, 1], to: [11, 2] },
        { kind: 'harvest', label: '頂花蕾の収穫', from: [11, 1], to: [12, 3] },
        { kind: 'harvest', label: '側花蕾の収穫（長期）', from: [12, 1], to: [3, 3] }
      ],
      days: 80
    },
    {
      id: 'autumn-seed', label: '秋・種から', start: 'seed', difficulty: 3,
      note: '7月下旬〜8月中旬にポットまき。真夏の育苗は水切れに注意。',
      steps: [
        { kind: 'sow', label: 'ポットに種まき', from: [7, 3], to: [8, 2] },
        { kind: 'nursery', label: '育苗（本葉4〜5枚まで約30日）', from: [8, 1], to: [9, 2] },
        { kind: 'plant', label: '定植', from: [8, 3], to: [9, 3] },
        { kind: 'grow', label: '生育・追肥', from: [9, 1], to: [11, 2] },
        { kind: 'harvest', label: '収穫', from: [11, 1], to: [3, 3] }
      ],
      days: 110
    },
    {
      id: 'spring', label: '春・苗から', start: 'seedling', difficulty: 3,
      note: '2月下旬〜3月植付け。ウイルス病・アブラムシが多く、秋作より難しい。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [2, 3], to: [3, 3] },
        { kind: 'grow', label: '生育・追肥', from: [3, 1], to: [5, 1] },
        { kind: 'harvest', label: '収穫', from: [5, 1], to: [6, 2] }
      ],
      days: 75
    }
  ],
  yieldNote: '1株あたり 頂花蕾1個 ＋ 側花蕾10〜20個',
  marketValue: 1000, valueUnit: '1株あたり',
  water: '花蕾が育つ時期に水切れさせない。',
  fert: '肥料食い。植付け2週間後、その後3〜4週おきに追肥（計3回程度）。',
  keys: [
    '苗を買うときは「本葉4〜5枚、茎が太く、徒長していない」ものを選ぶ',
    '植付けから収穫まで防虫ネットは外さない。青虫（モンシロチョウ）が最大の敵',
    '頂花蕾は「つぼみが開く前」に、茎を10cm付けて切る。開花させると台無し',
    '頂花蕾を穫ったあとも絶対に抜かない。追肥すれば側花蕾が春まで穫れます（ここが最大の得ポイント）',
    '株が大きくなるので株間45cmは必須。ケチると花蕾が小さくなります'
  ],
  troubles: [
    { name: '葉が食べ尽くされる', sign: '葉脈だけ残る', cause: 'アオムシ・ヨトウムシ', fix: '防虫ネット必須。ヨトウムシは夜行性なので夜に株元の土を探す。' },
    { name: '花蕾が黄色く開いた', sign: 'つぼみが開花', cause: '収穫遅れ・高温', fix: '毎日観察して早めに収穫。開いても食べられますが味は落ちます。' },
    { name: '花蕾が小さい・つかない', sign: '葉ばかり茂る', cause: '植付けが遅すぎた／肥料不足／株間が狭い', fix: '来年は9月中旬までに定植。追肥を忘れずに。' }
  ],
  companions: ['リーフレタス', 'シュンギク'],
  tip: '「側花蕾を穫り続ける」ことを知らずに1回で抜いてしまう人が非常に多い。3月まで置けば収量が3倍になります。'
},

/* ---------------- キャベツ ---------------- */
{
  id: 'cabbage', name: 'キャベツ', kana: 'きゃべつ', family: 'アブラナ科', emoji: '🥬',
  category: '葉物',
  difficulty: 3, beginner: 3, cost: 4, freshness: 3, speed: 1,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 40, row: 45 },
  perM2: 5,
  stdQty: 3,   // 2人家族の目安株数
  summary: '結球するまで4ヶ月。場所と時間を占有しますが、無農薬キャベツの甘さは格別。',
  whyGood: '冬キャベツは甘みが強く、外葉まで使えます。ただし「面積あたりの得」で見るとブロッコリーに劣るので、狭い畑では優先度は中程度。',
  plans: [
    {
      id: 'autumn-seedling', label: '秋・苗から（冬どり）【推奨】', start: 'seedling', difficulty: 3,
      note: '8月下旬〜9月中旬定植。年内〜2月に収穫。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [8, 3], to: [9, 3] },
        { kind: 'grow', label: '生育・追肥・防虫', from: [9, 1], to: [12, 1] },
        { kind: 'harvest', label: '収穫', from: [12, 1], to: [2, 3] }
      ],
      days: 100
    },
    {
      id: 'winter-seedling', label: '晩秋・苗から（春どり）', start: 'seedling', difficulty: 3,
      note: '11月定植で冬を小さいまま越し、4〜5月に穫る。畑を長期占有します。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [11, 1], to: [11, 3] },
        { kind: 'grow', label: '越冬・春の追肥', from: [12, 1], to: [4, 2] },
        { kind: 'harvest', label: '収穫', from: [4, 2], to: [5, 3] }
      ],
      days: 170
    }
  ],
  yieldNote: '1株1玉（1〜1.5kg）',
  marketValue: 250, valueUnit: '1株あたり',
  water: '結球期に水切れさせない。',
  fert: '肥料食い。定植2週間後から3週おきに追肥。',
  keys: [
    '防虫ネットを最後まで外さない。キャベツは青虫の最大の標的です',
    '結球が始まったら追肥をやめる（遅い追肥は裂球の原因）',
    '玉を手で押して硬く締まっていたら収穫適期',
    '畝2本程度の畑では1〜2株が現実的。場所を取るので欲張らない'
  ],
  troubles: [
    { name: '玉が巻かない', sign: '葉が開いたまま', cause: '定植が遅い／肥料不足／株間が狭い', fix: '9月中旬までの定植を厳守し、追肥する。' },
    { name: '玉が割れる', sign: '裂球', cause: '収穫遅れ、収穫期の大雨', fix: '適期に穫る。割れそうな株は根を片側だけスコップで切って生育を止める。' },
    { name: '中に虫が入っている', sign: '結球内部に食害', cause: '結球前にヨトウムシが侵入', fix: '結球開始前の防除が勝負。ネットの隙間をなくす。' }
  ],
  companions: ['シュンギク', 'レタス'],
  tip: '初年度は「ブロッコリー優先、キャベツは1株だけ試す」がおすすめ。面積効率で大きく差が出ます。'
},

/* ---------------- ハクサイ ---------------- */
{
  id: 'hakusai', name: 'ハクサイ（白菜）', kana: 'はくさい', family: 'アブラナ科', emoji: '🥬',
  category: '葉物',
  difficulty: 4, beginner: 2, cost: 4, freshness: 3, speed: 2,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 45, row: 50 },
  perM2: 4,
  stdQty: 3,   // 2人家族の目安株数
  summary: '「まき時が1〜2週間ずれると結球しない」時間にシビアな作物。上級者への登竜門。',
  whyGood: '鍋の主役で消費量も多い。ただし冷え込みの早い内陸では、まき遅れると結球前に寒さで生育が止まります。2年目以降のチャレンジ推奨。',
  plans: [
    {
      id: 'autumn-seed', label: '秋・種から【本命】', start: 'seed', difficulty: 4,
      note: '中間地は 8月中旬〜9月上旬まきが絶対条件。1週間の遅れが致命傷になります。',
      steps: [
        { kind: 'sow', label: '種まき（直まき or ポット）', from: [8, 2], to: [9, 1] },
        { kind: 'nursery', label: '育苗（ポットの場合25日）', from: [8, 3], to: [9, 2] },
        { kind: 'plant', label: '定植', from: [9, 1], to: [9, 3] },
        { kind: 'grow', label: '生育・追肥・防虫', from: [9, 2], to: [11, 2] },
        { kind: 'harvest', label: '収穫', from: [11, 2], to: [1, 3] }
      ],
      days: 85
    },
    {
      id: 'autumn-seedling', label: '秋・苗から（保険）', start: 'seedling', difficulty: 3,
      note: '9月上旬に苗を買えば失敗リスクが下がる。ただし品揃えは短期間。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [9, 1], to: [9, 3] },
        { kind: 'grow', label: '生育・追肥・防虫', from: [9, 2], to: [11, 2] },
        { kind: 'harvest', label: '収穫', from: [11, 2], to: [1, 3] }
      ],
      days: 80
    }
  ],
  yieldNote: '1株1玉（2〜3kg）',
  marketValue: 400, valueUnit: '1株あたり',
  water: '結球期は多めに必要。',
  fert: '定植2週間後・3週間後の2回、しっかり追肥。',
  keys: [
    '【最重要】まき遅れ厳禁。9月10日を過ぎたら結球をあきらめて「ミニ白菜」品種か、抜き菜として食べる前提に',
    '定植直後から防虫ネット。ハクサイは虫の総攻撃を受けます',
    '結球開始（葉が立ち上がってくる）までに株を大きくするのが勝負',
    '11月下旬、外葉で玉を包んで紐で縛ると、そのまま畑で1月まで保存できます'
  ],
  troubles: [
    { name: '結球しない', sign: '葉が開いたまま冬になる', cause: 'まき遅れ（最頻出）', fix: '来年は8月下旬までに。今年は「かき菜」として葉を利用。' },
    { name: '株元が腐る', sign: 'べっとり溶ける', cause: '軟腐病（過湿・傷口から感染）', fix: '水はけをよくし、株元に土を寄せすぎない。' },
    { name: '根がこぶ状に', sign: '生育不良で抜くとこぶ', cause: '根こぶ病（酸性土壌・アブラナ科の連作）', fix: '石灰でpH調整、2年は別の科を植える。' }
  ],
  companions: ['シュンギク'],
  tip: '初年度は無理をしない選択も正解。同じ面積でブロッコリー2株のほうが確実に食卓に貢献します。'
}

);
