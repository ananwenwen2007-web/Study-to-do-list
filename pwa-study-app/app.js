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
          reading: '盼望着，盼望着，东风来了，春天的脚步近了。\n\n一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。\n\n小草偷偷地从土里钻出来，嫩嫩的，绿绿的。园子里，田野里，瞧去，一大片一大片满是的。坐着，躺着，打两个滚，踢几脚球，赛几趟跑，捉几回迷藏。风轻悄悄的，草软绵绵的。\n\n桃树、杏树、梨树，你不让我，我不让你，都开满了花赶趟儿。红的像火，粉的像霞，白的像雪。花里带着甜味儿；闭了眼，树上仿佛已经满是桃儿、杏儿、梨儿。花下成千成百的蜜蜂嗡嗡地闹着，大小的蝴蝶飞来飞去。野花遍地是：杂样儿，有名字的，没名字的，散在草丛里，像眼睛，像星星，还眨呀眨的。\n\n\"吹面不寒杨柳风\"，不错的，像母亲的手抚摸着你。风里带来些新翻的泥土的气息，混着青草味儿，还有各种花的香，都在微微润湿的空气里酝酿。鸟儿将窠巢安在繁花嫩叶当中，高兴起来了，呼朋引伴地卖弄清脆的喉咙，唱出宛转的曲子，与轻风流水应和着。牛背上牧童的短笛，这时候也成天在嘹亮地响。\n\n雨是最寻常的，一下就是三两天。可别恼。看，像牛毛，像花针，像细丝，密密地斜织着，人家屋顶上全笼着一层薄烟。树叶子却绿得发亮，小草也青得逼你的眼。傍晚时候，上灯了，一点点黄晕的光，烘托出一片安静而和平的夜。乡下去，小路上，石桥边，撑起伞慢慢走着的人；还有地里工作的农夫，披着簔，戴着笠的。他们的房屋，稀稀疏疏的，在雨里静默着。\n\n天上风筝渐渐多了，地上孩子也多了。城里乡下，家家户户，老老小小，他们也赶趟儿似的，一个个都出来了。舒活舒活筋骨，抖擞抖擞精神，各做各的一份事去。\"一年之计在于春\"；刚起头儿，有的是工夫，有的是希望。\n\n春天像刚落地的娃娃，从头到脚都是新的，他生长着。\n\n春天像小姑娘，花枝招展的，笑着，走着。\n\n春天像健壮的青年，有铁一般的胳膊和腰脚，他领着我们上前去。'
        },
        '《济南的冬天》老舍': {
          reading: '对于一个在北平住惯的人，像我，冬天要是不刮风，便觉得是奇迹；济南的冬天是没有风声的。对于一个刚由伦敦回来的人，像我，冬天要能看得见日光，便觉得是怪事；济南的冬天是响晴的。自然，在热带的地方，日光是永远那么毒，响亮的天气反有点叫人害怕。可是，在北中国的冬天，而能有温晴的天气，济南真得算个宝地。\n\n设若单单是有阳光，那也算不了出奇。请闭上眼睛想：一个老城，有山有水，全在天底下晒着阳光，暖和安适地睡着，只等春风来把它们唤醒，这是不是个理想的境界？小山整把济南围了个圈儿，只有北边缺着点口儿。这一圈小山在冬天特别可爱，好像是把济南放在一个小摇篮里，它们全安静不动地低声地说："你们放心吧，这儿准保暖和。"真的，济南的人们在冬天是面上含笑的。他们一看那些小山，心中便觉得有了着落，有了依靠。他们由天上看到山上，便不觉地想起："明天也许就是春天了吧？这样的温暖，今天夜里山草也许就绿起来了吧？"就是这点幻想不能一时实现，他们也并不着急，因为有这样慈善的冬天，干啥还希望别的呢！\n\n最妙的是下点小雪呀。看吧，山上的矮松越发的青黑，树尖儿上顶着一髻儿白花，好像日本看护妇。山尖全白了，给蓝天镶上一道银边。山坡上，有的地方雪厚点儿，有的地方草色还露着；这样，一道儿白，一道儿暗黄，给山们穿上一件带水纹的花衣；看着看着，这件花衣好像被风儿吹动，叫你希望看见一点更美的山的肌肤。等到快日落的时候，微黄的阳光斜射在山腰上，那点儿薄雪好像忽然害了羞，微微露出点粉色。就是下小雪吧，济南是受不住大雪的，那些小山太秀气！\n\n古老的济南，城内那么狭窄，城外又那么宽敞，山坡上卧着些小村庄，小村庄的房顶上卧着点儿雪，对，这是张小水墨画，也许是唐代的名手画的吧。\n\n那水呢，不但不结冰，反倒在绿藻上冒着点儿热气。水藻真绿，把终年贮蓄的绿色全拿出来了。天儿越晴，水藻越绿，就凭这些绿的精神，水也不忍得冻上；况且那长枝的垂柳还要在水里照个影儿呢。看吧，由澄清的河水慢慢往上看吧，空中，半空中，天上，自上而下全是那么清亮，那么蓝汪汪的，整个的是块空灵的蓝水晶。这块水晶里，包着红屋顶、黄草山，像地毯上的小团花的小灰色树影。\n\n这就是冬天的济南。'
        },
        '《背影》朱自清': {
          reading: '我与父亲不相见已二年余了，我最不能忘记的是他的背影。\n\n那年冬天，祖母死了，父亲的差使也交卸了，正是祸不单行的日子。我从北京到徐州，打算跟着父亲奔丧回家。到徐州见着父亲，看见满院狼藉的东西，又想起祖母，不禁簌簌地流下眼泪。父亲说："事已如此，不必难过，好在天无绝人之路！"\n\n回家变卖典质，父亲还了亏空；又借钱办了丧事。这些日子，家中光景很是惨淡，一半为了丧事，一半为了父亲赋闲。丧事完毕，父亲要到南京谋事，我也要回北京念书，我们便同行。'
        },
      },
      '七年级下': {
        '《从百草园到三味书屋》鲁迅': {
          reading: '我家的后面有一个很大的园，相传叫作百草园。现在是早已并屋子一起卖给朱文公的子孙了，连那最末次的相见也已经隔了七八年，其中似乎确凿只有一些野草；但那时却是我的乐园。\n\n不必说碧绿的菜畦，光滑的石井栏，高大的皂荚树，紫红的桑椹；也不必说鸣蝉在树叶里长吟，肥胖的黄蜂伏在菜花上，轻捷的叫天子（云雀）忽然从草间直窜向云霄里去了。单是周围的短短的泥墙根一带，就有无限趣味。'
        },
        '《木兰诗》': {
          reading: '唧唧复唧唧，木兰当户织。不闻机杼声，唯闻女叹息。\n\n问女何所思，问女何所忆。女亦无所思，女亦无所忆。昨夜见军帖，可汗大点兵，军书十二卷，卷卷有爷名。阿爷无大儿，木兰无长兄，愿为市鞍马，从此替爷征。\n\n东市买骏马，西市买鞍鞯，南市买辔头，北市买长鞭。旦辞爷娘去，暮宿黄河边，不闻爷娘唤女声，但闻黄河流水鸣溅溅。旦辞黄河去，暮至黑山头，不闻爷娘唤女声，但闻燕山胡骑鸣啾啾。'
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

function loadDictationForTask(taskId) {
  const task = Store.getTasks().find(t => t.id === taskId);
  if (!task) return;
  dictState.taskId = taskId;
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
