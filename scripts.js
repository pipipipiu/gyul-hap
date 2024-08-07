"use strict";
//设置三种背景色
const BACKGROUND_COLORS = {
    white: "#FFF",
    gray: "#9C9C96",
    black: "#353531"
};
//设置三种图标色
const SHAPE_COLORS = {
    red: "#C81D25",
    blue: "#016FB9",
    yellow: "#FDE935"
};
//形状
const SHAPES = {
    square: {
        height: "60%",
        width: "60%"
    },
    circle: {
        height: "66%",
        width: "66%",
        borderRadius: "50%"
    },
    triangle: {
        width: "35px",
        height: "35px",
        borderLeft: "35px solid transparent",
        borderRight: "35px solid transparent",
        borderBottom: "70px solid "
    }
};

const BORDER_BLACK = "rgb(0, 0, 0)";
const BORDER_RED = "rgb(237, 49, 93)";

const scoreElement = document.getElementById("score");

const logElement = document.getElementById("log");

const wrongLogElement = document.getElementById("wrongLog");
//音频
// let musicWrong = new Audio('music/wrong.mp3');
// let musicAo = new Audio('music/ao.mp3');
// let musicDu = new Audio('music/du.mp3');
//4-24 新增弹窗
// const btn_rank=document.getElementById("rankings");
// const btn_name=document.getElementById("name");
// const close=document.getElementsByClassName("submit_1");
// let form_1=document.getElementById("loginForm");
// let form_2=document.getElementById("rankForm");
//     btn_name.addEventListener('click',function(){
//      if(btn_name.innerText.includes("米团")||btn_name.innerText==="点击登记")
//      {
//          form_1.className="form_1 open";
//      }
// })
//      btn_rank.addEventListener('click',function(){
//          getScore()
//       form_2.className="form_2 open";
// })
//      close[0].addEventListener('click',function(){
//          userName = document.getElementById("userName").value;
//          deptName = document.getElementById("deptName").value;
//          if(!userName||!deptName)
//          {
//              alert('请输入名字和部门')
//              return
//          }
//       sendScore();
//       form_1.className="form_1";
// })
/*
tileBoard
Index - Corresponding Tile
0 - top left
1 - top center
2 - top right
3 - middle left
4 - middle center
5 - middle right
6 - bottom left
7 - bottom center
8 - bottom right

Each tile is an array that contains at index:
0 - backgroundColor
1 - shapeColor
2 - shapeStyles
3 - shape
4 - if the tile is selected (default false)
*/
let tileBoard = [];

// Set round number.
let roundNumber = 1;

// Set total points in the game.
let totalPoints = 0;

// Set log in the game.
let totalLogs = "";
// Set wrong log in the game.
let totalWrongLogs = "";

// Allows player to select tiles in the game (up to 3).
let tilesSelected = 0;

// Contains all Haps on the board and all found Haps.
let allHaps;
let foundHaps;
let rankings;
let userName;
let deptName
const i=Math.floor(Math.random()*900)+100;
// Make all tiles clickable to select them.
makeTilesSelectable();

// Create the board and start the round.
playRound();

// Make the Gyul button clickable.
const gyulButton = document.querySelector(".gyul");
gyulButton.addEventListener("click", checkForGyul);

