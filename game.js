

// Oyun Değişkenleri
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let gameActive = false;
let score = 0;
let lives = 3;
let immortal=false;
let currentLevel = 1;
let levelColors = ['#8cc63f', '#f9a825', '#f44336']; // Yeşil, Sarı, Kırmızı
let gameObjects = [];
let lastTime = 0;
let audio = new Audio('aaa.mp3');
audio.loop = true;

// Oyuncumuzun Özellikleri
const player = {
    x: 50,
    y: 400,
    width: 30,
    height: 30,
    velX: 0,
    velY: 0,
    speed: 3.8,
    jumping: true,
    grounded: false,
    color: '#3498db' // Rengi (Mavi)
};

// Oyun Tuşları
const keys = {
    right: false,
    left: false,
    up: false
};

// Seviyelerin classı
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = 'platform';
    }

    draw() {
        ctx.fillStyle = '#795548'; // Seviye rengi (Kahverengi)
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Düşman classı
class Enemy {
    constructor(x, y, width, height, speedX) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speedX = speedX;
        this.type = 'enemy';
        this.color = '#e74c3c'; // Kırmızı
        this.direction = 1;
        this.moveDistance = 0;
        this.maxDistance = 100 + Math.random() * 100; // Düşmanların gezme yeri
        this.alive = true; // Düşmanların yaşayıp yaşamaması
    }

    update(deltaTime) { //Herşeyin güncellendiği yer 1 FPSde olacak olaylar
        if (!this.alive) return; // Düşman yaşamıyorsa güncelleme

        this.x += this.speedX * this.direction;
        this.moveDistance += Math.abs(this.speedX);

        if (this.moveDistance >= this.maxDistance) {
            this.direction *= -1;
            this.moveDistance = 0;
        }
    }

    draw() {
        if (!this.alive) return; // Düşman yaşamıyorsa çizme

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Altın class
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.type = 'coin';
        this.color = '#f1c40f'; // Altın rengi
        this.collected = false;
    }

    draw() {
        if (!this.collected) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

// Seviyeler
const levels = [
    // Seviye 1 - Kolay
    {
        platforms: [
            { x: 0, y: 450, width: 800, height: 50 }, // Yer
            { x: 150, y: 400, width: 50, height: 20 },
            { x: 300, y: 350, width: 100, height: 20 },
            { x: 450, y: 300, width: 100, height: 20 },
            { x: 600, y: 250, width: 100, height: 20 }
        ],
        enemies: [
            { x: 200, y: 420, width: 30, height: 30, speedX: 1 },
            { x: 500, y: 420, width: 30, height: 30, speedX: 1.5 }
        ],
        coins: [
            { x: 150, y: 330 },
            { x: 300, y: 280 },
            { x: 450, y: 230 },
            { x: 600, y: 180 },
            { x: 350, y: 400 }
        ],
        finishX: 700
    },
    // Seviye 2 - Orta
    {
        platforms: [
            { x: 0, y: 450, width: 250, height: 50 },
            { x: 350, y: 450, width: 450, height: 50 },
            { x: 100, y: 375, width: 60, height: 20 },
            { x: 220, y: 300, width: 60, height: 20 },
            { x: 340, y: 350, width: 60, height: 20 },
            { x: 460, y: 300, width: 60, height: 20 },
            { x: 580, y: 250, width: 60, height: 20 },
            { x: 700, y: 200, width: 60, height: 20 },
            { x: 260, y: 160, width: 350, height: 20 }
        ],
        enemies: [
            { x: 150, y: 420, width: 30, height: 30, speedX: 1 },
            { x: 400, y: 420, width: 30, height: 30, speedX: 1.2 },
            { x: 600, y: 420, width: 30, height: 30, speedX: 1.2 },
            { x: 300, y: 130, width: 30, height: 30, speedX: 1 }
        ],
        coins: [
            { x: 100, y: 330 },
            { x: 220, y: 280 },
            { x: 340, y: 330 },
            { x: 460, y: 280 },
            { x: 580, y: 230 },
            { x: 700, y: 180 },
            { x: 550, y: 420 },
            { x: 280, y: 140 },
            { x: 400, y: 140 }
        ],
        finishX: 720
    },
    // Seviye 3 - Zor
    {
        platforms: [
            { x: 0, y: 450, width: 150, height: 50 },
            { x: 250, y: 450, width: 150, height: 50 },
            { x: 500, y: 450, width: 150, height: 50 },
            { x: 700, y: 450, width: 100, height: 50 },
            { x: 0, y: 380, width: 50, height: 15 },
            { x: 125, y: 330, width: 125, height: 15 },
            { x: 300, y: 300, width: 50, height: 15 },
            { x: 400, y: 260, width: 50, height: 15 },
            { x: 500, y: 220, width: 50, height: 15 },
            { x: 600, y: 180, width: 200, height: 15 },
            { x: 700, y: 140, width: 50, height: 15 },
            { x: 650, y: 350, width: 120, height: 20 },
            { x: 550, y: 300, width: 80, height: 15 }
        ],
        enemies: [
            { x: 50, y: 420, width: 30, height: 30, speedX: 1.61 },
            { x: 300, y: 420, width: 30, height: 30, speedX: 1.62 },
            { x: 550, y: 420, width: 30, height: 30, speedX: 1.63 },
            { x: 650, y: 320, width: 30, height: 30, speedX: 1.64 },
            { x: 400, y: 230, width: 30, height: 30, speedX: 1.65 },
            { x: 600, y: 150, width: 30, height: 30, speedX: 1.66 }
        ],
        coins: [
            { x: 15, y: 360 },
            { x: 190, y: 310 },
            { x: 300, y: 270 },
            { x: 400, y: 240 },
            { x: 500, y: 200 },
            { x: 600, y: 160 },
            { x: 700, y: 120 },
            { x: 650, y: 330 },
            { x: 550, y: 280 },
            { x: 120, y: 430 },
            { x: 380, y: 430 },
            { x: 580, y: 430 }
        ],
        finishX: 750
    }
];

// Tuş listeners
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && !player.jumping && player.grounded) {
        player.jumping = true;
        player.grounded = false;
        player.velY = -player.speed * 2.5;
    }
});

