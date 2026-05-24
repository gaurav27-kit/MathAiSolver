const nerdamer = require('./node_modules/nerdamer/all.min');

function checkDivergence(expr, lower, upper) {
    try {
        let l = Number(nerdamer(lower).evaluate().toString());
        let u = Number(nerdamer(upper).evaluate().toString());
        if (isNaN(l) || isNaN(u)) return false;

        const STEPS = 1000;
        const dx = (u - l) / STEPS;
        const f = nerdamer(expr).buildFunction(['x']);

        let hasLargeValue = false;
        let lastSign = null;
        let flippedSignLarge = false;

        for (let i = 0; i <= STEPS; i++) {
            let x = l + i * dx;
            let val = f(x);
            if (isNaN(val) || !isFinite(val)) {
                return true;
            }
            if (Math.abs(val) > 1000) {
                hasLargeValue = true;
                let currentSign = Math.sign(val);
                if (lastSign !== null && currentSign !== lastSign && Math.abs(val - f(x - dx)) > 1000) {
                    flippedSignLarge = true;
                }
                lastSign = currentSign;
            } else {
                lastSign = Math.sign(val);
            }
        }
        return hasLargeValue && (flippedSignLarge || Math.max(Math.abs(f(l)), Math.abs(f(u))) < 100);
    } catch (e) {
        return false;
    }
}

console.log('e^x [0, 10]:', checkDivergence('e^x', '0', '10'));
console.log('x^3 [0, 50]:', checkDivergence('x^3', '0', '50'));
console.log('1/(x-10) [0, 20]:', checkDivergence('1/(x-10)', '0', '20'));
