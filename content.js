let timer = null;
let isRunning = false;

// 停止播放功能
function stopPlaying() {
    isRunning = false;
    clearInterval(timer);
    timer = null;
    const video = document.querySelector('video');
    if (video) {
        video.pause();
    }
}

// 确保面板只创建一次
let panelCreated = false;

// 创建悬浮控制面板
function createFloatingPanel() {
    if (panelCreated) return;
    panelCreated = true;

    const panel = document.createElement('div');
    panel.innerHTML = `
        <div id="autoPlayPanel" style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            font-family: 'Microsoft YaHei', sans-serif;
            cursor: move;
        ">
            <div style="
                font-size: 14px;
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
                text-align: center;
            ">e学助手</div>
            <div id="customProgressBar" style="
                width: 100%;
                height: 4px;
                background: #ddd;
                border-radius: 2px;
                cursor: pointer;
                position: relative;
            ">
                <div id="customProgress" style="
                    width: 0%;
                    height: 100%;
                    background: #4CAF50;
                    border-radius: 2px;
                    position: relative;
                ">
                    <div id="progressHandle" style="
                        width: 12px;
                        height: 12px;
                        background: #4CAF50;
                        border-radius: 50%;
                        position: absolute;
                        right: -6px;
                        top: -4px;
                        cursor: pointer;
                    "></div>
                </div>
            </div>
            <button id="floatingStartBtn" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.3s;
            ">开始自动播放</button>
            <button id="floatingStopBtn" style="
                background: #f44336;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.3s;
            ">停止播放</button>
        </div>
    `;
    document.body.appendChild(panel);

    // 添加按钮事件
    const startBtn = document.getElementById('floatingStartBtn');
    const stopBtn = document.getElementById('floatingStopBtn');
    const progressBar = document.getElementById('customProgressBar');
    const progress = document.getElementById('customProgress');
    const handle = document.getElementById('progressHandle');

    // 进度条点击和拖动功能
    let isDraggingProgress = false;

    function updateVideoProgress(e) {
        const video = document.querySelector('video');
        if (!video) return;

        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        progress.style.width = `${percentage}%`;
        video.currentTime = (percentage / 100) * video.duration;
        updateProgressBar(percentage);
    }

    progressBar.addEventListener('mousedown', (e) => {
        if (e.target === handle) {
            isDraggingProgress = true;
        } else {
            updateVideoProgress(e);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDraggingProgress) {
            updateVideoProgress(e);
        }
    });

    document.addEventListener('mouseup', () => {
        isDraggingProgress = false;
    });

    startBtn.addEventListener('click', () => {
        isRunning = true;
        autoProgress();
        startBtn.style.background = '#45a049';
    });

    stopBtn.addEventListener('click', () => {
        stopPlaying();
        startBtn.style.background = '#4CAF50';
    });

    // 添加拖动功能
    const dragPanel = document.getElementById('autoPlayPanel');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    dragPanel.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target === progressBar || e.target === progress || e.target === handle) {
            return;
        }
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === dragPanel) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, dragPanel);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
}

// 多种方式尝试创建面板
function initializePanel() {
    // 方式1: DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createFloatingPanel);
    } else {
        createFloatingPanel();
    }

    // 方式2: 监听DOM变化
    const observer = new MutationObserver((mutations) => {
        createFloatingPanel();
    });

    observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true
    });

    // 方式3: 延迟尝试
    setTimeout(createFloatingPanel, 1000);
}

// 立即初始化
initializePanel();

function autoProgress() {
    if (!isRunning) return;

    const video = document.querySelector('video');
    if (!video) return;

    video.playbackRate = 2.0;
    video.play();

    const duration = video.duration;
    let currentProgress = (video.currentTime / duration) * 100;

    // 根据视频时长调整进度增量
    const progressIncrement = duration <= 300 ? 2.0 : // 5分钟以内的视频
        duration <= 600 ? 1.0 : // 10分钟以内的视频
            0.5; // 更长的视频

    // 根据视频时长调整更新间隔
    const updateInterval = duration <= 300 ? 200 : // 5分钟以内的视频
        duration <= 600 ? 300 : // 10分钟以内的视频
            500; // 更长的视频

    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    timer = setInterval(() => {
        if (!isRunning) {
            stopPlaying();
            return;
        }

        if (currentProgress >= 100) {
            stopPlaying();
            return;
        }

        currentProgress += progressIncrement;
        const targetTime = (currentProgress / 100) * duration;

        try {
            video.currentTime = targetTime;
            updateProgressBar(currentProgress);
            // 更新自定义进度条
            const customProgress = document.getElementById('customProgress');
            if (customProgress) {
                customProgress.style.width = `${currentProgress}%`;
            }
        } catch (e) {
            console.log('更新进度:', currentProgress);
        }
    }, updateInterval);
}

function updateProgressBar(progress) {
    const progressBar = document.querySelector('.xgplayer-progress-played');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    // 更新自定义进度条
    const customProgress = document.getElementById('customProgress');
    if (customProgress) {
        customProgress.style.width = `${progress}%`;
    }
}

// 保持消息监听功能
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'start') {
        isRunning = true;
        autoProgress();
        sendResponse({ status: 'started' });
    } else if (request.action === 'stop') {
        stopPlaying();
        sendResponse({ status: 'stopped' });
    }
    return true;
});