function sendScore() {

    btn_name.innerText = userName?userName:'米团'+i+"号";
    if(totalPoints==0){
        return;
    }
    $.ajax({
        type: "POST",
        dataType: "json",
        async:false,
        url: 'https://tk.mishudata.com/game-center/score/addBatch',
        contentType: "application/json",
        data:JSON.stringify([{
            "userName":btn_name.innerText,
            "deptName": deptName?deptName:'米加',
            "score": totalPoints
        }]),
        success: function (result) {
            if (!!result) {
            }
        }
    });
}
function getScore() {
    $.ajax({
        type: "Post",
        dataType: "json",
        async:false,
        url: 'https://tk.mishudata.com/game-center/score/getList',
        contentType: "application/json",
        data:JSON.stringify({
        }),
        success: function (result) {
            console.log("data is :" + result)
            if (!!result) {
                rankings=result;
                const rankElement=document.getElementById("rankList");
                  let innerText=""
                rankings.map((t,index)=> { innerText += `【${index+1}】${t.deptName}【${t.userName}】${t.score}分\r \n`} )
                rankElement.innerText =innerText
                console.log(rankElement.innerText)
            }
        }
    });
}
function playRound() {
    tileBoard = [];
    foundHaps = [];
    const allTiles = document.querySelectorAll(".tile");
    const allShapes = document.querySelectorAll(".shape");

    for (let i = 0; i < allTiles.length; i++) {
        let currentTile = allTiles[i];
        let currentShape = allShapes[i];

        // Reset tile styles to blank first.
        currentTile.removeAttribute('style');
        currentShape.removeAttribute('style');

        // Make sure tile styles don't repeat.
        let styles;
        do {
            styles = createTile();
        } while (checkTileExists(styles));

        applyTileStyles(currentTile, currentShape, styles);
        tileBoard.push(styles);
    }

    // Find all Haps on the board.
    allHaps = findAllHaps();
};

function applyTileStyles(tile, shape, cssStyles) {
    // Apply tile background color.
    tile.style.backgroundColor = BACKGROUND_COLORS[cssStyles[0]];

    // Apply shape color.
    const isTriangle = cssStyles[3] == "triangle";
    if (isTriangle) {
        shape.style.backgroundColor = "transparent";
    } else {
        shape.style.backgroundColor = SHAPE_COLORS[cssStyles[1]];
    }

    // Apply shape.
    for (let cssStyle in cssStyles[2]) {
        shape.style[cssStyle] = cssStyles[2][cssStyle];
    }
};

function createTile() {
    // Get background color.
    let backgroundColor = getRandomFromArray(Object.keys(BACKGROUND_COLORS));

    // Get shape color.
    let shapeColor = getRandomFromArray(Object.keys(SHAPE_COLORS));

    // Get shape.
    let shape = getRandomFromArray(Object.keys(SHAPES));
    let shapeStyles = SHAPES[shape];
    if (shape == "triangle") {
        shapeStyles = Object.assign({}, shapeStyles);
        shapeStyles.borderBottom += SHAPE_COLORS[shapeColor];
    }

    return [backgroundColor, shapeColor, shapeStyles, shape, false];
};

function checkTileExists(tileToCheck) {
    for (let i = 0; i < tileBoard.length; i++) {
        if (checkTilesAreEqual(tileBoard[i], tileToCheck)) {
            return true;
        }
    }
    return false;
};

function checkTilesAreEqual(tile1, tile2) {
    if (tile1[0] == tile2[0] &&
        tile1[1] == tile2[1] &&
        tile1[3] == tile2[3]) {
        return true;
    }
    return false;
};

function makeTilesSelectable() {
    const allTiles = document.querySelectorAll(".tile");

    for (let i = 0; i < allTiles.length; i++) {
        let currentTile = allTiles[i];

        currentTile.addEventListener("click", function() {
            // musicDu.play();
            let tileIsSelected = tileBoard[i][4];

            if (!tileIsSelected) {
                tilesSelected++;
                currentTile.style.borderColor = BORDER_RED;
                tileBoard[i][4] = true;
            } else {
                if (tilesSelected != 0) {
                    tilesSelected--;
                }
                currentTile.style.borderColor = BORDER_BLACK;
                tileBoard[i][4] = false;
            }

            // //console.log(`CLICKED!: ${tileBoard[i]}`);

            checkThreeTilesSelected();
        });
    }
}

