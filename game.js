let startTimestamp = undefined;
let easing = bezier(Parameters.X1, Parameters.Y1, Parameters.X2, Parameters.Y2);
let reverseEasing = bezier(Parameters.Y1, Parameters.X1, Parameters.Y2, Parameters.X2);

let AnimationType = {
    FAILING: 1,
    RECOVERING: 2,
    FAILING_FAST: 3,
};

let playerState = {
    "dead": false,
    "animationType": undefined,
    "isOnRightSide": true,
    "failingProgression": 0.0,
    "failingCompletion": 0.0,
    "failingDuration": Parameters.BASE_DURATION,
    "lastUpdate": undefined,
    "masterKey": undefined,
    "isLeftPressed": false,
    "isRightPressed": false
};

function updateState() {
    if (playerState.dead) {
        return;
    }

    let isLeft = playerState.masterKey === "ArrowLeft";
    let isRight = playerState.masterKey === "ArrowRight"

    let isFailing = playerState.animationType === AnimationType.FAILING;
    let isRecovering = playerState.animationType === AnimationType.RECOVERING;
    let isFailingFast = playerState.animationType === AnimationType.FAILING_FAST;

    let now = Date.now();
    let elapsed = now - playerState.lastUpdate;
    let delta = elapsed / playerState.failingDuration;
    let newProgression = playerState.failingProgression + delta;


    playerState.failingDuration = Math.max(Parameters.MIN_DURATION, Parameters.BASE_DURATION - (now - startTimestamp) * Parameters.DECREASING_DURATION_FACTOR);

    let sideChanged = false;
    let newCompletion = 0;

    if (isFailing) {
        newCompletion = easing(newProgression);
    } else if (isRecovering) {
        newCompletion = playerState.failingCompletion - delta * Parameters.RECOVERING_FACTOR;
    } else if (isFailingFast) {
        newCompletion = playerState.failingCompletion + delta * Parameters.FAILING_FAST_FACTOR;
    }

    if (Math.abs(newCompletion) >= 1) {
        playerState.dead = true;
        document.getElementById("keyboard-key-left").classList.remove("red-image");
        document.getElementById("keyboard-key-right").classList.remove("red-image");
        return;
    }

    if (newCompletion <= 0 && isRecovering) {
        newCompletion = Math.abs(newCompletion);
        playerState.isOnRightSide = !playerState.isOnRightSide;
        sideChanged = true;
    }

    if ((isRight && playerState.isOnRightSide) || (isLeft && !playerState.isOnRightSide)) {
        if (isFailingFast && !sideChanged) {
            return;
        }
        playerState.animationType = AnimationType.FAILING_FAST;
        playerState.lastUpdate = now;
        playerState.failingCompletion = newCompletion;
        playerState.failingProgression = newCompletion;
        setFailingFastAnimation(playerState.failingDuration, playerState.failingProgression, playerState.isOnRightSide);
        return;
    }

    if (!isLeft && !isRight) {
        if (isFailing && !sideChanged) {
            return;
        }
        playerState.animationType = AnimationType.FAILING;
        playerState.lastUpdate = now;
        playerState.failingCompletion = newCompletion;
        playerState.failingProgression = reverseEasing(newCompletion);
        setFailingAnimation(playerState.failingDuration, playerState.failingProgression, playerState.isOnRightSide);
        return;
    }

    if ((isRight && !playerState.isOnRightSide) || (isLeft && playerState.isOnRightSide)) {
        if (isRecovering && !sideChanged) {
            return;
        }
        playerState.animationType = AnimationType.RECOVERING;
        playerState.lastUpdate = now;
        playerState.failingCompletion = newCompletion;
        playerState.failingProgression = newCompletion;
        setRecoverAnimation(playerState.failingDuration, playerState.failingCompletion, playerState.isOnRightSide);
        return;
    }
}

document.onkeydown = function (e) {
    let key = e || window.event;
    let isLeft = key.key == "ArrowLeft";
    let isRight = key.key == "ArrowRight";

    if (playerState.dead || (!isLeft && !isRight)) {
        return;
    }

    if (isLeft && !playerState.isLeftPressed) {
        playerState.isLeftPressed = true;
        document.getElementById("keyboard-key-left").classList.add("red-image");
    } else if (isRight && !playerState.isRightPressed) {
        playerState.isRightPressed = true;
        document.getElementById("keyboard-key-right").classList.add("red-image");
    }

    if (playerState.masterKey === undefined) {
        playerState.masterKey = key.key;
    } else if (playerState.masterKey !== key.key) {
        return;
    }

    updateState();
};

