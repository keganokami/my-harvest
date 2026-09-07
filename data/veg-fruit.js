/* =========================================================
   果菜類・マメ類・イチゴ
   ========================================================= */

VEG_DB.push(

/* ---------------- ミニトマト ---------------- */
{
  id: 'minitomato', name: 'ミニトマト', kana: 'みにとまと', family: 'ナス科', emoji: '🍅',
  category: '果菜',
  difficulty: 2, beginner: 4, cost: 5, freshness: 5, speed: 3,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 45, row: 70 },
  perM2: 3,
  stdQty: 2,   // 2人家族の目安株数
  summary: '1株で150〜250個。夏の間ずっと穫れ続ける、家庭菜園の絶対的エース。',
  whyGood: '大玉トマトと違い実割れや尻腐れが少なく、初心者でも確実に穫れます。1株300円の苗が2000円分以上の実になり、採れたての味は市販品と別物。',
  plans: [
    {
      id: 'spring-seedling', label: '春・苗から【最推奨】', start: 'seedling', difficulty: 2,
      note: '遅霜がある内陸では4月下旬〜5月上旬の定植が安全。GWが目安。',
      steps: [
        { kind: 'plant', label: '苗の定植（一番花が咲いた苗を選ぶ）', from: [4, 3], to: [5, 2] },
        { kind: 'grow', label: '支柱立て・わき芽かき・追肥', from: [5, 1], to: [9, 2] },
        { kind: 'harvest', label: '収穫', from: [6, 2], to: [10, 2] }
      ],
      days: 60
    },
    {
      id: 'spring-seed', label: '春・種から', start: 'seed', difficulty: 4,
      note: '2月中旬まきで加温育苗が必要。初心者には非推奨ですが、珍しい品種を作りたい場合の道。',
      steps: [
        { kind: 'sow', label: 'ポットに種まき（要保温25℃）', from: [2, 2], to: [3, 2] },
        { kind: 'nursery', label: '育苗（60〜70日・室内の日当たりで）', from: [2, 3], to: [5, 1] },
        { kind: 'plant', label: '定植', from: [4, 3], to: [5, 2] },
        { kind: 'grow', label: '整枝・追肥', from: [5, 1], to: [9, 2] },
        { kind: 'harvest', label: '収穫', from: [6, 3], to: [10, 2] }
      ],
      days: 130
    }
  ],
  yieldNote: '1株から150〜250個',
  marketValue: 2500, valueUnit: '1株あたり',
  water: '【控えめが正解】表土が乾いてから。水を絞るほど甘くなります。地植えなら真夏に週2回程度で十分。',
  fert: '一番果が膨らみ始めたら追肥開始、以後2〜3週おき。早すぎる追肥は「つるボケ」の原因。',
  keys: [
    '苗選びが8割。「第一花房に花が咲いている、茎が太く節間が詰まった苗」を選ぶ',
    '定植時、根鉢の上部が少し出るくらい浅めに。植え穴にはたっぷり水を入れてから植える',
    '【わき芽かき】葉の付け根から出る芽をすべて摘む。週2回のチェックが必要。放置するとジャングルになり実が小さくなります',
    '支柱は150cm以上。8の字にゆるく結ぶ',
    '真っ赤に完熟してから穫る。ここが市販品との最大の差になります',
    '雨に当たると実が割れる。株元に敷きわらをして泥はねを防ぎ、可能なら簡易の雨よけを立てると裂果が減ります'
  ],
  troubles: [
    { name: '実のお尻が黒くへこむ', sign: '尻腐れ果', cause: 'カルシウム不足＋水やりムラ', fix: '水切れと過湿を繰り返さない。カルシウム資材の葉面散布も有効。' },
    { name: '実が割れる', sign: '裂果', cause: '乾燥後の急な水・雨', fix: '水やりを一定に。完熟前に穫る。' },
    { name: '葉ばかり茂って花が咲かない', sign: 'つるボケ', cause: '窒素過多・追肥が早すぎ', fix: '一番果が着くまで追肥しない。' },
    { name: '葉に白い筋（絵を描いたよう）', sign: 'ハモグリバエ', cause: '幼虫の食害', fix: '被害葉を取り除く。生育への影響は軽微。' },
    { name: '実が食べられている', sign: '穴があく', cause: 'オオタバコガ・鳥', fix: 'ネットをかける。' }
  ],
  companions: ['バジル（害虫よけ・味の相性）', 'ニラ（土の病原菌を抑える）'],
  tip: 'トマトの株元にニラを一緒に植えると、ニラの根の微生物が青枯病を抑えます。プロも使う定番の組み合わせ。'
},

