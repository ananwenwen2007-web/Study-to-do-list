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

// ===== 工具函数 =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
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
          reading: '盼望着，盼望着，东风来了，春天的脚步近了。\n\n一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。\n\n小草偷偷地从土里钻出来，嫩嫩的，绿绿的。园子里，田野里，瞧去，一大片一大片满是的。坐着，躺着，打两个滚，踢几脚球，赛几趟跑，捉几回迷藏。风轻悄悄的，草软绵绵的。\n\n桃树、杏树、梨树，你不让我，我不让你，都开满了花赶趟儿。红的像火，粉的像霞，白的像雪。花里带着甜味儿；闭了眼，树上仿佛已经满是桃儿、杏儿、梨儿。花下成千成百的蜜蜂嗡嗡地闹着，大小的蝴蝶飞来飞去。野花遍地是：杂样儿，有名字的，没名字的，散在草丛里，像眼睛，像星星，还眨呀眨的。'
        },
        '《济南的冬天》老舍': {
          reading: '对于一个在北平住惯的人，像我，冬天要是不刮风，便觉得是奇迹；济南的冬天是没有风声的。对于一个刚由伦敦回来的人，像我，冬天要能看得见日光，便觉得是怪事；济南的冬天是响晴的。自然，在热带的地方，日光是永远那么毒，响亮的天气，反有点叫人害怕。可是，在北中国的冬天，而能有温晴的天气，济南真得算个宝地。\n\n设若单单是有阳光，那也算不了出奇。请闭上眼睛想：一个老城，有山有水，全在天底下晒着阳光，暖和安适地睡着，只等春风来把它们唤醒，这是不是个理想的境界？'
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
let dictationWords = [];
let currentWordIndex = 0;
let dictationCorrect = 0;
let dictationTotal = 0;
let currentPhotoTaskId = null;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAddTaskButton();
  initModalButtons();
  renderTasks();
  renderPoints();
  initReadingSelect();
  initDictationSelect();
  initPhotoUpload();

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

  if (tabId === 'tabPoints') renderPoints();
}

