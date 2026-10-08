//フォーマット
//usync pattern [[0], [8, 1]]
//sync pattern{pattern: [[0], [8, 2]], cross[[false], [true, false], star: true}

function getJugglableBirthdaySiteswap(month, day){
    let result = {};

    //1桁ずつ分離
    const monthDigits = getDigits(month);
    const dayDigits = getDigits(day);
    if(monthDigits.length < 2) monthDigits.unshift(0);
    if(dayDigits.length < 2) dayDigits.unshift(0);
    let numbers = [];
    result.numbers = numbers;
    for(const i of monthDigits) numbers.push(i);
    for(const i of dayDigits) numbers.push(i);

    //abc変換
    let abcConvertedNumbersArray = [];
    result.abcConvertedNumbersArray = abcConvertedNumbersArray;
    let queue = [];
    queue.push({current: [], index: 0});
    while(queue.length > 0){
        const data = queue.shift();
        //最後まで行ってたら終了
        if(data.index >= numbers.length){
            abcConvertedNumbersArray.push(data.current);
            continue;
        }
        //そのまま追加
        let unconnect = structuredClone(data);
        unconnect.current.push(numbers[data.index]);
        unconnect.index ++;
        queue.push(unconnect);
        //連結
        if(data.index >= numbers.length - 1) continue;
        let n = numbers[data.index] * 10 + numbers[data.index + 1];
        if(n < 10 || 35 < n) continue;
        let connect = structuredClone(data);
        connect.current.push(n);
        connect.index += 2;
        queue.push(connect);
    }

    //マルチ化
    let multiPatterns = [];
    result.multiPatterns = multiPatterns;
    for(let abcConvertedNumbers of abcConvertedNumbersArray){
        queue = [];
        queue.push({current: [], index: 0});
        while(queue.length > 0){
            const data = queue.shift();
            //最後まで行ってたら終了
            if(data.index >= abcConvertedNumbers.length){
                multiPatterns.push(data.current);
                continue;
            }
            //マルチを作ってキューに追加
            let currentThrow = [];
            for(let i = data.index; i < abcConvertedNumbers.length; i++){
                currentThrow.push(abcConvertedNumbers[i]);
                let cloneData = structuredClone(data);
                cloneData.current.push(structuredClone(currentThrow));
                cloneData.index = i + 1;
                queue.push(cloneData);
            }
        }
    }

    //シンクロ化
    let syncPatterns = [];
    result.syncPatterns = syncPatterns;
    for(let multiPattern of multiPatterns){
        //奇数があるとき、長さが奇数のとき
        if(multiPattern.some(group => group.some(n => n%2 == 1))) continue;
        if(multiPattern.length%2 == 1) continue;

        queue = [];
        queue.push({current: [], index1: 0, index2: 0});
        while(queue.length > 0){
            const data = queue.shift();
            //最後まで行ってたら終了
            if(data.index1 >= multiPattern.length){
                let syncPattern = {};
                syncPattern.pattern = structuredClone(multiPattern);
                syncPattern.cross = data.current;
                syncPattern.star = false;
                syncPatterns.push(structuredClone(syncPattern));
                syncPattern.star = true;
                syncPatterns.push(structuredClone(syncPattern));
                continue;
            }
            //indexの繰り上げ処理
            if(data.index2 >= multiPattern[data.index1].length){
                let cloneData = structuredClone(data);
                cloneData.index1 ++;
                cloneData.index2 = 0;
                queue.push(cloneData);
                continue;
            }

            if(data.index2 == 0) data.current.push([]);

            //ストレートパターン
            let straight = structuredClone(data);
            straight.current[straight.index1].push(false);
            straight.index2 ++;
            queue.push(straight);

            //クロスパターン
            if(multiPattern[data.index1][data.index2] == 0) continue;
            let cross = structuredClone(data);
            cross.current[straight.index1].push(true);
            cross.index2 ++;
            queue.push(cross);
        }
    }

    //asyncのジャグリング可能性
    let jugglableAsyncPatterns = [];
    result.jugglableAsyncPatterns = jugglableAsyncPatterns;
    let asyncCount = 0;
    let asyncNoAlpCount = 0;
    for(let asyncPattern of multiPatterns){
        if(!isJugglableAsyncSiteswap(asyncPattern)) continue;
        let ssStr = "";
        let ssStrNoAlp = "";
        let useAlp = false;
        let ssSum = 0;
        for(let i = 0; i < asyncPattern.length; i++){
            let currentThrow = asyncPattern[i];
            if(currentThrow.length > 1){
                ssStr += "[";
                ssStrNoAlp += "[";
            }
            for(let j = 0; j < currentThrow.length; j++){
                ss = currentThrow[j];
                ssStr += toAlphabet(ss);
                ssStrNoAlp += String(ss);
                if(ss >= 10) useAlp = true;
                ssSum += ss;
                if(j < currentThrow.length - 1) ssStrNoAlp += " ";
            }
            if(currentThrow.length > 1){
                ssStr += "]";
                ssStrNoAlp += "]";
            }
            if(i < asyncPattern.length - 1) ssStrNoAlp += " ";
        }
        asyncCount ++;
        if(!useAlp) asyncNoAlpCount ++;
        jugglableAsyncPatterns.push({siteswapStr: ssStr, noAlpStr: ssStrNoAlp, useAlp: useAlp, sync: false, balls: ssSum/asyncPattern.length});
    }

    //syncのジャグリング可能性
    let jugglableSyncPatterns = [];
    result.jugglableSyncPatterns = jugglableSyncPatterns;
    let syncCount = 0;
    let syncNoAlpCount = 0;
    for(syncPattern of syncPatterns){
        if(!isJugglableSyncSiteswap(syncPattern)) continue;
        let ssStr = "";
        let ssStrNoAlp = "";
        let useAlp = false;
        let ssSum = 0;
        for(let i = 0; i < syncPattern.pattern.length; i++){
            if(i%2 == 0){
                ssStr += "(";
                ssStrNoAlp += "(";
            }else{
                ssStr += ",";
                ssStrNoAlp += ", ";
            }
            let currentThrow = syncPattern.pattern[i];
            let currentCross = syncPattern.cross[i];
            if(currentThrow.length > 1){
                ssStr += "[";
                ssStrNoAlp += "[";
            }
            for(let j = 0; j < currentThrow.length; j++){
                ss = currentThrow[j];
                ssStr += toAlphabet(ss);
                ssStrNoAlp += String(ss);
                if(ss >= 10) useAlp = true;
                if(currentCross[j]){
                    ssStr += "x";
                    ssStrNoAlp += "x";
                }
                ssSum += ss;
                if(j < currentThrow.length - 1) ssStrNoAlp += " ";
            }
            if(currentThrow.length > 1){
                ssStr += "]";
                ssStrNoAlp += "]";
            }
            if(i%2 == 1){
                ssStr += ")";
                ssStrNoAlp += ")";
            }
        }
        if(syncPattern.star){
            ssStr += "*";
            ssStrNoAlp += "*";
        }
        syncCount ++;
        if(!useAlp) syncNoAlpCount ++;
        jugglableSyncPatterns.push({siteswapStr: ssStr, noAlpStr: ssStrNoAlp, useAlp: useAlp, sync: true, balls: ssSum/syncPattern.pattern.length});
    }

    let jugglable = {};
    jugglable.asyncPatterns = result.jugglableAsyncPatterns;
    //jugglable.asyncPatterns.sort((b, a) => a.siteswapStr.localeCompare(b.siteswapStr));
    jugglable.asyncPatterns.sort((a, b) => a.siteswapStr.replace(/[\[\]\(\),]/g, "").localeCompare(b.siteswapStr.replace(/[\[\]\(\),]/g, "")));
    jugglable.asyncPatterns.sort((a, b) => b.balls - a.balls);
    jugglable.syncPatterns = result.jugglableSyncPatterns;
    //jugglable.syncPatterns.sort((b, a) => a.siteswapStr.localeCompare(b.siteswapStr));
    jugglable.syncPatterns.sort((a, b) => a.siteswapStr.replace(/[\[\]\(\),x]/g, "").localeCompare(b.siteswapStr.replace(/[\[\]\(\),]/g, "")));
    jugglable.asyncPatterns.sort((b, a) => b.balls - a.balls);

    let output = {};
    output.patterns = [];
    for(let pattern of jugglable.asyncPatterns){
        output.patterns.push(pattern);
    }
    for(let pattern of jugglable.syncPatterns){
        output.patterns.push(pattern);
    }
    output.asyncCount = asyncCount;
    output.asyncNoAlpCount = asyncNoAlpCount;
    output.syncCount = syncCount;
    output.syncNoAlpCount = syncNoAlpCount;
    output.patternCount = asyncCount + syncCount;
    output.patternNoAlpCount = asyncNoAlpCount + syncNoAlpCount;
    return output;
}