/* ---------------- ナス ---------------- */
{
  id: 'eggplant', name: 'ナス', kana: 'なす', family: 'ナス科', emoji: '🍆',
  category: '果菜',
  difficulty: 3, beginner: 3, cost: 5, freshness: 4, speed: 3,
  place: ['plot'], sun: 'full',
  depth: 35,
  spacing: { plant: 60, row: 70 },
  perM2: 2,
  stdQty: 2,   // 2人家族の目安株数
  summary: '水と肥料さえ切らさなければ、6月から10月まで1株30〜50本。夏の畑の長距離ランナー。',
  whyGood: '収穫期間が非常に長く、真夏に「更新剪定」をすれば秋にもう一度たくさん穫れます。ただし水切れに弱いので、真夏に畑へ通えない人には向きません。',
  plans: [
    {
      id: 'spring-seedling', label: '春・苗から【最推奨】', start: 'seedling', difficulty: 3,
      note: 'ナスは低温に弱いので、内陸では5月上旬の定植が安全。接ぎ木苗を選ぶと連作障害・病気に強い。',
      steps: [
        { kind: 'plant', label: '苗の定植（接ぎ木苗推奨）', from: [5, 1], to: [5, 3] },
        { kind: 'grow', label: '3本仕立て・支柱・追肥', from: [5, 2], to: [7, 2] },
        { kind: 'harvest', label: '夏の収穫', from: [6, 3], to: [7, 3] },
        { kind: 'grow', label: '更新剪定（強く切り戻す）', from: [7, 3], to: [8, 1] },
        { kind: 'harvest', label: '秋ナスの収穫', from: [9, 1], to: [10, 3] }
      ],
      days: 60
    }
  ],
  yieldNote: '1株から30〜50本',
  marketValue: 2500, valueUnit: '1株あたり',
  water: '【最重要】ナスは水で作る野菜。夏は毎朝たっぷり、猛暑日は朝夕2回。地植えでも週2回は必要。',
  fert: '肥料食い。定植3週間後から2週間おきに追肥を続ける。',
  keys: [
    '一番花のすぐ下のわき芽2本＋主枝の「3本仕立て」にする。それ以外のわき芽は取る',
    '一番果は小さいうちに穫る（株を育てるため）',
    '7月下旬、枝を1/3〜1/2に切り戻し、株の周りをスコップで切って追肥・水やり（更新剪定）。3〜4週間後に秋ナスが穫れます',
    '実は若採りが基本。大きくしすぎると株が疲れ、皮が硬くなります',
    'アブラムシ・ハダニが付きやすい。葉裏を定期的にチェック'
  ],
  troubles: [
    { name: '実がつやのない・硬い', sign: 'ボケナス', cause: '水不足・肥料切れ', fix: '水と追肥。ナスの不調はほぼこの2つ。' },
    { name: '葉が縮れて白い斑点', sign: 'ハダニ', cause: '乾燥・高温', fix: '葉裏に水をかける（葉水）。ハダニは水に弱い。' },
    { name: '花が落ちる', sign: '実がつかない', cause: '肥料不足で花が短い（短花柱花）', fix: '花の中心のめしべが長ければ健全。短ければ肥料と水が足りていないサイン。' },
    { name: '株が急にしおれて枯れる', sign: '青枯病', cause: '土壌の細菌・連作', fix: '接ぎ木苗を使う。発病株は抜いて処分。同じ場所にナス科を植えない。' }
  ],
  companions: ['パセリ（株元の乾燥防止）', 'ニラ'],
  tip: 'ナスの花は「めしべがおしべより長い」のが健康な証拠。花を見るだけで肥料の過不足が診断できます。'
},

/* ---------------- ピーマン ---------------- */
{
  id: 'pepper', name: 'ピーマン・シシトウ', kana: 'ぴーまん', family: 'ナス科', emoji: '🫑',
  category: '果菜',
  difficulty: 2, beginner: 5, cost: 5, freshness: 4, speed: 3,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 45, row: 60 },
  perM2: 3,
  stdQty: 2,   // 2人家族の目安株数
  summary: '夏野菜で最も失敗しにくい。1株から100個近く穫れ、10月末まで収穫が続きます。',
  whyGood: 'ナスほど水を要求せず、トマトほど整枝も要らない。病害虫にも比較的強く、「植えたら穫れる」に最も近い夏野菜です。狭い畑でも必ず1株入れたい。',
  plans: [
    {
      id: 'spring-seedling', label: '春・苗から【最推奨】', start: 'seedling', difficulty: 2,
      note: '5月上旬定植。低温に弱いので急がないこと。',
      steps: [
        { kind: 'plant', label: '苗の定植', from: [5, 1], to: [5, 3] },
        { kind: 'grow', label: '3本仕立て・支柱・追肥', from: [5, 2], to: [9, 3] },
        { kind: 'harvest', label: '収穫', from: [6, 3], to: [10, 3] }
      ],
      days: 55
    }
  ],
  yieldNote: '1株から50〜100個',
  marketValue: 2000, valueUnit: '1株あたり',
  water: '土の表面が乾いたら。ナスほど神経質でなくてよい。',
  fert: '2〜3週おきに追肥。切らすと実が小さくなります。',
  keys: [
    '一番花の下のわき芽を2本残す3本仕立て。それより下のわき芽は全部取る',
    '一番果は小さいうちに収穫して株を充実させる',
    '枝が折れやすいので支柱は必須',
    '大きくなりすぎる前に穫ると、次々と新しい実がつきます',
    '赤くなるまで置くと「赤ピーマン」になり甘くなりますが、株の負担が大きく収量は減ります'
  ],
  troubles: [
    { name: '実に穴・中が食われている', sign: 'タバコガの幼虫', cause: '夏の蛾の産卵', fix: '被害果は取り除く。数個の被害で済むことが多い。' },
    { name: '新芽にアブラムシ', sign: '密集した小さな虫', cause: '', fix: '見つけ次第水で流すかテープで取る。' },
    { name: '実が小さくなってきた', sign: '後半の実が小玉', cause: '肥料切れ', fix: '追肥を2週おきに。' }
  ],
  companions: ['バジル', 'ニラ'],
  tip: 'シシトウは同じ育て方でさらに多収。ただし乾燥・ストレスがかかると辛い実が混ざります。'
},

