/*********************************
 * リロード、ブラウザバック無効化処理
 **********************************/
// F5無効
document.addEventListener('keydown', (e) => {
  if ((e.which || e.keyCode) == 116) {
    e.preventDefault();
  }
});

// ブラウザバック無効
history.pushState(null, null, null);
window.addEventListener("popstate", (e) => {
  history.pushState(null, null, null);
  return;
});

/*********************************
 * DOMを取得
 **********************************/
let dx = document.getElementById('dx');　//x座標書くところ
let dy = document.getElementById('dy');　//y座標書くところ
let ave = document.getElementById('d-ave');　//遭遇率
let count_win = document.getElementById('count-win'); // 勝った回数
let count_level = document.getElementById('level');  // 自分のレベル（1始まり）
let inner = document.getElementById('inner');
let direction = document.getElementsByClassName('direction');
let up = document.getElementById('up');
let left = document.getElementById('left');
let right = document.getElementById('right');
let down = document.getElementById('down');
let teki = document.getElementById('teki');
let fight = document.getElementById('fight');
let escape = document.getElementById('escape');
let result = document.getElementById('select3');
let start = document.getElementById('start');
let tekistep = document.getElementById('steps');

let heichi = document.getElementById('heichi');
let mori = document.getElementById('mori');
let numachi = document.getElementById('numachi');

let map = document.getElementById('map');



/*********************************
 * 変数を定義
 **********************************/
let h_goal = false;
let m_goal = false;
let n_goal = false;
let flag = false;
let flag_escape = true;

let pic = ["./images/teki.png", "./images/teki2.png"];
let steps = [up, left, down, right];

let randoms = [];
let Objects = {}; //オブジェクトを格納
/*********************************
 * クラスを定義
 **********************************/

/* ------------------------
 歩数計クラス
 ------------------------ */
class Walk {
  constructor() {
    this.count_step = 0; // 歩数合計
    this.count_left = 0; // 歩数左
    this.count_right = 0; // 歩数右
    this.count_up = 0; // 歩数前
    this.count_down = 0; // 歩数後ろ
    this.encounter = 0; // 敵に遭遇した回数

    this.dx = 0; // X座標
    this.dy = 0; // Y座標
  }

  // X座標を返す
  getX() {
    return this.dx;
  }

  //Y座標を返す
  getY() {
    return this.dy;
  }

  //全ての歩数を配列で返す
  getAllStep() {
    return {
      'total': this.count_step,  // 合計歩数
      'up': this.count_up,    // 前へ歩いた数
      'down': this.count_down,  // 後ろへ歩いた数
      'left': this.count_left,  // 左へ歩いた数
      'right': this.count_right, // 右へ歩いた数
    }
  }

  getXandY() {
    return {
      'dx': this.dx,
      'dy': this.dy
    }
  }

  // 敵に遭遇した回数を返す
  getEncounter() {
    return this.encounter;
  }


  /**
   * X座標、Y座標をset
   * @param where [string] どの方向
   */
  setXandY(where) {
    switch (where) {
      case "up":
        this.count_up++;   // 前 ++
        this.count_step++; // 合計 ++
        this.dy++;         // Y座標 ++
        break;

      case "down":
        this.count_down++; // 後ろ ++
        this.count_step++; // 合計 ++
        this.dy--;         // Y座標 --
        break;

      case "left":
        this.count_left++; // 左 ++
        this.count_step++; // 合計 ++
        this.dx--;         // X座標 --
        break;

      case "right":
        this.count_right++; // 右 ++
        this.count_step++;  // 合計++
        this.dx++;          // X座標 ++
        break;
    }
  }
}


/* ------------------------
 目的地クラス
 ------------------------ */
class Place {
  constructor(range, path, x, y) {
    this.range = range; // 1 ~ maxの間(遭遇する歩数)
    this.img = path;  // 目的地の画像のpathを格納 
    this.x = x;     // 目的地までのX座標
    this.y = y;     // 目的地までのY座標

    this.toX = 0;     // 目的地まであとX座標はどれくらい？
    this.toY = 0;     // 目的地まであとY座標はどれくらい？
  }