function isJugglableAsyncSiteswap(asyncPattern){
    let L = asyncPattern.length;

    let commingBalls = [];
    for(let i = 0; i < L; i++) commingBalls.push(0);

    for(let i = 0; i < L; i++){
        for(ss of asyncPattern[i]){
            commingBalls[(i + ss) % L] ++;
        }
    }
    
    for(let i = 0; i < L; i++){
        if(commingBalls[i] != asyncPattern[i].length) return false;
    }
    return true;
}

function isJugglableSyncSiteswap(syncPattern){
    //条件外の除外
    let pattern = syncPattern.pattern;
    if(pattern.some(group => group.some(n => n%2 == 1))) return false;
    if(pattern.length%2 == 1) return true;
    for(let i = 0; i < pattern.length; i++){
        for(let j = 0; j < pattern[i].length; j++){
            if(pattern[i][j] == 0 && syncPattern.cross[i][j]) return false;
        }
    }

    let clonePattern = structuredClone(syncPattern);
    //*の除去
    if(syncPattern.star){
        for(let i = 0; i < syncPattern.pattern.length; i += 2){
            clonePattern.pattern.push(structuredClone(syncPattern.pattern[i + 1]));
            clonePattern.cross.push(structuredClone(syncPattern.cross[i + 1]));
            clonePattern.pattern.push(structuredClone(syncPattern.pattern[i]));
            clonePattern.cross.push(structuredClone(syncPattern.cross[i]));
        }
        clonePattern.star = false;
    }
    //アシンクロ変換
    let asyncConvertedPattern = structuredClone(clonePattern.pattern);
    for(let i = 0; i < clonePattern.pattern.length; i++){
        for(let j = 0; j < clonePattern.pattern[i].length; j++){
            if(clonePattern.cross[i][j]){
                if(i%2 == 0) asyncConvertedPattern[i][j] += 1;
                else         asyncConvertedPattern[i][j] -= 1;
            }
        }
    }

    return isJugglableAsyncSiteswap(asyncConvertedPattern);
}

//数字のを1桁ずつ配列に格納
function getDigits(n){
    let numStr = String(n);
    let digitsStr = numStr.split('');
    let digits = [];
    for(const i of digitsStr){
        digits.push(Number(i));
    }
    return digits;
}

function toAlphabet(n) {
    if(n < 10) return String(n);
    return String.fromCharCode("a".charCodeAt(0) + n - 10);
}