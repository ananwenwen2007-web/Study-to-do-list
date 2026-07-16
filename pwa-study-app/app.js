// ===== 学习助手 PWA - 核心逻辑 =====

// ===== 数据存储 =====
const Store = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem('study_app_' + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch { return defaultValue; }
  },
  set(key, value) {
    localStorage.setItem('study_app_' + key, JSON.stringify(value));
  },
  getTasks() { return this.get('tasks', []); },
  saveTasks(tasks) { this.set('tasks', tasks); },
  getPoints() { return this.get('points', []); },
  savePoints(points) { this.set('points', points); },
  getPhotos() { return this.get('photos', {}); },
  savePhotos(photos) { this.set('photos', photos); },
};

// ===== TTS语音播报 =====
function speak(text, lang, onEnd) {
  if (!window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang || 'zh-CN';
  utterance.rate = 0.85;
  utterance.pitch = 1;
  utterance.onend = function() { if (onEnd) onEnd(); };
  utterance.onerror = function() { if (onEnd) onEnd(); };
  window.speechSynthesis.speak(utterance);
}


// ===== 工具函数 =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== 教材数据 =====
const TEXTBOOK_DATA = {
  english: {
    '译林版': {
      '七年级上': {
        'Unit 1 This is me!': {
          words: [
            { word: 'master', phonetic: '/ˈmɑːstə(r)/', meaning: '主人；大师' },
            { word: 'grade', phonetic: '/ɡreɪd/', meaning: '年级' },
            { word: 'student', phonetic: '/stjuːdnt/', meaning: '学生' },
            { word: 'reading', phonetic: '/ˈriːdɪ/', meaning: '阅读' },
            { word: 'classmate', phonetic: '/ˈklɑːsmeɪt/', meaning: '同班同学' },
            { word: 'after', phonetic: '/ˈɑːftə(r)/', meaning: '在……之后' },
            { word: 'slim', phonetic: '/slɪm/', meaning: '苗条的' },
            { word: 'over', phonetic: '/ˈəʊvə(r)/', meaning: '超过；在……上方' },
            { word: 'walking', phonetic: '/ˈwɔkɪ/', meaning: '步行' },
            { word: 'really', phonetic: '/riːəli/', meaning: '的确；确实' },
          ]
        },
        'Unit 2 Let\'s play sports!': {
          words: [
            { word: 'sports', phonetic: '/spɔːts/', meaning: '运动' },
            { word: 'really', phonetic: '/ˈriːəli/', meaning: '的确；确实' },
            { word: 'bowl', phonetic: '/bəʊl/', meaning: '碗' },
            { word: 'time', phonetic: '/taɪm/', meaning: '次；回' },
            { word: 'tennis', phonetic: '/ˈtenɪs/', meaning: '网球' },
            { word: 'volleyball', phonetic: '/ˈvɒlibɔːl/', meaning: '排球' },
            { word: 'enjoy', phonetic: '/ɪnˈdʒɔɪ/', meaning: '享受……的乐趣' },
            { word: 'club', phonetic: '/klʌb/', meaning: '俱乐部' },
            { word: 'free', phonetic: '/friː/', meaning: '空闲的' },
            { word: 'dream', phonetic: '/driːm/', meaning: '梦想' },
          ]
        },
        'Unit 3 Welcome to our school!': {
          words: [
            { word: 'which', phonetic: '/wɪtʃ/', meaning: '哪一个' },
            { word: 'building', phonetic: '/ˈbɪldɪŋ/', meaning: '建筑物' },
            { word: 'field', phonetic: '/fiːld/', meaning: '场地' },
            { word: 'library', phonetic: '/ˈlaɪbrəri/', meaning: '图书馆' },
            { word: 'only', phonetic: '/ˈəʊnli/', meaning: '只；只有' },
            { word: 'gate', phonetic: '/ɡeɪt/', meaning: '大门' },
            { word: 'bright', phonetic: '/braɪt/', meaning: '明亮的' },
            { word: 'modern', phonetic: '/ˈmɒdn/', meaning: '现代的' },
            { word: 'hall', phonetic: '/hɔl/', meaning: '大厅' },
            { word: 'diary', phonetic: '/ˈdaɪəri/', meaning: '日记' },
          ]
        },
        'Unit 4 My day': {
          words: [
            { word: 'wake', phonetic: '/weɪk/', meaning: '醒；唤醒' },
            { word: 'morning', phonetic: '/ˈmɔːnɪŋ/', meaning: '早晨' },
            { word: 'hill', phonetic: '/hɪl/', meaning: '小山' },
            { word: 'seldom', phonetic: '/ˈseldəm/', meaning: '很少' },
            { word: 'out', phonetic: '/aʊt/', meaning: '出来' },
            { word: 'need', phonetic: '/niːd/', meaning: '需要' },
            { word: 'rest', phonetic: '/rest/', meaning: '休息' },
            { word: 'once', phonetic: '/wʌns/', meaning: '一次' },
            { word: 'activity', phonetic: '/ækˈtɪvəti/', meaning: '活动' },
            { word: 'homework', phonetic: '/həʊmwɜːk/', meaning: '家庭作业' },
          ]
        },
      },
      '七年级下': {
        'Unit 1 Dream homes': {
          words: [
            { word: 'next', phonetic: '/nekst/', meaning: '下一个' },
            { word: 'town', phonetic: '/taʊn/', meaning: '城镇' },
            { word: 'capital', phonetic: '/ˈkæpɪtl/', meaning: '首都' },
            { word: 'balcony', phonetic: '/ˈbælkəni/', meaning: '阳台' },
            { word: 'share', phonetic: '/ʃeə(r)/', meaning: '分享' },
            { word: 'bedroom', phonetic: '/bedruːm/', meaning: '卧室' },
            { word: 'own', phonetic: '/əʊn/', meaning: '自己的' },
            { word: 'bathroom', phonetic: '/ˈbɑːθruːm/', meaning: '浴室' },
            { word: 'kitchen', phonetic: '/ˈkɪtʃɪn/', meaning: '厨房' },
            { word: 'garden', phonetic: '/ˈɡɑːdn/', meaning: '花园' },
          ]
        },
        'Unit 2 Neighbours': {
          words: [
            { word: 'neighbour', phonetic: '/ˈneɪbə(r)/', meaning: '邻居' },
            { word: 'welcome', phonetic: '/ˈwelkəm/', meaning: '欢迎' },
            { word: 'skill', phonetic: '/skɪl/', meaning: '技能' },
            { word: 'helpful', phonetic: '/ˈhelpfl/', meaning: '有帮助的' },
            { word: 'community', phonetic: '/kəˈmjuːnəti/', meaning: '社区' },
            { word: 'problem', phonetic: '/prɒbləm/', meaning: '问题' },
            { word: 'something', phonetic: '/ˈsʌmθŋ/', meaning: '某事' },
            { word: 'engineer', phonetic: '/ˌendʒɪˈnɪə(r)/', meaning: '工程师' },
            { word: 'check', phonetic: '/tʃek/', meaning: '检查' },
            { word: 'lucky', phonetic: '/ˈlʌki/', meaning: '幸运的' },
          ]
        },
      }
    }
  },
  chinese: {
    '人教版': {
      '七年级上': {
        '《春》朱自清': {
          reading: '盼望着，盼望着，东风来了，春天的脚步近了。\n\n一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。\n\n小草偷偷地从土里钻出来，嫩嫩的，绿绿的。园子里，田野里，瞧去，一大片一大片满是的。坐着，躺着，打两个滚，踢几脚球，赛几趟跑，捉几回迷藏。风轻悄悄的，草软绵绵的。\n\n桃树、杏树、梨树，你不让我，我不让你，都开满了花赶趟儿。红的像火，粉的像霞，白的像雪。花里带着甜味儿；闭了眼，树上仿佛已经满是桃儿、杏儿、梨儿。花下成千成百的蜜蜂嗡嗡地闹着，大小的蝴蝶飞来飞去。野花遍地是：杂样儿，有名字的，没名字的，散在草丛里，像眼睛，像星星，还眨呀眨的。\n\n"吹面不寒杨柳风"，不错的，像母亲的手抚摸着你。风里带来些新翻的泥土的气息，混着青草味儿，还有各种花的香，都在微微润湿的空气里酝酿。鸟儿将窠巢安在繁花嫩叶当中，高兴起来了，呼朋引伴地卖弄清脆的喉咙，唱出宛转的曲子，与轻风流水应和着。牛背上牧童的短笛，这时候也成天在嘹亮地响。\n\n雨是最寻常的，一下就是三两天。可别恼。看，像牛毛，像花针，像细丝，密密地斜织着，人家屋顶上全笼着一层薄烟。树叶子却绿得发亮，小草也青得逼你的眼。傍晚时候，上灯了，一点点黄晕的光，烘托出一片安静而和平的夜。乡下去，小路上，石桥边，有撑起伞慢慢走着的人；地里还有工作的农夫，披着蓑，戴着笠的。他们的草屋，稀稀疏疏的，在雨里静默着。\n\n天上风筝渐渐多了，地上孩子也多了。城里乡下，家家户户，老老小小，他们也赶趟儿似的，一个个都出来了。舒活舒活筋骨，抖擞抖擞精神，各做各的一份事去。"一年之计在于春"，刚起头儿，有的是工夫，有的是希望。\n\n春天像刚落地的娃娃，从头到脚都是新的，他生长着。\n\n春天像小姑娘，花枝招展的，笑着，走着。\n\n春天像健壮的青年，有铁一般的胳膊和腰脚，他领着我们上前去。'
        },
        '《济南的冬天》老舍': {
          reading: '对于一个在北平住惯的人，像我，冬天要是不刮风，便觉得是奇迹；济南的冬天是没有风声的。对于一个刚由伦敦回来的人，像我，冬天要能看得见日光，便觉得是怪事；济南的冬天是响晴的。自然，在热带的地方，日光是永远那么毒，响亮的天气反有点叫人害怕。可是，在北中国的冬天，而能有温晴的天气，济南真得算个宝地。\n\n设若单单是有阳光，那也算不了出奇。请闭上眼睛想：一个老城，有山有水，全在天底下晒着阳光，暖和安适地睡着，只等春风来把它们唤醒，这是不是个理想的境界？小山整把济南围了个圈儿，只有北边缺着点口儿。这一圈小山在冬天特别可爱，好像是把济南放在一个小摇篮里，它们全安静不动地低声地说："你们放心吧，这儿准保暖和。"真的，济南的人们在冬天是面上含笑的。他们一看那些小山，心中便觉得有了着落，有了依靠。他们由天上看到山上，便不觉地想起："明天也许就是春天了吧？这样的温暖，今天夜里山草也许就绿起来了吧？"就是这点幻想不能一时实现，他们也并不着急，因为有这样慈善的冬天，干啥还希望别的呢！\n\n最妙的是下点小雪呀。看吧，山上的矮松越发的青黑，树尖儿上顶着一髻儿白花，好像日本看护妇。山尖全白了，给蓝天镶上一道银边。山坡上，有的地方雪厚点，有的地方草色还露着，这样，一道儿白，一道儿暗黄，给山们穿上一件带水纹的花衣；看着看着，这件花衣好像被风儿吹动，叫你希望看见一点更美的山的肌肤。等到快日落的时候，微黄的阳光斜射在山腰上，那点薄雪好像忽然害了羞，微微露出点粉色。就是下小雪吧，济南是受不住大雪的，那些小山太秀气！\n\n古老的济南，城里那么狭窄，城外又那么宽敞，山坡上卧着些小村庄，小村庄的房顶上卧着点雪，对，这是张小水墨画，也许是唐代的名手画的吧。\n\n那水呢，不但不结冰，倒反在绿萍上冒着点热气，水藻真绿，把终年贮蓄的绿色全拿出来了。天儿越晴，水藻越绿，就凭这些绿的精神，水也不忍得冻上，况且那些长枝的垂柳还要在水里照个影儿呢！看吧，由澄清的河水慢慢往上看吧，空中，半空中，天上，自上而下全是那么清亮，那么蓝汪汪的，整个的是块空灵的蓝水晶。这块水晶里，包着红屋顶、黄草山，像地毯上的小团花的小灰色树影。\n\n这就是冬天的济南。'
        },
        '《雨的四季》刘湛秋': {
          reading: '我喜欢雨，无论什么季节的雨，我都喜欢。她给我的形象和记忆，永远是美的。\n\n春天，树叶开始闪出黄青，花苞轻轻地在风中摆动，似乎还带着一种冬天的昏黄。可是只要经过一场春雨的洗淋，那种颜色和神态是难以想像的。每一棵树仿佛都睁开特别明亮的眼睛，树枝的手臂也顿时柔软了，而那萌发的叶子，简直就像起伏着一层绿茵茵的波浪。水珠子从花苞里滴下来，比少女的眼泪还娇媚。半空中似乎总挂着透明的水雾的丝帘，牵动着阳光的彩棱镜。这时，整个大地是美丽的。小草似乎像复苏的蚯蚓一样翻动，发出一种春天才能听到的嗖嗖声。呼吸变得畅快，空气里像有无数芳甜的果子，在诱惑着鼻子和嘴唇。真的，只有这一场雨，才完全驱走了冬天，才使世界改变了姿容。\n\n而夏天，就更是别有一番风情了。夏天的雨也有夏天的性格，热烈而又粗犷。天上聚集几朵乌云，有时连一点雷的预告也没有，当你还来不及思索，豆粒大的雨点就打来了。可这时雨也并不可怕，因为你浑身的毛孔都热得张开了嘴，巴望着那清凉的甘露。打伞，戴斗笠，固然能保持住身上的干爽，可光头浇，洗个雨澡却更有滋味，只是淋湿的头发、额头、睫毛滴着水，挡着眼睛的视线，耳朵也有些痒嗦嗦的。这时，你会更喜欢一切。如果说，春雨给大地披上美丽的衣裳，而经过几场夏天的透雨的浇灌，大地就以自己的丰满而展示它全部的诱惑了。一切都毫不掩饰地敞开了。花朵怒放着，树叶鼓着浆汁，数不清的杂草争先恐后地成长，暑气被一片绿的海绵吸收着。而荷叶铺满了河面，迫不及待地等待着雨点，和远方的蝉声、近处的蛙鼓一起奏起了夏天的雨的交响曲。\n\n当田野上染上一层金黄，各种各样的果实摇着铃铛的时候，雨，似乎也像出嫁生了孩子的母亲，显得端庄而又沉思了。这时候，雨不大出门。田野上几乎总是金黄的太阳。也许，人们都忘记了雨。成熟的庄稼地等待收割，金灿灿的种子需要晒干，甚至红透了的山果也希望最后晒甜。忽然，在一个夜晚，窗玻璃上发出了响声，那是雨，是使人静谧、使人怀想、使人动情的秋雨啊！天空是暗的，但雨却闪着光；田野是静的，但雨在倾诉着。顿时，你会产生一脉悠远的情思。也许，在人们劳累了一个春夏，收获已经在大门口的时候，多么需要安静和沉思啊！雨变得更轻、也更深情了，水声在屋檐下，水花在窗玻璃上，会陪伴着你的夜梦。只有这秋雨，才洗净了大地，才使世界变得洁净。\n\n也许，到冬天来临，人们会讨厌雨吧！但这时候，雨已经化妆了，它经常变成美丽的雪花，飘然莅临人间。但在南国，雨仍然偶尔造访大地，但它变得更吝啬了。它既不倾盆瓢泼，又不绵绵如丝，或淅淅沥沥，它显出一种自然、平静。在冬日灰蒙蒙的天空中，雨变得透明，甚至有些干巴，几乎没有春、夏、秋那样富有色彩。但是，在人们受够了冷冽的风的时候，这雨便显得极其珍贵。当雨在头顶上飘落的时候，似乎又降临了一种特殊的温暖，仿佛从那湿润中又漾出花和树叶的气息。那种清冷是柔和的，没有北风那样咄咄逼人。远远地望过去，收割过的田野变得很亮，没有叶的枝干、淋着雨的草垛，对着瓷色的天空，像一幅干净利落的木刻。而近处池畦里的油菜，经这冬雨一洗，甚至忘记了严冬。忽然到了晚间，水银柱降下来，黎明提前敲着窗户，你睁眼一看，屋顶、树枝、街道，都已经盖上柔软的雪被，地上的光亮比天上还亮。这雨的精灵，雨的公主，给南国城市和田野带来异常的蜜情，是它送给人们一年中最后的一份礼物。\n\n啊，雨，我爱恋的雨啊，你一年四季常在我的眼前流动，你给我的生命带来活跃，你给我的感情带来滋润，你给我的思想带来流动。只有在雨中，我才真正感到这世界是活的，是有欢乐和泪水的。但在北方干燥的城市，我们的相逢是多么稀少！只希望日益增多的绿色，能把你请回我们的生活之中。\n\n啊，总是美丽而使人爱恋的雨啊！'
        },
        '《古代诗歌四首》': {
          reading: '观沧海\n曹操\n\n东临碣石，以观沧海。\n水何澹澹，山岛竦峙。\n树木丛生，百草丰茂。\n秋风萧瑟，洪波涌起。\n日月之行，若出其中；\n星汉灿烂，若出其里。\n幸甚至哉，歌以咏志。\n\n闻王昌龄左迁龙标遥有此寄\n李白\n\n杨花落尽子规啼，\n闻道龙标过五溪。\n我寄愁心与明月，\n随君直到夜郎西。\n\n次北固山下\n王湾\n\n客路青山外，行舟绿水前。\n潮平两岸阔，风正一帆悬。\n海日生残夜，江春入旧年。\n乡书何处达？归雁洛阳边。\n\n天净沙·秋思\n马致远\n\n枯藤老树昏鸦，\n小桥流水人家，\n古道西风瘦马。\n夕阳西下，\n断肠人在天涯。'
        },
        '《世说新语》二则': {
          reading: '咏雪\n\n谢太傅寒雪日内集，与儿女讲论文义。俄而雪骤，公欣然曰："白雪纷纷何所似？"兄子胡儿曰："撒盐空中差可拟。"兄女曰："未若柳絮因风起。"公大笑乐。即公大兄无奕女，左将军王凝之妻也。\n\n陈太丘与友期行\n\n陈太丘与友期行，期日中。过中不至，太丘舍去，去后乃至。元方时年七岁，门外戏。客问元方："尊君在不？"答曰："待君久不至，已去。"友人便怒曰："非人哉！与人期行，相委而去。"元方曰："君与家君期日中。日中不至，则是无信；对子骂父，则是无礼。"友人惭，下车引之。元方入门不顾。'
        },
        '《秋天的怀念》史铁生': {
          reading: '双腿瘫痪后，我的脾气变得暴怒无常。望着望着天上北归的雁阵，我会突然把面前的玻璃砸碎；听着听着李谷一甜美的歌声，我会猛地把手边的东西摔向四周的墙壁。母亲就悄悄地躲出去，在我看不见的地方偷偷地听着我的动静。当一切恢复沉寂，她又悄悄地进来，眼边红红的，看着我。"听说北海的花儿都开了，我推着你去走走。"她总是这么说。母亲喜欢花，可自从我的腿瘫痪后，她侍弄的那些花都死了。"不，我不去！"我狠命地捶打这两条可恨的腿，喊着，"我可活什么劲儿！"母亲扑过来抓住我的手，忍住哭声说："咱娘儿俩在一块儿，好好儿活，好好儿活……"\n\n可我却一直都不知道，她的病已经到了那步田地。后来妹妹告诉我，她常常肝疼得整宿整宿翻来覆去地睡不了觉。\n\n那天我又独自坐在屋里，看着窗外的树叶"唰唰啦啦"地飘落。母亲进来了，挡在窗前："北海的菊花开了，我推着你去看看吧。"她憔悴的脸上现出央求般的神色。"什么时候？""你要是愿意，就明天？"她说。我的回答已经让她喜出望外了。"好吧，就明天。"我说。她高兴得一会坐下，一会站起："那就赶紧准备准备。""哎呀，烦不烦？几步路，有什么好准备的！"她也笑了，坐在我身边，絮絮叨叨地说着："看完菊花，咱们就去\'仿膳\'，你小时候最爱吃那儿的豌豆黄儿。还记得那回我带你去北海吗？你偏说那杨树花是毛毛虫，跑着，一脚踩扁一个……"她忽然不说了。对于"跑"和"踩"一类的字眼，她比我还敏感。她又悄悄地出去了。\n\n她出去了，就再也没回来。\n\n邻居们把她抬上车时，她还在大口大口地吐着鲜血。我没想到她已经病成那样。看着三轮车远去，也绝没有想到那竟是永远的诀别。\n\n邻居的小伙子背着我去看她的时候，她正艰难地呼吸着，像她那一生艰难的生活。别人告诉我，她昏迷前的最后一句话是："我那个有病的儿子和我那个还未成年的女儿……"\n\n又是秋天，妹妹推着我去北海看了菊花。黄色的花淡雅，白色的花高洁，紫红色的花热烈而深沉，泼泼洒洒，秋风中正开得烂漫。我懂得母亲没有说完的话。妹妹也懂。我俩在一块儿，要好好儿活……'
        },
        '《散步》莫怀戚': {
          reading: '我们在田野散步：我，我的母亲，我的妻子和儿子。\n\n母亲本不愿出来的。她老了，身体不好，走远一点就觉得很累。我说，正因为如此，才应该多走走。母亲信服地点点头，便去拿外套。她现在很听我的话，就像我小时候很听她的话一样。\n\n天气很好。今年的春天来得太迟，太迟了，有一些老人挺不住。但是春天总算来了。我的母亲又熬过了一个严冬。\n\n这南方初春的田野，大块小块的新绿随意地铺着，有的浓，有的淡；树上的嫩芽也密了；田里的冬水也咕咕地起着水泡。这一切都使人想着一样东西——生命。\n\n我和母亲走在前面，我的妻子和儿子走在后面。小家伙突然叫起来："前面也是妈妈和儿子，后面也是妈妈和儿子。"我们都笑了。\n\n后来发生了分歧：我的母亲要走大路，大路平顺；我的儿子要走小路，小路有意思。不过，一切都取决于我。我的母亲老了，她早已习惯听从她强壮的儿子；我的儿子还小，他还习惯听从他高大的父亲；妻子呢，在外面，她总是听我的。一霎时，我感到了责任的重大，就像民族领袖在严重关头时那样。我想一个两全的办法，找不出；我想拆散一家人，分成两路，各得其所，终不愿意。我决定委屈儿子，因为我伴同他的时日还长。我说："走大路。"\n\n但是母亲摸摸孙儿的小脑瓜，变了主意："还是走小路吧。"她的眼睛顺小路望过去：那里有金色的菜花，两行整齐的桑树，尽头一口水波粼粼的鱼塘。"我走不过去的地方，你就背着我。"母亲对我说。\n\n这样，我们在阳光下，向着那菜花、桑树和鱼塘走去。到了一处，我蹲下来，背起了母亲，妻子也蹲下来，背起了儿子。我的母亲虽然高大，然而很瘦，自然不算重；儿子虽然很胖，毕竟幼小，自然也很轻。但我和妻子都是慢慢地，稳稳地，走得很仔细，好像我背上的同她背上的加起来，就是整个世界。'
        },
        '《散文诗二首》': {
          reading: '金色花\n泰戈尔\n\n假如我变成了一朵金色花，为了好玩，长在树的高枝上，笑嘻嘻地在空中摇摆，又在新叶上跳舞，妈妈，你会认识我吗？\n\n你要是叫道："孩子，你在哪里呀？"我暗暗地在那里匿笑，却一声儿不响。\n\n我要悄悄地开放花瓣儿，看着你工作。\n\n当你沐浴后，湿发披在两肩，穿过金色花的林荫，走到做祷告的小庭院时，你会嗅到这花香，却不知道这香气是从我身上来的。\n\n当你吃过午饭，坐在窗前读《罗摩衍那》，那棵树的阴影落在你的头发与膝上时，我便要将我小小的影子投在你的书页上，正投在你所读的地方。\n\n但是你会猜得出这就是你孩子的小小影子吗？\n\n当你黄昏时拿了灯到牛棚里去，我便要突然地再落到地上来，又成了你的孩子，求你讲故事给我听。\n\n"你到哪里去了，你这坏孩子？"\n"我不告诉你，妈妈。"这就是你同我那时所要说的话了。\n\n荷叶·母亲\n冰心\n\n父亲的朋友送给我们两缸莲花，一缸是红的，一缸是白的，都摆在院子里。\n\n八年之久，我没有在院子里看莲花了——但故乡的园院里，却有许多；不但有并蒂的，还有三蒂的，四蒂的，都是红莲。\n\n九年前的一个月夜，祖父和我在园里乘凉。祖父笑着和我说："我们园里最初开三蒂莲的时候，正好我们大家庭中添了你们三个姊妹。大家都欢喜，说是应了花瑞。"\n\n半夜里听见繁杂的雨声，早起是浓阴的天，我觉得有些烦闷。从窗内往外看时，那一朵白莲已经谢了，白瓣儿小船般散漂在水面。梗上只留个小小的莲蓬，和几根淡黄色的花须。那一朵红莲，昨夜还是菡萏的，今晨却开满了，亭亭地在绿叶中间立着。\n\n仍是不适意！——徘徊了一会子，窗外雷声作了，大雨接着就来，愈下愈大。那朵红莲，被那繁密的雨点，打得左右攲斜。在无遮蔽的天空之下，我不敢下阶去，也无法可想。\n\n对屋里母亲唤着，我连忙走过去，坐在母亲旁边——一回头忽然看见红莲旁边的一个大荷叶，慢慢地倾侧了来，正覆盖在红莲上面……我不宁的心绪散尽了！\n\n雨势并不减退，红莲却不摇动了。雨点不住地打着，只能在那勇敢慈怜的荷叶上面，聚了些流转无力的水珠。\n\n我心中深深地受了感动——\n\n母亲啊！你是荷叶，我是红莲。心中的雨点来了，除了你，谁是我在无遮拦天空下的荫蔽？'
        },
      },
      '七年级下': {
        '《从百草园到三味书屋》鲁迅': {
          reading: '我家的后面有一个很大的园，相传叫作百草园。现在是早已并屋子一起卖给朱文公的子孙了，连那最末次的相见也已经隔了七八年，其中似乎确凿只有一些野草；但那时却是我的乐园。\n\n不必说碧绿的菜畦，光滑的石井栏，高大的皂荚树，紫红的桑椹；也不必说鸣蝉在树叶里长吟，肥胖的黄蜂伏在菜花上，轻捷的叫天子（云雀）忽然从草间直窜向云霄里去了。单是周围的短短的泥墙根一带，就有无限趣味。油蛉在这里低唱，蟋蟀们在这里弹琴。翻开断砖来，有时会遇见蜈蚣；还有斑蝥，倘若用手指按住它的脊梁，便会啪的一声，从后窍喷出一阵烟雾。何首乌藤和木莲藤缠络着，木莲有莲房一般的果实，何首乌有拥肿的根。有人说，何首乌根是有像人形的，吃了便可以成仙，我于是常常拔它起来，牵连不断地拔起来，也曾因此弄坏了泥墙，却从来没有见过有一块根像人样。如果不怕刺，还可以摘到覆盆子，像小珊瑚珠攒成的小球，又酸又甜，色味都比桑椹要好得远。\n\n长的草里是不去的，因为相传这园里有一条很大的赤练蛇。\n\n长妈妈曾经讲给我一个故事听：先前，有一个读书人住在古庙里用功，晚间，在院子里纳凉的时候，突然听到有人在叫他。答应着，四面看时，却见一个美女的脸露在墙头上，向他一笑，隐去了。他很高兴；但竟给那走来夜谈的老和尚识破了机关。说他脸上有些妖气，一定遇见"美女蛇"了；这是人首蛇身的怪物，能唤人名，倘一答应，夜间便要来吃这人的肉的。他自然吓得要死，而那老和尚却道无妨，给他一个小盒子，说只要放在枕边，便可高枕而卧。他虽然照样办，却总是睡不着，——当然睡不着的。到半夜，果然来了，沙沙沙！门外像是风雨声。他正抖作一团时，却听得豁的一声，一道金光从枕边飞出，外面便什么声音也没有了，那金光也就飞回来，敛在盒子里。后来呢？后来，老和尚说，这是飞蜈蚣，它能吸蛇的脑髓，美女蛇就被它治死了。\n\n结末的教训是：所以倘有陌生的声音叫你的名字，你万不可答应他。\n\n这故事很使我觉得做人之险，夏夜乘凉，往往有些担心，不敢去看墙上，而且极想得到一盒老和尚那样的飞蜈蚣。走到百草园的草丛旁边时，也常常这样想。但直到现在，总还没有得到，但也没有遇见过赤练蛇和美女蛇。叫我名字的陌生声音自然是常有的，然而都不是美女蛇。\n\n冬天的百草园比较的无味；雪一下，可就两样了。拍雪人（将自己的全形印在雪上）和塑雪罗汉需要人们鉴赏，这是荒园，人迹罕至，所以不相宜，只好来捕鸟。薄薄的雪，是不行的；总须积雪盖了地面一两天，鸟雀们久已无处觅食的时候才好。扫开一块雪，露出地面，用一支短棒支起一面大的竹筛来，下面撒些秕谷，棒上系一条长绳，人远远地牵着，看鸟雀下来啄食，走到竹筛底下的时候，将绳子一拉，便罩住了。但所得的是麻雀居多，也有白颊的"张飞鸟"，性子很躁，养不过夜的。\n\n这是闰土的父亲所传授的方法，我却不大能用。明明见它们进去了，拉了绳，跑去一看，却什么都没有，费了半天力，捉住的不过三四只。闰土的父亲是小半天便能捕获几十只，装在叉袋里叫着撞着的。我曾经问他得失的缘由，他只静静地笑道："你太性急，来不及等它走到中间去。"\n\n我不知道为什么家里的人要将我送进书塾里去了，而且还是全城中称为最严厉的书塾。也许是因为拔何首乌毁了泥墙罢，也许是因为将砖头抛到间壁的梁家去了罢，也许是因为站在石井栏上跳了下来罢……都无从知道。总而言之：我将不能常到百草园了。Ade，我的蟋蟀们！Ade，我的覆盆子们和木莲们！\n\n出门向东，不上半里，走过一道石桥，便是我的先生的家了。从一扇黑油的竹门进去，第三间是书房。中间挂着一块匾道：三味书屋；匾下面是一幅画，画着一只很肥大的梅花鹿伏在古树下。没有孔子牌位，我们便对着那匾和鹿行礼。第一次算是拜孔子，第二次算是拜先生。\n\n第二次行礼时，先生便和蔼地在一旁答礼。他是一个高而瘦的老人，须发都花白了，还戴着大眼镜。我对他很恭敬，因为我早听到，他是本城中极方正，质朴，博学的人。\n\n不知从哪里听来的，东方朔也很渊博，他认识一种虫，名曰"怪哉"，冤气所化，用酒一浇，就消释了。我很想详细地知道这故事，但阿长是不知道的，因为她毕竟不渊博。现在得到机会了，可以问先生。\n\n"先生，\'怪哉\'这虫，是怎么一回事？……"我上了生书，将要退下来的时候，赶忙问。\n\n"不知道！"他似乎很不高兴，脸上还有怒色了。\n\n我才知道做学生是不应该问这些事的，只要读书，因为他是渊博的宿儒，决不至于不知道，所谓不知道者，乃是不愿意说。年纪比我大的人，往往如此，我遇见过好几回了。\n\n我就只读书，正午习字，晚上对课。先生最初这几天对我很严厉，后来却好起来了，不过给我读的书渐渐加多，对课也渐渐地加上字去，从三言到五言，终于到七言。\n\n三味书屋后面也有一个园，虽然小，但在那里也可以爬上花坛去折蜡梅花，在地上或桂花树上寻蝉蜕。最好的工作是捉了苍蝇喂蚂蚁，静悄悄地没有声音。然而同窗们到园里的太多，太久，可就不行了，先生在书房里便大叫起来：\n\n"人都到那里去了！"\n\n人们便一个一个陆续走回去；一同回去，也不行的。他有一条戒尺，但是不常用，也有罚跪的规则，但也不常用，普通总不过瞪几眼，大声道：\n\n"读书！"\n\n于是大家放开喉咙读一阵书，真是人声鼎沸。有念"仁远乎哉我欲仁斯仁至矣"的，有念"笑人齿缺曰狗窦大开"的，有念"上九潜龙勿用"的，有念"厥土下上上错厥贡苞茅橘柚"的……先生自己也念书。后来，我们的声音便低下去，静下去了，只有他还大声朗读着：\n\n"铁如意，指挥倜傥一乡皆震；金叵罗，颠倒淋漓噫，千杯未醉嗬……"\n\n我疑心这是极好的文章，因为读到这里，他总是微笑起来，而且将头仰起，摇着，向后面拗过去，拗过去。'
        },
        '《木兰诗》': {
          reading: '唧唧复唧唧，木兰当户织。不闻机杼声，唯闻女叹息。\n\n问女何所思，问女何所忆。女亦无所思，女亦无所忆。昨夜见军帖，可汗大点兵，军书十二卷，卷卷有爷名。阿爷无大儿，木兰无长兄，愿为市鞍马，从此替爷征。\n\n东市买骏马，西市买鞍鞯，南市买辔头，北市买长鞭。旦辞爷娘去，暮宿黄河边，不闻爷娘唤女声，但闻黄河流水鸣溅溅。旦辞黄河去，暮至黑山头，不闻爷娘唤女声，但闻燕山胡骑鸣啾啾。\n\n万里赴戎机，关山度若飞。朔气传金柝，寒光照铁衣。将军百战死，壮士十年归。\n\n归来见天子，天子坐明堂。策勋十二转，赏赐百千强。可汗问所欲，木兰不用尚书郎，愿驰千里足，送儿还故乡。\n\n爷娘闻女来，出郭相扶将；阿姊闻妹来，当户理红妆；小弟闻姊来，磨刀霍霍向猪羊。开我东阁门，坐我西阁床。脱我战时袍，著我旧时裳。当窗理云鬓，对镜帖花黄。出门看火伴，火伴皆惊忙：同行十二年，不知木兰是女郎。\n\n雄兔脚扑朔，雌兔眼迷离；双兔傍地走，安能辨我是雄雌？'
        },
        '《卖油翁》欧阳修': {
          reading: '陈康肃公善射，当世无双，公亦以此自矜。尝射于家圃，有卖油翁释担而立，睨之久而不去。见其发矢十中八九，但微颔之。\n\n康肃问曰："汝亦知射乎？吾射不亦精乎？"翁曰："无他，但手熟尔。"康肃忿然曰："尔安敢轻吾射！"翁曰："以我酌油知之。"乃取一葫芦置于地，以钱覆其口，徐以杓酌油沥之，自钱孔入，而钱不湿。因曰："我亦无他，惟手熟尔。"康肃笑而遣之。'
        },
        '《短文二篇》': {
          reading: '夸父逐日\n\n夸父与日逐走，入日。渴欲得饮，饮于河、渭，河、渭不足，北饮大泽。未至，道渴而死。弃其杖，化为邓林。\n\n共工怒触不周山\n\n昔者共工与颛顼争为帝，怒而触不周之山，天柱折，地维绝。天倾西北，故日月星辰移焉；地不满东南，故水潦尘埃归焉。'
        },
        '《古代诗歌五首》': {
          reading: '登幽州台歌\n陈子昂\n\n前不见古人，后不见来者。\n念天地之悠悠，独怆然而涕下！\n\n望岳\n杜甫\n\n岱宗夫如何？齐鲁青未了。\n造化钟神秀，阴阳割昏晓。\n荡胸生曾云，决眦入归鸟。\n会当凌绝顶，一览众山小。\n\n登飞来峰\n王安石\n\n飞来山上千寻塔，\n闻说鸡鸣见日升。\n不畏浮云遮望眼，\n自缘身在最高层。\n\n游山西村\n陆游\n\n莫笑农家腊酒浑，丰年留客足鸡豚。\n山重水复疑无路，柳暗花明又一村。\n箫鼓追随春社近，衣冠简朴古风存。\n从今若许闲乘月，拄杖无时夜叩门。\n\n己亥杂诗（其五）\n龚自珍\n\n浩荡离愁白日斜，\n吟鞭东指即天涯。\n落红不是无情物，\n化作春泥更护花。'
        },
      }
    }
  },
  classical: {
    '必背小古文': {
      '《陋室铭》刘禹锡': {
        reading: '山不在高，有仙则名。水不在深，有龙则灵。斯是陋室，惟吾德馨。苔痕上阶绿，草色入帘青。谈笑有鸿儒，往来无白丁。可以调素琴，阅金经。无丝竹之乱耳，无案牍之劳形。南阳诸葛庐，西蜀子云亭。孔子云：何陋之有？'
      },
      '《爱莲说》周敦颐': {
        reading: '水陆草木之花，可爱者甚蕃。晋陶渊明独爱菊。自李唐来，世人甚爱牡丹。予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植，可远观而不可亵玩焉。\n\n予谓菊，花之隐逸者也；牡丹，花之富贵者也；莲，花之君子者也。噫！菊之爱，陶后鲜有闻。莲之爱，同予者何人？牡丹之爱，宜乎众矣！'
      },
      '《记承天寺夜游》苏轼': {
        reading: '元丰六年十月十二日夜，解衣欲睡，月色入户，欣然起行。念无与为乐者，遂至承天寺寻张怀民。怀民亦未寝，相与步于中庭。庭下如积水空明，水中藻、荇交横，盖竹柏影也。何夜无月？何处无竹柏？但少闲人如吾两人者耳。'
      },
      '《马说》韩愈': {
        reading: '世有伯乐，然后有千里马。千里马常有，而伯乐不常有。故虽有名马，祗辱于奴隶人之手，骈死于槽枥之间，不以千里称也。\n\n马之千里者，一食或尽粟一石。食马者不知其能千里而食也。是马也，虽有千里之能，食不饱，力不足，才美不外见，且欲与常马等不可得，安求其能千里也？\n\n策之不以其道，食之不能尽其材，鸣之而不能通其意，执策而临之，曰："天下无马！"呜呼！其真无马邪？其真不知马也！'
      },
      '《诫子书》诸葛亮': {
        reading: '夫君子之行，静以修身，俭以养德。非淡泊无以明志，非宁静无以致远。夫学须静也，才须学也，非学无以广才，非志无以成学。淫慢则不能励精，险躁则不能治性。年与时驰，意与日去，遂成枯落，多不接世，悲守穷庐，将复何及！'
      },
      '《狼》蒲松龄': {
        reading: '一屠晚归，担中肉尽，止有剩骨。途中两狼，缀行甚远。\n\n屠惧，投以骨。一狼得骨止，一狼仍从。复投之，后狼止而前狼又至。骨已尽矣，而两狼之并驱如故。\n\n屠大窘，恐前后受其敌。顾野有麦场，场主积薪其中，苫蔽成丘。屠乃奔倚其下，弛担持刀。狼不敢前，眈眈相向。\n\n少时，一狼径去，其一犬坐于前。久之，目似瞑，意暇甚。屠暴起，以刀劈狼首，又数刀毙之。方欲行，转视积薪后，一狼洞其中，意将隧入以攻其后也。身已半入，止露尻尾。屠自后断其股，亦毙之。乃悟前狼假寐，盖以诱敌。\n\n狼亦黠矣，而顷刻两毙，禽兽之变诈几何哉？止增笑耳。'
      },
    },
    '必背诗歌': {
      '《观沧海》曹操': {
        reading: '东临碣石，以观沧海。\n水何澹澹，山岛竦峙。\n树木丛生，百草丰茂。\n秋风萧瑟，洪波涌起。\n日月之行，若出其中；\n星汉灿烂，若出其里。\n幸甚至哉，歌以咏志。'
      },
      '《次北固山下》王湾': {
        reading: '客路青山外，行舟绿水前。\n潮平两岸阔，风正一帆悬。\n海日生残夜，江春入旧年。\n乡书何处达？归雁洛阳边。'
      },
      '《天净沙·秋思》马致远': {
        reading: '枯藤老树昏鸦，\n小桥流水人家，\n古道西风瘦马。\n夕阳西下，\n断肠人在天涯。'
      },
      '《闻王昌龄左迁龙标遥有此寄》李白': {
        reading: '杨花落尽子规啼，\n闻道龙标过五溪。\n我寄愁心与明月，\n随君直到夜郎西。'
      },
      '《夜雨寄北》李商隐': {
        reading: '君问归期未有期，\n巴山夜雨涨秋池。\n何当共剪西窗烛，\n却话巴山夜雨时。'
      },
      '《登幽州台歌》陈子昂': {
        reading: '前不见古人，后不见来者。\n念天地之悠悠，独怆然而涕下！'
      },
      '《望岳》杜甫': {
        reading: '岱宗夫如何？齐鲁青未了。\n造化钟神秀，阴阳割昏晓。\n荡胸生曾云，决眦入归鸟。\n会当凌绝顶，一览众山小。'
      },
      '《登飞来峰》王安石': {
        reading: '飞来山上千寻塔，\n闻说鸡鸣见日升。\n不畏浮云遮望眼，\n自缘身在最高层。'
      },
      '《游山西村》陆游': {
        reading: '莫笑农家腊酒浑，丰年留客足鸡豚。\n山重水复疑无路，柳暗花明又一村。\n箫鼓追随春社近，衣冠简朴古风存。\n从今若许闲乘月，拄杖无时夜叩门。'
      },
      '《己亥杂诗》龚自珍': {
        reading: '浩荡离愁白日斜，\n吟鞭东指即天涯。\n落红不是无情物，\n化作春泥更护花。'
      },
    }
  }
};

// ===== 应用状态 =====
let currentTab = 'tabTasks';
let recording = false;
let mediaRecorder = null;
let audioChunks = [];
let currentWordIndex = 0;
let currentPhotoTaskId = null;
let selectedDate = getTodayStr(); // 当前选中的日期
let pendingAction = null; // 待执行的受保护操作

// ===== 密码系统 =====
const DEFAULT_PASSWORD = '20260715';
function getPassword() {
  return Store.get('parentPassword', DEFAULT_PASSWORD);
}
function setPassword(pwd) {
  Store.set('parentPassword', pwd);
}
function verifyPassword(input) {
  return input === getPassword();
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAddTaskButton();
  initModalButtons();
  renderTasks();
  renderPoints();
  renderWeeklyStats();
  initReadingSelect();
  initDictation();
  initPhotoUpload();
  initDateNav();
  initSettings();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

// ===== Tab 切换 =====
function initTabs() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      switchTab(item.dataset.tab);
    });
  });
}

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const tabEl = document.getElementById(tabId);
  if (tabEl) tabEl.classList.add('active');

  const navEl = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (navEl) navEl.classList.add('active');

  if (tabId === 'tabPoints') { renderPoints(); renderWeeklyStats(); }
}