  // rangeを返す
  getRange() {
    return this.range;
  }

  // イメージまでのpathを返す
  getImg() {
    return this.img;
  }

  // 目的地までのX座標とY座標をJSON形式で返す
  getXandY() {
    return {
      'x': this.x,
      'y': this.y
    }
  }

  getToXandToY() {
    return {
      'toX': this.toX,
      'toY': this.toY
    }
  }

  /**
   * 目的地までを計算する
   * @param x [int] 目的地まであとXがどのくらいか
   * @param y [int] 目的地まであとYがどのくらいか
   */
  setToXandToY(x, y) {
    this.toX = x;
    this.toY = y;
  }
}
/* ------------------------
 勇者クラス
 ------------------------ */
class Brave {
  constructor(winPro, escAway, level) {
    this.count_pro = winPro;  // 勝率
    this.count_away = escAway; // 逃げられる確率

    this.level = 0; // 勇者のレベル
  }

  // 勝率を返す
  getWinPro() {
    return this.count_pro;
  }

  // 逃げられる確率を返す
  getEscAway() {
    return this.count_away;
  }

  // levelを返す
  getLevel() {
    return this.level;
  }

  //level upしたら 1レベずつレベルをあげる
  setLevel() {
    this.level++;
  }
}


/*********************************
 * 関数を定義
 **********************************/
/* 以下の変数をPlaceのインスタンスに格納して使うようにする
-----------------------------------------

function Dog(name, cry) {
  this.name = name;
  this.back = function(){
    console.log(cry);
  };
}
  var dog = new Dog("太郎", "わんわん");
  console.log(dog.name);
  dog.back();




let max         = 50;　//通常の遭遇する歩数
let he_max      = 90;　//平地で遭遇する歩数
let mo_max      = 110; //森で遭遇する歩数
let nu_max      = 120;　//沼地で遭遇する歩数
let map_heichi  = [3, 5];　   
let map_mori    = [6, -4];    
let map_numachi = [-1, -10];
let mpic        = ["./images/map_heichi.jpg", "./images/map_mori.jpg", "./images/map_numachi.jpg"];
-----------------------------------------
*/
/* ------------------------
 最初にここでインスタンス化する
 ------------------------ */
const initializeInstance = () => {
  Objects.wal = new Walk; //歩数系のインスタンス
  Objects.place = {
    'nomal': new Place(50, '', 0, 0),                            // Startから目的地まで
    'heichi': new Place(90, "./images/map_heichi.jpg", 3, 5),     // 平地インスタンス
    'mori': new Place(110, "./images/map_mori.jpg", 6, -4),     // 森インスタンス
    'numachi': new Place(120, "./images/map_numachi.jpg", -1, -10) // 沼地インスタンス
  }
  Objects.brave = new Brave(400, 250); // 勇者インスタンス
}

/* ------------------------
 エンカウント処理
 ------------------------ */
let encounterRate = (val) => {
  // 敵に遭遇する歩数
  for (let i = 0; i < val; i++) {
    let ran = intRandom();
    if (!randoms.includes(ran)) {
      randoms.push(ran);
    }
  }
  randoms.sort(function (a, b) {
    return (a < b ? -1 : 1);
  });
}

/* ------------------------
 敵と遭遇した時
 ------------------------ */
let encount = (val) => {

  // 遭遇した回数
  encounter++;

  // 遭遇率　遭遇した歩数　/ 遭遇した回数
  ave.innerHTML = Math.round(val / encounter, 2);
  // 敵出現ログ
  let x = randoms.shift();
  tekistep.innerHTML += `${count_step}歩目<br>`;
  // 敵の画像を表示
  teki.src = pic[0];
  result.innerHTML = "敵が現れた！"
  for (let i = 0; i < direction.length; i++) {
    direction[i].style.display = 'none';
  }
}