function canhileYap() {
    lives++;
    updateLives();

}

function skorhileYap() {
    score+=50;
    updateScore();

}
function olumsuzlukhileYap() {
    if (!immortal){
        immortal = true;
        document.getElementById("immortal-screen").innerText = "Ölümsüzlük Aktif!";
    }else {
        immortal = false;
        document.getElementById("immortal-screen").innerText = "";
    }


}

document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.up = false;
    if (e.key === 'ğ') canhileYap();
    if (e.key === 'ü') skorhileYap();
    if (e.key === 'ö') olumsuzlukhileYap();
});



document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('next-level').addEventListener('click', nextLevel);
document.getElementById('restart-button').addEventListener('click', restartGame);
document.getElementById('restart-button2').addEventListener('click', restartGame);

// Müzik
document.getElementById('mute-button').addEventListener('click', function() {
    if (audio.paused) {
        audio.play();
        this.textContent = '🔊 Müzik Açık';
    } else {
        audio.pause();
        this.textContent = '🔇 Müzik Kapalı';
    }
});

// Oyunu başlat
function init() {
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('level-complete').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';

    // Oyun yeniden başladığında bilgileri resetle
    score = 0;
    lives = 3;
    currentLevel = 1;
    updateScore();
    updateLives();
    updateLevelIndicator();
}

// Oyunu başlatma functionu
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    gameActive = true;
    loadLevel(currentLevel);
    audio.play().catch(e => console.log('Audio autoplay was prevented'));
    requestAnimationFrame(gameLoop);
}