// ===== 添加任务按钮 =====
function initAddTaskButton() {
  const btn = document.getElementById('btnAddTask');
  if (btn) {
    btn.addEventListener('click', () => {
      requestPassword(() => openAddTaskModal());
    });
  }
}

// ===== 模态框按钮 =====
function initModalButtons() {
  // 添加任务模态框
  const closeModal = document.getElementById('closeModal');
  if (closeModal) closeModal.addEventListener('click', closeAddTaskModal);

  const btnCancel = document.getElementById('btnCancelTask');
  if (btnCancel) btnCancel.addEventListener('click', closeAddTaskModal);

  const btnSave = document.getElementById('btnSaveTask');
  if (btnSave) btnSave.addEventListener('click', saveTask);

  // 任务类型切换
  document.querySelectorAll('input[name="taskType"]').forEach(radio => {
    radio.addEventListener('change', updateTypeFields);
  });

  // 教材选择器变化
  const taskTextbook = document.getElementById('taskTextbook');
  if (taskTextbook) {
    taskTextbook.addEventListener('change', onTextbookSelectChange);
  }

  // 拍照模态框
  const closePhotoModal = document.getElementById('closePhotoModal');
  if (closePhotoModal) closePhotoModal.addEventListener('click', closePhotoModalFn);

  const btnCancelPhoto = document.getElementById('btnCancelPhoto');
  if (btnCancelPhoto) btnCancelPhoto.addEventListener('click', closePhotoModalFn);

  const btnConfirmPhoto = document.getElementById('btnConfirmPhoto');
  if (btnConfirmPhoto) btnConfirmPhoto.addEventListener('click', confirmPhoto);

  const photoPlaceholder = document.getElementById('photoPlaceholder');
  if (photoPlaceholder) photoPlaceholder.addEventListener('click', triggerPhotoInput);

  // 听写按钮已移至 initDictation()

  // 单词输入框回车提交
  const wordAnswer = document.getElementById('wordAnswer');
  if (wordAnswer) {
    wordAnswer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitAnswer();
    });
  }

  // 朗读按钮
  const btnRecord = document.getElementById('btnRecord');
  if (btnRecord) btnRecord.addEventListener('click', toggleRecording);
}