/* ------------------------
 ここで表示周りの操作をする
 => htmlに表示させるのは、
  - 歩数X: 
  - 歩数Y: 
  - 平地まで 歩数X:   歩数Y: 
  - 森まで   歩数X:  歩数Y: 
  - 沼地まで 歩数X:  歩数Y: 
  - 倒した敵の数: 
  - 敵出現平均歩数: 0
  - 敵出現ログ
  - 敵が現れてた or 勝った or 負けた
 ------------------------ */
const showToHtml = () => {
  /* 歩数X, 歩数Y を表示 */
  dx.innerHTML = Objects.walk.getXandY()['x'];
  dy.innerHTML = Objects.walk.getXandY()['y'];

  /* 各々の場所オブジェクトからX座標と、Y座標を持ってきて表示 */
  let hc = heichi.children; // 平地周りの表示
  let mc = mori.children;   // 森周りの表示
  let uc = numachi.children;// 沼地周りの表示

  for (let i = 0; i < hc.length; i++) {
    switch (hc[i].className) {
      case 'mapX':
        hc[0].textContent = Objects.place.heichi.getToXandToY()['x'];
        mc[0].textContent = Objects.place.mori.getToXandToY()['x'];
        uc[0].textContent = Objects.place.numachi.getToXandToY()['x'];
        break;
      case 'mapY':
        hc[1].textContent = Objects.place.heichi.getToXandToY()['y'];
        mc[1].textContent = Objects.place.mori.getToXandToY()['y'];
        uc[1].textContent = Objects.place.mori.getToXandToY()['y'];
        break;
    }
  }
}


/* ------------------------
 前後左右ボタンの歩数・座標カウントしてオブジェクトにset
 ------------------------ */
let tokotoko = (steps) => {
  Objects.walk.setXandY(steps); // Walkクラスに進んだ方向を入れる。

  let walkX = Objects.walk.getXandY()['dx'];         // 歩数のX座標
  let walkY = Objects.walk.getXandY()['dy'];         // 歩数のY座標
  let heichiX = Objects.place.heichi.getXandY()['x'];  // 平地に設定したx座標
  let heichiY = Objects.place.heichi.getXandY()['y'];  // 平地に設定したy座標
  let moriX = Objects.place.mori.getXandY()['x'];    // 森に設定したx座標
  let moriY = Objects.place.mori.getXandY()['y'];    // 森に設定したy座標
  let numachiX = Objects.place.numachi.getXandY()['x']; // 沼地に設定したx座標
  let numachiY = Objects.place.numachi.getXandY()['y']; // 沼地に設定したy座標

  let mhToX = heichiX - walkX;  // 平地まであとX
  let mhToY = heichiY - walkY;  // 平地まであとY
  let moToX = moriX - walkX;  // 森まであとX
  let moToY = moriY - walkY;  // 森まであとY
  let muToX = numachiX - walkX;  // 沼地まであとX
  let muToY = numachiY - walkY;  // 沼地まであとY

  Objects.place.heichi.setToXandToY(mhToX, mhToY); // 平地オブジェクトに値をset
  Objects.place.mori.setToXandToY(moToX, moToY);   // 森オブジェクトに値をset
  Objects.place.numachi.setToXandToY(muToX, muToY);// 沼地オブジェクトに値をset
}

/**
 * 目的地に到達
 */