// Diğer seviyeye geç
function nextLevel() {
    document.getElementById('level-complete').style.display = 'none';
    currentLevel++;
    if (currentLevel > levels.length) {
        // Oyuncu bütün seviyeleri geçti ve oyun bitti
        gameActive = false;
        document.getElementById('final-score').textContent = score;
        document.getElementById('game-over').style.display = 'flex';
        document.getElementById('game-over').querySelector('h1').textContent = 'KAZANDIN!';
    } else {
        loadLevel(currentLevel);
        updateLevelIndicator();
        gameActive = true;
        requestAnimationFrame(gameLoop);
    }
}

// Oyunu yeniden başlat
function restartGame() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over2').style.display = 'none';
    init();
    startGame();
}

// Seviyeyi yükle
function loadLevel(levelNum) {
    // Backgroundu seviyeye göre değiştir
    canvas.style.backgroundColor = levelColors[levelNum-1];

    // Oyuncunun yerini düzelt
    player.x = 50;
    player.y = 400;
    player.velX = 0;
    player.velY = 0;

    // Oyundaki objeleri (Seviye tasarımlarını, Düşmanları ve Altınları) yok et
    gameObjects = [];

    const level = levels[levelNum-1];

    // Seviye tasarımını kur
    level.platforms.forEach(p => {
        gameObjects.push(new Platform(p.x, p.y, p.width, p.height));
    });

    // Düşmanları doğur
    level.enemies.forEach(e => {
        gameObjects.push(new Enemy(e.x, e.y, e.width, e.height, e.speedX));
    });

    // Altınları koy
    level.coins.forEach(c => {
        gameObjects.push(new Coin(c.x, c.y));
    });

    // Bitirme yerini koy
    gameObjects.push({
        x: level.finishX,
        y: 350,
        width: 50,
        height: 100,
        type: 'finish',
        draw: function() {
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText('Bitir', this.x + 2, this.y + 50);
        }
    });
}

function checkHile() {
    if (score >= 2000){
        gameOver2();
    }
    if (lives >= 15){
        gameOver2();
    }
}

// Ana oyun döngüsü
function gameLoop(timestamp) {
    if (!gameActive) return;
    const deltaTime = timestamp - lastTime || 0;
    lastTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayer(deltaTime);

    // Düşmanları güncelle
    gameObjects.forEach(obj => {
        if (obj.type === 'enemy') {
            obj.update(deltaTime);
        }
    });

    // herhangibi bir değme var mı kontrol et
    checkCollisions();

    // Herşeyi çiz
    drawGame();

    checkHile()//Burada Hile fazla yapılmış mı yapılmamış mı diye kontrol ediliyor

    // Bu döngüye bir daha sok
    requestAnimationFrame(gameLoop);
}

// Oyuncunun haraketlerini güncelle
function updatePlayer(deltaTime) {
    // Yerçekimi
    player.velY += 0.5;

    // Hareket ettir
    if (keys.right) {
        player.velX = player.speed;
    } else if (keys.left) {
        player.velX = -player.speed;
    } else {
        player.velX = 0;
    }

    // Fizikleri kur
    player.x += player.velX;
    player.y += player.velY;

    // Oyuncuyu oyun sınırlarının içinde tut
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Oyuncu yere düştü mü diye kontrol et
    if (player.y > canvas.height) {
        loseLife();
    }

    player.grounded = false;
}