// ===== 任务管理 =====
function renderTasks() {
  const tasks = Store.getTasks();
  const dayTasks = tasks.filter(t => t.date === selectedDate);
  const isToday = selectedDate === getTodayStr();

  // Update date label
  updateDateLabel();

  // Show/hide add button (only today)
  const addBtn = document.getElementById('btnAddTask');
  if (addBtn) addBtn.style.display = isToday ? 'flex' : 'none';

  const container = document.getElementById('taskList');
  if (!container) return;

  if (dayTasks.length === 0) {
    const msg = isToday ? '今天还没有任务哦' : '这天没有任务';
    const hint = isToday ? '点击 ＋ 添加任务开始学习吧' : '点击 ▶ 切换日期查看';
    container.innerHTML = '<div class="empty-state"><div class="empty-icon"></div><p>' + msg + '</p><p class="empty-hint">' + hint + '</p></div>';
    return;
  }

  container.innerHTML = dayTasks.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask('${task.id}')">
        ${task.completed ? '✓' : ''}
      </div>
      <div class="task-info">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          <span class="task-subject">${escapeHtml(task.subject)}</span>
          <span class="task-points">⭐ ${task.points}积分</span>
          ${task.type === 'reading' ? '<span>🎤</span>' : ''}
          ${task.type === 'dictation' ? '<span>🔤</span>' : ''}
          ${task.photoUrl ? '<span>📸</span>' : ''}
        </div>
      </div>
      <div class="task-actions">
        ${!task.completed ? `<button class="btn-task-action" onclick="openTaskAction('${task.id}')" title="完成">📝</button>` : ''}
        <button class="btn-task-action delete" onclick="deleteTask('${task.id}')" title="删除">🗑</button>
      </div>
    </div>
  `).join('');
}

function toggleTask(taskId) {
  const tasks = Store.getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  if (task.type === 'reading' || task.type === 'dictation') {
    if (task.type === 'reading') {
      switchTab('tabReading');
      loadReadingForTask(task);
    } else {
      switchTab('tabDictation');
      loadDictationForTask(task);
    }
    return;
  }

  task.completed = !task.completed;
  if (task.completed) {
    task.completedAt = new Date().toISOString();
    addPoints(task.points, '完成任务: ' + task.title, task.id);
  } else {
    removePoints(task.id);
  }

  Store.saveTasks(tasks);
  renderTasks();
  updatePointsBadge();
  showToast(task.completed ? '✅ 完成！+' + task.points + '积分' : '已取消完成');
}

function openTaskAction(taskId) {
  const tasks = Store.getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  if (task.type === 'reading') {
    switchTab('tabReading');
    loadReadingForTask(task);
  } else if (task.type === 'dictation') {
    switchTab('tabDictation');
    loadDictationForTask(task);
  } else {
    openPhotoModal(taskId);
  }
}

function deleteTask(taskId) {
  requestPassword(() => {
    if (!confirm('确定删除这个任务吗？')) return;

  let tasks = Store.getTasks();
  tasks = tasks.filter(t => t.id !== taskId);
  Store.saveTasks(tasks);
  removePoints(taskId);
    renderTasks();
    updatePointsBadge();
    showToast('任务已删除');
  });
}

// ===== 添加任务 =====
function openAddTaskModal() {
  const modal = document.getElementById('addTaskModal');
  if (modal) modal.classList.add('show');

  const titleInput = document.getElementById('taskTitle');
  if (titleInput) titleInput.value = '';

  const subjectSelect = document.getElementById('taskSubject');
  if (subjectSelect) subjectSelect.value = '数学';

  const pointsInput = document.getElementById('taskPoints');
  if (pointsInput) pointsInput.value = '5';

  const dateInput = document.getElementById('taskDate');
  if (dateInput) dateInput.value = getTodayStr();

  const normalRadio = document.querySelector('input[name="taskType"][value="normal"]');
  if (normalRadio) normalRadio.checked = true;

  updateTypeFields();
  populateTextbookSelect();
}

function closeAddTaskModal() {
  const modal = document.getElementById('addTaskModal');
  if (modal) modal.classList.remove('show');
}

function updateTypeFields() {
  const selectedType = document.querySelector('input[name="taskType"]:checked');
  const type = selectedType ? selectedType.value : 'normal';

  const textbookGroup = document.getElementById('textbookSelectorGroup');
  const wordListGroup = document.getElementById('wordListGroup');
  const readingContentGroup = document.getElementById('readingContentGroup');

  if (textbookGroup) textbookGroup.style.display = type !== 'normal' ? 'block' : 'none';
  if (wordListGroup) wordListGroup.style.display = type === 'dictation' ? 'block' : 'none';
  if (readingContentGroup) readingContentGroup.style.display = type === 'reading' ? 'block' : 'none';
}

function populateTextbookSelect() {
  const select = document.getElementById('taskTextbook');
  if (!select) return;

  select.innerHTML = '<option value="">-- 手动输入 --</option>';

  // 英语
  if (TEXTBOOK_DATA.english) {
    Object.keys(TEXTBOOK_DATA.english).forEach(publisher => {
      Object.keys(TEXTBOOK_DATA.english[publisher]).forEach(grade => {
        Object.keys(TEXTBOOK_DATA.english[publisher][grade]).forEach(unit => {
          const opt = document.createElement('option');
          opt.value = 'en|' + publisher + '|' + grade + '|' + unit;
          opt.textContent = ' 英语 ' + publisher + ' ' + grade + ' ' + unit;
          select.appendChild(opt);
        });
      });
    });
  }

  // 语文
  if (TEXTBOOK_DATA.chinese) {
    Object.keys(TEXTBOOK_DATA.chinese).forEach(publisher => {
      Object.keys(TEXTBOOK_DATA.chinese[publisher]).forEach(grade => {
        Object.keys(TEXTBOOK_DATA.chinese[publisher][grade]).forEach(unit => {
          const opt = document.createElement('option');
          opt.value = 'cn|' + publisher + '|' + grade + '|' + unit;
          opt.textContent = ' 语文 ' + publisher + ' ' + grade + ' ' + unit;
          select.appendChild(opt);
        });
      });
    });
  }

  // 古文诗歌
  if (TEXTBOOK_DATA.classical) {
    Object.keys(TEXTBOOK_DATA.classical).forEach(category => {
      Object.keys(TEXTBOOK_DATA.classical[category]).forEach(unit => {
        const opt = document.createElement('option');
        opt.value = 'cl|' + category + '||' + unit;
        opt.textContent = ' ' + category + ' ' + unit;
        select.appendChild(opt);
      });
    });
  }
}

function onTextbookSelectChange() {
  const select = document.getElementById('taskTextbook');
  if (!select || !select.value) return;

  const parts = select.value.split('|');
  const type = parts[0];
  const publisher = parts[1];
  const grade = parts[2];
  const unit = parts[3];

  const selectedType = document.querySelector('input[name="taskType"]:checked');
  const currentType = selectedType ? selectedType.value : 'normal';

  if (currentType === 'reading') {
    const content = getTextbookContent(type, publisher, grade, unit);
    const textarea = document.getElementById('taskReadingContent');
    if (textarea && content) textarea.value = content;
  } else if (currentType === 'dictation') {
    const words = getTextbookWords(type, publisher, grade, unit);
    const textarea = document.getElementById('taskWordList');
    if (textarea && words) {
      textarea.value = JSON.stringify(words.map(w => w.word));
    }
  }
}

function getTextbookContent(type, publisher, grade, unit) {
  try {
    if (type === 'en') return TEXTBOOK_DATA.english[publisher]?.[grade]?.[unit]?.words?.map(w => w.word + ' ' + w.meaning).join('\n') || null;
    if (type === 'cn') return TEXTBOOK_DATA.chinese[publisher]?.[grade]?.[unit]?.reading || null;
    if (type === 'cl') return TEXTBOOK_DATA.classical[publisher]?.[unit]?.reading || null;
  } catch { return null; }
  return null;
}

function getTextbookWords(type, publisher, grade, unit) {
  try {
    if (type === 'en') return TEXTBOOK_DATA.english[publisher]?.[grade]?.[unit]?.words || null;
  } catch { return null; }
  return null;
}

function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) { showToast('请输入任务名称'); return; }

  const selectedType = document.querySelector('input[name="taskType"]:checked');
  const type = selectedType ? selectedType.value : 'normal';

  const task = {
    id: generateId(),
    title: title,
    subject: document.getElementById('taskSubject').value,
    type: type,
    points: parseInt(document.getElementById('taskPoints').value) || 5,
    date: document.getElementById('taskDate').value || getTodayStr(),
    completed: false,
    completedAt: null,
    photoUrl: null,
    wordList: null,
    readingContent: null,
    createdAt: new Date().toISOString(),
  };

  // 如果是朗读或听写任务，获取教材内容
  if (type === 'reading') {
    const content = document.getElementById('taskReadingContent').value.trim();
    if (content) task.readingContent = content;
  } else if (type === 'dictation') {
    const wordListStr = document.getElementById('taskWordList').value.trim();
    if (wordListStr) {
      try {
        task.wordList = JSON.parse(wordListStr);
      } catch {
        task.wordList = wordListStr.split(/[,，\n]/).map(w => w.trim()).filter(w => w);
      }
    }
  }

  const tasks = Store.getTasks();
  tasks.push(task);
  Store.saveTasks(tasks);

  closeAddTaskModal();
  renderTasks();
  showToast('✅ 任务已添加！');
}

// ===== 朗读打卡 =====
function initReadingSelect() {
  const select = document.getElementById('readingSelect');
  if (!select) return;

  select.innerHTML = '<option value="">-- 选择课文 --</option>';

  // 语文课文
  if (TEXTBOOK_DATA.chinese) {
    Object.keys(TEXTBOOK_DATA.chinese).forEach(publisher => {
      Object.keys(TEXTBOOK_DATA.chinese[publisher]).forEach(grade => {
        Object.keys(TEXTBOOK_DATA.chinese[publisher][grade]).forEach(unit => {
          const opt = document.createElement('option');
          opt.value = 'cn|' + publisher + '|' + grade + '|' + unit;
          opt.textContent = publisher + ' ' + grade + ' ' + unit;
          select.appendChild(opt);
        });
      });
    });
  }

  // 古文诗歌
  if (TEXTBOOK_DATA.classical) {
    Object.keys(TEXTBOOK_DATA.classical).forEach(category => {
      Object.keys(TEXTBOOK_DATA.classical[category]).forEach(unit => {
        const opt = document.createElement('option');
        opt.value = 'cl|' + category + '||' + unit;
        opt.textContent = category + ' ' + unit;
        select.appendChild(opt);
      });
    });
  }

  select.addEventListener('change', () => {
    const val = select.value;
    const contentEl = document.getElementById('readingContent');
    if (!contentEl) return;

    if (!val) {
      contentEl.innerHTML = '<p class="placeholder-text">请先选择一篇课文</p>';
      return;
    }

    const parts = val.split('|');
    const content = getTextbookContent(parts[0], parts[1], parts[2], parts[3]);
    if (content) {
      contentEl.innerHTML = '<div style="white-space:pre-wrap;line-height:1.8;font-size:16px;">' + escapeHtml(content) + '</div>';
    } else {
      contentEl.innerHTML = '<p class="placeholder-text">暂无内容</p>';
    }
  });
}

function loadReadingForTask(task) {
  const contentEl = document.getElementById('readingContent');
  if (!contentEl) return;

  if (task.readingContent) {
    contentEl.innerHTML = '<div style="white-space:pre-wrap;line-height:1.8;font-size:16px;">' + escapeHtml(task.readingContent) + '</div>';
  } else {
    contentEl.innerHTML = '<p class="placeholder-text">该任务没有课文内容</p>';
  }

  const statusEl = document.getElementById('recordStatus');
  if (statusEl) statusEl.textContent = '';

  const btnRecord = document.getElementById('btnRecord');
  if (btnRecord) {
    btnRecord.innerHTML = '<span class="record-icon">🎙️</span><span class="record-text">开始录音</span>';
    btnRecord.classList.remove('recording');
  }
  recording = false;

  // 保存当前任务ID，录音完成后标记完成
  btnRecord.dataset.taskId = task.id;
}

async function toggleRecording() {
  const btnRecord = document.getElementById('btnRecord');
  if (!btnRecord) return;

  if (recording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const statusEl = document.getElementById('recordStatus');
      if (statusEl) statusEl.textContent = '✅ 录音完成！';

      // 标记朗读任务完成
      const btnRecord = document.getElementById('btnRecord');
      const taskId = btnRecord ? btnRecord.dataset.taskId : null;
      if (taskId) {
        completeTaskById(taskId, '朗读完成');
      }
    };

    mediaRecorder.start();
    recording = true;
    btnRecord.innerHTML = '<span class="record-icon">️</span><span class="record-text">停止录音</span>';
    btnRecord.classList.add('recording');

    const statusEl = document.getElementById('recordStatus');
    if (statusEl) statusEl.textContent = '🔴 录音中...请朗读课文';
  } catch (err) {
    showToast('无法访问麦克风，请检查权限');
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  recording = false;
  const btnRecord = document.getElementById('btnRecord');
  if (btnRecord) {
    btnRecord.innerHTML = '<span class="record-icon">🎙️</span><span class="record-text">开始录音</span>';
    btnRecord.classList.remove('recording');
  }
}

// ===== 英语听写（打怪闯关模式）=====
const DICT_WORDS_PER_ROUND = 20;

let dictState = {
  textbookId: '', unitId: '',
  allWords: [], studyIndex: 0, studyWords: [],
  round: 1, queue: [], currentIndex: 0,
  correct: [], wrong: [], totalRounds: 0,
  allWrongEver: [], phase: 'select'
};

function loadDictationForTask(task) {
  if (!task) return;
  dictState.taskId = task.id;
  dictState.textbookId = task.textbookId || 'yl-7a';
  dictState.unitId = task.unitId || 'U1';
  // Set selects
  const tbSel = document.getElementById('dictationTextbook');
  if (tbSel) tbSel.value = dictState.textbookId;
  onDictTextbookChange();
  setTimeout(function() {
    const uSel = document.getElementById('dictationUnit');
    if (uSel) uSel.value = dictState.unitId;
    onDictUnitChange();
    showDictStep('study');
  }, 100);
}

function initDictation() {
  const sel = document.getElementById('dictationTextbook');
  if (sel) sel.addEventListener('change', onDictTextbookChange);
  const unitSel = document.getElementById('dictationUnit');
  if (unitSel) unitSel.addEventListener('change', onDictUnitChange);
  const btnStudy = document.getElementById('btnStartStudy');
  if (btnStudy) btnStudy.addEventListener('click', () => showDictStep('study'));
  const btnPrev = document.getElementById('btnPrevWord');
  const btnNext = document.getElementById('btnNextWord');
  if (btnPrev) btnPrev.addEventListener('click', () => navigateStudyWord(-1));
  if (btnNext) btnNext.addEventListener('click', () => navigateStudyWord(1));
  const btnStartDict = document.getElementById('btnStartDict');
  if (btnStartDict) btnStartDict.addEventListener('click', startDictationRound);
  const btnPlay = document.getElementById('btnPlayWord');
  if (btnPlay) btnPlay.addEventListener('click', playCurrentWord);
  const btnSubmit = document.getElementById('btnSubmitDict');
  if (btnSubmit) btnSubmit.addEventListener('click', submitDictAnswer);
  const dictInput = document.getElementById('dictInput');
  if (dictInput) dictInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitDictAnswer(); });
  const btnReview = document.getElementById('btnReviewWrong');
  if (btnReview) btnReview.addEventListener('click', startWrongReview);
  const btnFinish = document.getElementById('btnFinishDict');
  if (btnFinish) btnFinish.addEventListener('click', finishDictation);
}

function onDictTextbookChange() {
  const tid = document.getElementById('dictationTextbook').value;
  const unitSel = document.getElementById('dictationUnit');
  unitSel.innerHTML = '<option value="">选择单元</option>';
  document.getElementById('btnStartStudy').style.display = 'none';
  document.getElementById('dictWordCount').textContent = '';
  if (!tid) return;
  const tb = TEXTBOOK_DATA.english[tid];
  if (!tb) return;
  Object.keys(tb.units).forEach(uid => {
    const u = tb.units[uid];
    const opt = document.createElement('option');
    opt.value = uid; opt.textContent = u.title;
    unitSel.appendChild(opt);
  });
}

function onDictUnitChange() {
  const tid = document.getElementById('dictationTextbook').value;
  const uid = document.getElementById('dictationUnit').value;
  const btnStudy = document.getElementById('btnStartStudy');
  const countEl = document.getElementById('dictWordCount');
  if (!tid || !uid) { btnStudy.style.display = 'none'; countEl.textContent = ''; return; }
  const words = TEXTBOOK_DATA.english[tid].units[uid].words;
  countEl.textContent = '本单元共 ' + words.length + ' 个单词';
  btnStudy.style.display = 'block';
}

function showDictStep(step) {
  dictState.phase = step;
  ['dictStepSelect','dictStepStudy','dictStepDictate','dictStepResult','dictStepSuccess'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  const map = {select:'dictStepSelect',study:'dictStepStudy',dictate:'dictStepDictate',result:'dictStepResult',success:'dictStepSuccess'};
  const el = document.getElementById(map[step]); if (el) el.style.display = 'block';
  if (step === 'study') initStudyPhase();
}

function initStudyPhase() {
  const tid = document.getElementById('dictationTextbook').value;
  const uid = document.getElementById('dictationUnit').value;
  if (!tid || !uid) return;
  dictState.textbookId = tid; dictState.unitId = uid;
  dictState.allWords = TEXTBOOK_DATA.english[tid].units[uid].words;
  dictState.studyWords = [...dictState.allWords];
  dictState.studyIndex = 0;
  renderStudyCard();
}

function renderStudyCard() {
  const words = dictState.studyWords;
  const idx = dictState.studyIndex;
  if (idx < 0 || idx >= words.length) return;
  const w = words[idx];
  document.getElementById('studyWord').textContent = w.word;
  document.getElementById('studyPhonetic').textContent = w.phonetic || '';
  document.getElementById('studyMeaning').textContent = w.meaning;
  document.getElementById('studyTip').textContent = w.tip || '';
  document.getElementById('studyCounter').textContent = (idx+1) + '/' + words.length;
}

function navigateStudyWord(offset) {
  const words = dictState.studyWords;
  dictState.studyIndex = Math.max(0, Math.min(words.length-1, dictState.studyIndex + offset));
  renderStudyCard();
}

function startDictationRound() {
  dictState.round = dictState.totalRounds + 1;
  dictState.totalRounds = dictState.round;
  dictState.correct = []; dictState.wrong = []; dictState.allWrongEver = [];
  dictState.currentIndex = 0;

  const wrongBook = getWrongBook();
  const allWords = dictState.allWords;
  let queue = [];

  if (wrongBook.length > 0) {
    const ww = allWords.filter(w => wrongBook.includes(w.word));
    queue = shuffleArray([...ww]);
  }
  const remaining = allWords.filter(w => !queue.find(q => q.word === w.word));
  const needed = DICT_WORDS_PER_ROUND - queue.length;
  queue = queue.concat(shuffleArray([...remaining]).slice(0, Math.max(0, needed)));
  if (queue.length > DICT_WORDS_PER_ROUND) queue = shuffleArray(queue).slice(0, DICT_WORDS_PER_ROUND);

  dictState.queue = shuffleArray(queue);
  showDictStep('dictate');
  renderDictProgress();
  setTimeout(() => playCurrentWord(0), 300);
}

function renderDictProgress() {
  document.getElementById('dictRoundLabel').textContent = '第' + dictState.round + '轮';
  document.getElementById('dictProgressText').textContent = (dictState.currentIndex+1) + '/' + dictState.queue.length;
  document.getElementById('dictFeedback').textContent = '';
  document.getElementById('dictFeedback').style.color = '';
  const input = document.getElementById('dictInput'); if (input) input.value = '';
}

function playCurrentWord(repeatIndex) {
  if (repeatIndex === undefined) repeatIndex = 0;
  const idx = dictState.currentIndex;
  if (idx >= dictState.queue.length) return;
  const word = dictState.queue[idx];
  const label = document.getElementById('dictProgressText');
  if (label) label.textContent = (idx+1) + '/' + dictState.queue.length + ' (第' + (repeatIndex+1) + '遍)';
  speak(word.word, 'en-US', function() {
    if (repeatIndex < 2) {
      setTimeout(function() { playCurrentWord(repeatIndex + 1); }, 800);
    }
  });
}

function submitDictAnswer() {
  const input = document.getElementById('dictInput');
  if (!input) return;
  const answer = input.value.trim().toLowerCase();
  if (!answer) return;

  const word = dictState.queue[dictState.currentIndex];
  const isCorrect = answer === word.word.toLowerCase();
  const feedback = document.getElementById('dictFeedback');

  if (isCorrect) {
    dictState.correct.push(word);
    feedback.textContent = '✅ 正确！'; feedback.style.color = '#22c55e';
  } else {
    dictState.wrong.push(word);
    if (!dictState.allWrongEver.find(w => w.word === word.word)) dictState.allWrongEver.push(word);
    feedback.textContent = '❌ 正确答案：' + word.word; feedback.style.color = '#ef4444';
  }

  setTimeout(() => {
    dictState.currentIndex++;
    if (dictState.currentIndex >= dictState.queue.length) showDictResult();
    else { renderDictProgress(); playCurrentWord(0); }
  }, 1200);
}

function showDictResult() {
  const total = dictState.queue.length;
  const cc = dictState.correct.length;
  const wc = dictState.wrong.length;
  updateWrongBook(dictState.allWrongEver.map(w => w.word));

  document.getElementById('resultSummary').innerHTML =
    '<h3>第' + dictState.round + '轮结果</h3>' +
    '<p style="font-size:24px;font-weight:700;color:' + (wc===0?'#22c55e':'#f59e0b') + '">' + cc + '/' + total + ' 正确</p>';

  document.getElementById('resultCorrect').innerHTML =
    '<h4>✅ 已掌握 (' + cc + '个)</h4><div class="result-word-list">' +
    (dictState.correct.map(w => w.word).join('、') || '无') + '</div>';

  if (wc > 0) {
    document.getElementById('resultWrong').style.display = 'block';
    document.getElementById('resultWrong').innerHTML =
      '<h4>❌ 出错 (' + wc + '个) → 已加入错题本</h4><div class="result-word-list">' +
      dictState.wrong.map(w => w.word + ' ' + (w.meaning||'')).join('<br>') + '</div>';
    document.getElementById('btnReviewWrong').style.display = 'block';
    document.getElementById('btnReviewWrong').textContent = '📖 学习错题后继续（还剩' + wc + '个）';
    showDictStep('result');
  } else {
    showDictSuccess();
  }
}

function startWrongReview() {
  dictState.studyWords = [...dictState.wrong];
  dictState.studyIndex = 0;
  showDictStep('study');
  const btnStartDict = document.getElementById('btnStartDict');
  if (btnStartDict) {
    btnStartDict.textContent = '🎧 听写错题（' + dictState.wrong.length + '个）';
    btnStartDict.onclick = function() {
      dictState.queue = shuffleArray([...dictState.wrong]);
      dictState.correct = []; dictState.wrong = []; dictState.allWrongEver = [];
      dictState.currentIndex = 0; dictState.round++; dictState.totalRounds = dictState.round;
      showDictStep('dictate'); renderDictProgress();
      setTimeout(() => playCurrentWord(0), 300);
      btnStartDict.textContent = '🎧 开始听写';
      btnStartDict.onclick = startDictationRound;
    };
  }
}

function showDictSuccess() {
  document.getElementById('successDetail').textContent =
    '共用了 ' + dictState.totalRounds + ' 轮，全部掌握！';
  showDictStep('success');
}

function finishDictation() {
  clearWrongBookForUnit(dictState.textbookId, dictState.unitId);
  const btnStartDict = document.getElementById('btnStartDict');
  if (btnStartDict) { btnStartDict.textContent = '🎧 开始听写'; btnStartDict.onclick = startDictationRound; }
  // 完成关联的任务并发放积分
  if (dictState.taskId) {
    completeTaskById(dictState.taskId);
    dictState.taskId = null;
  }
  showDictStep('select');
  showToast('🎉 听写任务完成，积分已发放！');
}

function getWrongBook() { return Store.get('wrongBook', []); }
function updateWrongBook(words) {
  const book = getWrongBook();
  words.forEach(w => { if (!book.includes(w)) book.push(w); });
  Store.set('wrongBook', book);
}
function clearWrongBookForUnit(tid, uid) {
  const book = getWrongBook();
  const uw = TEXTBOOK_DATA.english[tid]?.units[uid]?.words.map(w => w.word) || [];
  Store.set('wrongBook', book.filter(w => !uw.includes(w)));
}
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

// ===== 拍照提交 =====
function initPhotoUpload() {
  // 已在 initModalButtons 中绑定
}

function openPhotoModal(taskId) {
  currentPhotoTaskId = taskId;
  const modal = document.getElementById('photoModal');
  if (modal) modal.classList.add('show');

  const preview = document.getElementById('photoPreview');
  if (preview) {
    preview.style.display = 'none';
    preview.src = '';
  }

  const placeholder = document.getElementById('photoPlaceholder');
  if (placeholder) placeholder.style.display = 'block';

  const input = document.getElementById('photoInput');
  if (input) input.value = '';
}

function closePhotoModalFn() {
  const modal = document.getElementById('photoModal');
  if (modal) modal.classList.remove('show');
  currentPhotoTaskId = null;
}

function triggerPhotoInput() {
  const input = document.getElementById('photoInput');
  if (input) input.click();
}

// 监听文件选择
document.addEventListener('change', (e) => {
  if (e.target.id === 'photoInput' && e.target.files.length > 0) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const preview = document.getElementById('photoPreview');
      const placeholder = document.getElementById('photoPlaceholder');
      if (preview) {
        preview.src = ev.target.result;
        preview.style.display = 'block';
      }
      if (placeholder) placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
});

function confirmPhoto() {
  const preview = document.getElementById('photoPreview');
  if (!preview || !preview.src || preview.style.display === 'none') {
    showToast('请先拍照或选择照片');
    return;
  }

  if (!currentPhotoTaskId) {
    showToast('任务信息丢失，请重试');
    return;
  }

  // 保存照片到 localStorage（base64）
  const photos = Store.getPhotos();
  photos[currentPhotoTaskId] = preview.src;
  Store.savePhotos(photos);

  // 标记任务完成
  completeTaskById(currentPhotoTaskId, '拍照提交');

  closePhotoModalFn();
  showToast('✅ 任务已完成！');
}

// ===== 完成任务通用方法 =====
function completeTaskById(taskId, reason) {
  const tasks = Store.getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task || task.completed) return;

  task.completed = true;
  task.completedAt = new Date().toISOString();
  addPoints(task.points, reason + ': ' + task.title, task.id);
  Store.saveTasks(tasks);
  renderTasks();
  updatePointsBadge();
}

// ===== 日期导航 =====
function initDateNav() {
  const picker = document.getElementById('datePicker');
  if (picker) {
    picker.value = selectedDate;
    picker.addEventListener('change', () => {
      selectedDate = picker.value;
      renderTasks();
    });
  }
}

function updateDateLabel() {
  // Sync date picker
  const picker = document.getElementById('datePicker');
  if (picker) picker.value = selectedDate;

  const label = document.getElementById('dateNavLabel');
  if (!label) return;
  const today = getTodayStr();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (selectedDate === today) label.textContent = '今天';
  else if (selectedDate === yesterdayStr) label.textContent = '昨天';
  else if (selectedDate === tomorrowStr) label.textContent = '明天';
  else {
    const d = new Date(selectedDate + 'T00:00:00');
    const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
    label.textContent = (d.getMonth()+1) + '月' + d.getDate() + '日 ' + weekdays[d.getDay()];
  }
}

// ===== 本周统计 =====
function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday
  const monday = new Date(now);
  // Convert to Monday-based week (Monday=0)
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(now.getDate() - offset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  };
}

function renderWeeklyStats() {
  const tasks = Store.getTasks();
  const week = getWeekRange();
  const weekTasks = tasks.filter(t => t.date >= week.start && t.date <= week.end);
  const total = weekTasks.length;
  const completed = weekTasks.filter(t => t.completed).length;
  const rate = total > 0 ? Math.round(completed / total * 100) : 0;

  const textEl = document.getElementById('weeklyStatsText');
  if (textEl) textEl.textContent = completed + '/' + total;

  const fillEl = document.getElementById('weeklyProgressFill');
  if (fillEl) fillEl.style.width = rate + '%';

  const detailEl = document.getElementById('weeklyStatsDetail');
  if (detailEl) {
    if (total === 0) {
      detailEl.textContent = '本周还没有任务';
    } else {
      detailEl.textContent = '完成率 ' + rate + '%，' + (total - completed) + ' 个待完成';
    }
  }
}

// ===== 密码验证弹窗 =====
function requestPassword(callback) {
  pendingAction = callback;
  const modal = document.getElementById('passwordModal');
  if (modal) modal.classList.add('show');
  const input = document.getElementById('passwordInput');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 100);
  }
  const errorEl = document.getElementById('passwordError');
  if (errorEl) errorEl.style.display = 'none';
}

function closePasswordModal() {
  const modal = document.getElementById('passwordModal');
  if (modal) modal.classList.remove('show');
  pendingAction = null;
}

function confirmPassword() {
  const input = document.getElementById('passwordInput');
  const errorEl = document.getElementById('passwordError');
  if (!input) return;

  if (verifyPassword(input.value)) {
    const action = pendingAction; // 先保存回调
    pendingAction = null; // 立即清空，防止重复触发
    closePasswordModal();
    if (action) action(); // 再执行回调
  } else {
    if (errorEl) {
      errorEl.style.display = 'block';
      input.value = '';
      input.focus();
    }
  }
}

// ===== 修改密码 =====
function openChangePasswordModal() {
  const modal = document.getElementById('changePasswordModal');
  if (modal) modal.classList.add('show');
  document.getElementById('currentPasswordInput').value = '';
  document.getElementById('newPasswordInput').value = '';
  document.getElementById('confirmPasswordInput').value = '';
  const errorEl = document.getElementById('changePasswordError');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }
}

function closeChangePasswordModal() {
  const modal = document.getElementById('changePasswordModal');
  if (modal) modal.classList.remove('show');
}

function saveNewPassword() {
  const current = document.getElementById('currentPasswordInput').value;
  const newPwd = document.getElementById('newPasswordInput').value;
  const confirm = document.getElementById('confirmPasswordInput').value;
  const errorEl = document.getElementById('changePasswordError');

  if (!verifyPassword(current)) {
    if (errorEl) { errorEl.textContent = '当前密码错误'; errorEl.style.display = 'block'; }
    return;
  }
  if (newPwd.length < 4) {
    if (errorEl) { errorEl.textContent = '新密码至少4位'; errorEl.style.display = 'block'; }
    return;
  }
  if (newPwd !== confirm) {
    if (errorEl) { errorEl.textContent = '两次输入的新密码不一致'; errorEl.style.display = 'block'; }
    return;
  }

  setPassword(newPwd);
  closeChangePasswordModal();
  showToast('✅ 密码已修改');
}

// ===== 设置页面 =====
function initSettings() {
  const btnChange = document.getElementById('btnChangePassword');
  if (btnChange) {
    btnChange.addEventListener('click', () => {
      requestPassword(() => openChangePasswordModal());
    });
  }

  // 密码弹窗按钮
  const closePwdModal = document.getElementById('closePasswordModal');
  if (closePwdModal) closePwdModal.addEventListener('click', closePasswordModal);

  const btnCancelPwd = document.getElementById('btnCancelPassword');
  if (btnCancelPwd) btnCancelPwd.addEventListener('click', closePasswordModal);

  const btnConfirmPwd = document.getElementById('btnConfirmPassword');
  if (btnConfirmPwd) btnConfirmPwd.addEventListener('click', confirmPassword);

  const pwdInput = document.getElementById('passwordInput');
  if (pwdInput) {
    pwdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmPassword();
    });
  }

  // 修改密码弹窗按钮
  const closeChangePwd = document.getElementById('closeChangePasswordModal');
  if (closeChangePwd) closeChangePwd.addEventListener('click', closeChangePasswordModal);

  const btnCancelChange = document.getElementById('btnCancelChangePassword');
  if (btnCancelChange) btnCancelChange.addEventListener('click', closeChangePasswordModal);

  const btnSaveNew = document.getElementById('btnSaveNewPassword');
  if (btnSaveNew) btnSaveNew.addEventListener('click', saveNewPassword);
}

// ===== 积分系统 =====
function addPoints(points, reason, taskId) {
  const pointsList = Store.getPoints();
  pointsList.push({
    id: generateId(),
    points: points,
    reason: reason,
    taskId: taskId,
    date: getTodayStr(),
    createdAt: new Date().toISOString(),
  });
  Store.savePoints(pointsList);
  updatePointsBadge();
}

function removePoints(taskId) {
  let pointsList = Store.getPoints();
  pointsList = pointsList.filter(p => p.taskId !== taskId);
  Store.savePoints(pointsList);
  updatePointsBadge();
}

function updatePointsBadge() {
  const pointsList = Store.getPoints();
  const total = pointsList.reduce((sum, p) => sum + p.points, 0);
  const el = document.getElementById('totalPoints');
  if (el) el.textContent = total;
}

function renderPoints() {
  const pointsList = Store.getPoints();
  const today = getTodayStr();

  const total = pointsList.reduce((sum, p) => sum + p.points, 0);
  const todayPoints = pointsList.filter(p => p.date === today).reduce((sum, p) => sum + p.points, 0);

  const summaryTotal = document.getElementById('summaryTotal');
  if (summaryTotal) summaryTotal.textContent = total;

  const summaryToday = document.getElementById('summaryToday');
  if (summaryToday) summaryToday.textContent = todayPoints;

  const historyEl = document.getElementById('pointsHistory');
  if (!historyEl) return;

  if (pointsList.length === 0) {
    historyEl.innerHTML = '<div class="empty-state"><p>还没有积分记录</p></div>';
    return;
  }

  const sorted = [...pointsList].reverse();
  historyEl.innerHTML = sorted.map(p => `
    <div class="history-item">
      <div class="history-item-info">
        <div class="history-item-title">${escapeHtml(p.reason)}</div>
        <div class="history-item-date">${p.date}</div>
      </div>
      <div class="history-item-points">+${p.points}</div>
    </div>
  `).join('');
}