/* ---------------- キュウリ ---------------- */
{
  id: 'cucumber', name: 'キュウリ', kana: 'きゅうり', family: 'ウリ科', emoji: '🥒',
  category: '果菜',
  difficulty: 3, beginner: 3, cost: 4, freshness: 5, speed: 4,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 45, row: 90 },
  perM2: 3,
  stdQty: 2,   // 2人家族の目安株数
  summary: '植えて1ヶ月半で穫れ始め、1日1本ペースで穫れる爆速野菜。ただし寿命は2〜3ヶ月と短命。',
  whyGood: '成長が目に見えて早く、収穫の喜びが大きい。採れたてのイボイボは市販品にない食感。ただし病気（うどんこ病・べと病）が出やすく、夏の中盤で終わります。',
  plans: [
    {
      id: 'spring-seedling', label: '春・苗から【最推奨】', start: 'seedling', difficulty: 3,
      note: '【重要】必ず「接ぎ木苗」を。つる割病に強く、成功率がまるで違います（+100円の価値あり）。',
      steps: [
        { kind: 'plant', label: '苗の定植（接ぎ木苗）', from: [4, 3], to: [5, 3] },
        { kind: 'grow', label: 'ネット・つる誘引・整枝・追肥', from: [5, 1], to: [7, 3] },
        { kind: 'harvest', label: '収穫', from: [6, 1], to: [8, 1] }
      ],
      days: 45
    },
    {
      id: 'summer-seed', label: '夏まき（秋どり）', start: 'seed', difficulty: 3,
      note: '7月中に種をまくと、9〜10月にもう一度穫れます。春の株が終わった後の第二陣に。',
      steps: [
        { kind: 'sow', label: '直まき or ポットまき', from: [7, 1], to: [7, 3] },
        { kind: 'grow', label: '誘引・追肥', from: [7, 2], to: [9, 3] },
        { kind: 'harvest', label: '収穫', from: [8, 3], to: [10, 2] }
      ],
      days: 45
    }
  ],
  yieldNote: '1株から20〜40本',
  marketValue: 1500, valueUnit: '1株あたり',
  water: '【毎日】キュウリの実は95%が水。夏は朝夕2回必要な日もあります。',
  fert: '実がつき始めたら2週おきに必ず追肥。切らすと即「曲がり果」になります。',
  keys: [
    '接ぎ木苗を選ぶ。これだけで失敗率が半減します',
    '支柱＋ネットで立体栽培。地面を這わせると病気が出ます',
    '株元から5節目までのわき芽と雌花はすべて取る（株を育てるため）',
    '実は18〜20cmで若採り。大きくすると株が一気に疲れて終わります',
    'うどんこ病（葉の白い粉）は必ず出ます。見つけたら病葉を切り取り、風通しを確保'
  ],
  troubles: [
    { name: '実が曲がる・先細り', sign: '奇形果', cause: '水不足・肥料切れ・株の疲れ', fix: '水と追肥。曲がっても味は同じなので食べられます。' },
    { name: '葉が白い粉をふく', sign: 'うどんこ病', cause: '乾燥・風通し不良', fix: '病葉を除去。重曹スプレーや専用薬剤。放置すると株全体に広がります。' },
    { name: '葉に黄色い角ばった斑点', sign: 'べと病', cause: '多湿・梅雨', fix: '下葉を整理して風通しを。窒素過多も原因。' },
    { name: '急に株全体がしおれる', sign: 'つる割病', cause: 'ウリ科の連作', fix: '接ぎ木苗の使用と3年の輪作で予防。' }
  ],
  companions: ['ネギ（つる割病を抑える）'],
  tip: 'キュウリは短命なので「7月に2株目の種をまく」ずらし栽培で、秋まで途切れず穫れます。'
},