function checkThreeTilesSelected() {
    if (tilesSelected == 3) {
        // Check if a Hap was formed by the player.
        let selectedTileIndexes = "";
        let selectedTiles = [];
        for (let i = 0; i < tileBoard.length; i++) {
            let tileIsSelected = tileBoard[i][4];
            if (tileIsSelected) {
                selectedTiles.push(tileBoard[i]);
                selectedTileIndexes += i.toString();
            }
        }
        let hap = checkForHap(selectedTiles);
        let testList=[
            "哇哦",
        ];
        if (hap && !foundHaps.includes(selectedTileIndexes)) {
            testList=[
                "OHHHHHHHHH",
                "牛啊牛啊",
                "66666666666666",
                "卡姿兰大眼睛也没有你的雪亮",
                "你是我亲眼见了也不敢相信的高智商",
                "你的眼力，够我跪一辈子",
                "你这双眼睛啊，连石头也能看进三尺去",
            ];
            //console.log("Correct Hap +1")
            updateScore(1);
            updateLog(selectedTileIndexes,true);
            foundHaps.push(selectedTileIndexes);
        } else {
            testList=[
                "你行不行啊",
                "笑死我了",
                "好好笑哦",
                "弱爆了你",
                "哈哈哈哈哈哈哈",
                "不会吧，不会吧，这么简单的游戏都不会",
                "小脑养鱼吗",
                "眼睛不用的话可以捐一下",
                "你还是蛮正常的，如果不考虑智商"
            ];
            if(foundHaps.includes(selectedTileIndexes))
            {
                testList=[
                    "重复啦，大聪明",
                ];
            }
            // musicWrong.play();
            //console.log("Wrong Hap -1")
            updateLog(selectedTileIndexes,false);
            updateScore(-1);
        }

        // Reset all tiles so nothing is selected.
        tilesSelected = 0;
        for (let i = 0; i < tileBoard.length; i++) {
            tileBoard[i][4] = false;
        }

        // Set short delay before returning tiles to normal size.
        setTimeout(function() {
            const allTiles = document.querySelectorAll(".tile");
            for (let i = 0; i < allTiles.length; i++) {
                let currentTile = allTiles[i];
                currentTile.style.borderColor = BORDER_BLACK;
            };
        }, 500)
        const n=Math.floor(Math.random() * testList.length + 1)-1;   //随机获取一条数据
        const $i=$("<p/>").text(testList[n]);      //新建一个b标签，并显示随机的话语
        const x=$("body").width/2,y=450;            //获取鼠标点击的x，和y
        $i.css({
            "font-size": 40,//为标签赋予css值
            "z-index":99999,
            "top":y-20,
            "left":x,
            "position":"absolute",
            "color":"#b564e9",
            "font-family":"微软雅黑",
            "cursor":"default",
            "-moz-user-select": "none",
            "-webkit-user-select": "none",
            "-ms-user-select": "none",
            "-khtml-user-select": "none",
            "user-select": "none",
        });
        $("body").append($i);               //在尾部插入
        $i.animate({"top": y - 400, "opacity": 0}, 1500, function () {
            $i.remove();
        });     //动画消除;

    }
}

function checkForHap(selectedTiles) {
    let backgroundColors = [];
    let shapeColors = [];
    let shapes = [];
    for (let i = 0; i < selectedTiles.length; i++) {
        backgroundColors.push(selectedTiles[i][0]);
        shapeColors.push(selectedTiles[i][1]);
        shapes.push(selectedTiles[i][3]);
        // //console.log(selectedTiles[i]);
    }

    // Check background colors if all same or all different.
    let backgroundColorHap = (allSame(backgroundColors) || allDifferent(backgroundColors));
    // //console.log(`backgroundColorHap: ${backgroundColorHap}`);

    // Check shape colors if all same or all different.
    let shapeColorHap = (allSame(shapeColors) || allDifferent(shapeColors));
    // //console.log(`shapeColorHap: ${shapeColorHap}`);

    // Check shapes if all same or all different.
    let shapeHap = (allSame(shapes) || allDifferent(shapes));
    // //console.log(`shapeHap: ${shapeHap}`);

    // Check if a Hap was formed.
    if ((backgroundColorHap && shapeColorHap) && shapeHap) {
        // //console.log("Hap!");
        return true;
    } else {
        // //console.log("Not Hap!");
        return false;
    }
}

