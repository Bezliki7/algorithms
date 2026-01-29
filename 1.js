const s = '0';

const getMinS = (s) => {
    let result = '';

    if (s.length === 1) {
        return s;
    }

    const sortedS = s.split('').sort((a, b) => a - b)

    let zeros = '';

    for (let i = 0; i < sortedS.length; i++) {
        const num = sortedS[i];

        if (num === '0') {
            zeros += num;
            continue;
        }

        
        result += num;
    }

    return result[0] + zeros + result.slice(1);
}
console.log(getMinS(s))