/* ---------------- エダマメ ---------------- */
{
  id: 'edamame', name: 'エダマメ', kana: 'えだまめ', family: 'マメ科', emoji: '🫛',
  category: '豆',
  difficulty: 2, beginner: 4, cost: 4, freshness: 5, speed: 4,
  place: ['plot'], sun: 'full',
  depth: 25,
  spacing: { plant: 25, row: 40 },
  perM2: 12,
  stdQty: 15,   // 2人家族の目安株数
  summary: '「収穫して3時間以内が最高」と言われる、鮮度がすべての野菜。自分で作る意味が最も大きい。',
  whyGood: 'スーパーの枝豆とは完全に別物の甘さ。収穫までが早く（80〜90日）、根粒菌が土を肥やすので跡地の野菜がよく育つ、輪作上も価値の高い作物です。',
  plans: [
    {
      id: 'spring-seed', label: '春まき【最推奨】', start: 'seed', difficulty: 2,
      note: '4月中旬〜6月まき。ずらしてまくと収穫が続きます。',
      steps: [
        { kind: 'sow', label: '種まき（1ヶ所3粒・鳥よけ必須）', from: [4, 2], to: [6, 2] },
        { kind: 'grow', label: '間引き・土寄せ・追肥', from: [5, 1], to: [7, 2] },
        { kind: 'harvest', label: '収穫（さやが膨らんだ数日が勝負）', from: [7, 1], to: [9, 1] }
      ],
      days: 85
    },
    {
      id: 'spring-seedling', label: '春・苗から', start: 'seedling', difficulty: 1,
      note: '鳥に種を食べられる心配がなく、確実。4〜5月にポット苗が出回ります。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [4, 3], to: [6, 1] },
        { kind: 'grow', label: '土寄せ・追肥', from: [5, 1], to: [7, 2] },
        { kind: 'harvest', label: '収穫', from: [7, 1], to: [8, 3] }
      ],
      days: 70
    }
  ],
  yieldNote: '1株から30〜50さや。4株で1〜2回のビール分',
  marketValue: 250, valueUnit: '1株あたり',
  water: 'さやが膨らむ時期に水切れさせると実が入りません。ここだけは要注意。',
  fert: '【少なめ】根粒菌が窒素を作るので、窒素肥料が多いと葉ばかり茂って実がつきません。',
  keys: [
    '【鳥対策】まいた豆はハトに掘り返されます。発芽まで不織布か防虫ネットを必ずかける',
    '1ヶ所に3粒まき、発芽後2本立ちに（1本より2本のほうが実付きが良い）',
    '本葉5枚頃に株元に土を寄せると、倒れにくく根張りが良くなります',
    'さやを押して豆がぷりっと弾力を持ったら収穫。数日で味が落ちるので見極めが重要',
    'カメムシがさやの汁を吸うと実が入りません。開花期は要チェック'
  ],
  troubles: [
    { name: 'さやが空・実が入らない', sign: 'ぺったんこ', cause: 'カメムシの吸汁／開花期の水不足／窒素過多', fix: '開花期に水をたっぷり。カメムシは捕殺かネット。' },
    { name: '発芽しない', sign: '種が消えている', cause: '鳥に食べられた', fix: 'まいた直後からネット。ポット育苗にするのが確実。' },
    { name: '葉が茂るだけ', sign: '花が少ない', cause: '窒素過多', fix: '追肥を控える。マメ科に肥料はほぼ不要。' }
  ],
  companions: ['ニンジン', 'トウモロコシ'],
  tip: '収穫は食べる直前に。お湯を沸かしてから穫りに行くのが、家庭菜園ならではの贅沢です。'
},

/* ---------------- オクラ ---------------- */
{
  id: 'okra', name: 'オクラ', kana: 'おくら', family: 'アオイ科', emoji: '🌶️',
  category: '果菜',
  difficulty: 2, beginner: 4, cost: 4, freshness: 5, speed: 3,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 30, row: 60 },
  perM2: 6,
  stdQty: 3,   // 2人家族の目安株数
  summary: '猛暑が大好き。真夏に他の野菜が弱る中、毎日1本ずつ穫れ続けます。花もきれい。',
  whyGood: '高温乾燥に強く、真夏に水やりを多少サボっても平気。7月〜10月の長期間穫れ、上へ伸びるので畝の幅を取らないのも利点。',
  plans: [
    {
      id: 'spring-seed', label: '春まき【推奨】', start: 'seed', difficulty: 2,
      note: '【重要】地温が十分上がる5月中旬以降にまく。早まきは発芽不良の最大要因。',
      steps: [
        { kind: 'sow', label: '種まき（一晩浸水させてから）', from: [5, 2], to: [6, 2] },
        { kind: 'grow', label: '間引き・追肥・下葉かき', from: [6, 1], to: [9, 2] },
        { kind: 'harvest', label: '収穫（毎日）', from: [7, 1], to: [10, 1] }
      ],
      days: 60
    },
    {
      id: 'spring-seedling', label: '春・苗から', start: 'seedling', difficulty: 2,
      note: 'オクラは移植を嫌うので、根を崩さずそっと植えること。',
      steps: [
        { kind: 'plant', label: '苗の植付け（根鉢を崩さない）', from: [5, 2], to: [6, 2] },
        { kind: 'grow', label: '追肥・下葉かき', from: [6, 1], to: [9, 2] },
        { kind: 'harvest', label: '収穫', from: [7, 1], to: [10, 1] }
      ],
      days: 50
    }
  ],
  yieldNote: '1株から30〜50本',
  marketValue: 800, valueUnit: '1株あたり',
  water: '乾燥に強いが、実がつき始めたらしっかり与える。',
  fert: '2〜3週おきに追肥。',
  keys: [
    '種は硬いので一晩水に浸けてからまくと発芽が揃います',
    '1ヶ所に3〜4粒まき、2本立ちにすると生育がゆるやかになり、実が硬くなりにくい',
    '【収穫】7〜8cmで穫る。1日遅れると硬くて食べられません。夏は毎日チェック',
    '収穫した実の下の葉は取り除く（風通しと日当たりの確保）'
  ],
  troubles: [
    { name: '実が硬い', sign: '包丁が入らない', cause: '収穫遅れ', fix: '7〜8cmで穫る。夏は成長が早く1日で大きくなります。' },
    { name: '発芽しない', sign: '種が腐る', cause: '地温不足（早まき）', fix: '5月中旬以降、地温20℃以上を待つ。' },
    { name: '葉裏に小さな虫', sign: 'アブラムシ・フタトガリコヤガ', cause: '', fix: '数が少なければ捕殺で十分。' }
  ],
  companions: [],
  tip: '花は一日花で、ハイビスカスに似た美しい黄色。畝の端に1株あると畑が華やぎます。'
},