// ===== 添加任务按钮 =====
function initAddTaskButton() {
  const btn = document.getElementById('btnAddTask');
  if (btn) {
    btn.addEventListener('click', openAddTaskModal);
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

  // 听写按钮
  const btnStart = document.getElementById('btnStartDictation');
  if (btnStart) btnStart.addEventListener('click', startDictation);

  const btnStop = document.getElementById('btnStopDictation');
  if (btnStop) btnStop.addEventListener('click', stopDictation);

  const btnSubmit = document.getElementById('btnSubmitAnswer');
  if (btnSubmit) btnSubmit.addEventListener('click', submitAnswer);

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
  const today = getTodayStr();
  const todayTasks = tasks.filter(t => t.date === today);

  const container = document.getElementById('taskList');
  if (!container) return;

  if (todayTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"></div>
        <p>今天还没有任务哦</p>
        <p class="empty-hint">点击 ＋ 添加任务开始学习吧</p>
      </div>`;
    return;
  }

  container.innerHTML = todayTasks.map(task => `
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
  if (!confirm('确定删除这个任务吗？')) return;

  let tasks = Store.getTasks();
  tasks = tasks.filter(t => t.id !== taskId);
  Store.saveTasks(tasks);
  removePoints(taskId);
  renderTasks();
  updatePointsBadge();
  showToast('任务已删除');
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

// ===== 英语听写 =====
function initDictationSelect() {
  const select = document.getElementById('dictationSelect');
  if (!select) return;

  select.innerHTML = '<option value="">-- 选择单元 --</option>';

  if (TEXTBOOK_DATA.english) {
    Object.keys(TEXTBOOK_DATA.english).forEach(publisher => {
      Object.keys(TEXTBOOK_DATA.english[publisher]).forEach(grade => {
        Object.keys(TEXTBOOK_DATA.english[publisher][grade]).forEach(unit => {
          const opt = document.createElement('option');
          opt.value = 'en|' + publisher + '|' + grade + '|' + unit;
          opt.textContent = publisher + ' ' + grade + ' ' + unit;
          select.appendChild(opt);
        });
      });
    });
  }

  select.addEventListener('change', () => {
    const val = select.value;
    const wordEl = document.getElementById('currentWord');
    if (!wordEl) return;

    if (!val) {
      wordEl.innerHTML = '<p class="placeholder-text">选择单元后点击开始听写</p>';
      return;
    }

    const parts = val.split('|');
    const words = getTextbookWords(parts[0], parts[1], parts[2], parts[3]);
    if (words) {
      wordEl.innerHTML = '<div><div class="word-display">' + words.length + ' 个单词</div><div class="word-hint">点击"开始听写"开始</div></div>';
    }
  });
}

function loadDictationForTask(task) {
  if (task.wordList && task.wordList.length > 0) {
    dictationWords = [...task.wordList];
  } else {
    dictationWords = ['hello', 'world', 'student', 'teacher', 'school'];
  }

  currentWordIndex = 0;
  dictationCorrect = 0;
  dictationTotal = 0;

  const wordEl = document.getElementById('currentWord');
  if (wordEl) {
    wordEl.innerHTML = '<div><div class="word-display">' + dictationWords.length + ' 个单词</div><div class="word-hint">点击"开始听写"开始</div></div>';
  }

  const answerDiv = document.getElementById('answerInput');
  if (answerDiv) answerDiv.style.display = 'none';

  const resultEl = document.getElementById('dictationResult');
  if (resultEl) {
    resultEl.className = 'dictation-result';
    resultEl.textContent = '';
  }

  // 保存任务ID
  const btnStart = document.getElementById('btnStartDictation');
  if (btnStart) btnStart.dataset.taskId = task.id;
}

function startDictation() {
  // 先从选择器获取单词
  const select = document.getElementById('dictationSelect');
  if (select && select.value && dictationWords.length === 0) {
    const parts = select.value.split('|');
    const words = getTextbookWords(parts[0], parts[1], parts[2], parts[3]);
    if (words) {
      dictationWords = words.map(w => w.word);
    }
  }

  if (dictationWords.length === 0) {
    showToast('请先选择单元或添加听写任务');
    return;
  }

  currentWordIndex = 0;
  dictationCorrect = 0;
  dictationTotal = 0;

  const btnStart = document.getElementById('btnStartDictation');
  const btnStop = document.getElementById('btnStopDictation');
  if (btnStart) btnStart.style.display = 'none';
  if (btnStop) btnStop.style.display = 'flex';

  speakCurrentWord();
}

function speakCurrentWord() {
  if (currentWordIndex >= dictationWords.length) {
    finishDictation();
    return;
  }

  const word = dictationWords[currentWordIndex];
  const wordEl = document.getElementById('currentWord');
  if (wordEl) {
    wordEl.innerHTML = '<div><div class="word-display">第 ' + (currentWordIndex + 1) + '/' + dictationWords.length + ' 个</div><div class="word-hint">仔细听，然后输入你听到的单词</div></div>';
  }

  const answerDiv = document.getElementById('answerInput');
  if (answerDiv) answerDiv.style.display = 'flex';

  const answerInput = document.getElementById('wordAnswer');
  if (answerInput) {
    answerInput.value = '';
    setTimeout(() => answerInput.focus(), 100);
  }

  const resultEl = document.getElementById('dictationResult');
  if (resultEl) {
    resultEl.className = 'dictation-result';
    resultEl.textContent = '';
  }

  speakWord(word);
}

function speakWord(word) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.8;

  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en'));
  if (enVoice) utterance.voice = enVoice;

  window.speechSynthesis.speak(utterance);

  utterance.onend = () => {
    setTimeout(() => {
      const u2 = new SpeechSynthesisUtterance(word);
      u2.lang = 'en-US';
      u2.rate = 0.8;
      if (enVoice) u2.voice = enVoice;
      window.speechSynthesis.speak(u2);
    }, 800);
  };
}

function submitAnswer() {
  const answerInput = document.getElementById('wordAnswer');
  if (!answerInput) return;

  const answer = answerInput.value.trim().toLowerCase();
  if (!answer) return;

  const correct = dictationWords[currentWordIndex].toLowerCase();
  dictationTotal++;

  const resultEl = document.getElementById('dictationResult');
  if (!resultEl) return;

  if (answer === correct) {
    dictationCorrect++;
    resultEl.className = 'dictation-result show correct';
    resultEl.textContent = '✅ 正确！';
  } else {
    resultEl.className = 'dictation-result show wrong';
    resultEl.textContent = '❌ 正确答案：' + dictationWords[currentWordIndex];
  }

  currentWordIndex++;
  setTimeout(() => speakCurrentWord(), 1500);
}

function stopDictation() {
  finishDictation();
}

function finishDictation() {
  const btnStart = document.getElementById('btnStartDictation');
  const btnStop = document.getElementById('btnStopDictation');
  if (btnStart) btnStart.style.display = 'flex';
  if (btnStop) btnStop.style.display = 'none';

  const wordEl = document.getElementById('currentWord');
  if (wordEl) {
    wordEl.innerHTML = '<div><div class="word-display">听写结束</div><div class="word-hint">正确 ' + dictationCorrect + '/' + dictationTotal + '</div></div>';
  }

  const answerDiv = document.getElementById('answerInput');
  if (answerDiv) answerDiv.style.display = 'none';

  const resultEl = document.getElementById('dictationResult');
  if (resultEl) {
    resultEl.className = 'dictation-result show';
    resultEl.textContent = '📊 听写结果：正确 ' + dictationCorrect + '/' + dictationTotal + ' (' + (dictationTotal > 0 ? Math.round(dictationCorrect / dictationTotal * 100) : 0) + '%)';
  }

  // 如果正确率 >= 60%，标记任务完成
  if (dictationTotal > 0 && dictationCorrect / dictationTotal >= 0.6) {
    const btnStart = document.getElementById('btnStartDictation');
    const taskId = btnStart ? btnStart.dataset.taskId : null;
    if (taskId) {
      completeTaskById(taskId, '听写完成');
    }
    showToast('🎉 听写完成！正确率 ' + Math.round(dictationCorrect / dictationTotal * 100) + '%');
  } else if (dictationTotal > 0) {
    showToast('正确率 ' + Math.round(dictationCorrect / dictationTotal * 100) + '%，继续加油！');
  }

  dictationWords = [];
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