// temas var mı diye kontrol et
function checkCollisions() {
    // Oyuncunun seviye tasarımıyla teması var mı diye kontrol et
    gameObjects.forEach(obj => {
        // seviye temasları
        if (obj.type === 'platform') {
            const dir = collisionCheck(player, obj);

            if (dir === 'l' || dir === 'r') {
                player.velX = 0;
            } else if (dir === 'b') {
                player.grounded = true;
                player.jumping = false;
            } else if (dir === 't') {
                player.velY *= -1;
            }
        }

        // Düşman temasları
        else if (obj.type === 'enemy' && obj.alive) {
            const dir = collisionCheck(player, obj);

            if (dir === 'b') {
                // Oyuncu Düşmanın üstündeyse düşman ölür
                obj.alive = false;
                player.velY = -player.speed * 1.5; // Düşmanı öldürdükten sonra zıplat
                score += 40; // Düşman öldürdüğü için skor hediye et
                updateScore();
            } else if (dir) {
                // Oyuncu yanlardan yada alttan değerse öl
                loseLife();
            }
        }

        // Altın temasları
        else if (obj.type === 'coin' && !obj.collected) {
            if (collisionCheck(player, obj)) {
                obj.collected = true;
                score += 10;
                updateScore();
            }
        }

        // Bitir kısmı ile temas
        else if (obj.type === 'finish') {
            if (collisionCheck(player, obj)) {
                levelComplete();// Seviyeyi vitir
            }
        }
    });
}

// Temasları Kontrol et
function collisionCheck(rect1, rect2) {
    // vektörleri kontrol etmek için al
    const vX = (rect1.x + (rect1.width / 2)) - (rect2.x + (rect2.width / 2));
    const vY = (rect1.y + (rect1.height / 2)) - (rect2.y + (rect2.height / 2));

    // objelerin yarım eni ve çapınını ekle
    const hWidths = (rect1.width / 2) + (rect2.width / 2);
    const hHeights = (rect1.height / 2) + (rect2.height / 2);

    // Eğer değmiyorsak false gönder
    if (Math.abs(vX) >= hWidths || Math.abs(vY) >= hHeights) {
        return false;
    }

    // Temasın ne taraftan olduğunu bul
    const oX = hWidths - Math.abs(vX);
    const oY = hHeights - Math.abs(vY);

    if (oX < oY) {
        if (vX > 0) {
            if (rect2.type === 'platform') {
                rect1.x = rect2.x + rect2.width;
            }
            return 'l';
        } else {
            if (rect2.type === 'platform') {
                rect1.x = rect2.x - rect1.width;
            }
            return 'r';
        }
    } else {
        if (vY > 0) {
            if (rect2.type === 'platform') {
                rect1.y = rect2.y + rect2.height;
                rect1.velY = 0;
            }
            return 't';
        } else {
            if (rect2.type === 'platform') {
                rect1.y = rect2.y - rect1.height;
                rect1.velY = 0;
            }
            return 'b';
        }
    }
}

// Oyunu çiz
function drawGame() {
    // Seviye tasarımını ve Objeleri çiz (Altın ve Düşmanlar)
    gameObjects.forEach(obj => {
        obj.draw();
    });

    // Oyuncuyu çiz
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Skor hudunu güncelle
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level-score').textContent = score;
    document.getElementById('final-score').textContent = score;
}

// Kaç can kaldığını güncelel
function updateLives() {
    const heartsContainer = document.getElementById('hearts');
    heartsContainer.innerHTML = '';

    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('span');
        heart.classList.add('heart');
        heart.textContent = '❤';
        heartsContainer.appendChild(heart);
    }
}

// Hangi seviyede olduğumuzu gösteren hudu güncelle
function updateLevelIndicator() {
    document.getElementById('level-indicator').textContent = `${currentLevel}. Seviye`;
}

// Kalp kaybet
function loseLife() {

    if (immortal){

    }else{
        lives--;
        updateLives();

        if (lives <= 0) {// Can kalmazsa oyun biter
            gameOver();
        } else {
            // Oyuncuyu başlangıça götür
            player.x = 50;
            player.y = 400;
            player.velX = 0;
            player.velY = 0;
        }
    }

}

// Seviye bitti
function levelComplete() {
    gameActive = false;
    document.getElementById('level-score').textContent = score;
    document.getElementById('level-complete').style.display = 'flex';
}

// Oyun Bitti
function gameOver() {
    gameActive = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').style.display = 'flex';
}
function gameOver2() {
    gameActive = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over2').style.display = 'flex';
}

init();