/* ---------------- ゴーヤ ---------------- */
{
  id: 'goya', name: 'ゴーヤ（ニガウリ）', kana: 'ごーや', family: 'ウリ科', emoji: '🥒',
  category: '果菜',
  difficulty: 2, beginner: 4, cost: 3, freshness: 3, speed: 3,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 50, row: 90 },
  perM2: 2,
  stdQty: 1,   // 2人家族の目安株数
  summary: '「緑のカーテン」として日よけになり、実も穫れる一石二鳥。ウリ科では最も丈夫。',
  whyGood: '病害虫に非常に強く、暑さで枯れることもほぼない。ウリ科では最も丈夫で、支柱とネットさえ立てれば放任でよく穫れます。',
  plans: [
    {
      id: 'spring-seedling', label: '春・苗から【推奨】', start: 'seedling', difficulty: 2,
      steps: [
        { kind: 'plant', label: '苗の定植', from: [5, 1], to: [5, 3] },
        { kind: 'grow', label: 'ネット誘引・摘心・追肥', from: [5, 2], to: [8, 3] },
        { kind: 'harvest', label: '収穫', from: [7, 1], to: [9, 3] }
      ],
      days: 55
    },
    {
      id: 'spring-seed', label: '春・種から', start: 'seed', difficulty: 3,
      note: '種の皮が非常に硬い。先端を爪切りで少し削り、一晩浸水させると発芽率が上がります。',
      steps: [
        { kind: 'sow', label: 'ポットに種まき（皮を削って浸水）', from: [4, 2], to: [5, 2] },
        { kind: 'nursery', label: '育苗（30日）', from: [4, 3], to: [6, 1] },
        { kind: 'plant', label: '定植', from: [5, 2], to: [6, 1] },
        { kind: 'grow', label: '誘引・摘心・追肥', from: [5, 3], to: [8, 3] },
        { kind: 'harvest', label: '収穫', from: [7, 2], to: [9, 3] }
      ],
      days: 90
    }
  ],
  yieldNote: '1株から15〜30本',
  marketValue: 2000, valueUnit: '1株あたり',
  water: '夏は毎日たっぷり。カーテンにするなら水切れ厳禁。',
  fert: '2〜3週おきに追肥。',
  keys: [
    '本葉5〜6枚で先端を摘む（摘心）。子づる・孫づるに実がつくので、摘心しないと収量が激減します',
    'ネットは目の粗いもの（10cm角）を、壁から10cm離して張る',
    '実は緑のうちに収穫。オレンジ色に熟すと弾けて中の赤い種が出ます（この種は甘くて食べられます）',
    'つるが茂りすぎたら間引いて風を通す'
  ],
  troubles: [
    { name: '実がつかない', sign: '雄花ばかり', cause: '摘心していない・肥料過多', fix: '摘心して子づるを伸ばす。雌花が咲かない場合は追肥を控える。' },
    { name: '実がすぐ黄色くなる', sign: '完熟', cause: '収穫遅れ', fix: '濃い緑でイボが張っているうちに穫る。' }
  ],
  companions: [],
  tip: '実は食べきれないほど穫れます。薄切りにして冷凍しておくと、夏の間ずっと使えます。'
},

/* ---------------- インゲン ---------------- */
{
  id: 'ingen', name: 'インゲン（つるなし）', kana: 'いんげん', family: 'マメ科', emoji: '🫛',
  category: '豆',
  difficulty: 1, beginner: 5, cost: 4, freshness: 4, speed: 5,
  place: ['plot'], sun: 'full',
  depth: 25,
  spacing: { plant: 25, row: 40 },
  perM2: 12,
  stdQty: 8,   // 2人家族の目安株数
  summary: 'まいて50〜60日で穫れる「三度豆」。つるなし種なら支柱もいらず、狭い場所の隙間作物に最適。',
  whyGood: '生育が非常に早く、春・夏・秋と年3回作れます（関西で「三度豆」と呼ばれる由来）。空いた区画にすぐ入れられる便利な作物。',
  plans: [
    {
      id: 'spring', label: '春まき【推奨】', start: 'seed', difficulty: 1,
      steps: [
        { kind: 'sow', label: '種まき（1ヶ所3粒）', from: [4, 3], to: [6, 1] },
        { kind: 'grow', label: '間引き・追肥', from: [5, 1], to: [7, 1] },
        { kind: 'harvest', label: '収穫', from: [6, 2], to: [7, 3] }
      ],
      days: 55
    },
    {
      id: 'summer', label: '夏まき（秋どり）', start: 'seed', difficulty: 2,
      note: '8月上旬にまくと、9月下旬〜10月に穫れます。夏野菜の跡地の穴埋めに最適。',
      steps: [
        { kind: 'sow', label: '種まき', from: [7, 3], to: [8, 3] },
        { kind: 'grow', label: '間引き・追肥', from: [8, 2], to: [9, 3] },
        { kind: 'harvest', label: '収穫', from: [9, 2], to: [10, 3] }
      ],
      days: 55
    }
  ],
  yieldNote: '1株から30〜50さや',
  marketValue: 300, valueUnit: '1株あたり',
  water: '開花〜さや肥大期は水を切らさない。',
  fert: 'マメ科なので控えめ。追肥は1回程度。',
  keys: [
    '鳥に種を食べられるので発芽までネットをかける',
    '1ヶ所3粒まき、2本立ちに',
    'さやが12〜13cm、中の豆が膨らむ前に収穫。遅れるとすじが硬くなります',
    '収穫が始まったら2〜3日おきにこまめに穫る。穫るほど次が着きます'
  ],
  troubles: [
    { name: 'さやが硬い・すじっぽい', sign: '豆が膨らんでいる', cause: '収穫遅れ', fix: '若採り。2〜3日おきにチェック。' },
    { name: '葉が黄色くなり枯れる', sign: '下葉から', cause: '高温・水不足', fix: '真夏は敷きわらで地温を下げる。' }
  ],
  companions: ['トウモロコシ', 'ニンジン'],
  tip: '「区画が2ヶ月だけ空く」というときの穴埋めに最強。土も肥やしてくれるので次の作物にも good。'
},