const getDestination = () => {
  let mhX = Objects.place.heichi.getToXandToY()['x']; // 平地の目的地X
  let mhY = Objects.place.heichi.getToXandToY()['y']; // 平地の目的地Y
  let moX = Objects.place.mori.getToXandToY()['x'];   // 森の目的地X
  let moY = Objects.place.mori.getToXandToY()['y'];   // 森の目的地Y
  let muX = Objects.place.numachi.getToXandToY()['x'];// 沼地の目的地X
  let muY = Objects.place.numachi.getToXandToY()['y'];// 沼地の目的地Y

  // 平地
  if (mhX <= 0 && mhY <= 0 && !h_goal) {
    encounterRate(Objects.place.heichi.getRange());
    inner.style.backgroundImage = 'url(' + mpic[0] + ')'; //画像
    h_goal = true;
  } else if (mhX > 0 && h_goal || mhY > 0 && h_goal) {
    encounterRate(max);
    h_goal = false;
    inner.style.background = 'none'; //画像
  }

  // 森
  if (moX <= 0 && moY >= 0 && !m_goal) {
    encounterRate(Objects.place.mori.getRange());
    inner.style.backgroundImage = 'url(' + mpic[1] + ')'; //画像
    m_goal = true;
  } else if (moX > 0 && m_goal || moY < 0 && m_goal) {
    encounterRate(max);
    m_goal = false;
    inner.style.background = 'none'; //画像
  }

  // 沼地
  if (muX >= 0 && muY >= 0 && !n_goal) {
    encounterRate(Objects.place.numachi.getRange());
    inner.style.backgroundImage = 'url(' + mpic[2] + ')'; //画像
    m_goal = true;
  } else if (muX < 0 && n_goal || muY < 0 && n_goal) {
    encounterRate(max);
    n_goal = false;
    inner.style.background = 'none'; //画像
  }
}

/* ------------------------
 エンカウントに使用。ここで得られた値と比べる
 ------------------------ */
let intRandom = () => {
  return Math.floor(Math.random() * 500 + 1);
};

/* ------------------------
 戦うボタンを押下した時の処理
 ------------------------ */
let matchResult = () => {
  // ある確率で敵に勝つ
  let pro = intRandom();

  if (flag) {
    if (pro < Objects.brave.getWinPro()) {
      count_win.innerHTML = Number(count_win.textContent) + 1;
      teki.src = pic[1];
      result.innerHTML = "勝った！<br>歩く方向を押してください";
      for (let i = 0; i < direction.length; i++) {
        direction[i].style.display = "block";
      }

      // 10回敵に勝つごとにLVアップ、LVアップするごとに敵に勝つ確率が上がる
      if (Number(count_win.textContent) % 10 === 0) {
        count_level.innerHTML = Number(count_level.textContent) + 1;
        count_pro++;
      }

    } else {
      result.innerHTML = "負けた！<br>勇者は死んでしまった";
      for (let i = 0; i < direction.length; i++) {
        direction[i].style.display = "none";
      }
    }


    flag = false;
    flag_escape = true;
    console.log(`flag:` + flag);
  }
}

/* -----------
  逃げられないが出たら、戦うボタンだけ押せるようにしたい
  ----*/
let escapeResult = () => {
  let away = intRandom();
  if (flag && flag_escape) {
    if (away > count_away) {
      result.innerHTML = "逃げることができた！";

      for (let i = 0; i < direction.length; i++) {
        direction
        [i].style.display = "block";
      }
      flag = false;
      flag_escape = true;

    } else {
      result.innerHTML = "逃げられない！";
<<<<<<< HEAD
      flag_escape = true;
=======
      alert('たたかうしかない！')
      flag_escape = false;
>>>>>>> 5ede09a3b5e4e8cf0fa9754ac79499b7ed1d511f
    }
  }
}




/*********************************
 * クリック処理
 **********************************/

// 遭遇する歩数
encounterRate(max);


/* ------------------------
 前後左右ボタンクリック処理
 ------------------------ */
for (let j = 0; j < steps.length; j++) {
  steps[j].addEventListener("click", (event) => {

    // event.target.id　= 「up down left right うちどれか」
    tokotoko(event.target.id);

    // 遭遇したときの処理
    for (var value of randoms) {
      if (count_step === value) {
        encount(value);

        // このvalueランダムは遭遇する歩数
        flag = true;
      }
    }
  }, false);
}

// 戦うボタンを押したら
fight.addEventListener('click', () => {
  matchResult();
}, false);

// 逃げるボタンを押したら
escape.addEventListener('click', () => {

  escapeResult();
}, false);


// スタートボタンで初期化
start.addEventListener('click', () => {
  location.reload();
}, false);