document.onkeyup = function (e) {
    let key = e || window.event;
    let isLeft = key.key == "ArrowLeft";
    let isRight = key.key == "ArrowRight";

    if (playerState.dead || (!isLeft && !isRight)) {
        return;
    }

    if (isLeft && playerState.isLeftPressed) {
        playerState.isLeftPressed = false;
        document.getElementById("keyboard-key-left").classList.remove("red-image");
    } else if (isRight && playerState.isRightPressed) {
        playerState.isRightPressed = false;
        document.getElementById("keyboard-key-right").classList.remove("red-image");
    }

    if (playerState.masterKey === key.key) {

        if (playerState.isLeftPressed) {
            playerState.masterKey = "ArrowLeft";
        } else if (playerState.isRightPressed) {
            playerState.masterKey = "ArrowRight";
        } else {
            playerState.masterKey = undefined;
        }
    } else if (playerState.masterKey !== undefined) {
        return;
    }

    updateState();
}

function setFailingAnimation(duration, failingProgression, isFailingRight) {
    let degFrom = "0deg";
    let degTo = isFailingRight ? "45deg" : "-45deg";
    let progression = failingProgression * duration;
    let curve = `cubic-bezier(${Parameters.X1},${Parameters.Y1},${Parameters.X2},${Parameters.Y2})`;
    setAnimation(degFrom, degTo, duration, progression, curve);
}

function setFailingFastAnimation(duration, failingProgression, isFailingRight) {
    let degFrom = "0deg";
    let degTo = isFailingRight ? "45deg" : "-45deg";
    let progression = failingProgression * duration / Parameters.FAILING_FAST_FACTOR;
    let curve = "linear";
    setAnimation(degFrom, degTo, duration / Parameters.FAILING_FAST_FACTOR, progression, curve);
}

function setRecoverAnimation(duration, failingProgression, isFailingRight) {

    let degFrom = isFailingRight ? "45deg" : "-45deg";
    let degTo = "0deg";
    let progression = (1 - failingProgression) * (duration / Parameters.RECOVERING_FACTOR);
    let curve = "linear";
    setAnimation(degFrom, degTo, duration / Parameters.RECOVERING_FACTOR, progression, curve);
}

function setAnimation(degFrom, degTo, duration, progression, curve) {
    let random = Math.floor(Math.random() * 10000000);
    let animationName = `anim-${random}`;

    let animation = `
    .${animationName} {
        animation: ${animationName} ${duration}ms ${curve};
        animation-fill-mode: forwards;
        transform-origin: 50% 100%;
        animation-delay: -${progression}ms;
      }

      @keyframes ${animationName} {
        from {
          transform: rotate(${degFrom});
        }
        to {
          transform: rotate(${degTo});
        }
      }
    `;

    document.getElementById("dynamic-css").insertAdjacentHTML("beforeend", animation);
    let player = document.getElementById("player");
    let currentAnim = player.getAttribute("current-animation");
    player.classList.remove(currentAnim);
    player.classList.add(animationName);
    player.setAttribute("current-animation", animationName);
}

function updateTimer() {
    if (playerState.dead || startTimestamp === undefined) {
        return;
    }
    let elapsed = Date.now() - startTimestamp;
    let ms = (elapsed % 1000).toString().padStart(3, 0);
    let seconds = (((elapsed - ms) / 1000) % 60).toString().padStart(2, 0);
    let minutes = ((elapsed - ms - seconds * 1000) / (1000 * 60)).toString();
    document.getElementById("timer").innerText = `${minutes}:${seconds}.${ms}`;
}


window.onload = function () {
    let timerId = setInterval(updateTimer, 23);

    document.getElementById("player").addEventListener("animationend", function () {
        updateTimer();
        updateState();
        if (playerState.dead) {
            clearInterval(timerId);
        }
    });

    startTimestamp = Date.now();
    playerState.lastUpdate = startTimestamp;
    updateState();
}