/* ---------------- スナップエンドウ ---------------- */
{
  id: 'snappea', name: 'スナップエンドウ・絹さや', kana: 'すなっぷえんどう', family: 'マメ科', emoji: '🫛',
  category: '豆',
  difficulty: 2, beginner: 4, cost: 5, freshness: 5, speed: 1,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 30, row: 60 },
  perM2: 6,
  stdQty: 6,   // 2人家族の目安株数
  summary: '秋にまいて小さな苗で冬を越し、春に大収穫。冬の畑を有効活用できる高コスパ作物。',
  whyGood: 'スナップエンドウは100g250円前後と高価な野菜。1株から50〜80さや穫れ、採れたての甘さは市販品を圧倒します。冬の間ほぼ何もしなくてよいのも利点。',
  plans: [
    {
      id: 'autumn-seed', label: '秋まき（越冬）【最推奨】', start: 'seed', difficulty: 2,
      note: '【最重要】10月下旬〜11月中旬にまく。早まきすると株が大きくなりすぎて寒害で枯れます。',
      steps: [
        { kind: 'sow', label: '種まき（1ヶ所3〜4粒）', from: [10, 3], to: [11, 2] },
        { kind: 'grow', label: '越冬（草丈10cm程度で冬を越す）', from: [12, 1], to: [2, 3] },
        { kind: 'grow', label: '支柱・ネット設置・追肥', from: [3, 1], to: [4, 2] },
        { kind: 'harvest', label: '収穫', from: [4, 2], to: [6, 1] }
      ],
      days: 180
    },
    {
      id: 'spring-seed', label: '春まき', start: 'seed', difficulty: 3,
      note: '2月下旬〜3月上旬まき。収量は秋まきに劣りますが、まき遅れた年の保険になります。',
      steps: [
        { kind: 'sow', label: '種まき', from: [2, 3], to: [3, 2] },
        { kind: 'grow', label: '支柱・追肥', from: [3, 3], to: [5, 1] },
        { kind: 'harvest', label: '収穫', from: [5, 1], to: [6, 2] }
      ],
      days: 90
    },
    {
      id: 'autumn-seedling', label: '秋・苗から', start: 'seedling', difficulty: 2,
      note: '11月にポット苗が出回ります。まき遅れたときの選択肢。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [11, 1], to: [11, 3] },
        { kind: 'grow', label: '越冬・支柱・追肥', from: [12, 1], to: [4, 2] },
        { kind: 'harvest', label: '収穫', from: [4, 2], to: [6, 1] }
      ],
      days: 165
    }
  ],
  yieldNote: '1株から50〜80さや',
  marketValue: 700, valueUnit: '1株あたり',
  water: '冬は控えめ。春の開花期以降はしっかり。',
  fert: '元肥は控えめ（窒素過多は禁物）。春に追肥1〜2回。',
  keys: [
    '【まき時厳守】早すぎる種まきが最大の失敗要因。内陸では11月上旬が安心',
    '越冬時の草丈は10〜15cm（本葉2〜3枚）が理想。大きすぎると凍害を受けます',
    '冬の間は敷きわらや不織布で株元を守る',
    '3月に草丈が伸び始めたら、すぐに180cm以上の支柱とネットを立てる（伸びるのが非常に早い）',
    'エンドウは連作障害が特に強い。4〜5年は同じ場所に植えないこと',
    '収穫はさやがぷっくり膨らみ、豆の形が見えてきた頃。絹さやは薄いうちに'
  ],
  troubles: [
    { name: '冬に枯れる', sign: '越冬失敗', cause: 'まき時が早すぎて株が大きくなりすぎた', fix: '10月下旬〜11月中旬を厳守。' },
    { name: '葉が白い粉をふく', sign: 'うどんこ病', cause: '春の乾燥・密植', fix: '風通しを確保。収穫後半に出やすいが、収穫は続けられます。' },
    { name: '芽が出ない・株が消える', sign: '発芽不良', cause: '鳥の食害・連作障害', fix: '発芽までネット。4年空けた場所に植える。' }
  ],
  companions: [],
  tip: '9月に畑を始めるなら、11月のエンドウまきは必ず予定に入れてください。冬の間場所を取るだけで、春に大きな見返りがあります。'
},

