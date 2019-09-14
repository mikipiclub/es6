let count_step = 0;//歩いた合計歩数
let count_left = 0;// 左に歩いた歩数
let count_right = 0;// 右に歩いた歩数
let count_up = 0;// 前に歩いた歩数
let count_down = 0;// 後ろに歩いた歩数

let dx = document.getElementById('dx');　//x座標書くところ
let dy = document.getElementById('dy');　//y座標書くところ

let encounter = 0; // 敵との遭遇回数
let ave = document.getElementById('d-ave');　//遭遇率
let count_win = document.getElementById('count-win'); // 勝った回数
let count_level = document.getElementById('level');  // 自分のレベル（1始まり）
let count_pro = 200; // 確率に使う数字 この数字以下だったら勝ち
let count_away = 250; //逃げられる確率に使う数字

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

let map_heichi = [3, 5];
let map_mori = [6, -4];
let map_numachi = [-1, -10];
let h_goal = false;
let m_goal = false;
let n_goal = false;

let map = document.getElementById('map');
let flag = false;
let flag_escape = false;

// 画像のパス
let pic = ["./images/teki.png", "./images/teki2.png"];
let mpic = ["../images/map_heichi.jpg", "./images/map_mori.jpg", "/images/map_numachi.jpg"];
let steps = [up, left, down, right];
let max = 50;　//通常の遭遇する歩数
let he_max = 120;　//平地で遭遇する歩数
let mo_max = 130; //森で遭遇する歩数
let nu_max = 140;　//沼地で遭遇する歩数

let randoms = [];
let intRandom = () => Math.floor(Math.random() * 300 + 1);

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
  console.log(randoms);

}
// 遭遇する歩数
encounterRate(100);

// 前後左右ボタンクリック処理
for (let j = 0; j < steps.length; j++) {
  steps[j].addEventListener("click", (event) => {
    // 歩数カウント処理
    tokotoko(event.target.id);

    // 遭遇したときの処理
    for (var value of randoms) {
      if (count_step === value) {

        encount(value);
        // このvalueはランダムは遭遇する歩数
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

// 遭遇した時
let encount = (val) => {

  // 遭遇した回数
  encounter++;
  console.log("びんご");
  // 遭遇率　遭遇した歩数　/ 遭遇した回数
  ave.innerHTML = Math.round(val / encounter, 2);
  // 敵出現ログ
  let x = randoms.shift();
  tekistep.innerHTML += `${x}歩目<br>`;
  // 敵の画像を表示
  teki.src = pic[0];
  result.innerHTML = "敵が現れた！"
  for (let i = 0; i < direction.length; i++) {
    direction[i].style.display = 'none';
  }
}

// 前後左右ボタンの歩数・座標カウント
let tokotoko = (steps) => {
  switch (steps) {
    case "up":
      count_up++;
      count_step++;
      dy.innerHTML = Number(dy.textContent) + 1;
      break;
    case "down":
      count_down++;
      count_step++;
      dy.innerHTML = Number(dy.textContent) - 1;
      break;
    case "left":
      count_left++;
      count_step++;
      dx.innerHTML = Number(dx.textContent) - 1;
      break;
    case "right":
      count_right++;
      count_step++;
      dx.innerHTML = Number(dx.textContent) + 1;
      break;
    default:
      break;
  }

  let mh = map_heichi[0] - dx.textContent,
    mh1 = map_heichi[1] - dy.textContent,
    hc = heichi.children;

  let mo = map_mori[0] - dx.textContent,
    mo1 = map_mori[1] - dy.textContent,
    mc = mori.children;

  let mu = map_numachi[0] - dx.textContent,
    mu1 = map_numachi[1] - dy.textContent,
    uc = numachi.children;

  for (let i = 0; i < hc.length; i++) {
    switch (hc[i].className) {
      case 'mapX':
        hc[0].textContent = mh;
        mc[0].textContent = mo;
        uc[0].textContent = mu;
        break;
      case 'mapY':
        hc[1].textContent = mh1;
        mc[1].textContent = mo1;
        uc[1].textContent = mu1;
        break;
      default:
        break;
    }
  }
  /* ----------- 目的地に到達！ ----------------*/

  // 平地
  if (mh <= 0 && mh1 <= 0 && !h_goal) {
    encounterRate(he_max);
    console.log(randoms);
    alert('平地にやってきた！');
    inner.style.backgroundImage = 'url(' + mpic[0] + ')';
    h_goal = true;

  } else if (mh > 0 && h_goal || mh1 > 0 && h_goal) {
    alert('平地から抜け出した！');
    h_goal = false;
    inner.style.background = 'none';
  }

  // 森
  if (mo <= 0 && mo1 >= 0 && !m_goal) {
    encounterRate(120);
    console.log(randoms);
    alert('森にやってきた！');
    inner.style.backgroundImage = 'url(' + mpic[1] + ')';
    m_goal = true;

  } else if (mo > 0 && m_goal || mo1 < 0 && m_goal) {
    alert(' 森から抜け出した！');
    m_goal = false;
    inner.style.background = 'none';
  }

  // 沼地
  if (mu >= 0 && mu1 >= 0 && !n_goal) {
    encounterRate(nu_max);
    console.log(randoms);
    alert('沼地にやってきた！');
    inner.style.backgroundImage = 'url(' + mpic[2] + ')';
    m_goal = true;

  } else if (mu < 0 && n_goal || mu1 < 0 && n_goal) {
    alert(' 沼地から抜け出した！');
    n_goal = false;
    inner.style.background = 'none';
  }

}/* -----------ここまで----------------*/

let matchResult = () => {
  // ある確率で敵に勝つ
  let pro = intRandom();

  if (flag) {
    if (pro < count_pro) {
      count_win.innerHTML = Number(count_win.textContent) + 1;
      teki.src = pic[1];
      result.innerHTML = "勝った！<br>歩く方向を押してください";

      // 10回的に勝つごとにLVアップ、LVアップするごとに敵に勝つ確率が上がる
      if (Number(count_win.textContent) % 10 === 0) {
        count_level.innerHTML = Number(count_level.textContent) + 1;
        count_pro++;

        alert('やったね！！\nレベルあっぷ！');
      }
    } else {
      alert('負けた！\n勇者は死んでしまった');
      result.innerHTML = "負けた！<br>勇者は死んでしまった";
    }

    for (let i = 0; i < direction.length; i++) {
      direction[i].style.display = "block"
    }
    console.log(`${pro} ===> 確率の数字`);
    console.log(`${count_pro} ===> 確率基準の数字`);
    console.log(`${count_level.textContent} ===> レベル`);
    console.log(`${count_win.textContent} ===> 勝った回数`);
    flag = false;
    flag_escape = false;
    console.log(`flag:` + flag);
  }
}

/* -----------
  逃げられないが出たら、戦うボタンだけ押せるようにしたい
  ----*/

// ある確率で逃げられる

let escapeResult = () => {
  let away = intRandom();
  if (flag && !flag_escape) {
    if (away > count_away) {
      result.innerHTML = "逃げることができた！";

      for (let i = 0; i < direction.length; i++) {
        direction
        [i].style.display = "block";
      }
      flag = false;
      flag_escape = false;

    } else {
      result.innerHTML = "逃げられない！";
      alert('たたかうしかない！')
      flag_escape = true;
    }

  }
}

/* ---r------------ここまで-----------------------*/


// スタートボタンで初期化
start.addEventListener('click', () => {
  location.reload();
}, false);

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