function findAllHaps() {
    const allHaps = [];
    let numOfTiles = tileBoard.length;

    //console.log(`Hap solutions for round ${roundNumber}:`);
    for (let i = 0; i < numOfTiles-2; i++) {
        for (let j = i+1; j < numOfTiles-1; j++) {
            for (let k = j+1; k < numOfTiles; k++) {
                let tile1 = tileBoard[i];
                let tile2 = tileBoard[j];
                let tile3 = tileBoard[k];
                if (checkForHap([tile1, tile2, tile3])) {
                    //console.log(`Hap Found: ${i+1} ${j+1} ${k+1}`);
                    allHaps.push(i.toString() + j.toString() + k.toString());
                }
            }
        }
    }

    return allHaps;
}

function checkForGyul(keyframes, options) {
    let dfs=[
        "哇哦",
    ];
    if (foundHaps.length == allHaps.length) {
        dfs=[
            "OHHHHHHHHH",
            "牛啊牛啊",
            "66666666666666",
            "卡姿兰大眼睛也没有你的雪亮",
            "你是我亲眼见了也不敢相信的高智商",
            "你的聪明，够我跪一辈子",
            "你这双眼睛啊，连石头也能看进三尺去",
        ];
        //console.log("Gyul! +3");
        updateScore(3);
        totalLogs = "";
        totalWrongLogs="";
        logElement.innerText = "";
        wrongLogElement.innerText = "";
        roundNumber++;
        playRound();
    } else {
        //console.log("Not Gyul! -1");
        updateScore(-1);
        dfs=[
            "你行不行啊",
            "笑死我了",
            "好好笑哦",
            "弱爆了你",
            "哈哈哈哈哈哈哈",
            "不会吧，不会吧，这么简单的游戏都不会",
            "小脑养鱼吗",
            "眼睛不用的话可以捐一下",
            "你还是蛮正常的，如果不考虑智商"
        ];
        // musicAo.play();
    }
    const n=Math.floor(Math.random() * dfs.length + 1)-1;   //随机获取一条数据
    const $i=$("<p style='font-size: 22px'/>").text(dfs[n]);      //新建一个b标签，并显示随机的话语
    const x=keyframes.x+10,y=keyframes.y-58;            //获取鼠标点击的x，和y
    $i.css({                            //为标签赋予css值
        "z-index":99999,
        "top":y-20,
        "left":x,
        "position":"absolute",
        "color":"#dc37e9",
        "font-family":"微软雅黑",
        "cursor":"default",
        "-moz-user-select": "none",
        "-webkit-user-select": "none",
        "-ms-user-select": "none",
        "-khtml-user-select": "none",
        "user-select": "none",
    });
    //console.log($i);
    $("body").append($i);               //在尾部插入
    $i.animate({"top": y - 180, "opacity": 0}, 1500, function () {
        $i.remove();
    });     //动画消除
}

function updateScore(points) {
    totalPoints += points;
    scoreElement.innerText = totalPoints;
    // sendScore()
    //console.log(`Current score: ${totalPoints}`)
};
function updateLog(log,isTrue) {
    let logArray=log.split('')
    //console.log(logArray,isTrue)
    logArray=logArray.map(t=>Number(t)+1)
     const logs =logArray.toString()+(isTrue?"（√）":"（×）");
    //console.log(logs)
    if(isTrue)
    {
        totalLogs +=  logs;
        logElement.innerText = totalLogs;
    }
    else
    {
        totalWrongLogs +=  logs;
        wrongLogElement.innerText = totalWrongLogs;
    }
};

function allSame(arr) {
    return arr.every(elem => elem === arr[0]);
}

function allDifferent(arr) {
    return arr.length === new Set(arr).size;
}

function getRandomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