/* ---------------- ソラマメ ---------------- */
{
  id: 'soramame', name: 'ソラマメ', kana: 'そらまめ', family: 'マメ科', emoji: '🫘',
  category: '豆',
  difficulty: 3, beginner: 3, cost: 5, freshness: 5, speed: 1,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 40, row: 70 },
  perM2: 4,
  stdQty: 6,   // 2人家族の目安株数
  summary: '採れたてを焼いて食べる味は、家庭菜園でしか味わえないもの。ただしアブラムシとの戦いがあります。',
  whyGood: 'スーパーでさや付き5本300円ほどの高級野菜。「収穫して3日で味が落ちる」ため、自作の価値が非常に高い。冬の畑を使える点も◎。',
  plans: [
    {
      id: 'autumn-seed', label: '秋まき（越冬）【推奨】', start: 'seed', difficulty: 3,
      note: '10月中旬〜11月上旬まき。エンドウ同様、早まき厳禁。',
      steps: [
        { kind: 'sow', label: '種まき（お歯黒を斜め下に、頭を出して）', from: [10, 2], to: [11, 1] },
        { kind: 'grow', label: '越冬（本葉5〜6枚で冬越し）', from: [12, 1], to: [2, 3] },
        { kind: 'grow', label: '整枝（6〜7本に）・支柱・追肥・摘心', from: [3, 1], to: [4, 3] },
        { kind: 'harvest', label: '収穫', from: [5, 1], to: [6, 1] }
      ],
      days: 200
    },
    {
      id: 'autumn-seedling', label: '秋・苗から', start: 'seedling', difficulty: 2,
      note: '11月にポット苗が出回ります。発芽の失敗がなく確実。',
      steps: [
        { kind: 'plant', label: '苗の植付け', from: [11, 1], to: [11, 3] },
        { kind: 'grow', label: '越冬・整枝・支柱・追肥', from: [12, 1], to: [4, 3] },
        { kind: 'harvest', label: '収穫', from: [5, 1], to: [6, 1] }
      ],
      days: 180
    }
  ],
  yieldNote: '1株から20〜30さや',
  marketValue: 900, valueUnit: '1株あたり',
  water: '冬は控えめ、春は普通に。',
  fert: '元肥は控えめ。春に追肥1〜2回。',
  keys: [
    '種は「お歯黒（黒い筋）」を斜め下に向け、頭を少し地上に出して植える。全部埋めると腐ります',
    '越冬時は本葉5〜6枚が理想。大きすぎると寒害を受けます',
    '春に枝が10本以上出るので、太い6〜7本を残して他を株元から切る',
    '【アブラムシ】4月に先端に真っ黒に群がります。草丈70cmで先端を摘む（摘心）とアブラムシごと除去でき、実の太りも良くなる一石二鳥',
    'さやが下を向き、背中に黒い筋が出て光沢が出たら収穫適期'
  ],
  troubles: [
    { name: '新芽が真っ黒', sign: 'アブラムシの大群', cause: '春の生育期', fix: '先端を摘心して処分。シルバーマルチも有効。' },
    { name: '冬に枯れる', sign: '越冬失敗', cause: '早まきで大きくなりすぎた', fix: '10月中旬〜11月上旬まきを厳守。' },
    { name: 'さやが上を向いたまま', sign: '未熟', cause: '収穫が早い', fix: 'さやが下を向いてから穫る。' }
  ],
  companions: [],
  tip: '「そら豆は3日で味が落ちる」。収穫後すぐさやごと焼くのが最高の食べ方です。'
},

/* ---------------- イチゴ ---------------- */
{
  id: 'strawberry', name: 'イチゴ', kana: 'いちご', family: 'バラ科', emoji: '🍓',
  category: '果菜',
  difficulty: 3, beginner: 3, cost: 3, freshness: 5, speed: 1,
  place: ['plot'], sun: 'full',
  depth: 20,
  spacing: { plant: 25, row: 40 },
  perM2: 10,
  stdQty: 6,   // 2人家族の目安株数
  summary: '10月に苗を植えて冬を越し、4〜5月に収穫。収量は多くありませんが、育てる楽しさは随一。',
  whyGood: '食費への貢献は小さめですが、完熟イチゴの味と、子どもや来客の喜びが大きい作物。冬の間ほぼ手がかからないのも利点。',
  plans: [
    {
      id: 'autumn-seedling', label: '秋・苗から【唯一の実用ルート】', start: 'seedling', difficulty: 3,
      note: '9月下旬〜10月に苗を植える。11月以降だと根張りが不十分で春の収量が落ちます。',
      steps: [
        { kind: 'plant', label: '苗の植付け（クラウンを埋めない）', from: [9, 3], to: [11, 1] },
        { kind: 'grow', label: '越冬（枯れ葉取り）', from: [12, 1], to: [2, 3] },
        { kind: 'grow', label: '追肥・マルチ・人工授粉', from: [3, 1], to: [4, 3] },
        { kind: 'harvest', label: '収穫', from: [4, 2], to: [6, 1] },
        { kind: 'grow', label: 'ランナーから子株を取って翌年用の苗作り', from: [6, 1], to: [8, 3] }
      ],
      days: 210
    }
  ],
  yieldNote: '1株から15〜30個',
  marketValue: 500, valueUnit: '1株あたり',
  water: '冬も乾かさない程度に。実がつく時期は多めに。',
  fert: '元肥＋2月と3月の追肥。窒素過多は葉ばかり茂ります。',
  keys: [
    '【最重要】苗の「クラウン（株元の王冠状の部分）」を絶対に土に埋めない。埋めると腐ります',
    '苗の「ランナー（親株とつながっていた跡）」の反対側に実がつくので、ランナー跡を通路側に向けて植える',
    '冬に枯れた下葉はこまめに取る（病気予防）',
    '3月に敷きわらか黒マルチ。実が土に触れると腐ります',
    '春の開花時、虫が少ない年は筆で花の中心をなでて人工授粉すると、形の良い実になります',
    '収穫後、ランナーから出た子株の「2番目・3番目」を来年の苗に（1番目は親の病気を受け継ぎやすい）'
  ],
  troubles: [
    { name: '実が変形する', sign: 'いびつな形', cause: '受粉ムラ', fix: '筆で人工授粉。訪花昆虫が少ない時期は特に有効。' },
    { name: '実が白いまま・腐る', sign: 'カビ', cause: '灰色かび病・実が土に接触', fix: 'マルチを敷き、傷んだ実は即除去。' },
    { name: '株が枯れる', sign: '越冬失敗', cause: 'クラウンを埋めた・水切れ', fix: '浅植えを徹底。冬も完全乾燥は避ける。' }
  ],
  companions: ['ニンニク（病気予防）', 'ボリジ（受粉を助ける）'],
  tip: '毎年苗を買うと高くつきますが、6月にランナーから子株を取れば翌年の苗が無料で作れます。ここまでやると本格派。'
},

/* ---------------- ズッキーニ ---------------- */
{
  id: 'zucchini', name: 'ズッキーニ', kana: 'ずっきーに', family: 'ウリ科', emoji: '🥒',
  category: '果菜',
  difficulty: 2, beginner: 4, cost: 5, freshness: 4, speed: 4,
  place: ['plot'], sun: 'full',
  depth: 30,
  spacing: { plant: 80, row: 100 },
  perM2: 1,
  stdQty: 1,   // 2人家族の目安株数
  summary: '1株から15〜25本。1本150〜200円する野菜が、6〜7月に毎日のように穫れます。',
  whyGood: 'つるが伸びずコンパクト（ただし葉は大きい）。生育が早く、植えて1ヶ月半で穫れ始めます。金額効率は夏野菜でもトップクラス。',
  plans: [
    {
      id: 'spring-seedling', label: '春・苗から【推奨】', start: 'seedling', difficulty: 2,
      steps: [
        { kind: 'plant', label: '苗の定植', from: [4, 3], to: [5, 2] },
        { kind: 'grow', label: '下葉かき・人工授粉・追肥', from: [5, 2], to: [7, 2] },
        { kind: 'harvest', label: '収穫', from: [6, 1], to: [7, 3] }
      ],
      days: 45
    },
    {
      id: 'spring-seed', label: '春・種から', start: 'seed', difficulty: 2,
      steps: [
        { kind: 'sow', label: 'ポットに種まき', from: [4, 1], to: [4, 3] },
        { kind: 'nursery', label: '育苗（25日）', from: [4, 2], to: [5, 2] },
        { kind: 'plant', label: '定植', from: [4, 3], to: [5, 2] },
        { kind: 'grow', label: '管理・追肥', from: [5, 2], to: [7, 2] },
        { kind: 'harvest', label: '収穫', from: [6, 1], to: [7, 3] }
      ],
      days: 75
    }
  ],
  yieldNote: '1株から15〜25本',
  marketValue: 3000, valueUnit: '1株あたり',
  water: '実の肥大期はたっぷり。',
  fert: '2週おきに追肥。',
  keys: [
    '葉が非常に大きいので、1株あたり1m²近い場所を見込む。狭い畑なら1株が限度',
    '朝、雄花を摘んで雌花にこすりつける人工授粉をすると確実',
    '開花から1週間、長さ20cmで収穫。大きくすると味が落ち、株も疲れます',
    '古い下葉は切り取って風通しを確保。うどんこ病の予防になります'
  ],
  troubles: [
    { name: '実が大きくならず腐る', sign: '実の先が黄色く萎む', cause: '受粉不良', fix: '朝のうちに人工授粉。' },
    { name: '葉が白い粉', sign: 'うどんこ病', cause: '梅雨明けの乾燥', fix: '下葉を整理。7月には株が終わるので割り切ることも可。' }
  ],
  companions: [],
  tip: '「場所を取るが金額効率は最高」。狭い畑では悩ましい存在ですが、1株入れると食卓のインパクトは大きいです。'
}

);
